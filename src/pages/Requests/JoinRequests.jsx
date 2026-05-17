import { useState, useEffect } from "react";
import Navbar from "../../components/layout/Navbar";
import { useAuthStore } from "../../store/authStore";
import { getUserJoinRequests, updateRequestStatus, deleteJoinRequest, cleanupOldRequests } from "../../services/joinService";
import { getProject } from "../../services/projectService";
import {
  approveGroupJoinRequest,
  deleteGroupJoinRequest,
  getUserGroupJoinRequests,
  rejectGroupJoinRequest,
} from "../../services/groupService";

export default function JoinRequests() {
  const { user } = useAuthStore();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [incomingGroupRequests, setIncomingGroupRequests] = useState([]);
  const [myGroupRequests, setMyGroupRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("incoming");

  useEffect(() => {
    cleanupOldRequests(1);
    (async () => {
      try {
        const allRequests = await getUserJoinRequests(user.uid);
        const allGroupRequests = await getUserGroupJoinRequests(user.uid);
        
        const incoming = allRequests.filter((r) => r.projectOwnerId === user.uid);
        const outgoing = allRequests.filter((r) => r.requesterId === user.uid);
        const incomingGroups = allGroupRequests.filter((r) => r.groupAdminId === user.uid);
        const outgoingGroups = allGroupRequests.filter((r) => r.requesterId === user.uid);
        
        const enrichedIncoming = await Promise.all(
          incoming.map(async (req) => {
            const project = await getProject(req.projectId);
            return { ...req, project };
          })
        );
        
        setIncomingRequests(enrichedIncoming);
        setMyRequests(outgoing);
        setIncomingGroupRequests(incomingGroups);
        setMyGroupRequests(outgoingGroups);
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

  const handleGroupAccept = async (requestId) => {
    try {
      await approveGroupJoinRequest(requestId, user.uid);
      setIncomingGroupRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "accepted" } : r))
      );
    } catch (err) {
      console.error("Error accepting group request:", err);
    }
  };

  const handleGroupReject = async (requestId) => {
    try {
      await rejectGroupJoinRequest(requestId);
      setIncomingGroupRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "rejected" } : r))
      );
    } catch (err) {
      console.error("Error rejecting group request:", err);
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

  const handleGroupWithdraw = async (requestId) => {
    if (!window.confirm("Withdraw this group request?")) return;
    try {
      await deleteGroupJoinRequest(requestId);
      setMyGroupRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error("Error withdrawing group request:", err);
    }
  };

  const pendingIncomingCount = incomingRequests.filter((r) => r.status === "pending").length
    + incomingGroupRequests.filter((r) => r.status === "pending").length;
  const sentCount = myRequests.length + myGroupRequests.length;

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
        .request-section { margin-bottom: 28px; }
        .request-section-title {
          font-family: 'Syne', sans-serif; font-size: 15px; color: #fff;
          margin: 0 0 12px; display: flex; align-items: center; gap: 8px;
        }
        .request-section-count {
          color: #63ffb4; background: rgba(99,255,180,0.1); border: 0.5px solid rgba(99,255,180,0.22);
          border-radius: 999px; padding: 2px 8px; font-family: 'DM Sans', sans-serif; font-size: 11px;
        }
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
        @media (max-width: 640px) {
          .requests-shell { padding: 24px 16px 56px; }
          .requests-title { font-size: 22px; margin-bottom: 18px; }
          .tab-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding-bottom: 12px; margin-bottom: 20px; }
          .tab-btn { padding: 10px 8px; font-size: 12px; }
          .request-card { padding: 16px; }
          .request-header { align-items: flex-start; gap: 12px; }
          .request-user { min-width: 0; flex: 1; }
          .request-status { flex-shrink: 0; }
          .request-actions { flex-direction: column; gap: 8px; }
          .request-btn { width: 100%; padding: 10px 14px; }
          .request-message { font-size: 13px; }
        }
        @media (max-width: 420px) {
          .request-header { flex-direction: column; }
          .request-status { align-self: flex-start; }
        }
      `}</style>

      <Navbar />

      <main className="requests-shell">
        <h1 className="requests-title">Join Requests</h1>

        <div className="tab-row">
          <button
            className={`tab-btn ${activeTab === "incoming" ? "active" : ""}`}
            onClick={() => setActiveTab("incoming")}
          >
            Received ({pendingIncomingCount})
          </button>
          <button
            className={`tab-btn ${activeTab === "sent" ? "active" : ""}`}
            onClick={() => setActiveTab("sent")}
          >
            Sent ({sentCount})
          </button>
        </div>

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : activeTab === "incoming" ? (
          incomingRequests.length === 0 && incomingGroupRequests.length === 0 ? (
            <div className="empty-state">
              <p>No join requests yet. Project and group requests will show here.</p>
            </div>
          ) : (
            <div>
              {incomingRequests.length > 0 && (
                <section className="request-section">
                  <h2 className="request-section-title">
                    Project Join Requests
                    <span className="request-section-count">{incomingRequests.filter((r) => r.status === "pending").length}</span>
                  </h2>
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
                </section>
              )}

              {incomingGroupRequests.length > 0 && (
                <section className="request-section">
                  <h2 className="request-section-title">
                    Group Join Requests
                    <span className="request-section-count">{incomingGroupRequests.filter((r) => r.status === "pending").length}</span>
                  </h2>
                  <div className="requests-list">
                    {incomingGroupRequests.map((req) => (
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

                        <p className="request-project">
                          Wants to join group: <strong>{req.groupName}</strong>
                        </p>

                        {req.requesterSkills?.length > 0 && (
                          <div className="request-skills">
                            {req.requesterSkills.map((skill) => (
                              <span key={skill} className="skill-chip">{skill}</span>
                            ))}
                          </div>
                        )}

                        {req.status === "pending" && (
                          <div className="request-actions">
                            <button className="request-btn accept" onClick={() => handleGroupAccept(req.id)}>
                              Accept
                            </button>
                            <button className="request-btn reject" onClick={() => handleGroupReject(req.id)}>
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )
        ) : (
          myRequests.length === 0 && myGroupRequests.length === 0 ? (
            <div className="empty-state">
              <p>You haven't sent any join requests yet.</p>
            </div>
          ) : (
            <div>
              {myRequests.length > 0 && (
                <section className="request-section">
                  <h2 className="request-section-title">Project Join Requests</h2>
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
                </section>
              )}

              {myGroupRequests.length > 0 && (
                <section className="request-section">
                  <h2 className="request-section-title">Group Join Requests</h2>
                  <div className="requests-list">
                    {myGroupRequests.map((req) => (
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
                          Requested to join group: <strong>{req.groupName}</strong>
                        </p>

                        {req.status === "pending" && (
                          <div className="request-actions">
                            <button className="request-btn withdraw" onClick={() => handleGroupWithdraw(req.id)}>
                              Withdraw
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )
        )}
      </main>
    </div>
  );
}
