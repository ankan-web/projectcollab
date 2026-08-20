import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { getDocs, collection, deleteDoc, doc } from "firebase/firestore";
import { auth } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc as docRef, getDoc } from "firebase/firestore";
import { getDailyActiveUsers, getTotalUsersCount, getTotalProjectsCount, getTotalNeedsCount } from "../../services/analyticsService";
import { deleteUserAppData, hasAdminSession, endAdminSession } from "../../services/adminService";
import { useAuthStore } from "../../store/authStore";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { setUser, setProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState("");
  const [stats, setStats] = useState({ users: 0, projects: 0, needs: 0, daily: [] });

  const loadStats = async () => {
    try {
      const [userCount, projectCount, needCount, dailyData] = await Promise.all([
        getTotalUsersCount(),
        getTotalProjectsCount(),
        getTotalNeedsCount(),
        getDailyActiveUsers(7),
      ]);
      setStats({
        users: userCount,
        projects: projectCount,
        needs: needCount,
        daily: dailyData,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "users") {
        const snap = await getDocs(collection(db, "users"));
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } else if (activeTab === "projects") {
        const snap = await getDocs(collection(db, "projects"));
        setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } else if (activeTab === "needs") {
        const snap = await getDocs(collection(db, "needs"));
        setNeeds(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (hasAdminSession()) {
          loadData();
          loadStats();
          return;
        }
        navigate("/login");
        return;
      }
      
      const userDoc = await getDoc(docRef(db, "users", user.uid));
      const userData = userDoc.data();
      
      if (!userData?.isAdmin) {
        navigate("/home");
        return;
      }
      
      loadData();
      loadStats();
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleDeleteUser = async (userId, userName) => {
    if (userId === auth.currentUser?.uid) {
      setAdminError("You cannot delete the admin account you are currently signed in with.");
      return;
    }
    setDeleteTarget({ type: "user", id: userId, name: userName || userId });
    setShowDeleteModal(true);
  };

  const handleDeleteProject = async (projectId, projectTitle) => {
    setDeleteTarget({ type: "project", id: projectId, name: projectTitle });
    setShowDeleteModal(true);
  };

  const handleDeleteNeed = async (needId, needTitle) => {
    setDeleteTarget({ type: "need", id: needId, name: needTitle });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    setShowDeleteModal(false);
    setAdminMessage("");
    setAdminError("");
    
    try {
      if (deleteTarget.type === "user") {
        await deleteUserAppData(deleteTarget.id);
        await loadData();
        setAdminMessage("User app data was deleted from Firestore. Delete the Firebase Authentication user separately in Firebase Console.");
      } else if (deleteTarget.type === "project") {
        await deleteDoc(doc(db, "projects", deleteTarget.id));
        setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setAdminMessage("Project deleted.");
      } else if (deleteTarget.type === "need") {
        await deleteDoc(doc(db, "needs", deleteTarget.id));
        setNeeds((prev) => prev.filter((n) => n.id !== deleteTarget.id));
        setAdminMessage("Post deleted.");
      }
      loadStats();
    } catch (err) {
      console.error("Error deleting:", err);
      setAdminError(err.message || "Delete failed. Check Firestore rules and try again.");
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  const handleLogout = () => {
    endAdminSession();
    setUser(null);
    setProfile(null);
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "'JetBrains Mono', monospace", color: "#EAEAEA" }}>
      <style>{`
        .admin-shell { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
        .admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
        .admin-title { font-family: 'Archivo Black', sans-serif; font-size: 24px; font-weight: 400; text-transform: uppercase; letter-spacing: -0.02em; color: #EAEAEA; margin: 0; }
        .admin-title .red { color: #E61919; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #1A1A1A; border: 1px solid #1A1A1A; margin-bottom: 32px; }
        .stat-card { background: #0E0E0E; padding: 20px; }
        .stat-value { font-family: 'Archivo Black', sans-serif; font-size: 28px; font-weight: 400; color: #EAEAEA; margin: 0 0 8px; font-variant-numeric: tabular-nums; }
        .stat-value .red { color: #E61919; }
        .stat-label { font-size: 10px; color: rgba(234,234,234,0.4); font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin: 0; }
        .chart-section { background: #0E0E0E; border: 1px solid #1A1A1A; padding: 20px; margin-bottom: 32px; }
        .chart-title { font-family: 'Archivo Black', sans-serif; font-size: 15px; font-weight: 400; text-transform: uppercase; color: #EAEAEA; margin: 0 0 16px; }
        .chart-bars { display: flex; align-items: flex-end; justify-content: space-around; height: 120px; gap: 8px; }
        .chart-bar-container { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .chart-bar { width: 32px; background: rgba(230,25,25,0.55); border-top: 2px solid #E61919; transition: height 0.3s; }
        .chart-label { font-size: 10px; color: rgba(234,234,234,0.4); }
        .chart-count { font-size: 10px; color: #E61919; font-weight: 700; font-variant-numeric: tabular-nums; }
        .admin-tabs { display: flex; margin-bottom: 24px; }
        .admin-tab { padding: 10px 20px; border: 1px solid #2A2A2A; border-right: none; background: transparent; color: rgba(234,234,234,0.5); cursor: pointer; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; transition: background 0.15s, color 0.15s; }
        .admin-tab:last-child { border-right: 1px solid #2A2A2A; }
        .admin-tab:hover { color: rgba(234,234,234,0.85); }
        .admin-tab.active { background: #E61919; border-color: #E61919; color: #fff; }
        .admin-table-wrap { overflow-x: auto; }
        .admin-table { width: 100%; min-width: 560px; background: #0E0E0E; border: 1px solid #1A1A1A; border-collapse: collapse; }
        .admin-th { padding: 12px 16px; text-align: left; font-size: 10px; font-weight: 700; color: rgba(234,234,234,0.4); text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid #1A1A1A; }
        .admin-td { padding: 12px 16px; font-size: 12px; color: rgba(234,234,234,0.7); border-bottom: 1px solid #1A1A1A; }
        .admin-row:hover { background: #101010; }
        .admin-note {
          background: rgba(230,25,25,0.06);
          border: 1px solid rgba(230,25,25,0.3);
          color: rgba(234,234,234,0.64);
          padding: 12px 14px;
          font-size: 12px;
          line-height: 1.6;
          margin-bottom: 18px;
        }
        .admin-alert {
          border: 1px solid #2A2A2A;
          padding: 11px 13px;
          font-size: 12px;
          margin-bottom: 16px;
        }
        .admin-alert.success { background: rgba(74,246,38,0.06); border-color: rgba(74,246,38,0.35); color: #4AF626; }
        .admin-alert.error { background: rgba(230,25,25,0.08); border-color: rgba(230,25,25,0.4); color: #FF6B6B; }
        .empty-state { padding: 60px 20px; text-align: center; color: rgba(234,234,234,0.4); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; border: 1px dashed #2A2A2A; }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .admin-tabs { flex-wrap: wrap; }
          .admin-tab { border: 1px solid #2A2A2A !important; }
        }
      `}</style>

      <div className="admin-shell">
        <div className="admin-header">
          <h1 className="admin-title">Admin <span className="red">Dashboard</span></h1>
          <button className="btn btn-danger" onClick={handleLogout}>Sign out</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.users}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.projects}</div>
            <div className="stat-label">Total Projects</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.needs}</div>
            <div className="stat-label">Total Posts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value"><span className="red">{stats.daily[stats.daily.length - 1]?.count || 0}</span></div>
            <div className="stat-label">Active Today</div>
          </div>
        </div>

        {stats.daily.length > 0 && (
          <div className="chart-section">
            <h3 className="chart-title">Daily active users [ 7 days ]</h3>
            <div className="chart-bars">
              {stats.daily.map((day) => {
                const maxCount = Math.max(...stats.daily.map((d) => d.count), 1);
                const height = Math.max((day.count / maxCount) * 100, 2);
                return (
                  <div key={day.date} className="chart-bar-container">
                    <span className="chart-count">{day.count}</span>
                    <div className="chart-bar" style={{ height: `${height}px` }} />
                    <span className="chart-label">{day.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
            Users ({users.length})
          </button>
          <button className={`admin-tab ${activeTab === "projects" ? "active" : ""}`} onClick={() => setActiveTab("projects")}>
            Projects ({projects.length})
          </button>
          <button className={`admin-tab ${activeTab === "needs" ? "active" : ""}`} onClick={() => setActiveTab("needs")}>
            Posts ({needs.length})
          </button>
        </div>

        {activeTab === "users" && (
          <div className="admin-note">
            WARNING: Deleting a user here removes their Firestore profile and app data. Firebase Authentication users must be deleted from Firebase Console or through a backend Admin SDK function.
          </div>
        )}

        {adminMessage && <div className="admin-alert success">{adminMessage}</div>}
        {adminError && <div className="admin-alert error">{adminError}</div>}

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : activeTab === "users" ? (
          users.length === 0 ? (
            <div className="empty-state">No users found</div>
          ) : (
            <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th">Name</th>
                  <th className="admin-th">Email</th>
                  <th className="admin-th">College</th>
                  <th className="admin-th">Skills</th>
                  <th className="admin-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="admin-row">
                    <td className="admin-td">{user.displayName || "—"}</td>
                    <td className="admin-td">{user.email || "—"}</td>
                    <td className="admin-td">{user.college || "—"}</td>
                    <td className="admin-td">{user.skills?.slice(0, 3).join(", ") || "—"}</td>
                    <td className="admin-td">
                      <button className="btn btn-danger" style={{ padding: "6px 12px", fontSize: 10 }} onClick={() => handleDeleteUser(user.id, user.displayName)} disabled={deleting === user.id}>
                        {deleting === user.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )
        ) : activeTab === "projects" ? (
          projects.length === 0 ? (
            <div className="empty-state">No projects found</div>
          ) : (
            <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th">Title</th>
                  <th className="admin-th">Owner</th>
                  <th className="admin-th">Domain</th>
                  <th className="admin-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="admin-row">
                    <td className="admin-td">{project.title || "—"}</td>
                    <td className="admin-td">{project.ownerName || "—"}</td>
                    <td className="admin-td">{project.domain || "—"}</td>
                    <td className="admin-td">
                      <button className="btn btn-danger" style={{ padding: "6px 12px", fontSize: 10 }} onClick={() => handleDeleteProject(project.id, project.title)} disabled={deleting === project.id}>
                        {deleting === project.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )
        ) : (
          needs.length === 0 ? (
            <div className="empty-state">No posts found</div>
          ) : (
            <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th">Title</th>
                  <th className="admin-th">Author</th>
                  <th className="admin-th">Type</th>
                  <th className="admin-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {needs.map((need) => (
                  <tr key={need.id} className="admin-row">
                    <td className="admin-td">{need.title || "—"}</td>
                    <td className="admin-td">{need.authorName || "—"}</td>
                    <td className="admin-td">{need.type || "—"}</td>
                    <td className="admin-td">
                      <button className="btn btn-danger" style={{ padding: "6px 12px", fontSize: 10 }} onClick={() => handleDeleteNeed(need.id, need.title)} disabled={deleting === need.id}>
                        {deleting === need.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )
        )}
      </div>

      {showDeleteModal && deleteTarget && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="confirm-panel" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
              </svg>
            </div>
            <h3 className="modal-title">Delete {deleteTarget.type}?</h3>
            <p className="confirm-message">
              Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? This action cannot be undone.
              {deleteTarget.type === "user" && (
                <>
                  <br /><br />
                  This removes Firestore app data only. Delete the Auth account separately in Firebase Console.
                </>
              )}
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}