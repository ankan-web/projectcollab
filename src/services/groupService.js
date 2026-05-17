import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { createNotification } from "./notificationService";

const MAX_GROUP_MEMBERS = 6;

const toMember = (uid, profile, role = "member") => ({
  uid,
  displayName: profile?.displayName || "Builder",
  photoURL: profile?.photoURL || "",
  college: profile?.college || "",
  role,
  joinedAt: Timestamp.now(),
});

export const subscribeToGroups = (callback, onError) => {
  const q = query(collection(db, "groups"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    onError
  );
};

export const createGroup = async (uid, profile, data) => {
  const userRef = doc(db, "users", uid);
  const groupRef = doc(collection(db, "groups"));

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) throw new Error("User profile not found.");
    if (userSnap.data().groupId) throw new Error("You are already in a group.");

    const groupName = data.name.trim();
    transaction.set(groupRef, {
      name: groupName,
      description: data.description.trim(),
      focus: data.focus.trim(),
      skillsNeeded: data.skillsNeeded || [],
      adminId: uid,
      adminName: profile?.displayName || "Builder",
      members: [toMember(uid, profile, "admin")],
      memberCount: 1,
      maxMembers: MAX_GROUP_MEMBERS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    transaction.update(userRef, {
      groupId: groupRef.id,
      groupName,
      updatedAt: serverTimestamp(),
    });
  });

  return groupRef.id;
};

export const joinGroup = async (groupId, uid, profile) => {
  const groupRef = doc(db, "groups", groupId);
  const userRef = doc(db, "users", uid);

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    const groupSnap = await transaction.get(groupRef);

    if (!userSnap.exists()) throw new Error("User profile not found.");
    if (!groupSnap.exists()) throw new Error("Group not found.");
    if (userSnap.data().groupId) throw new Error("You are already in a group.");

    const group = groupSnap.data();
    const members = group.members || [];
    if (members.some((member) => member.uid === uid)) throw new Error("You are already in this group.");
    if (members.length >= (group.maxMembers || MAX_GROUP_MEMBERS)) throw new Error("This group is full.");

    const nextMembers = [...members, toMember(uid, profile)];
    transaction.update(groupRef, {
      members: nextMembers,
      memberCount: nextMembers.length,
      updatedAt: serverTimestamp(),
    });
    transaction.update(userRef, {
      groupId,
      groupName: group.name,
      updatedAt: serverTimestamp(),
    });
  });
};

export const sendGroupJoinRequest = async (groupId, requesterId, requesterProfile) => {
  const groupSnap = await getDoc(doc(db, "groups", groupId));
  const userSnap = await getDoc(doc(db, "users", requesterId));

  if (!groupSnap.exists()) throw new Error("Group not found.");
  if (!userSnap.exists()) throw new Error("User profile not found.");
  if (userSnap.data().groupId) throw new Error("You are already in a group.");

  const group = groupSnap.data();
  const members = group.members || [];
  if (members.some((member) => member.uid === requesterId)) throw new Error("You are already in this group.");
  if (members.length >= (group.maxMembers || MAX_GROUP_MEMBERS)) throw new Error("This group is full.");

  const existingQuery = query(
    collection(db, "groupJoinRequests"),
    where("groupId", "==", groupId),
    where("requesterId", "==", requesterId),
    where("status", "==", "pending")
  );
  const existingSnap = await getDocs(existingQuery);
  if (!existingSnap.empty) throw new Error("You already sent a request to this group.");

  const ref = await addDoc(collection(db, "groupJoinRequests"), {
    groupId,
    groupName: group.name || "Group",
    groupAdminId: group.adminId,
    requesterId,
    requesterName: requesterProfile?.displayName || "Builder",
    requesterPhoto: requesterProfile?.photoURL || "",
    requesterCollege: requesterProfile?.college || "",
    requesterSkills: requesterProfile?.skills || [],
    status: "pending",
    createdAt: serverTimestamp(),
  });

  if (group.adminId !== requesterId) {
    await createNotification(group.adminId, "group_join_request", {
      title: "New Group Request",
      message: `${requesterProfile?.displayName || "Someone"} wants to join "${group.name}"`,
      link: "/requests",
    });
  }

  return ref.id;
};

export const getUserGroupJoinRequests = async (userId) => {
  const q = query(collection(db, "groupJoinRequests"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((request) => request.requesterId === userId || request.groupAdminId === userId);
};

export const approveGroupJoinRequest = async (requestId, adminId) => {
  const requestRef = doc(db, "groupJoinRequests", requestId);

  await runTransaction(db, async (transaction) => {
    const requestSnap = await transaction.get(requestRef);
    if (!requestSnap.exists()) throw new Error("Request not found.");

    const request = requestSnap.data();
    if (request.groupAdminId !== adminId) throw new Error("Only the group admin can approve this request.");
    if (request.status !== "pending") throw new Error("This request has already been handled.");

    const groupRef = doc(db, "groups", request.groupId);
    const userRef = doc(db, "users", request.requesterId);
    const groupSnap = await transaction.get(groupRef);
    const userSnap = await transaction.get(userRef);

    if (!groupSnap.exists()) throw new Error("Group not found.");
    if (!userSnap.exists()) throw new Error("User profile not found.");
    if (userSnap.data().groupId) throw new Error("This user is already in a group.");

    const group = groupSnap.data();
    const members = group.members || [];
    if (members.length >= (group.maxMembers || MAX_GROUP_MEMBERS)) throw new Error("This group is full.");
    if (members.some((member) => member.uid === request.requesterId)) throw new Error("This user is already in this group.");

    const nextMembers = [
      ...members,
      {
        uid: request.requesterId,
        displayName: request.requesterName || "Builder",
        photoURL: request.requesterPhoto || "",
        college: request.requesterCollege || "",
        role: "member",
        joinedAt: Timestamp.now(),
      },
    ];

    transaction.update(groupRef, {
      members: nextMembers,
      memberCount: nextMembers.length,
      updatedAt: serverTimestamp(),
    });
    transaction.update(userRef, {
      groupId: request.groupId,
      groupName: group.name,
      updatedAt: serverTimestamp(),
    });
    transaction.update(requestRef, {
      status: "accepted",
      updatedAt: serverTimestamp(),
    });
  });
};

export const rejectGroupJoinRequest = async (requestId) => {
  await updateDoc(doc(db, "groupJoinRequests", requestId), {
    status: "rejected",
    updatedAt: serverTimestamp(),
  });
};

export const deleteGroupJoinRequest = async (requestId) => {
  await deleteDoc(doc(db, "groupJoinRequests", requestId));
};

export const leaveGroup = async (groupId, uid) => {
  const groupRef = doc(db, "groups", groupId);
  const userRef = doc(db, "users", uid);

  await runTransaction(db, async (transaction) => {
    const groupSnap = await transaction.get(groupRef);
    const userSnap = await transaction.get(userRef);
    if (!groupSnap.exists() || !userSnap.exists()) return;

    const group = groupSnap.data();
    const members = group.members || [];
    const leavingMember = members.find((member) => member.uid === uid);
    if (!leavingMember) return;

    const remainingMembers = members.filter((member) => member.uid !== uid);
    transaction.update(userRef, {
      groupId: "",
      groupName: "",
      updatedAt: serverTimestamp(),
    });

    if (remainingMembers.length === 0) {
      transaction.delete(groupRef);
      return;
    }

    let nextMembers = remainingMembers;
    let adminId = group.adminId;
    let adminName = group.adminName;

    if (leavingMember.role === "admin" || group.adminId === uid) {
      const nextAdmin = remainingMembers[0];
      nextMembers = remainingMembers.map((member, index) => ({
        ...member,
        role: index === 0 ? "admin" : "member",
      }));
      adminId = nextAdmin.uid;
      adminName = nextAdmin.displayName;
    }

    transaction.update(groupRef, {
      members: nextMembers,
      memberCount: nextMembers.length,
      adminId,
      adminName,
      updatedAt: serverTimestamp(),
    });
  });
};

export const disbandGroup = async (groupId, uid) => {
  const groupRef = doc(db, "groups", groupId);

  await runTransaction(db, async (transaction) => {
    const groupSnap = await transaction.get(groupRef);
    if (!groupSnap.exists()) return;

    const group = groupSnap.data();
    if (group.adminId !== uid) throw new Error("Only the group admin can disband this group.");

    const members = group.members || [];
    const userSnaps = await Promise.all(
      members.map((member) => transaction.get(doc(db, "users", member.uid)))
    );

    members.forEach((member, index) => {
      if (!userSnaps[index].exists()) return;
      transaction.update(doc(db, "users", member.uid), {
        groupId: "",
        groupName: "",
        updatedAt: serverTimestamp(),
      });
    });
    transaction.delete(groupRef);
  });
};

export const getGroup = async (groupId) => {
  const snap = await getDoc(doc(db, "groups", groupId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export { MAX_GROUP_MEMBERS };
