/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getUserByUid, updateUserDoc } from "../../services/userService";
import { getUserProjects } from "../../services/projectService";
import { getUserNeeds, deleteNeed } from "../../services/needService";
import { getGroup } from "../../services/groupService";
import { useAuthStore } from "../../store/authStore";
import { getOrCreateChat } from "../../services/chatService";
import Navbar from "../../components/layout/Navbar";
import SkillInput from "../../components/ui/SkillInput";
import ProjectCard from "../Projects/ProjectCard";
import toast from "react-hot-toast";

const NEED_TYPES = [
  { value: "collab", label: "Collaboration" },
  { value: "mentor", label: "Mentor Needed" },
  { value: "hire", label: "Hiring" },
  { value: "event", label: "Event" },
  { value: "other", label: "Other" },
];

function NeedCard({ need, onDelete }) {
  return (
    <>
      <style>{`
        .need-card { background: #0E0E0E; border: 1px solid #1A1A1A; padding: 18px; transition: border-color 0.15s; }
        .need-card:hover { border-color: rgba(230,25,25,0.4); }
        .need-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
        .need-type { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 10px; background: rgba(230,25,25,0.08); border: 1px solid rgba(230,25,25,0.4); color: #FF6B6B; }
        .need-delete { background: none; border: 1px solid #2A2A2A; color: rgba(234,234,234,0.3); cursor: pointer; padding: 5px; transition: color 0.15s, border-color 0.15s; }
        .need-delete:hover { color: #FF6B6B; border-color: rgba(230,25,25,0.5); }
        .need-title { font-family: 'Archivo Black', sans-serif; font-size: 14px; font-weight: 400; text-transform: uppercase; color: #EAEAEA; margin: 0 0 6px; }
        .need-desc { font-size: 12px; color: rgba(234,234,234,0.55); line-height: 1.5; margin: 0 0 10px; }
        .need-tech { display: flex; flex-wrap: wrap; gap: 6px; }
        .tech-chip { font-size: 10px; letter-spacing: 0.04em; text-transform: uppercase; padding: 3px 9px; background: transparent; border: 1px solid #2A2A2A; color: rgba(234,234,234,0.5); }
      `}</style>
      <div className="need-card">
        <div className="need-header">
          <span className="need-type">{NEED_TYPES.find((t) => t.value === need.type)?.label}</span>
          <button className="need-delete" onClick={() => onDelete(need.id)} title="Delete">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
            </svg>
          </button>
        </div>
        <h3 className="need-title">{need.title}</h3>
        <p className="need-desc">{need.description}</p>
        {need.techStack?.length > 0 && (
          <div className="need-tech">
            {need.techStack.slice(0, 4).map((tech) => (
              <span key={tech} className="tech-chip">{tech}</span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function Profile() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { user, profile: myProfile, setProfile } = useAuthStore();

  const isMe = uid === "me" || uid === user?.uid;
  const targetUid = isMe ? user?.uid : uid;

  const [profile, setLocalProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({});
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");
  const [needs, setNeeds] = useState([]);
  const [needsLoading, setNeedsLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [groupLoading, setGroupLoading] = useState(false);

  useEffect(() => {
    if (!targetUid) return;
    setLoading(true);
    if (isMe && myProfile) {
      setLocalProfile(myProfile);
      setForm({ ...myProfile });
      setLoading(false);
    } else {
      getUserByUid(targetUid, user?.uid).then((data) => {
        if (!data) setNotFound(true);
        else { setLocalProfile(data); setForm({ ...data }); }
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUid, isMe, myProfile]);

  useEffect(() => {
    if (!targetUid) return;

    let active = true;
    setProjectsLoading(true);
    setProjectsError("");

    getUserProjects(targetUid)
      .then((items) => {
        if (active) setProjects(items);
      })
      .catch((e) => {
        toast.error("Failed to load projects. Please try again.");
        console.error("Error loading projects:", e);
        if (active) setProjectsError("Could not load projects.");
      })
      .finally(() => {
        if (active) setProjectsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [targetUid]);

  useEffect(() => {
    if (!profile?.groupId) {
      setGroup(null);
      setGroupLoading(false);
      return;
    }

    let active = true;
    setGroupLoading(true);
    getGroup(profile.groupId)
      .then((data) => {
        if (active) setGroup(data);
      })
      .catch((e) => {
        console.error("Error loading group:", e);
        if (active) setGroup(null);
      })
      .finally(() => {
        if (active) setGroupLoading(false);
      });

    return () => {
      active = false;
    };
  }, [profile?.groupId]);

  useEffect(() => {
    if (!targetUid) return;
    let active = true;
    setNeedsLoading(true);
    getUserNeeds(targetUid)
      .then((items) => {
        if (active) setNeeds(items);
      })
      .catch((e) => {
        // toast.error("Failed to load needs. Please try again.");
        console.error("Error loading needs:", e);
      })
      .finally(() => {
        if (active) setNeedsLoading(false);
      });
    return () => { active = false; };
  }, [targetUid]);

  const handleDeleteNeed = async (id) => {
    try {
      await deleteNeed(id);
      setNeeds((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      toast.error("Failed to delete need. Please try again.");
      console.error("Failed to delete need:", err);
    }
  };

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const updated = {
        displayName: form.displayName,
        college: form.college,
        bio: form.bio,
        domain: form.domain,
        skills: form.skills,
        githubUsername: form.githubUsername,
        linkedIn: form.linkedIn,
        portfolio: form.portfolio,
      };
      await updateUserDoc(user.uid, updated);
      const newProfile = { ...profile, ...updated };
      setLocalProfile(newProfile);
      setProfile({ ...myProfile, ...updated });
      setEditing(false);
    } catch {
      toast.error("Failed to save profile. Please try again.");
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ ...profile });
    setEditing(false);
    setSaveError("");
  };

  const initials = profile?.displayName
    ? profile.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  if (loading) return <PageLoader />;
  if (notFound) return <NotFound />;

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "'JetBrains Mono', monospace", color: "#EAEAEA" }}>
      <style>{`
        * { box-sizing: border-box; }
        .profile-input {
          width: 100%;
          background: #111111;
          border: 1px solid #2A2A2A;
          padding: 10px 13px;
          color: #EAEAEA;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s;
          resize: none;
        }
        .profile-input::placeholder { color: rgba(234,234,234,0.2); }
        .profile-input:focus { border-color: #E61919; }
        .p-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: rgba(234,234,234,0.4);
          margin-bottom: 6px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .skill-chip {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          background: transparent;
          border: 1px solid #2A2A2A;
          color: rgba(234,234,234,0.55);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .link-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          background: transparent;
          border: 1px solid #2A2A2A;
          color: rgba(234,234,234,0.6);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          transition: border-color 0.15s, color 0.15s;
        }
        .link-pill:hover { border-color: rgba(230,25,25,0.5); color: #E61919; }
        .profile-main-card, .profile-section-card {
          background: #0E0E0E;
          border: 1px solid #1A1A1A;
        }
        .profile-main-card { padding: 32px 32px 28px; margin-bottom: 16px; position: relative; }
        .profile-section-card { padding: 28px 32px; margin-bottom: 16px; }
        .domain-pill {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(230,25,25,0.08);
          border: 1px solid rgba(230,25,25,0.4);
          color: #FF6B6B;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .section-divider {
          height: 1px;
          background: #1A1A1A;
          margin: 28px 0;
        }
        .section-title {
          font-size: 10px;
          font-weight: 700;
          color: rgba(234,234,234,0.35);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin: 0 0 16px;
        }
        .domain-select-pill {
          padding: 7px 13px;
          border: 1px solid #2A2A2A;
          background: transparent;
          color: rgba(234,234,234,0.45);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
          cursor: pointer; transition: border-color 0.12s, background 0.12s, color 0.12s;
        }
        .domain-select-pill:hover { border-color: rgba(234,234,234,0.4); color: rgba(234,234,234,0.85); }
        .domain-select-pill.selected { background: #E61919; border-color: #E61919; color: #fff; }
        .fade-in { animation: fadeIn 0.3s ease; }
        .profile-group-card { background: #111111; border: 1px solid #1A1A1A; padding: 18px; }
        .profile-group-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
        .profile-group-name { font-family: 'Archivo Black', sans-serif; font-size: 16px; font-weight: 400; text-transform: uppercase; color: #EAEAEA; margin: 0 0 6px; }
        .profile-group-desc { font-size: 12px; color: rgba(234,234,234,0.52); line-height: 1.55; margin: 0; }
        .profile-group-count {
          flex-shrink: 0;
          padding: 5px 10px;
          background: rgba(230,25,25,0.08);
          border: 1px solid rgba(230,25,25,0.4);
          color: #FF6B6B;
          font-size: 11px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }
        .profile-group-members { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
        .profile-group-member {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          max-width: 190px;
          padding: 5px 9px 5px 5px;
          background: #131313;
          border: 1px solid #2A2A2A;
          color: rgba(234,234,234,0.68);
          font-size: 11px;
        }
        .profile-group-avatar {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
          background: #131313;
          border: 1px solid #2A2A2A;
          color: #E61919;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          font-weight: 700;
        }
        .profile-group-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .profile-group-member span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .profile-admin-tag {
          color: #0A0A0A;
          background: #E61919;
          padding: 2px 6px;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        @media (max-width: 640px) {
          .profile-shell { padding: 24px 14px 56px !important; }
          .profile-main-card, .profile-section-card { padding: 22px 18px !important; }
          .profile-actions { position: static !important; justify-content: flex-start; margin-bottom: 20px; flex-wrap: wrap; }
          .profile-identity { flex-direction: column; gap: 14px !important; }
          .profile-name-block { padding-right: 0 !important; width: 100%; }
          .profile-action-editing { width: 100%; flex-direction: column-reverse; }
          .profile-group-top { flex-direction: column; }
          .profile-group-count { align-self: flex-start; }
          .profile-group-member { max-width: 100%; }
          .link-pill { max-width: 100%; overflow-wrap: anywhere; }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      `}</style>

      <Navbar />

      <div className="profile-shell" style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* ── HEADER CARD ── */}
        <div className="fade-in profile-main-card">

          {/* Edit / action buttons */}
          <div className={`profile-actions ${editing ? "profile-action-editing" : ""}`} style={{ position: "absolute", top: 24, right: 24, display: "flex", gap: 8 }}>
            {isMe ? (
              editing ? (
                <>
                  <button className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
                  <button className="btn btn-red" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </>
              ) : (
                <button className="btn btn-ghost" onClick={() => setEditing(true)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit profile
                </button>
              )
            ) : (
              <button className="btn btn-red" onClick={async () => {
                if (!user?.uid || !targetUid) return;
                try {
                  await getOrCreateChat(user.uid, targetUid, myProfile);
                  navigate(`/chat?chatWith=${targetUid}`);
                } catch (e) {
                  console.error("Error starting chat:", e);
                }
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                Connect
              </button>
            )}
          </div>

          {/* Avatar + name */}
          <div className="profile-identity" style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24 }}>
            <div style={{
              width: 72, height: 72, flexShrink: 0,
              background: "#131313",
              border: "1px solid #2A2A2A",
              overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#E61919",
            }}>
              {profile?.photoURL
                ? <img src={profile.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initials
              }
            </div>

            <div className="profile-name-block" style={{ flex: 1, paddingRight: 120 }}>
              <p style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(234,234,234,0.3)", margin: "0 0 8px" }}>
                [ UNIT / {targetUid?.slice(0, 8)?.toUpperCase() || "----"} ]
              </p>
              {editing ? (
                <input
                  className="profile-input"
                  style={{ fontSize: 18, fontFamily: "'Archivo Black', sans-serif", textTransform: "uppercase", marginBottom: 8 }}
                  value={form.displayName}
                  onChange={(e) => set("displayName", e.target.value)}
                  placeholder="Your name"
                />
              ) : (
                <h1 style={{
                  fontFamily: "'Archivo Black', sans-serif",
                  fontSize: 22, fontWeight: 400, textTransform: "uppercase",
                  letterSpacing: "-0.02em", color: "#EAEAEA", margin: "0 0 6px",
                }}>
                  {profile?.displayName || "Unnamed Builder"}
                </h1>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {editing ? (
                  <input
                    className="profile-input"
                    style={{ maxWidth: 280 }}
                    value={form.college}
                    onChange={(e) => set("college", e.target.value)}
                    placeholder="College / University"
                  />
                ) : (
                  profile?.college && (
                    <span style={{ fontSize: 12, color: "rgba(234,234,234,0.5)" }}>
                      {profile.college}
                    </span>
                  )
                )}
                {!editing && profile?.domain && (
                  <span className="domain-pill">{profile.domain}</span>
                )}
              </div>
            </div>
          </div>

          {/* Domain selector in edit mode */}
          {editing && (
            <div style={{ marginBottom: 20 }}>
              <span className="p-label">Domain</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Web Development","Mobile Apps","Machine Learning / AI","Data Science","DevOps / Cloud","Blockchain / Web3","Game Development","Cybersecurity","Open Source","Other"].map((d) => (
                  <button
                    key={d}
                    className={`domain-select-pill ${form.domain === d ? "selected" : ""}`}
                    onClick={() => set("domain", form.domain === d ? "" : d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          <div style={{ marginBottom: 20 }}>
            {editing
              ? <>
                  <span className="p-label">Bio</span>
                  <textarea
                    className="profile-input"
                    rows={3}
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="Tell others what you build..."
                  />
                </>
              : profile?.bio
                ? <p style={{ fontSize: 13, color: "rgba(234,234,234,0.6)", lineHeight: 1.75, margin: 0 }}>
                    {profile.bio}
                  </p>
                : isMe
                  ? <p style={{ fontSize: 12, color: "rgba(234,234,234,0.25)", fontStyle: "italic" }}>No bio yet — add one by clicking Edit profile.</p>
                  : null
            }
          </div>

          {/* Skills */}
          <div style={{ marginBottom: 20 }}>
            <div className="section-title">Skills</div>
            {editing ? (
              <SkillInput value={form.skills || []} onChange={(s) => set("skills", s)} max={12} />
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profile?.skills?.length > 0
                  ? profile.skills.map((s) => <span key={s} className="skill-chip">{s}</span>)
                  : <span style={{ fontSize: 12, color: "rgba(234,234,234,0.25)", fontStyle: "italic" }}>No skills added yet.</span>
                }
              </div>
            )}
          </div>

          {/* Links */}
          <div>
            <div className="section-title">Links</div>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <span className="p-label">GitHub username</span>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "rgba(234,234,234,0.25)" }}>
                      github.com/
                    </span>
                    <input className="profile-input" style={{ paddingLeft: 100 }} value={form.githubUsername} onChange={(e) => set("githubUsername", e.target.value)} placeholder="yourusername" />
                  </div>
                </div>
                <div>
                  <span className="p-label">LinkedIn</span>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "rgba(234,234,234,0.25)" }}>
                      linkedin.com/in/
                    </span>
                    <input className="profile-input" style={{ paddingLeft: 120 }} value={form.linkedIn} onChange={(e) => set("linkedIn", e.target.value)} placeholder="yourprofile" />
                  </div>
                </div>
                <div>
                  <span className="p-label">Portfolio</span>
                  <input className="profile-input" value={form.portfolio} onChange={(e) => set("portfolio", e.target.value)} placeholder="https://yoursite.com" />
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profile?.githubUsername && (
                  <a className="link-pill" href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                    {profile.githubUsername}
                  </a>
                )}
                {profile?.linkedIn && (
                  <a className="link-pill" href={`https://linkedin.com/in/${profile.linkedIn}`} target="_blank" rel="noreferrer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                    LinkedIn
                  </a>
                )}
                {profile?.portfolio && (
                  <a className="link-pill" href={profile.portfolio} target="_blank" rel="noreferrer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    Portfolio
                  </a>
                )}
                {!profile?.githubUsername && !profile?.linkedIn && !profile?.portfolio && (
                  <span style={{ fontSize: 12, color: "rgba(234,234,234,0.25)", fontStyle: "italic" }}>No links added yet.</span>
                )}
              </div>
            )}
          </div>

          {saveError && (
            <p style={{ fontSize: 12, color: "#FF6B6B", marginTop: 16 }}>{saveError}</p>
          )}
        </div>

        {/* ── GROUP SECTION ── */}
        {(isMe || group || groupLoading) && (
          <div className="fade-in profile-section-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div className="section-title" style={{ margin: 0 }}>{isMe ? "My Group" : "Group"}</div>
              {isMe && (
                <Link to="/groups" className="link-pill">
                  Manage group
                </Link>
              )}
            </div>

            {groupLoading ? (
              <p style={{ fontSize: 12, color: "rgba(234,234,234,0.3)", margin: 0 }}>LOADING GROUP...</p>
            ) : group ? (
              <div className="profile-group-card">
                <div className="profile-group-top">
                  <div>
                    <h2 className="profile-group-name">{group.name}</h2>
                    <p className="profile-group-desc">{group.description}</p>
                  </div>
                  <span className="profile-group-count">
                    {group.members?.length || 0}/{group.maxMembers || 6}
                  </span>
                </div>

                <div className="profile-group-members">
                  {group.members?.map((member) => (
                    <div key={member.uid} className="profile-group-member">
                      <div className="profile-group-avatar">
                        {member.photoURL ? (
                          <img src={member.photoURL} alt="" />
                        ) : (
                          member.displayName?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?"
                        )}
                      </div>
                      <span>{member.displayName}</span>
                      {member.role === "admin" && <span className="profile-admin-tag">Admin</span>}
                    </div>
                  ))}
                </div>

                {group.focus && (
                  <p style={{ fontSize: 12, color: "rgba(234,234,234,0.4)", margin: 0 }}>
                    Focus: <span style={{ color: "#E61919" }}>{group.focus}</span>
                  </p>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "26px 0" }}>
                <p style={{ fontSize: 12, color: "rgba(234,234,234,0.3)", margin: "0 0 14px" }}>
                  You are not in a group yet.
                </p>
                <Link to="/groups" className="link-pill">Find a group</Link>
              </div>
            )}
          </div>
        )}

        {/* ── PROJECTS SECTION ── */}
        <div className="fade-in profile-section-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div className="section-title" style={{ margin: 0 }}>Projects</div>
            {isMe && (
              <Link to="/projects/new" className="btn btn-red" style={{ padding: "6px 14px", fontSize: 10 }}>
                + Add project
              </Link>
            )}
          </div>

          {projectsLoading ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ fontSize: 11, color: "rgba(234,234,234,0.3)", margin: 0, letterSpacing: "0.14em", textTransform: "uppercase", animation: "plblink 1.2s steps(2) infinite" }}>Loading projects...</p>
              <style>{`@keyframes plblink { 0%, 50% { opacity: 1; } 100% { opacity: 0.2; } }`}</style>
            </div>
          ) : projectsError ? (
            <p style={{ fontSize: 12, color: "#FF6B6B", margin: 0 }}>{projectsError}</p>
          ) : projects.length > 0 ? (
            <div style={{ display: "grid", gap: 1, background: "#1A1A1A", border: "1px solid #1A1A1A" }}>
              {projects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  currentUserId={user?.uid}
                  onDelete={(id) => setProjects((prev) => prev.filter((p) => p.id !== id))}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ fontSize: 12, color: "rgba(234,234,234,0.3)", margin: 0 }}>
                {isMe ? "NO PROJECTS YET — CREATE YOUR FIRST ONE." : "NO PROJECTS YET."}
              </p>
            </div>
          )}
        </div>

        {/* ── NEEDS (MY POSTS) SECTION ── */}
        {isMe && (
          <div className="profile-section-card" style={{ marginTop: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div className="section-title" style={{ margin: 0, fontSize: 14 }}>My Posts</div>
            </div>

            {needsLoading ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ fontSize: 11, color: "rgba(234,234,234,0.3)", margin: 0, letterSpacing: "0.14em", textTransform: "uppercase", animation: "plblink 1.2s steps(2) infinite" }}>Loading posts...</p>
              </div>
            ) : needs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#1A1A1A", border: "1px solid #1A1A1A" }}>
                {needs.map((need) => (
                  <NeedCard key={need.id} need={need} onDelete={handleDeleteNeed} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ fontSize: 12, color: "rgba(234,234,234,0.3)", margin: 0 }}>
                  NO POSTS YET — SHARE AN OPPORTUNITY.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes plblink { 0%, 50% { opacity: 1; } 100% { opacity: 0.2; } }`}</style>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(234,234,234,0.4)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.18em", textTransform: "uppercase", animation: "plblink 1.2s steps(2) infinite" }}>
          Loading profile...
        </p>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 40, fontFamily: "'Archivo Black', sans-serif", fontWeight: 400, color: "#E61919", margin: "0 0 10px" }}>[ 404 ]</p>
        <p style={{ fontSize: 12, color: "rgba(234,234,234,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>This profile doesn't exist.</p>
        <a href="/home" style={{ display: "inline-block", marginTop: 20, color: "#E61919", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none" }}>{"<< Back to home"}</a>
      </div>
    </div>
  );
}