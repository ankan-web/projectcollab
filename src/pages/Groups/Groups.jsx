import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import SkillInput from "../../components/ui/SkillInput";
import { useAuthStore } from "../../store/authStore";
import {
  MAX_GROUP_MEMBERS,
  createGroup,
  disbandGroup,
  getUserGroupJoinRequests,
  leaveGroup,
  sendGroupJoinRequest,
  subscribeToGroups,
} from "../../services/groupService";

const emptyForm = {
  name: "",
  description: "",
  focus: "",
  skillsNeeded: [],
};

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

export default function Groups() {
  const { user, profile, setProfile } = useAuthStore();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [busyGroupId, setBusyGroupId] = useState("");
  const [myGroupRequests, setMyGroupRequests] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const memberGroup = useMemo(
    () => groups.find((group) => group.members?.some((member) => member.uid === user?.uid)) || null,
    [groups, user.uid]
  );
  const profileGroupExists = groups.some((group) => group.id === profile?.groupId);
  const activeGroupId = memberGroup?.id || (profileGroupExists ? profile?.groupId : "");

  useEffect(() => {
    const unsubscribe = subscribeToGroups(
      (data) => {
        setGroups(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading groups:", error);
        toast.error("Could not load groups.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;

    getUserGroupJoinRequests(user.uid)
      .then((requests) => {
        if (!cancelled) {
          setMyGroupRequests(requests.filter((request) => request.requesterId === user.uid));
        }
      })
      .catch((error) => {
        console.error("Error loading group requests:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [user.uid]);

  const activeGroup = useMemo(
    () => groups.find((group) => group.id === activeGroupId) || memberGroup,
    [activeGroupId, groups, memberGroup]
  );
  const browseGroups = useMemo(
    () => groups.filter((group) => group.id !== activeGroup?.id),
    [activeGroup?.id, groups]
  );

  const openGroupsCount = groups.filter((group) => (group.members?.length || 0) < (group.maxMembers || MAX_GROUP_MEMBERS)).length;
  const totalOpenSlots = groups.reduce(
    (total, group) => total + Math.max((group.maxMembers || MAX_GROUP_MEMBERS) - (group.members?.length || 0), 0),
    0
  );

  const updateLocalMembership = (groupId, groupName = "") => {
    setProfile({
      ...profile,
      groupId,
      groupName,
    });
  };

  const validateForm = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Give the group a name.";
    if (!form.description.trim()) next.description = "Describe what the group is building or preparing for.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const groupId = await createGroup(user.uid, profile, form);
      updateLocalMembership(groupId, form.name.trim());
      setForm(emptyForm);
      setErrors({});
      setShowForm(false);
      toast.success("Group created.");
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.message || "Could not create group.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (group) => {
    setBusyGroupId(group.id);
    try {
      const requestId = await sendGroupJoinRequest(group.id, user.uid, profile);
      setMyGroupRequests((prev) => [
        {
          id: requestId,
          groupId: group.id,
          groupName: group.name,
          groupAdminId: group.adminId,
          requesterId: user.uid,
          status: "pending",
        },
        ...prev,
      ]);
      toast.success(`Request sent to ${group.name}.`);
    } catch (error) {
      console.error("Error joining group:", error);
      toast.error(error.message || "Could not join group.");
    } finally {
      setBusyGroupId("");
    }
  };

  const performLeave = async (group) => {
    setBusyGroupId(group.id);
    try {
      await leaveGroup(group.id, user.uid);
      updateLocalMembership("", "");
      toast.success("You left the group.");
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error(error.message || "Could not leave group.");
    } finally {
      setBusyGroupId("");
    }
  };

  const performDisband = async (group) => {
    if (group.adminId !== user.uid) {
      toast.error("Only the group admin can disband this group.");
      return;
    }

    setBusyGroupId(group.id);
    try {
      await disbandGroup(group.id, user.uid);
      updateLocalMembership("", "");
      toast.success("Group disbanded.");
    } catch (error) {
      console.error("Error disbanding group:", error);
      toast.error(error.message || "Could not disband group.");
    } finally {
      setBusyGroupId("");
    }
  };

  const requestLeave = (group) => {
    setConfirmAction({
      type: "leave",
      group,
      title: "Leave group?",
      message: `You will leave "${group.name}". You will need to request approval again if you want to rejoin later.`,
      confirmLabel: "Leave group",
    });
  };

  const requestDisband = (group) => {
    setConfirmAction({
      type: "disband",
      group,
      title: "Disband group?",
      message: `This will permanently delete "${group.name}" and remove every member from the group.`,
      confirmLabel: "Disband group",
    });
  };

  const confirmCurrentAction = async () => {
    if (!confirmAction) return;
    const action = confirmAction;
    setConfirmAction(null);
    if (action.type === "leave") await performLeave(action.group);
    if (action.type === "disband") await performDisband(action.group);
  };

  const renderGroupCard = (group, pinned = false) => {
    const memberCount = group.members?.length || 0;
    const maxMembers = group.maxMembers || MAX_GROUP_MEMBERS;
    const isFull = memberCount >= maxMembers;
    const isMine = activeGroup?.id === group.id;
    const isAdmin = group.adminId === user?.uid;
    const pendingRequest = myGroupRequests.some(
      (request) => request.groupId === group.id && request.status === "pending"
    );
    const slots = Array.from({ length: maxMembers }, (_, index) => renderMemberSlot(group, index));

    return (
      <div key={group.id} className={`group-card ${isMine ? "mine" : ""} ${pinned ? "pinned" : ""}`}>
        <div className="group-top">
          <div>
            <h2 className="group-name">{group.name}</h2>
            <p className="group-desc">{group.description}</p>
          </div>
          <span className={`capacity-badge ${isFull ? "full" : ""}`}>
            <span className="capacity-dot" />
            {memberCount}/{maxMembers}
          </span>
        </div>

        {group.focus && (
          <p className="group-focus">
            Focus: <strong>{group.focus}</strong>
          </p>
        )}

        <div className="skill-row">
          {group.skillsNeeded?.length ? (
            group.skillsNeeded.map((skill) => <span key={skill} className="skill-chip">{skill}</span>)
          ) : (
            <span className="skill-chip">Open to all skills</span>
          )}
        </div>

        <div className="slots-grid">{slots}</div>

        <div className="group-actions">
          {isMine ? (
            isAdmin ? (
              <button className="btn btn-danger" onClick={() => requestDisband(group)} disabled={busyGroupId === group.id}>
                {busyGroupId === group.id ? "Working..." : "Disband"}
              </button>
            ) : (
              <button className="btn btn-ghost" onClick={() => requestLeave(group)} disabled={busyGroupId === group.id}>
                {busyGroupId === group.id ? "Leaving..." : "Leave"}
              </button>
            )
          ) : (
            <button
              className="btn btn-red"
              onClick={() => handleJoin(group)}
              disabled={!!activeGroupId || isFull || pendingRequest || busyGroupId === group.id}
            >
              {isFull
                ? "Full"
                : busyGroupId === group.id
                  ? "Sending..."
                  : activeGroupId
                    ? "Already in group"
                    : pendingRequest
                      ? "Request sent"
                      : "Request to join"}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderMemberSlot = (group, index) => {
    const member = group.members?.[index];

    if (!member) {
      return (
        <div key={`empty-${index}`} className="group-slot empty">
          <div className="slot-avatar empty-avatar">+</div>
          <div>
            <p className="slot-name">Open slot</p>
            <p className="slot-meta">Waiting for teammate</p>
          </div>
        </div>
      );
    }

    return (
      <div key={member.uid} className="group-slot">
        <div className="slot-avatar">
          {member.photoURL ? <img src={member.photoURL} alt={`${member.displayName}'s avatar`} /> : getInitials(member.displayName)}
        </div>
        <div className="slot-copy">
          <div className="slot-name-row">
            <p className="slot-name">{member.displayName}</p>
            {member.role === "admin" && <span className="admin-tag">Admin</span>}
          </div>
          <p className="slot-meta">{member.college || "HackHive member"}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="groups-page">
      <style>{`
        .groups-page {
          min-height: 100dvh;
          background: #0A0A0A;
          font-family: 'JetBrains Mono', monospace;
          position: relative;
          overflow-x: clip;
          color: #EAEAEA;
        }
        .groups-shell {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
          padding: clamp(40px, 7vw, 72px) 24px 96px;
        }
        .groups-head { margin-bottom: 40px; }
        .groups-kicker {
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
        .groups-kicker .x { color: #E61919; }
        .groups-title {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: clamp(30px, 5.5vw, 48px);
          line-height: 0.98;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: #EAEAEA;
          margin: 0 0 14px;
        }
        .groups-title .red { color: #E61919; }
        .groups-subtitle {
          font-size: 13px;
          color: rgba(234,234,234,0.55);
          line-height: 1.7;
          max-width: 56ch;
          margin: 0;
        }
        .groups-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1px;
          background: #1A1A1A;
          border: 1px solid #1A1A1A;
          flex: 1;
          margin-bottom: 0;
        }
        .stat-box {
          background: #0E0E0E;
          padding: 20px 22px;
        }
        .stat-value {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          color: #EAEAEA;
          font-size: 28px;
          line-height: 1;
          margin: 0 0 8px;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.02em;
        }
        .stat-value .red { color: #E61919; }
        .stat-label {
          color: rgba(234,234,234,0.4);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin: 0;
        }
        .current-group {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: #0E0E0E;
          border: 1px solid rgba(230,25,25,0.4);
          padding: 20px 24px;
          margin-bottom: 16px;
        }
        .current-title { color: #EAEAEA; font-size: 15px; font-weight: 700; margin: 0 0 4px; font-family: 'Archivo Black', sans-serif; text-transform: uppercase; }
        .current-text { color: rgba(234,234,234,0.45); font-size: 12px; margin: 0; }
        .current-live {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          font-weight: 700;
          color: #E61919;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0 0 8px;
        }
        .current-live .dot {
          width: 6px; height: 6px;
          background: #E61919;
          animation: gblink 1.6s steps(2) infinite;
        }
        @keyframes gblink { 0%, 50% { opacity: 1; } 100% { opacity: 0.2; } }
        .groups-grid {
          display: grid;
          grid-auto-flow: dense;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1px;
          background: #1A1A1A;
          border: 1px solid #1A1A1A;
        }
        .group-card {
          background: #0E0E0E;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          height: 100%;
          transition: background 0.15s;
        }
        .group-card:hover { background: #101010; }
        .group-card.mine { border: 1px solid rgba(230,25,25,0.4); }
        .group-card.pinned { margin-bottom: 8px; }
        .group-top { display: flex; justify-content: space-between; gap: 14px; align-items: flex-start; }
        .group-name {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          text-transform: uppercase;
          color: #EAEAEA;
          font-size: 16px;
          margin: 0 0 6px;
          overflow-wrap: anywhere;
          letter-spacing: -0.01em;
        }
        .group-desc { color: rgba(234,234,234,0.5); font-size: 12px; line-height: 1.6; margin: 0; overflow-wrap: anywhere; max-width: 52ch; }
        .capacity-badge {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 10px;
          background: transparent;
          border: 1px solid #2A2A2A;
          color: rgba(234,234,234,0.65);
          font-size: 11px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }
        .capacity-dot { width: 5px; height: 5px; background: #E61919; }
        .capacity-badge.full { color: #FF6B6B; background: rgba(230,25,25,0.08); border-color: rgba(230,25,25,0.4); }
        .capacity-badge.full .capacity-dot { background: #FF2A2A; }
        .group-focus { color: rgba(234,234,234,0.55); font-size: 12px; margin: 0; }
        .group-focus strong { color: #E61919; font-weight: 700; }
        .skill-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-chip {
          color: rgba(234,234,234,0.5);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 4px 9px;
          background: transparent;
          border: 1px solid #2A2A2A;
        }
        .slots-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; background: #1A1A1A; }
        .group-slot {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          padding: 10px;
          background: #0E0E0E;
          border: none;
        }
        .group-slot.empty { border: 1px dashed #2A2A2A; background: transparent; }
        .slot-avatar {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #131313;
          border: 1px solid #2A2A2A;
          color: #E61919;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          overflow: hidden;
        }
        .slot-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .empty-avatar { color: rgba(234,234,234,0.3); background: transparent; font-size: 16px; font-weight: 400; }
        .slot-copy { min-width: 0; }
        .slot-name-row { display: flex; align-items: center; gap: 6px; min-width: 0; }
        .slot-name { color: rgba(234,234,234,0.85); font-size: 12px; font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: uppercase; }
        .slot-meta { color: rgba(234,234,234,0.35); font-size: 10px; margin: 2px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .admin-tag {
          color: #0A0A0A;
          background: #E61919;
          padding: 2px 7px;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          flex-shrink: 0;
        }
        .group-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }
        .browse-title {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          text-transform: uppercase;
          color: #EAEAEA;
          font-size: 14px;
          margin: 0 0 16px;
        }
        .feed-state {
          text-align: center;
          padding: 64px 24px;
          color: rgba(234,234,234,0.45);
          border: 1px dashed #2A2A2A;
          background: #0E0E0E;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .feed-state h3 {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: 20px;
          text-transform: uppercase;
          color: #EAEAEA;
          margin: 0 0 10px;
          letter-spacing: -0.02em;
        }
        .feed-state p { margin: 0; line-height: 1.6; }
        .skeleton-card {
          border: 1px solid #1A1A1A;
          background: #0E0E0E;
          min-height: 240px;
        }
        .confirm-actions { display: flex; gap: 10px; }
        .confirm-actions .btn { flex: 1; }
        .form-field { margin-bottom: 16px; }
        @media (max-width: 860px) {
          .groups-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .groups-shell { padding: 32px 16px 72px; }
          .groups-header, .current-group { flex-direction: column; align-items: stretch; }
          .groups-title { font-size: 30px; }
          .groups-subtitle { font-size: 12px; }
          .btn { width: 100%; }
          .stats-row { grid-template-columns: 1fr; }
          .group-card { padding: 20px; }
          .group-top { align-items: flex-start; }
          .slots-grid { grid-template-columns: 1fr; }
          .group-actions { flex-direction: column; }
          .confirm-actions { flex-direction: column-reverse; }
        }
      `}</style>

      <Navbar />

      <main className="groups-shell">
        <div className="groups-head">
          <p className="groups-kicker">
            <span className="x">[</span> Team finder <span className="x">]</span>
          </p>
          <h1 className="groups-title">
            Find your <span className="red">six.</span>
          </h1>
          <p className="groups-subtitle">
            {">"} Join an existing six-person group or create one and let others fill the open slots.
          </p>
        </div>

        <div className="groups-header">
          <div className="stats-row">
            <div className="stat-box">
              <p className="stat-value">{groups.length}</p>
              <p className="stat-label">Active groups</p>
            </div>
            <div className="stat-box">
              <p className="stat-value">{openGroupsCount}</p>
              <p className="stat-label">Groups with space</p>
            </div>
            <div className="stat-box">
              <p className="stat-value"><span className="red">{totalOpenSlots}</span></p>
              <p className="stat-label">Open member slots</p>
            </div>
          </div>
          <button className="btn btn-red" onClick={() => setShowForm(true)} disabled={!!activeGroupId}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create group
          </button>
        </div>

        {activeGroup && (
          <section style={{ marginBottom: 40 }}>
            <div className="current-group">
              <div>
                <p className="current-live"><span className="dot" /> Your crew</p>
                <p className="current-title">You are in {activeGroup.name}</p>
                <p className="current-text">
                  {activeGroup.adminId === user?.uid
                    ? "You are the admin. Only you can disband this group."
                    : "You can leave this group, but only the admin can disband it."}
                </p>
              </div>
              {activeGroup.adminId === user?.uid ? (
                <button className="btn btn-danger" onClick={() => requestDisband(activeGroup)} disabled={busyGroupId === activeGroup.id}>
                  {busyGroupId === activeGroup.id ? "Working..." : "Disband group"}
                </button>
              ) : (
                <button className="btn btn-ghost" onClick={() => requestLeave(activeGroup)} disabled={busyGroupId === activeGroup.id}>
                  {busyGroupId === activeGroup.id ? "Leaving..." : "Leave group"}
                </button>
              )}
            </div>
            {renderGroupCard(activeGroup, true)}
          </section>
        )}

        {loading ? (
          <div className="groups-grid" aria-hidden="true">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        ) : groups.length === 0 ? (
          <div className="feed-state">
            <h3>No groups yet</h3>
            <p>Create the first group and start filling the six slots.</p>
          </div>
        ) : browseGroups.length === 0 ? (
          <div className="feed-state">
            <h3>{activeGroup ? "Nothing else to browse" : "No groups right now"}</h3>
            <p>
              {activeGroup
                ? "No other groups are open for requests at the moment."
                : "No groups are available right now."}
            </p>
          </div>
        ) : (
          <>
            {activeGroup && <h2 className="browse-title">Other groups</h2>}
            <div className="groups-grid">
              {browseGroups.map((group) => (
                <div key={group.id} className="bento-item">
                  {renderGroupCard(group)}
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <p style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(234,234,234,0.3)", margin: "0 0 12px" }}>
              [ TRANSMIT / CREATE GROUP ]
            </p>
            <h2 className="modal-title">Create a group</h2>
            <p className="modal-sub">Pick a name, set the direction, and let people fill the rest.</p>
            <form onSubmit={handleCreate} noValidate>
              <div className="form-field">
                <label className="field-label" htmlFor="group-name">Group name</label>
                <input
                  id="group-name"
                  className={`field ${errors.name ? "error" : ""}`}
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: "" }); }}
                  placeholder="e.g., AI Builders Squad"
                  maxLength={60}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>
              <div className="form-field">
                <label className="field-label" htmlFor="group-desc">Description</label>
                <textarea
                  id="group-desc"
                  className={`field ${errors.description ? "error" : ""}`}
                  style={{ minHeight: 96 }}
                  value={form.description}
                  onChange={(e) => { setForm({ ...form, description: e.target.value }); if (errors.description) setErrors({ ...errors, description: "" }); }}
                  placeholder="What is this group building or preparing for?"
                  maxLength={240}
                  aria-invalid={!!errors.description}
                />
                {errors.description && <p className="field-error">{errors.description}</p>}
              </div>
              <div className="form-field">
                <label className="field-label" htmlFor="group-focus">Focus <span style={{ color: "rgba(234,234,234,0.4)", fontWeight: 400 }}>(optional)</span></label>
                <input
                  id="group-focus"
                  className="field"
                  value={form.focus}
                  onChange={(e) => setForm({ ...form, focus: e.target.value })}
                  placeholder="Hackathon, startup idea, open source, research..."
                  maxLength={80}
                />
              </div>
              <div className="form-field">
                <label className="field-label">Skills wanted <span style={{ color: "rgba(234,234,234,0.4)", fontWeight: 400 }}>(optional)</span></label>
                <SkillInput
                  value={form.skillsNeeded}
                  onChange={(skillsNeeded) => setForm({ ...form, skillsNeeded })}
                  max={8}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setErrors({}); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-red" disabled={submitting}>
                  {submitting ? "Creating..." : "Create group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="confirm-panel" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
                <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>
              </svg>
            </div>
            <h2 className="modal-title">{confirmAction.title}</h2>
            <p className="confirm-message">{confirmAction.message}</p>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmAction(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmCurrentAction}>
                {confirmAction.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}