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

const getInitials = (name = "") => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "?";
};

export default function JoinRequests() {
  const { user } = useAuthStore();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [incomingGroupRequests, setIncomingGroupRequests] = useState([]);
  const [myGroupRequests, setMyGroupRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("incoming");
  const [busyId, setBusyId] = useState("");
  const [confirmWithdraw, setConfirmWithdraw] = useState(null);

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
    setBusyId(requestId);
    try {
      await updateRequestStatus(requestId, "accepted");
      setIncomingRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "accepted" } : r))
      );
    } catch (err) {
      console.error("Error accepting request:", err);
    } finally {
      setBusyId("");
    }
  };

  const handleReject = async (requestId) => {
    setBusyId(requestId);
    try {
      await updateRequestStatus(requestId, "rejected");
      setIncomingRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "rejected" } : r))
      );
    } catch (err) {
      console.error("Error rejecting request:", err);
    } finally {
      setBusyId("");
    }
  };

  const handleGroupAccept = async (requestId) => {
    setBusyId(requestId);
    try {
      await approveGroupJoinRequest(requestId, user.uid);
      setIncomingGroupRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "accepted" } : r))
      );
    } catch (err) {
      console.error("Error accepting group request:", err);
    } finally {
      setBusyId("");
    }
  };

  const handleGroupReject = async (requestId) => {
    setBusyId(requestId);
    try {
      await rejectGroupJoinRequest(requestId);
      setIncomingGroupRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "rejected" } : r))
      );
    } catch (err) {
      console.error("Error rejecting group request:", err);
    } finally {
      setBusyId("");
    }
  };

  const performWithdraw = async () => {
    if (!confirmWithdraw) return;
    const { type, requestId } = confirmWithdraw;
    setConfirmWithdraw(null);
    setBusyId(requestId);
    try {
      if (type === "group") {
        await deleteGroupJoinRequest(requestId);
        setMyGroupRequests((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        await deleteJoinRequest(requestId);
        setMyRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (err) {
      console.error("Error withdrawing request:", err);
    } finally {
      setBusyId("");
    }
  };

  const pendingIncomingCount = incomingRequests.filter((r) => r.status === "pending").length
    + incomingGroupRequests.filter((r) => r.status === "pending").length;
  const sentCount = myRequests.length + myGroupRequests.length;

  const renderStatus = (status) => (
    <span className={`status-badge ${status}`}>
      <span className="status-dot" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  const renderAvatar = (req) => (
    <div className="request-avatar">
      {req.requesterPhoto ? (
        <img src={req.requesterPhoto} alt={`${req.requesterName || "User"}'s avatar`} />
      ) : (
        getInitials(req.requesterName)
      )}
    </div>
  );

  return (
    <div className="requests-page">
      <style>{`
        .requests-page {
          min-height: 100dvh;
          background: #0A0A0A;
          font-family: 'JetBrains Mono', monospace;
          position: relative;
          overflow-x: clip;
          color: #EAEAEA;
        }
        .requests-shell {
          position: relative;
          z-index: 1;
          max-width: 860px;
          margin: 0 auto;
          padding: clamp(40px, 7vw, 72px) 24px 96px;
        }
        .requests-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(234,234,234,0.5);
          border: 1px solid #1A1A1A;
          background: #0E0E0E;
          padding: 8px 14px;
          margin: 0 0 24px;
        }
        .requests-kicker .x { color: #E61919; }
        .requests-title {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: clamp(30px, 5vw, 44px);
          line-height: 0.98;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: #EAEAEA;
          margin: 0 0 12px;
        }
        .requests-title .red { color: #E61919; }
        .requests-subtitle {
          font-size: 13px;
          color: rgba(234,234,234,0.55);
          line-height: 1.7;
          margin: 0 0 34px;
          max-width: 56ch;
        }
        .seg-wrap { margin-bottom: 26px; }
        .seg { max-width: 340px; }
        .seg-count {
          font-variant-numeric: tabular-nums;
          font-size: 10px;
          font-weight: 700;
          background: #131313;
          border: 1px solid #2A2A2A;
          padding: 1px 7px;
          color: rgba(234,234,234,0.6);
        }
        .seg-btn.active .seg-count { color: #0A0A0A; background: rgba(255,255,255,0.85); border-color: transparent; }
        .request-section { margin-bottom: 32px; }
        .request-section-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(234,234,234,0.65);
          margin: 0 0 14px;
          display: flex;
          align-items: center;
          gap: 9px;
        }
        .request-section-title::before {
          content: "";
          width: 6px;
          height: 6px;
          background: #E61919;
        }
        .request-section-count {
          color: #E61919;
          background: rgba(230,25,25,0.08);
          border: 1px solid rgba(230,25,25,0.4);
          padding: 1px 7px;
          font-size: 10px;
          font-variant-numeric: tabular-nums;
        }
        .requests-list { display: flex; flex-direction: column; gap: 1px; background: #1A1A1A; border: 1px solid #1A1A1A; }
        .request-card {
          background: #0E0E0E;
          padding: 20px;
          transition: background 0.15s;
        }
        .request-card:hover { background: #101010; }
        .request-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }
        .request-user { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .request-avatar {
          width: 40px;
          height: 40px;
          background: #131313;
          border: 1px solid #2A2A2A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 700;
          color: #E61919;
          overflow: hidden;
          flex-shrink: 0;
        }
        .request-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .request-name { font-size: 13px; font-weight: 700; color: #EAEAEA; margin: 0 0 2px; text-transform: uppercase; }
        .request-college { font-size: 11px; color: rgba(234,234,234,0.45); }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 5px 10px;
          border: 1px solid #2A2A2A;
          flex-shrink: 0;
          font-variant-numeric: tabular-nums;
        }
        .status-dot { width: 5px; height: 5px; background: rgba(234,234,234,0.5); }
        .status-badge.pending { background: rgba(255,200,0,0.06); color: #FFC800; border-color: rgba(255,200,0,0.35); }
        .status-badge.pending .status-dot { background: #FFC800; animation: rblink 1.6s steps(2) infinite; }
        .status-badge.accepted { background: rgba(74,246,38,0.06); color: #4AF626; border-color: rgba(74,246,38,0.35); }
        .status-badge.accepted .status-dot { background: #4AF626; }
        .status-badge.rejected { background: rgba(230,25,25,0.08); color: #FF6B6B; border-color: rgba(230,25,25,0.4); }
        .status-badge.rejected .status-dot { background: #FF2A2A; }
        @keyframes rblink { 0%, 50% { opacity: 1; } 100% { opacity: 0.25; } }
        .request-project { font-size: 12px; color: rgba(234,234,234,0.55); margin-bottom: 12px; line-height: 1.5; }
        .request-project strong { color: #E61919; font-weight: 700; }
        .request-message {
          font-size: 12px;
          color: rgba(234,234,234,0.75);
          line-height: 1.65;
          background: #111111;
          border: 1px solid #2A2A2A;
          padding: 12px 14px;
          margin-bottom: 14px;
        }
        .request-message::before {
          content: ">> ";
          color: #E61919;
          font-weight: 700;
        }
        .request-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
        .skill-chip {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 4px 9px;
          border: 1px solid #2A2A2A;
          background: transparent;
          color: rgba(234,234,234,0.5);
        }
        .request-actions { display: flex; gap: 10px; }
        .empty-state {
          text-align: center;
          padding: 64px 24px;
          color: rgba(234,234,234,0.45);
          border: 1px dashed #2A2A2A;
          background: #0E0E0E;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .empty-state h3 {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: 20px;
          text-transform: uppercase;
          color: #EAEAEA;
          margin: 0 0 10px;
          letter-spacing: -0.02em;
        }
        .empty-state p { margin: 0; line-height: 1.6; }
        .skeleton-card {
          border: 1px solid #1A1A1A;
          background: #0E0E0E;
          min-height: 140px;
        }
        .confirm-actions { display: flex; gap: 10px; }
        .confirm-actions .btn { flex: 1; }
        @media (max-width: 640px) {
          .requests-shell { padding: 32px 16px 72px; }
          .requests-title { font-size: 30px; }
          .requests-subtitle { font-size: 12px; }
          .seg { max-width: none; }
          .request-card { padding: 16px; }
          .request-header { align-items: flex-start; }
          .request-user { min-width: 0; flex: 1; }
          .request-actions { flex-direction: column; gap: 8px; }
          .btn { width: 100%; padding: 11px 16px; }
          .confirm-actions { flex-direction: column-reverse; }
        }
      `}</style>

      <Navbar />

      <main className="requests-shell">
        <p className="requests-kicker">
          <span className="x">[</span> Inbox <span className="x">]</span>
        </p>
        <h1 className="requests-title">
          Join <span className="red">requests</span>
        </h1>
        <p className="requests-subtitle">
          {">"} Review who wants to join your projects and groups, and track the requests you have sent.
        </p>

        <div className="seg-wrap">
          <div className="seg">
            <button
              className={`seg-btn ${activeTab === "incoming" ? "active" : ""}`}
              onClick={() => setActiveTab("incoming")}
            >
              Received
              <span className="seg-count">{pendingIncomingCount}</span>
            </button>
            <button
              className={`seg-btn ${activeTab === "sent" ? "active" : ""}`}
              onClick={() => setActiveTab("sent")}
            >
              Sent
              <span className="seg-count">{sentCount}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="requests-list" aria-hidden="true">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        ) : activeTab === "incoming" ? (
          incomingRequests.length === 0 && incomingGroupRequests.length === 0 ? (
            <div className="empty-state">
              <h3>Nothing received</h3>
              <p>Join requests for your projects and groups will show up here.</p>
            </div>
          ) : (
            <div>
              {incomingRequests.length > 0 && (
                <section className="request-section">
                  <h2 className="request-section-title">
                    Project requests
                    <span className="request-section-count">{incomingRequests.filter((r) => r.status === "pending").length}</span>
                  </h2>
                  <div className="requests-list">
                    {incomingRequests.map((req) => (
                      <div key={req.id} className="request-card">
                        <div className="request-header">
                          <div className="request-user">
                            {renderAvatar(req)}
                            <div>
                              <p className="request-name">{req.requesterName || "User"}</p>
                              {req.requesterCollege && (
                                <p className="request-college">{req.requesterCollege}</p>
                              )}
                            </div>
                          </div>
                          {renderStatus(req.status)}
                        </div>
                        
                        {req.project && (
                          <p className="request-project">
                            Wants to join: <strong>{req.project.title}</strong>
                          </p>
                        )}
                        
                        {req.message && (
                          <p className="request-message">{req.message}</p>
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
                            <button className="btn btn-red" onClick={() => handleAccept(req.id)} disabled={busyId === req.id}>
                              {busyId === req.id ? "Working..." : "Accept"}
                            </button>
                            <button className="btn btn-ghost" onClick={() => handleReject(req.id)} disabled={busyId === req.id}>
                              {busyId === req.id ? "Working..." : "Decline"}
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
                    Group requests
                    <span className="request-section-count">{incomingGroupRequests.filter((r) => r.status === "pending").length}</span>
                  </h2>
                  <div className="requests-list">
                    {incomingGroupRequests.map((req) => (
                      <div key={req.id} className="request-card">
                        <div className="request-header">
                          <div className="request-user">
                            {renderAvatar(req)}
                            <div>
                              <p className="request-name">{req.requesterName || "User"}</p>
                              {req.requesterCollege && (
                                <p className="request-college">{req.requesterCollege}</p>
                              )}
                            </div>
                          </div>
                          {renderStatus(req.status)}
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
                            <button className="btn btn-red" onClick={() => handleGroupAccept(req.id)} disabled={busyId === req.id}>
                              {busyId === req.id ? "Working..." : "Accept"}
                            </button>
                            <button className="btn btn-ghost" onClick={() => handleGroupReject(req.id)} disabled={busyId === req.id}>
                              {busyId === req.id ? "Working..." : "Decline"}
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
              <h3>Nothing sent</h3>
              <p>Requests you send to projects and groups will appear here.</p>
            </div>
          ) : (
            <div>
              {myRequests.length > 0 && (
                <section className="request-section">
                  <h2 className="request-section-title">Project requests</h2>
                  <div className="requests-list">
                    {myRequests.map((req) => (
                      <div key={req.id} className="request-card">
                        <div className="request-header">
                          <div className="request-user">
                            {renderAvatar(req)}
                            <div>
                              <p className="request-name">{req.requesterName || "You"}</p>
                            </div>
                          </div>
                          {renderStatus(req.status)}
                        </div>
                        
                        <p className="request-project">
                          Applied to: <strong>{req.projectTitle}</strong>
                        </p>
                        
                        {req.message && (
                          <p className="request-message">{req.message}</p>
                        )}
                        
                        {req.status === "pending" && (
                          <div className="request-actions">
                            <button className="btn btn-danger" onClick={() => setConfirmWithdraw({ type: "project", requestId: req.id })}>
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
                  <h2 className="request-section-title">Group requests</h2>
                  <div className="requests-list">
                    {myGroupRequests.map((req) => (
                      <div key={req.id} className="request-card">
                        <div className="request-header">
                          <div className="request-user">
                            {renderAvatar(req)}
                            <div>
                              <p className="request-name">{req.requesterName || "You"}</p>
                            </div>
                          </div>
                          {renderStatus(req.status)}
                        </div>

                        <p className="request-project">
                          Requested to join group: <strong>{req.groupName}</strong>
                        </p>

                        {req.status === "pending" && (
                          <div className="request-actions">
                            <button className="btn btn-danger" onClick={() => setConfirmWithdraw({ type: "group", requestId: req.id })}>
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

      {confirmWithdraw && (
        <div className="modal-overlay" onClick={() => setConfirmWithdraw(null)}>
          <div className="confirm-panel" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
                <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>
              </svg>
            </div>
            <h2 className="modal-title">Withdraw request?</h2>
            <p className="confirm-message">This request will be removed. You can send a new one later if you change your mind.</p>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmWithdraw(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={performWithdraw} disabled={busyId === confirmWithdraw.requestId}>
                {busyId === confirmWithdraw.requestId ? "Withdrawing..." : "Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}