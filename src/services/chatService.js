import {
  collection,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
  getDocs,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const CHATS_COLLECTION = "chats";
const MESSAGES_COLLECTION = "messages";

const getChatId = (uid1, uid2) => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

export const getOrCreateChat = async (currentUid, otherUid, currentUserProfile = {}) => {
  const chatId = getChatId(currentUid, otherUid);
  
  const indexRef = doc(db, CHATS_COLLECTION, "index");
  const indexSnap = await getDoc(indexRef);
  
  let userChats = {};
  if (indexSnap.exists()) {
    userChats = indexSnap.data()?.userChats || {};
  } else {
    await setDoc(indexRef, { userChats: {} });
  }
  
  const existingChat = userChats[currentUid]?.[chatId];
  
  if (!existingChat) {
    const otherUserDoc = await getDoc(doc(db, "users", otherUid));
    const otherUser = otherUserDoc.exists() ? otherUserDoc.data() : {};
    
    const currentChats = userChats[currentUid] || {};
    const otherChats = userChats[otherUid] || {};
    
    const updateData = {
      userChats: {
        ...userChats,
        [currentUid]: {
          ...currentChats,
          [chatId]: {
            otherUid,
            otherName: otherUser.displayName || "User",
            otherPhotoURL: otherUser.photoURL || "",
            lastMessage: "",
            lastMessageAt: null,
            hasUnread: false,
          },
        },
        [otherUid]: {
          ...otherChats,
          [chatId]: {
            otherUid: currentUid,
            otherName: currentUserProfile.displayName || "User",
            otherPhotoURL: currentUserProfile.photoURL || "",
            lastMessage: "",
            lastMessageAt: null,
            hasUnread: false,
          },
        },
      },
    };
    
    await setDoc(indexRef, updateData, { merge: true });
  }
  
  return chatId;
};

export const sendMessage = async (chatId, senderId, text) => {
  const messagesRef = collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION);
  const docRef = await addDoc(messagesRef, {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

export const subscribeToMessages = (chatId, callback) => {
  const messagesRef = collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION);
  const q = query(
    messagesRef,
    orderBy("createdAt", "asc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

export const subscribeToChats = (userUid, callback) => {
  const chatsRef = collection(db, CHATS_COLLECTION);
  const q = query(
    chatsRef,
    where("participants", "array-contains", userUid),
    orderBy("lastMessageAt", "desc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(chats);
  });
};

export const getChatMessages = async (chatId, messageLimit = 50) => {
  const messagesRef = collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION);
  const q = query(
    messagesRef,
    orderBy("createdAt", "desc"),
    limit(messageLimit)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).reverse();
};

export const deleteOldMessages = async (chatId, daysOld = 15) => {
  const messagesRef = collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const q = query(
    messagesRef,
    where("createdAt", "<", cutoffDate)
  );
  
  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  
  return snapshot.size;
};

export { getChatId };
