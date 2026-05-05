import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

export const createNotification = async (userId, type, data) => {
  const ref = await addDoc(collection(db, "notifications"), {
    userId,
    type,
    title: data.title || "",
    message: data.message || "",
    link: data.link || "",
    read: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getUserNotifications = async (userId) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(notifications);
  });
};

export const markAsRead = async (notificationId) => {
  const ref = doc(db, "notifications", notificationId);
  await updateDoc(ref, { read: true });
};

export const markAllAsRead = async (userId) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  const updates = snap.docs.map((doc) => updateDoc(doc.ref, { read: true }));
  await Promise.all(updates);
};

export const deleteNotification = async (notificationId) => {
  await deleteDoc(doc(db, "notifications", notificationId));
};

export const getUnreadCount = async (userId) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  return snap.size;
};
