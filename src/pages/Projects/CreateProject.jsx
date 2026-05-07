import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import SkillInput from "../../components/ui/SkillInput";
import { createProject } from "../../services/projectService";
import { useAuthStore } from "../../store/authStore";

const DOMAINS = [
  "Web Development",
  "Mobile Apps",
  "Machine Learning / AI",
  "Data Science",
  "DevOps / Cloud",
  "Blockchain / Web3",
  "Game Development",
  "Cybersecurity",
  "Open Source",
  "Other",
];

const initialForm = {
  title: "",
  description: "",
  techStack: [],
  domain: "",
  openToCollab: true,
};

export default function App() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }

    setSaving(true);
    try {
      const projectId = await createProject(user.uid, profile || {}, {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
      });
      navigate(`/projects/${projectId}`);
    } catch(e) {
      console.error("Error creating project:", e);
      setError("Failed to create project. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .project-shell { max-width: 760px; margin: 0 auto; padding: 46px 24px 80px; }
        .project-panel {
          background: #111113;
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 30px 32px;
        }
        .project-heading {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          margin: 0 0 8px;
        }
        .project-copy { color: rgba(255,255,255,0.4); font-size: 14px; line-height: 1.7; margin: 0 0 28px; }
        .project-label {
          display: block;
          margin-bottom: 7px;
          color: rgba(255,255,255,0.35);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .project-field {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 12px 14px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          resize: vertical;
          transition: border-color 0.15s;
        }
        .project-field:focus { border-color: rgba(99,255,180,0.45); }
        .project-field::placeholder { color: rgba(255,255,255,0.22); }
        .domain-options { display: flex; flex-wrap: wrap; gap: 8px; }
        .domain-option {
          padding: 7px 13px;
          border-radius: 20px;
          border: 0.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.46);
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
        }
        .domain-option.selected {
          background: rgba(99,255,180,0.1);
          border-color: rgba(99,255,180,0.35);
          color: #63ffb4;
        }
        .collab-toggle {
          width: 46px;
          height: 26px;
          border-radius: 999px;
          border: 0.5px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.08);
          padding: 3px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .collab-toggle.on { background: rgba(99,255,180,0.18); border-color: rgba(99,255,180,0.38); }
        .toggle-knob {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(255,255,255,0.7);
          transition: transform 0.15s, background 0.15s;
        }
        .collab-toggle.on .toggle-knob { transform: translateX(20px); background: #63ffb4; }
        .primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 22px;
          border-radius: 10px;
          background: #63ffb4;
          color: #09090b;
          border: none;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        .primary-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .ghost-link {
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          text-decoration: none;
        }
        .link-inputs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 600px) {
          .link-inputs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Navbar />

      <main className="project-shell">
        <form className="project-panel" onSubmit={handleSubmit}>
          <h1 className="project-heading">Create project</h1>
          <p className="project-copy">Share what you are building and make it easy for other builders to understand where they can help.</p>

          <div style={{ display: "grid", gap: 20 }}>
            <label>
              <span className="project-label">Title</span>
              <input
                className="project-field"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="AI study planner"
              />
            </label>

            <label>
              <span className="project-label">Description</span>
              <textarea
                className="project-field"
                rows={5}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What does it do, who is it for, and what kind of collaborator would help?"
              />
            </label>

            {/* Added Links Grid */}
            <div className="link-inputs-grid">
              <label>
                <span className="project-label">GitHub Repository (Optional)</span>
                <input
                  className="project-field"
                  type="url"
                  value={form.githubLink}
                  onChange={(e) => set("githubLink", e.target.value)}
                  placeholder="https://github.com/username/repo"
                />
              </label>

              <label>
                <span className="project-label">Live Project Link (Optional)</span>
                <input
                  className="project-field"
                  type="url"
                  value={form.liveLink}
                  onChange={(e) => set("liveLink", e.target.value)}
                  placeholder="https://your-project.com"
                />
              </label>
            </div>

            <div>
              <span className="project-label">Tech stack</span>
              <SkillInput value={form.techStack} onChange={(skills) => set("techStack", skills)} max={12} />
            </div>

            <div>
              <span className="project-label">Domain</span>
              <div className="domain-options">
                {DOMAINS.map((domain) => (
                  <button
                    key={domain}
                    type="button"
                    className={`domain-option ${form.domain === domain ? "selected" : ""}`}
                    onClick={() => set("domain", form.domain === domain ? "" : domain)}
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 0" }}>
              <div>
                <p style={{ margin: "0 0 4px", color: "#fff", fontSize: 14, fontWeight: 500 }}>Open to collab</p>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.34)", fontSize: 13 }}>Show a collaboration button on the project page.</p>
              </div>
              <button
                type="button"
                className={`collab-toggle ${form.openToCollab ? "on" : ""}`}
                onClick={() => set("openToCollab", !form.openToCollab)}
                aria-pressed={form.openToCollab}
                aria-label="Toggle open to collab"
              >
                <div className="toggle-knob" />
              </button>
            </div>
          </div>

          {error && <p style={{ color: "#ff6b6b", fontSize: 12, margin: "2px 0 0" }}>{error}</p>}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, marginTop: 28 }}>
            <button type="button" className="ghost-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => navigate("/profile/me")}>Cancel</button>
            <button className="primary-btn" type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create project"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}