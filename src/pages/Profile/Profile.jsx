/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getUserByUid, updateUserDoc } from "../../services/userService";
import { getUserProjects } from "../../services/projectService";
import { getUserNeeds, deleteNeed } from "../../services/needService";
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
        .need-card { background: #111113; border: 0.5px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 18px; transition: border-color 0.15s; }
        .need-card:hover { border-color: rgba(255,255,255,0.15); }
        .need-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
        .need-type { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 12px; background: rgba(99,255,180,0.1); border: 0.5px solid rgba(99,255,180,0.25); color: #63ffb4; }
        .need-delete { background: none; border: none; color: rgba(255,255,255,0.2); cursor: pointer; padding: 4px; transition: color 0.15s; }
        .need-delete:hover { color: #ff5555; }
        .need-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #fff; margin: 0 0 6px; }
        .need-desc { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.5; margin: 0 0 10px; }
        .need-tech { display: flex; flex-wrap: wrap; gap: 6px; }
        .tech-chip { font-size: 11px; padding: 3px 10px; border-radius: 20px; background: rgba(255,255,255,0.05); border: 0.5px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); }
      `}</style>
      <div className="need-card">
        <div className="need-header">
          <span className="need-type">{NEED_TYPES.find((t) => t.value === need.type)?.label}</span>
          <button className="need-delete" onClick={() => onDelete(need.id)} title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    } catch (err) {
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
    <div style={{ minHeight: "100vh", background: "#09090b", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .profile-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 10px 13px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
          resize: none;
        }
        .profile-input::placeholder { color: rgba(255,255,255,0.2); }
        .profile-input:focus { border-color: rgba(99,255,180,0.45); }
        .p-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.35);
          margin-bottom: 6px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .skill-chip {
          display: inline-flex;
          align-items: center;
          padding: 5px 12px;
          border-radius: 20px;
          background: rgba(99,255,180,0.08);
          border: 0.5px solid rgba(99,255,180,0.2);
          color: #63ffb4;
          font-size: 12px;
          font-weight: 500;
        }
        .link-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          font-size: 13px;
          text-decoration: none;
          transition: all 0.15s;
        }
        .link-pill:hover { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.2); }
        .edit-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 9px;
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.7);
          font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
        }
        .edit-btn:hover { background: rgba(255,255,255,0.09); color: #fff; }
        .save-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 20px; border-radius: 9px;
          background: #63ffb4; color: #09090b;
          font-size: 13px; font-weight: 700;
          font-family: 'Syne', sans-serif;
          border: none; cursor: pointer;
          transition: opacity 0.15s;
        }
        .save-btn:hover { opacity: 0.88; }
        .save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .cancel-btn {
          display: inline-flex; align-items: center;
          padding: 9px 18px; border-radius: 9px;
          background: transparent;
          border: 0.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4);
          font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
        }
        .cancel-btn:hover { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.2); }
        .connect-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 22px; border-radius: 9px;
          background: #63ffb4; color: #09090b;
          font-size: 13px; font-weight: 700;
          font-family: 'Syne', sans-serif;
          border: none; cursor: pointer;
          transition: opacity 0.15s; letter-spacing: 0.02em;
        }
        .connect-btn:hover { opacity: 0.85; }
        .domain-pill {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          background: rgba(29,158,117,0.12);
          border: 0.5px solid rgba(29,158,117,0.3);
          color: #1D9E75;
          font-size: 12px; font-weight: 500;
        }
        .section-divider {
          height: 0.5px;
          background: rgba(255,255,255,0.07);
          margin: 28px 0;
        }
        .section-title {
          font-size: 11px; font-weight: 500;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0 0 16px;
        }
        .domain-select-pill {
          padding: 6px 14px;
          border-radius: 20px;
          border: 0.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.4);
          font-size: 12px; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.12s;
        }
        .domain-select-pill:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); }
        .domain-select-pill.selected {
          background: rgba(99,255,180,0.1);
          border-color: rgba(99,255,180,0.35);
          color: #63ffb4;
        }
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      `}</style>

      <Navbar />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* ── HEADER CARD ── */}
        <div className="fade-in" style={{
          background: "#111113",
          border: "0.5px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "32px 32px 28px",
          marginBottom: 16,
          position: "relative",
        }}>

          {/* Edit / action buttons */}
          <div style={{ position: "absolute", top: 24, right: 24, display: "flex", gap: 8 }}>
            {isMe ? (
              editing ? (
                <>
                  <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                  <button className="save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </>
              ) : (
                <button className="edit-btn" onClick={() => setEditing(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit profile
                </button>
              )
            ) : (
              <button className="connect-btn" onClick={async () => {
                if (!user?.uid || !targetUid) return;
                try {
                  await getOrCreateChat(user.uid, targetUid, myProfile);
                  navigate(`/chat?chatWith=${targetUid}`);
                } catch (err) {
                  console.error("Error starting chat:", err);
                }
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%", flexShrink: 0,
              background: "rgba(99,255,180,0.1)",
              border: "1.5px solid rgba(99,255,180,0.25)",
              overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#63ffb4",
            }}>
              {profile?.photoURL
                ? <img src={profile.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initials
              }
            </div>

            <div style={{ flex: 1, paddingRight: 120 }}>
              {editing ? (
                <input
                  className="profile-input"
                  style={{ fontSize: 20, fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 8 }}
                  value={form.displayName}
                  onChange={(e) => set("displayName", e.target.value)}
                  placeholder="Your name"
                />
              ) : (
                <h1 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 22, fontWeight: 800, color: "#fff",
                  letterSpacing: "-0.5px", margin: "0 0 6px",
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
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
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
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
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
                ? <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.75, margin: 0 }}>
                    {profile.bio}
                  </p>
                : isMe
                  ? <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>No bio yet — add one by clicking Edit profile.</p>
                  : null
            }
          </div>

          {/* Skills */}
          <div style={{ marginBottom: 20 }}>
            <div className="section-title">Skills</div>
            {editing ? (
              <SkillInput value={form.skills || []} onChange={(s) => set("skills", s)} max={12} />
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {profile?.skills?.length > 0
                  ? profile.skills.map((s) => <span key={s} className="skill-chip">{s}</span>)
                  : <span style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>No skills added yet.</span>
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
                    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
                      github.com/
                    </span>
                    <input className="profile-input" style={{ paddingLeft: 100 }} value={form.githubUsername} onChange={(e) => set("githubUsername", e.target.value)} placeholder="yourusername" />
                  </div>
                </div>
                <div>
                  <span className="p-label">LinkedIn</span>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
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
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {profile?.githubUsername && (
                  <a className="link-pill" href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                    {profile.githubUsername}
                  </a>
                )}
                {profile?.linkedIn && (
                  <a className="link-pill" href={`https://linkedin.com/in/${profile.linkedIn}`} target="_blank" rel="noreferrer">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                    LinkedIn
                  </a>
                )}
                {profile?.portfolio && (
                  <a className="link-pill" href={profile.portfolio} target="_blank" rel="noreferrer">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    Portfolio
                  </a>
                )}
                {!profile?.githubUsername && !profile?.linkedIn && !profile?.portfolio && (
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>No links added yet.</span>
                )}
              </div>
            )}
          </div>

          {saveError && (
            <p style={{ fontSize: 12, color: "#ff6b6b", marginTop: 16 }}>{saveError}</p>
          )}
        </div>

        {/* ── PROJECTS SECTION ── */}
        <div className="fade-in" style={{
          background: "#111113",
          border: "0.5px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "28px 32px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div className="section-title" style={{ margin: 0 }}>Projects</div>
            {isMe && (
              <Link to="/projects/new" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 12, color: "#63ffb4",
                background: "rgba(99,255,180,0.08)",
                border: "0.5px solid rgba(99,255,180,0.2)",
                padding: "5px 12px", borderRadius: 20,
                textDecoration: "none", fontWeight: 500,
                transition: "background 0.15s",
              }}>
                + Add project
              </Link>
            )}
          </div>

          {projectsLoading ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#63ffb4", margin: "0 auto 14px", animation: "pulse 1.2s ease-in-out infinite" }} />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", margin: 0 }}>Loading projects...</p>
            </div>
          ) : projectsError ? (
            <p style={{ fontSize: 13, color: "#ff6b6b", margin: 0 }}>{projectsError}</p>
          ) : projects.length > 0 ? (
            <div style={{ display: "grid", gap: 12 }}>
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
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", margin: 0 }}>
                {isMe ? "No projects yet - create your first one." : "No projects yet."}
              </p>
            </div>
          )}
        </div>

        {/* ── NEEDS (MY POSTS) SECTION ── */}
        {isMe && (
          <div style={{
            background: "#111113",
            border: "0.5px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "28px 32px",
            marginTop: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Syne', sans-serif" }}>My Posts</div>
            </div>

{needsLoading ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#63ffb4", margin: "0 auto 14px", animation: "pulse 1.2s ease-in-out infinite" }} />
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", margin: 0 }}>Loading posts...</p>
              </div>
            ) : needs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {needs.map((need) => (
                  <NeedCard key={need.id} need={need} onDelete={handleDeleteNeed} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)",
                  border: "0.5px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                  </svg>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", margin: 0 }}>
                  No posts yet - share an opportunity.
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
    <div style={{ minHeight: "100vh", background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#63ffb4", margin: "0 auto 16px", animation: "pulse 1.2s ease-in-out infinite" }} />
        <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}}`}</style>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif" }}>Loading profile...</p>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 32, fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "#fff", marginBottom: 10 }}>404</p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>This profile doesn't exist.</p>
        <a href="/home" style={{ display: "inline-block", marginTop: 20, color: "#63ffb4", fontSize: 13 }}>← Back to home</a>
      </div>
    </div>
  );
}
