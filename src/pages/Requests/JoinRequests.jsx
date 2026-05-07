import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import { useAuthStore } from "../../store/authStore";
import { getUserJoinRequests, updateRequestStatus, deleteJoinRequest, cleanupOldRequests } from "../../services/joinService";
import { getProject } from "../../services/projectService";

export default function JoinRequests() {
  const { user } = useAuthStore();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("incoming");

  useEffect(() => {
    cleanupOldRequests(1);
    (async () => {
      try {
        const allRequests = await getUserJoinRequests(user.uid);
        
        const incoming = allRequests.filter((r) => r.projectOwnerId === user.uid);
        const outgoing = allRequests.filter((r) => r.requesterId === user.uid);
        
        const enrichedIncoming = await Promise.all(
          incoming.map(async (req) => {
            const project = await getProject(req.projectId);
            return { ...req, project };
          })
        );
        
        setIncomingRequests(enrichedIncoming);
        setMyRequests(outgoing);
      } catch (err) {
        console.error("Error loading requests:", err);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccept = async (requestId) => {
    try {
      await updateRequestStatus(requestId, "accepted");
      setIncomingRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "accepted" } : r))
      );
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await updateRequestStatus(requestId, "rejected");
      setIncomingRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "rejected" } : r))
      );
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  const handleWithdraw = async (requestId) => {
    if (!window.confirm("Withdraw this request?")) return;
    try {
      await deleteJoinRequest(requestId);
      setMyRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error("Error withdrawing request:", err);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        .requests-shell { max-width: 800px; margin: 0 auto; padding: 32px 24px 64px; }
        .requests-title { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 24px; }
        .tab-row { display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 0.5px solid rgba(255,255,255,0.08); padding-bottom: 16px; }
        .tab-btn {
          padding: 10px 20px; border-radius: 10px; font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700; border: none; cursor: pointer;
          transition: all 0.15s; background: transparent; color: rgba(255,255,255,0.4);
        }
        .tab-btn:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); }
        .tab-btn.active { background: rgba(99,255,180,0.1); color: #63ffb4; }
        .requests-list { display: flex; flex-direction: column; gap: 16px; }
        .request-card {
          background: #111113; border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 20px;
        }
        .request-card:hover { border-color: rgba(255,255,255,0.15); }
        .request-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .request-user { display: flex; align-items: center; gap: 12px; }
        .request-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(99,255,180,0.1); border: 1.5px solid rgba(99,255,180,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 600; color: #63ffb4; overflow: hidden;
        }
        .request-avatar img { width: 100%; height: 100%; objectFit: cover; }
        .request-name { font-size: 14px; font-weight: 600; color: #fff; margin: 0 0 2px; }
        .request-college { font-size: 12px; color: rgba(255,255,255,0.4); }
        .request-status {
          font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 12px;
        }
        .request-status.pending { background: rgba(255,200,0,0.1); color: #ffc800; }
        .request-status.accepted { background: rgba(99,255,180,0.1); color: #63ffb4; }
        .request-status.rejected { background: rgba(255,80,80,0.1); color: #ff5555; }
        .request-project { font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 12px; }
        .request-project strong { color: #63ffb4; }
        .request-message {
          font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6;
          background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px;
          margin-bottom: 16px;
        }
        .request-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .skill-chip { font-size: 11px; padding: 3px 10px; border-radius: 20px; background: rgba(255,255,255,0.05); border: 0.5px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); }
        .request-actions { display: flex; gap: 12px; }
        .request-btn {
          padding: 8px 16px; border-radius: 8px; font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; border: none;
        }
        .request-btn.accept { background: #63ffb4; color: #09090b; }
        .request-btn.accept:hover { background: #7affc4; }
        .request-btn.reject { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); }
        .request-btn.reject:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .request-btn.withdraw { background: rgba(255,80,80,0.1); color: #ff5555; }
        .request-btn.withdraw:hover { background: rgba(255,80,80,0.2); }
        .empty-state { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.4); }
      `}</style>

      <Navbar />

      <main className="requests-shell">
        <h1 className="requests-title">Join Requests</h1>

        <div className="tab-row">
          <button
            className={`tab-btn ${activeTab === "incoming" ? "active" : ""}`}
            onClick={() => setActiveTab("incoming")}
          >
            Received ({incomingRequests.filter((r) => r.status === "pending").length})
          </button>
          <button
            className={`tab-btn ${activeTab === "sent" ? "active" : ""}`}
            onClick={() => setActiveTab("sent")}
          >
            Sent ({myRequests.length})
          </button>
        </div>

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : activeTab === "incoming" ? (
          incomingRequests.length === 0 ? (
            <div className="empty-state">
              <p>No join requests yet. When someone requests to join your project, it'll show here.</p>
            </div>
          ) : (
            <div className="requests-list">
              {incomingRequests.map((req) => (
                <div key={req.id} className="request-card">
                  <div className="request-header">
                    <div className="request-user">
                      <div className="request-avatar">
                        {req.requesterPhoto ? (
                          <img src={req.requesterPhoto} alt="" />
                        ) : (
                          req.requesterName?.[0]?.toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="request-name">{req.requesterName || "User"}</p>
                        {req.requesterCollege && (
                          <p className="request-college">{req.requesterCollege}</p>
                        )}
                      </div>
                    </div>
                    <span className={`request-status ${req.status}`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>
                  
                  {req.project && (
                    <p className="request-project">
                      Wants to join: <strong>{req.project.title}</strong>
                    </p>
                  )}
                  
                  {req.message && (
                    <p className="request-message">"{req.message}"</p>
                  )}
                  
                  {req.requesterSkills?.length > 0 && (
                    <div className="request-skills">
                      {req.requesterSkills.map((skill) => (
                        <span key={skill} className="skill-chip">{skill}</span>
                      ))}
                    </div>
                  )}
                  
                  {req.status === "pending" && (
                    <div className="request-actions">
                      <button
                        className="request-btn accept"
                        onClick={() => handleAccept(req.id)}
                      >
                        Accept
                      </button>
                      <button
                        className="request-btn reject"
                        onClick={() => handleReject(req.id)}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          myRequests.length === 0 ? (
            <div className="empty-state">
              <p>You haven't sent any join requests yet.</p>
            </div>
          ) : (
            <div className="requests-list">
              {myRequests.map((req) => (
                <div key={req.id} className="request-card">
                  <div className="request-header">
                    <div className="request-user">
                      <div className="request-avatar">
                        {req.requesterPhoto ? (
                          <img src={req.requesterPhoto} alt="" />
                        ) : (
                          req.requesterName?.[0]?.toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="request-name">{req.requesterName || "You"}</p>
                      </div>
                    </div>
                    <span className={`request-status ${req.status}`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="request-project">
                    Applied to: <strong>{req.projectTitle}</strong>
                  </p>
                  
                  {req.message && (
                    <p className="request-message">"{req.message}"</p>
                  )}
                  
                  {req.status === "pending" && (
                    <div className="request-actions">
                      <button
                        className="request-btn withdraw"
                        onClick={() => handleWithdraw(req.id)}
                      >
                        Withdraw
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}