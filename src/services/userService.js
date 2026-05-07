import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  increment,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { createNotification } from "./notificationService";

const getFirebasePhotoURL = (firebaseUser) => {
  if (firebaseUser.photoURL) return firebaseUser.photoURL;

  return firebaseUser.providerData?.find((provider) => provider.photoURL)?.photoURL || "";
};

const getGitHubPhotoURL = async (githubAccessToken) => {
  if (!githubAccessToken) return "";

  try {
    const response = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${githubAccessToken}` },
    });

    if (!response.ok) return "";

    const githubUser = await response.json();
    return githubUser.avatar_url || "";
  } catch (e) {
    console.error("Failed to fetch GitHub avatar:", e);
    return "";
  }
};

export const createUserDoc = async (firebaseUser, githubAccessToken = null) => {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);
  const newPhotoURL = getFirebasePhotoURL(firebaseUser) || await getGitHubPhotoURL(githubAccessToken);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || "",
      email: firebaseUser.email || "",
      photoURL: newPhotoURL,
      college: "",
      bio: "",
      skills: [],
      githubUsername: "",
      linkedIn: "",
      portfolio: "",
      onboarded: false,
      createdAt: serverTimestamp(),
    });
  } else {
    const existingData = snap.data();
    if (newPhotoURL && existingData.photoURL !== newPhotoURL) {
      await updateDoc(ref, { photoURL: newPhotoURL });
    }
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

export const checkUserExists = async (email, githubUsername = null) => {
  const usersRef = collection(db, "users");
  const normalizedEmail = email.toLowerCase();

  const emailQuery = query(usersRef, where("email", "==", normalizedEmail));
  const emailSnap = await getDocs(emailQuery);

  if (!emailSnap.empty) {
    return { exists: true, reason: "email" };
  }

  if (githubUsername) {
    const normalizedGithub = githubUsername.toLowerCase();
    const githubQuery = query(usersRef, where("githubUsername", "==", normalizedGithub));
    const githubSnap = await getDocs(githubQuery);

    if (!githubSnap.empty) {
      return { exists: true, reason: "github" };
    }
  }

  return { exists: false, reason: null };
};
