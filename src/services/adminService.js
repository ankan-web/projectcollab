import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

const ADMIN_EMAIL = "***REMOVED***";
const ADMIN_PASSWORD = "***REMOVED***";

export const checkIsAdmin = async (email) => {
  return email === ADMIN_EMAIL;
};

export const hashPassword = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

export const verifyAdminCredentials = async (email, password) => {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
};

const queueQueryDeletes = async (batch, collectionName, constraints, counters, queuedPaths) => {
  const snap = await getDocs(query(collection(db, collectionName), ...constraints));
  snap.docs.forEach((docSnap) => {
    if (queuedPaths.has(docSnap.ref.path)) return;
    queuedPaths.add(docSnap.ref.path);
    batch.delete(docSnap.ref);
    counters[collectionName] = (counters[collectionName] || 0) + 1;
  });
};

export const deleteUserAppData = async (uid) => {
  const batch = writeBatch(db);
  const counters = {};
  const queuedPaths = new Set();

  await Promise.all([
    queueQueryDeletes(batch, "projects", [where("ownerId", "==", uid)], counters, queuedPaths),
    queueQueryDeletes(batch, "needs", [where("authorId", "==", uid)], counters, queuedPaths),
    queueQueryDeletes(batch, "joinRequests", [where("requesterId", "==", uid)], counters, queuedPaths),
    queueQueryDeletes(batch, "joinRequests", [where("projectOwnerId", "==", uid)], counters, queuedPaths),
    queueQueryDeletes(batch, "groupJoinRequests", [where("requesterId", "==", uid)], counters, queuedPaths),
    queueQueryDeletes(batch, "groupJoinRequests", [where("groupAdminId", "==", uid)], counters, queuedPaths),
    queueQueryDeletes(batch, "notifications", [where("userId", "==", uid)], counters, queuedPaths),
  ]);

  const groupsSnap = await getDocs(collection(db, "groups"));
  groupsSnap.docs.forEach((groupDoc) => {
    const group = groupDoc.data();
    const members = group.members || [];
    const removedMember = members.find((member) => member.uid === uid);
    if (!removedMember) return;

    const remainingMembers = members.filter((member) => member.uid !== uid);

    if (remainingMembers.length === 0) {
      batch.delete(groupDoc.ref);
      counters.groups = (counters.groups || 0) + 1;
      return;
    }

    let nextMembers = remainingMembers;
    let adminId = group.adminId;
    let adminName = group.adminName;

    if (group.adminId === uid || removedMember.role === "admin") {
      const nextAdmin = remainingMembers[0];
      nextMembers = remainingMembers.map((member, index) => ({
        ...member,
        role: index === 0 ? "admin" : "member",
      }));
      adminId = nextAdmin.uid;
      adminName = nextAdmin.displayName;
    }

    batch.update(groupDoc.ref, {
      members: nextMembers,
      memberCount: nextMembers.length,
      adminId,
      adminName,
      updatedAt: serverTimestamp(),
    });
  });

  batch.delete(doc(db, "users", uid));
  counters.users = 1;

  await batch.commit();
  return counters;
};
