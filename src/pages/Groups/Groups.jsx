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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return;

    setSubmitting(true);
    try {
      const groupId = await createGroup(user.uid, profile, form);
      updateLocalMembership(groupId, form.name.trim());
      setForm(emptyForm);
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
      title: "Leave Group?",
      message: `You will leave "${group.name}". You will need to request approval again if you want to rejoin later.`,
      confirmLabel: "Leave Group",
    });
  };

  const requestDisband = (group) => {
    setConfirmAction({
      type: "disband",
      group,
      title: "Disband Group?",
      message: `This will permanently delete "${group.name}" and remove every member from the group.`,
      confirmLabel: "Disband Group",
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
      <article key={group.id} className={`group-card ${isMine ? "mine" : ""} ${pinned ? "pinned" : ""}`}>
        <div className="group-top">
          <div>
            <h2 className="group-name">{group.name}</h2>
            <p className="group-desc">{group.description}</p>
          </div>
          <span className={`capacity-pill ${isFull ? "full" : ""}`}>
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
              <button className="ghost-btn danger-btn" onClick={() => requestDisband(group)} disabled={busyGroupId === group.id}>
                {busyGroupId === group.id ? "Working..." : "Disband"}
              </button>
            ) : (
              <button className="ghost-btn" onClick={() => requestLeave(group)} disabled={busyGroupId === group.id}>
                {busyGroupId === group.id ? "Leaving..." : "Leave"}
              </button>
            )
          ) : (
            <button
              className="primary-btn"
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
                      : "Request to Join"}
            </button>
          )}
        </div>
      </article>
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
          {member.photoURL ? <img src={member.photoURL} alt="" /> : getInitials(member.displayName)}
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
    <div style={{ minHeight: "100vh", background: "#09090b", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .groups-shell { max-width: 1120px; margin: 0 auto; padding: 32px 24px 72px; }
        .groups-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 22px; }
        .groups-kicker { margin: 0 0 8px; color: #63ffb4; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
        .groups-title { font-family: 'Syne', sans-serif; color: #fff; font-size: 28px; line-height: 1.1; margin: 0 0 8px; }
        .groups-subtitle { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; margin: 0; max-width: 620px; }
        .primary-btn {
          background: #63ffb4; color: #09090b; border: none; border-radius: 10px;
          padding: 11px 18px; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 13px;
          cursor: pointer; transition: transform 0.15s, opacity 0.15s; white-space: nowrap;
        }
        .primary-btn:hover { transform: translateY(-1px); }
        .primary-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
        .ghost-btn {
          background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.75); border: 0.5px solid rgba(255,255,255,0.12);
          border-radius: 10px; padding: 10px 14px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px;
          cursor: pointer; transition: all 0.15s;
        }
        .ghost-btn:hover { color: #fff; background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .danger-btn { color: #ff7777; border-color: rgba(255,110,110,0.22); background: rgba(255,80,80,0.08); }
        .danger-btn:hover { color: #fff; background: rgba(255,80,80,0.16); }
        .stats-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 24px; }
        .stat-box { background: #111113; border: 0.5px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; }
        .stat-value { font-family: 'Syne', sans-serif; color: #fff; font-size: 22px; margin: 0 0 4px; }
        .stat-label { color: rgba(255,255,255,0.4); font-size: 12px; margin: 0; }
        .current-group {
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          background: rgba(99,255,180,0.08); border: 0.5px solid rgba(99,255,180,0.25);
          border-radius: 14px; padding: 16px 18px; margin-bottom: 22px;
        }
        .current-title { color: #fff; font-size: 14px; font-weight: 700; margin: 0 0 3px; }
        .current-text { color: rgba(255,255,255,0.5); font-size: 13px; margin: 0; }
        .groups-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        .group-card {
          background: #111113; border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 18px; min-width: 0; transition: border-color 0.15s;
        }
        .group-card:hover { border-color: rgba(255,255,255,0.16); }
        .group-card.mine { border-color: rgba(99,255,180,0.42); box-shadow: 0 0 0 1px rgba(99,255,180,0.08); }
        .group-card.pinned { margin-bottom: 24px; }
        .browse-title { font-family: 'Syne', sans-serif; color: #fff; font-size: 16px; margin: 0 0 14px; }
        .group-top { display: flex; justify-content: space-between; gap: 14px; margin-bottom: 14px; }
        .group-name { font-family: 'Syne', sans-serif; color: #fff; font-size: 18px; margin: 0 0 6px; overflow-wrap: anywhere; }
        .group-desc { color: rgba(255,255,255,0.55); font-size: 13px; line-height: 1.55; margin: 0; overflow-wrap: anywhere; }
        .capacity-pill {
          flex-shrink: 0; height: fit-content; border-radius: 999px; padding: 6px 10px;
          background: rgba(255,255,255,0.05); border: 0.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.65); font-size: 12px; font-weight: 700;
        }
        .capacity-pill.full { color: #ff9a9a; background: rgba(255,80,80,0.08); border-color: rgba(255,80,80,0.18); }
        .group-focus { color: rgba(255,255,255,0.38); font-size: 12px; margin: 0 0 12px; }
        .group-focus strong { color: #63ffb4; }
        .skill-row { display: flex; flex-wrap: wrap; gap: 6px; min-height: 24px; margin-bottom: 14px; }
        .skill-chip { color: rgba(255,255,255,0.56); font-size: 11px; border-radius: 999px; padding: 4px 9px; background: rgba(255,255,255,0.05); border: 0.5px solid rgba(255,255,255,0.1); }
        .slots-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 16px; }
        .group-slot { display: flex; align-items: center; gap: 9px; min-width: 0; padding: 9px; border-radius: 10px; background: rgba(255,255,255,0.035); border: 0.5px solid rgba(255,255,255,0.08); }
        .group-slot.empty { border-style: dashed; background: rgba(255,255,255,0.018); }
        .slot-avatar {
          width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          background: rgba(99,255,180,0.1); border: 0.5px solid rgba(99,255,180,0.22); color: #63ffb4;
          font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 800; overflow: hidden;
        }
        .slot-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .empty-avatar { color: rgba(255,255,255,0.28); background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); font-size: 18px; }
        .slot-copy { min-width: 0; }
        .slot-name-row { display: flex; align-items: center; gap: 6px; min-width: 0; }
        .slot-name { color: rgba(255,255,255,0.82); font-size: 12px; font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .slot-meta { color: rgba(255,255,255,0.32); font-size: 11px; margin: 2px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .admin-tag { color: #09090b; background: #63ffb4; border-radius: 999px; padding: 2px 6px; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; flex-shrink: 0; }
        .group-actions { display: flex; justify-content: flex-end; gap: 8px; }
        .empty-state { text-align: center; color: rgba(255,255,255,0.42); padding: 56px 20px; background: #111113; border: 0.5px solid rgba(255,255,255,0.08); border-radius: 14px; }
        .modal-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.72); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-panel { width: 100%; max-width: 520px; background: #18181b; border: 0.5px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 26px; }
        .modal-title { font-family: 'Syne', sans-serif; font-size: 20px; color: #fff; margin: 0 0 20px; }
        .confirm-panel { width: 100%; max-width: 390px; background: #18181b; border: 0.5px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 26px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.45); }
        .confirm-icon { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; background: rgba(255,80,80,0.1); border: 1px solid rgba(255,80,80,0.25); color: #ff6666; }
        .confirm-title { font-family: 'Syne', sans-serif; font-size: 19px; color: #fff; margin: 0 0 9px; }
        .confirm-message { font-size: 14px; line-height: 1.55; color: rgba(255,255,255,0.56); margin: 0 0 22px; }
        .confirm-actions { display: flex; gap: 12px; }
        .confirm-actions button { flex: 1; }
        .form-field { margin-bottom: 15px; }
        .form-label { display: block; color: rgba(255,255,255,0.48); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 7px; }
        .form-input, .form-textarea {
          width: 100%; background: rgba(255,255,255,0.04); border: 0.5px solid rgba(255,255,255,0.12);
          border-radius: 10px; padding: 12px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px;
          outline: none; transition: border-color 0.15s;
        }
        .form-input:focus, .form-textarea:focus { border-color: rgba(99,255,180,0.45); }
        .form-textarea { min-height: 96px; resize: vertical; }
        .form-actions { display: flex; gap: 12px; margin-top: 20px; }
        .form-actions button { flex: 1; }
        @media (max-width: 860px) {
          .groups-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .groups-shell { padding: 24px 16px 56px; }
          .groups-header, .current-group { flex-direction: column; align-items: stretch; }
          .groups-title { font-size: 24px; }
          .groups-subtitle { font-size: 13px; }
          .primary-btn, .ghost-btn { width: 100%; }
          .stats-row { grid-template-columns: 1fr; }
          .group-card { padding: 15px; }
          .group-top { align-items: flex-start; }
          .slots-grid { grid-template-columns: 1fr; }
          .group-actions { flex-direction: column; }
          .group-actions button { width: 100%; }
          .modal-overlay { padding: 14px; align-items: flex-end; }
          .modal-panel, .confirm-panel { max-width: none; padding: 22px; border-radius: 16px 16px 0 0; }
          .form-actions, .confirm-actions { flex-direction: column-reverse; }
        }
      `}</style>

      <Navbar />

      <main className="groups-shell">
        <div className="groups-header">
          <div>
            <p className="groups-kicker">Team finder</p>
            <h1 className="groups-title">Groups</h1>
            <p className="groups-subtitle">
              Join an existing six-person group or create a new one and let others fill the open slots.
            </p>
          </div>
          <button className="primary-btn" onClick={() => setShowForm(true)} disabled={!!activeGroupId}>
            Create Group
          </button>
        </div>

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
            <p className="stat-value">{totalOpenSlots}</p>
            <p className="stat-label">Open member slots</p>
          </div>
        </div>

        {activeGroup && (
          <section>
            <div className="current-group">
            <div>
              <p className="current-title">You are in {activeGroup.name}</p>
              <p className="current-text">
                {activeGroup.adminId === user?.uid
                  ? "You are the admin. Only you can disband this group."
                  : "You can leave this group, but only the admin can disband it."}
              </p>
            </div>
            {activeGroup.adminId === user?.uid ? (
              <button className="ghost-btn danger-btn" onClick={() => requestDisband(activeGroup)} disabled={busyGroupId === activeGroup.id}>
                {busyGroupId === activeGroup.id ? "Working..." : "Disband Group"}
              </button>
            ) : (
              <button className="ghost-btn" onClick={() => requestLeave(activeGroup)} disabled={busyGroupId === activeGroup.id}>
                {busyGroupId === activeGroup.id ? "Leaving..." : "Leave Group"}
              </button>
            )}
            </div>
            {renderGroupCard(activeGroup, true)}
          </section>
        )}

        {loading ? (
          <div className="empty-state">Loading groups...</div>
        ) : groups.length === 0 ? (
          <div className="empty-state">No groups yet. Create the first group and start filling the six slots.</div>
        ) : browseGroups.length === 0 ? (
          <div className="empty-state">
            {activeGroup ? "No other groups to browse right now." : "No groups available right now."}
          </div>
        ) : (
          <>
            {activeGroup && <h2 className="browse-title">Other Groups</h2>}
            <div className="groups-grid">
              {browseGroups.map((group) => renderGroupCard(group))}
            </div>
          </>
        )}
      </main>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create a Group</h2>
            <form onSubmit={handleCreate}>
              <div className="form-field">
                <label className="form-label">Group name</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., AI Builders Squad"
                  maxLength={60}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this group building or preparing for?"
                  maxLength={240}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Focus</label>
                <input
                  className="form-input"
                  value={form.focus}
                  onChange={(e) => setForm({ ...form, focus: e.target.value })}
                  placeholder="Hackathon, startup idea, open source, research..."
                  maxLength={80}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Skills wanted</label>
                <SkillInput
                  value={form.skillsNeeded}
                  onChange={(skillsNeeded) => setForm({ ...form, skillsNeeded })}
                  max={8}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="ghost-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={submitting || !form.name.trim() || !form.description.trim()}>
                  {submitting ? "Creating..." : "Create"}
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
                <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>
              </svg>
            </div>
            <h2 className="confirm-title">{confirmAction.title}</h2>
            <p className="confirm-message">{confirmAction.message}</p>
            <div className="confirm-actions">
              <button className="ghost-btn" onClick={() => setConfirmAction(null)}>
                Cancel
              </button>
              <button className="ghost-btn danger-btn" onClick={confirmCurrentAction}>
                {confirmAction.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
