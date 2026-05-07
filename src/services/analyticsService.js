import { doc, setDoc, getDoc, updateDoc, increment, collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "./firebase";

const getTodayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

export const trackDailyActiveUser = async (userId) => {
  if (!userId) return;
  
  const today = getTodayKey();
  const ref = doc(db, "analytics", today);
  
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      date: today,
      activeUsers: [userId],
      activeUserCount: 1,
      lastUpdated: new Date(),
    });
  } else {
    const data = snap.data();
    const activeUsers = data.activeUsers || [];
    if (!activeUsers.includes(userId)) {
      await updateDoc(ref, {
        activeUsers: [...activeUsers, userId],
        activeUserCount: increment(1),
        lastUpdated: new Date(),
      });
    }
  }
};

export const getDailyActiveUsers = async (days = 7) => {
  const results = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    const snap = await getDoc(doc(db, "analytics", key));
    results.push({
      date: key,
      count: snap.exists() ? snap.data().activeUserCount || 0 : 0,
    });
  }
  return results.reverse();
};

export const getTotalUsersCount = async () => {
  const snap = await getDocs(query(collection(db, "users"), limit(1000)));
  return snap.size;
};

export const getTotalProjectsCount = async () => {
  const snap = await getDocs(query(collection(db, "projects"), limit(1000)));
  return snap.size;
};

export const getTotalNeedsCount = async () => {
  const snap = await getDocs(query(collection(db, "needs"), limit(1000)));
  return snap.size;
};