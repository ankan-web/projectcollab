import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export const createNeed = async (uid, profile, data) => {
  const ref = await addDoc(collection(db, "needs"), {
    authorId: uid,
    authorName: profile.displayName || "",
    authorPhoto: profile.photoURL || "",
    authorCollege: profile.college || "",
    type: data.type,
    title: data.title,
    description: data.description,
    lookingFor: data.lookingFor || "",
    techStack: data.techStack || [],
    link: data.link || "",
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getAllNeeds = async () => {
  const q = query(collection(db, "needs"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getNeed = async (id) => {
  const snap = await getDoc(doc(db, "needs", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateNeed = async (id, data) => {
  await updateDoc(doc(db, "needs", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteNeed = async (id) => {
  await deleteDoc(doc(db, "needs", id));
};

export const getUserNeeds = async (uid) => {
  const q = query(
    collection(db, "needs"),
    where("authorId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};