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
import { createNotification } from "./notificationService";

export const sendJoinRequest = async (projectId, requesterId, requesterProfile, message = "") => {
  const projectSnap = await getDoc(doc(db, "projects", projectId));
  if (!projectSnap.exists()) throw new Error("Project not found");
  
  const project = projectSnap.data();
  const ownerId = project.ownerId;
  
  const ref = await addDoc(collection(db, "joinRequests"), {
    projectId,
    projectTitle: project.title || "Project",
    projectOwnerId: ownerId,
    requesterId,
    requesterName: requesterProfile.displayName || "",
    requesterPhoto: requesterProfile.photoURL || "",
    requesterCollege: requesterProfile.college || "",
    requesterSkills: requesterProfile.skills || [],
    message,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  
  if (ownerId !== requesterId) {
    await createNotification(ownerId, "join_request", {
      title: "New Join Request",
      message: `${requesterProfile.displayName || "Someone"} wants to join your project "${project.title}"`,
      link: "/requests",
    });
  }
  
  return ref.id;
};

export const getProjectRequests = async (projectId) => {
  const q = query(
    collection(db, "joinRequests"),
    where("projectId", "==", projectId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getMyJoinRequests = async (requesterId) => {
  const q = query(
    collection(db, "joinRequests"),
    where("requesterId", "==", requesterId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getUserJoinRequests = async (userId) => {
  const q = query(collection(db, "joinRequests"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((r) => r.requesterId === userId || r.projectOwnerId === userId);
};

export const updateRequestStatus = async (requestId, status) => {
  const ref = doc(db, "joinRequests", requestId);
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });
};

export const deleteJoinRequest = async (requestId) => {
  await deleteDoc(doc(db, "joinRequests", requestId));
};

export const getJoinRequestForProject = async (projectId, requesterId) => {
  const q = query(
    collection(db, "joinRequests"),
    where("projectId", "==", projectId),
    where("requesterId", "==", requesterId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
};

export const cleanupOldRequests = async (hoursOld = 1) => {
  const cutoffTime = Date.now() - hoursOld * 60 * 60 * 1000;
  
  const q = query(collection(db, "joinRequests"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  
  let deletedCount = 0;
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (data.status === "accepted" || data.status === "rejected") {
      const updatedAt = data.updatedAt?.toDate()?.getTime() || data.createdAt?.toDate()?.getTime() || 0;
      if (updatedAt && updatedAt < cutoffTime) {
        await deleteDoc(doc(db, "joinRequests", docSnap.id));
        deletedCount++;
      }
    }
  }
  return deletedCount;
};