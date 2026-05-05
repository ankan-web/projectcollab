import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { createUserDoc } from "../services/userService";
import { trackDailyActiveUser } from "../services/analyticsService";
import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await createUserDoc(firebaseUser);
        setUser(firebaseUser);
        setProfile(profile);
        trackDailyActiveUser(firebaseUser.uid);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [setLoading, setProfile, setUser]);

  return { user: useAuthStore((s) => s.user) };
};
