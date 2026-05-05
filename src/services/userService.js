import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import { createNotification } from "./notificationService";

export const createUserDoc = async (firebaseUser) => {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      photoURL: firebaseUser.photoURL || "",
      college: "",
      bio: "",
      skills: [],
      githubUsername: "",
      linkedIn: "",
      portfolio: "",
      onboarded: false,
      createdAt: serverTimestamp(),
    });
  }

  return (await getDoc(ref)).data();
};

export const getUserDoc = async (uid, viewerId = null) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  
  if (!snap.exists()) return null;
  
  const userData = snap.data();
  
  if (viewerId && viewerId !== uid) {
    await updateDoc(ref, {
      profileViews: increment(1),
    });
    
    await createNotification(uid, "profile_view", {
      title: "Profile viewed",
      message: `Someone viewed your profile`,
      link: `/profile/${uid}`,
    });
  }
  
  return userData;
};

// Alias — used when viewing someone else's profile by uid
export const getUserByUid = async (uid, viewerId = null) => {
  return getUserDoc(uid, viewerId);
};

export const updateUserDoc = async (uid, data) => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
};

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
};