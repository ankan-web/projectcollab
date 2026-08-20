import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { createUserDoc } from "../services/userService";
import { trackDailyActiveUser } from "../services/analyticsService";
import { useAuthStore } from "../store/authStore";
import { hasAdminSession, adminUser, adminProfile } from "../services/adminService";

export const useAuth = () => {
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const githubToken = sessionStorage.getItem("github_access_token");
        const profile = await createUserDoc(firebaseUser, githubToken);
        setUser(firebaseUser);
        setProfile(profile);
        trackDailyActiveUser(firebaseUser.uid);
      } else if (hasAdminSession()) {
        setUser(adminUser());
        setProfile(adminProfile());
      } else {
        sessionStorage.removeItem("github_access_token");
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [setLoading, setProfile, setUser]);

  return { user: useAuthStore((s) => s.user) };
};
