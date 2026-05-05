import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { subscribeToNotifications } from "../../services/notificationService";
import { useAuthStore } from "../../store/authStore";

export default function NotificationListener() {
  const { user } = useAuthStore();
  const notifiedIds = useRef(new Set());
  const initialSnapshotLoaded = useRef(false);

  useEffect(() => {
    if (!user?.uid) return;

    notifiedIds.current = new Set();
    initialSnapshotLoaded.current = false;

    const unsubscribe = subscribeToNotifications(user.uid, (notifications) => {
      if (!initialSnapshotLoaded.current) {
        notifications.forEach((notif) => notifiedIds.current.add(notif.id));
        initialSnapshotLoaded.current = true;
        return;
      }

      notifications.forEach((notif) => {
        if (!notifiedIds.current.has(notif.id)) {
          notifiedIds.current.add(notif.id);

          if (notif.type === "message") return;
          
          const icons = {
            join_request: "🤝",
            project_view: "👀",
            profile_view: "👤",
          };
          
          toast(notif.message, {
            icon: icons[notif.type] || "🔔",
            duration: 4000,
          });
        }
      });
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return null;
}
