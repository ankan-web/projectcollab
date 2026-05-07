import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { getDocs, collection, deleteDoc, doc } from "firebase/firestore";
import { auth } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc as docRef, getDoc } from "firebase/firestore";
import { getDailyActiveUsers, getTotalUsersCount, getTotalProjectsCount, getTotalNeedsCount } from "../../services/analyticsService";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
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
    setDeleteTarget({ type: "user", id: userId, name: userName });
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
    
    try {
      if (deleteTarget.type === "user") {
        await deleteDoc(doc(db, "users", deleteTarget.id));
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      } else if (deleteTarget.type === "project") {
        await deleteDoc(doc(db, "projects", deleteTarget.id));
        setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      } else if (deleteTarget.type === "need") {
        await deleteDoc(doc(db, "needs", deleteTarget.id));
        setNeeds((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      }
      loadStats();
    } catch (err) {
      console.error("Error deleting:", err);
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .admin-shell { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
        .admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
        .admin-title { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #fff; }
        .admin-logout { background: rgba(255,80,80,0.1); border: none; color: #ff5555; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .stat-card { background: #111113; border: 0.5px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; }
        .stat-value { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #fff; }
        .stat-label { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 4px; }
        .chart-section { background: #111113; border: 0.5px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin-bottom: 32px; }
        .chart-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #fff; margin: 0 0 16px; }
        .chart-bars { display: flex; align-items: flex-end; justify-content: space-around; height: 120px; gap: 8px; }
        .chart-bar-container { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .chart-bar { width: 32px; background: rgba(99,255,180,0.3); border-radius: 4px 4px 0 0; transition: height 0.3s; }
        .chart-label { font-size: 11px; color: rgba(255,255,255,0.4); }
        .chart-count { font-size: 11px; color: #63ffb4; font-weight: 600; }
        .admin-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
        .admin-tab { padding: 10px 20px; border-radius: 10px; border: none; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); cursor: pointer; font-weight: 600; transition: all 0.15s; }
        .admin-tab:hover { background: rgba(255,255,255,0.08); }
        .admin-tab.active { background: rgba(99,255,180,0.15); color: #63ffb4; }
        .admin-table { width: 100%; background: #111113; border-radius: 12px; overflow: hidden; }
        .admin-th { padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 0.5px solid rgba(255,255,255,0.08); }
        .admin-td { padding: 14px 16px; font-size: 13px; color: rgba(255,255,255,0.7); border-bottom: 0.5px solid rgba(255,255,255,0.05); }
        .admin-row:hover { background: rgba(255,255,255,0.02); }
        .admin-btn { padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; }
        .admin-btn.delete { background: rgba(255,80,80,0.1); color: #ff5555; }
        .admin-btn.delete:hover { background: rgba(255,80,80,0.2); }
        .empty-state { padding: 60px 20px; text-align: center; color: rgba(255,255,255,0.4); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: #18181b; border: 0.5px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 28px; width: 90%; max-width: 360px; text-align: center; }
        .modal-icon { width: 52px; height: 52px; border-radius: 50%; background: rgba(255,80,80,0.1); border: 1px solid rgba(255,80,80,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
        .modal-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #fff; margin: 0 0 8px; }
        .modal-text { font-size: 14px; color: rgba(255,255,255,0.5); margin: 0 0 24px; }
        .modal-actions { display: flex; gap: 12px; }
        .modal-btn { flex: 1; padding: 12px; border-radius: 10px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; border: none; }
        .modal-btn.cancel { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); }
        .modal-btn.cancel:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .modal-btn.delete { background: #ff5555; color: #fff; }
        .modal-btn.delete:hover { background: #ff6b6b; }
      `}</style>

      <div className="admin-shell">
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <button className="admin-logout" onClick={handleLogout}>Sign out</button>
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
            <div className="stat-value">{stats.daily[stats.daily.length - 1]?.count || 0}</div>
            <div className="stat-label">Active Today</div>
          </div>
        </div>

        {stats.daily.length > 0 && (
          <div className="chart-section">
            <h3 className="chart-title">Daily Active Users (Last 7 Days)</h3>
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

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : activeTab === "users" ? (
          users.length === 0 ? (
            <div className="empty-state">No users found</div>
          ) : (
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
                      <button className="admin-btn delete" onClick={() => handleDeleteUser(user.id, user.displayName)} disabled={deleting === user.id}>
                        {deleting === user.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : activeTab === "projects" ? (
          projects.length === 0 ? (
            <div className="empty-state">No projects found</div>
          ) : (
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
                      <button className="admin-btn delete" onClick={() => handleDeleteProject(project.id, project.title)} disabled={deleting === project.id}>
                        {deleting === project.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          needs.length === 0 ? (
            <div className="empty-state">No posts found</div>
          ) : (
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
                      <button className="admin-btn delete" onClick={() => handleDeleteNeed(need.id, need.title)} disabled={deleting === need.id}>
                        {deleting === need.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {showDeleteModal && deleteTarget && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff5555" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
              </svg>
            </div>
            <h3 className="modal-title">Delete {deleteTarget.type}?</h3>
            <p className="modal-text">
              Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="modal-btn delete" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}