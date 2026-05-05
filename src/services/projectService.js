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
  onSnapshot,
  serverTimestamp,
  increment,
  deleteField,
} from "firebase/firestore";
import { db } from "./firebase";
import { createNotification } from "./notificationService";

export const createProject = async (uid, ownerProfile, data) => {
  const ref = await addDoc(collection(db, "projects"), {
    ownerId: uid,
    ownerName: ownerProfile.displayName || "",
    ownerPhoto: ownerProfile.photoURL || "",
    ownerCollege: ownerProfile.college || "",
    title: data.title,
    description: data.description,
    techStack: data.techStack || [],
    domain: data.domain || "",
    openToCollab: data.openToCollab || false,
    rolesNeeded: data.rolesNeeded || [],
    githubUrl: data.githubUrl || "",
    liveUrl: data.liveUrl || "",
    collaborators: [],
    viewCount: 0,
    interestCount: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getProject = async (id, viewerId = null) => {
  const ref = doc(db, "projects", id);
  const snap = await getDoc(ref);
  
  if (!snap.exists()) return null;
  
  const projectData = { id: snap.id, ...snap.data() };
  const ownerId = projectData.ownerId;
  
  if (viewerId && viewerId !== ownerId) {
    await updateDoc(ref, {
      viewCount: increment(1),
    });
    
    await createNotification(ownerId, "project_view", {
      title: "Project viewed",
      message: `Someone viewed your project "${projectData.title}"`,
      link: `/projects/${id}`,
    });
  }
  
  return projectData;
};

export const getUserProjects = async (uid) => {
  const q = query(
    collection(db, "projects"),
    where("ownerId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllProjects = async () => {
  const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const subscribeToProjects = (callback, onError) => {
  const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    onError
  );
};

export const updateProject = async (id, data) => {
  await updateDoc(doc(db, "projects", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProject = async (id) => {
  await deleteDoc(doc(db, "projects", id));
};

export const toggleInterest = async (projectId, userId) => {
  const ref = doc(db, "projects", projectId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  
  const data = snap.data();
  const interestsMap = data.interests || {};
  const hasInterest = !!interestsMap[userId];
  
  if (hasInterest) {
    await updateDoc(ref, {
      [`interests.${userId}`]: deleteField(),
      interestCount: increment(-1),
    });
  } else {
    await updateDoc(ref, {
      [`interests.${userId}`]: true,
      interestCount: increment(1),
    });
  }
};
