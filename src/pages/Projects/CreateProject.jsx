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
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "'JetBrains Mono', monospace", color: "#EAEAEA" }}>
      <style>{`
        * { box-sizing: border-box; }
        .project-shell { max-width: 760px; margin: 0 auto; padding: 46px 24px 80px; }
        .project-panel {
          background: #0E0E0E;
          border: 1px solid #1A1A1A;
          padding: 30px 32px;
        }
        .project-heading {
          font-family: 'Archivo Black', sans-serif;
          font-size: 24px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: #EAEAEA;
          margin: 0 0 8px;
        }
        .project-copy { color: rgba(234,234,234,0.45); font-size: 13px; line-height: 1.7; margin: 0 0 28px; }
        .domain-options { display: flex; flex-wrap: wrap; gap: 6px; }
        .domain-option {
          padding: 8px 13px;
          border: 1px solid #2A2A2A;
          background: transparent;
          color: rgba(234,234,234,0.45);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s, color 0.15s;
        }
        .domain-option:hover { color: rgba(234,234,234,0.85); border-color: rgba(234,234,234,0.4); }
        .domain-option.selected { background: #E61919; border-color: #E61919; color: #fff; }
        .collab-toggle {
          width: 46px;
          height: 26px;
          border: 1px solid #2A2A2A;
          background: #131313;
          padding: 3px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .collab-toggle.on { background: rgba(230,25,25,0.25); border-color: #E61919; }
        .toggle-knob {
          width: 18px;
          height: 18px;
          background: rgba(234,234,234,0.5);
          transition: transform 0.15s, background 0.15s;
        }
        .collab-toggle.on .toggle-knob { transform: translateX(20px); background: #E61919; }
        .link-inputs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-block { margin-bottom: 20px; }
        @media (max-width: 600px) {
          .link-inputs-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Navbar />

      <main className="project-shell">
        <form className="project-panel" onSubmit={handleSubmit}>
          <p style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(234,234,234,0.3)", margin: "0 0 12px" }}>
            [ TRANSMIT / NEW PROJECT ]
          </p>
          <h1 className="project-heading">Create project</h1>
          <p className="project-copy">Share what you are building and make it easy for other builders to understand where they can help.</p>

          <div style={{ display: "grid", gap: 20 }}>
            <div className="form-block">
              <label className="field-label" htmlFor="cp-title">Title</label>
              <input
                id="cp-title"
                className="field"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="AI study planner"
              />
            </div>

            <div className="form-block">
              <label className="field-label" htmlFor="cp-desc">Description</label>
              <textarea
                id="cp-desc"
                className="field"
                rows={5}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What does it do, who is it for, and what kind of collaborator would help?"
              />
            </div>

            <div className="link-inputs-grid">
              <div className="form-block">
                <label className="field-label" htmlFor="cp-github">GitHub Repository (Optional)</label>
                <input
                  id="cp-github"
                  className="field"
                  type="url"
                  value={form.githubLink}
                  onChange={(e) => set("githubLink", e.target.value)}
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div className="form-block">
                <label className="field-label" htmlFor="cp-live">Live Project Link (Optional)</label>
                <input
                  id="cp-live"
                  className="field"
                  type="url"
                  value={form.liveLink}
                  onChange={(e) => set("liveLink", e.target.value)}
                  placeholder="https://your-project.com"
                />
              </div>
            </div>

            <div className="form-block">
              <span className="field-label">Tech stack</span>
              <SkillInput value={form.techStack} onChange={(skills) => set("techStack", skills)} max={12} />
            </div>

            <div className="form-block">
              <span className="field-label">Domain</span>
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

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 0", borderTop: "1px solid #1A1A1A", borderBottom: "1px solid #1A1A1A" }}>
              <div>
                <p style={{ margin: "0 0 4px", color: "#EAEAEA", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Open to collab</p>
                <p style={{ margin: 0, color: "rgba(234,234,234,0.4)", fontSize: 12 }}>Show a collaboration button on the project page.</p>
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

          {error && <p style={{ color: "#FF6B6B", fontSize: 12, margin: "16px 0 0" }}>{error}</p>}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, marginTop: 28 }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate("/profile/me")}>Cancel</button>
            <button className="btn btn-red" type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create project"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}