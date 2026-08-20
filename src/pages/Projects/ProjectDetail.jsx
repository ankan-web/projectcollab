/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { getProject } from "../../services/projectService";
import { useAuthStore } from "../../store/authStore";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getProject(id, user?.uid)
      .then((data) => {
        if (!active) return;
        if (!data) setNotFound(true);
        else setProject(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <ProjectLoader />;
  if (notFound) return <ProjectNotFound />;

  const isOwner = project.ownerId === user?.uid;
  const ownerInitial = project.ownerName?.[0]?.toUpperCase() || "?";

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "'JetBrains Mono', monospace", color: "#EAEAEA" }}>
      <style>{`
        * { box-sizing: border-box; }
        .detail-shell { max-width: 920px; margin: 0 auto; padding: 42px 24px 80px; }
        .back-link {
          color: rgba(234,234,234,0.45);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #1A1A1A;
          background: #0E0E0E;
          padding: 8px 14px;
          transition: color 0.15s, border-color 0.15s;
        }
        .back-link:hover { color: #EAEAEA; border-color: rgba(230,25,25,0.5); }
        .detail-grid { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 1px; margin-top: 18px; align-items: start; background: #1A1A1A; border: 1px solid #1A1A1A; }
        .detail-panel { background: #0E0E0E; padding: 30px 32px; }
        .detail-id {
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(234,234,234,0.3);
          margin: 0 0 12px;
        }
        .detail-title {
          font-family: 'Archivo Black', sans-serif;
          font-size: 28px;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: #EAEAEA;
          margin: 0 0 14px;
          line-height: 1.1;
        }
        .detail-desc { color: rgba(234,234,234,0.55); font-size: 13px; line-height: 1.8; margin: 0; white-space: pre-wrap; }
        .domain-pill {
          display: inline-flex;
          padding: 5px 12px;
          background: rgba(230,25,25,0.08);
          border: 1px solid rgba(230,25,25,0.4);
          color: #FF6B6B;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin: 0 0 16px;
        }
        .section-label {
          color: rgba(234,234,234,0.32);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin: 0 0 12px;
        }
        .stack-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .stack-chip {
          display: inline-flex;
          padding: 5px 10px;
          background: transparent;
          border: 1px solid #2A2A2A;
          color: rgba(234,234,234,0.62);
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .owner-avatar {
          width: 54px;
          height: 54px;
          overflow: hidden;
          background: #131313;
          border: 1px solid #2A2A2A;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #E61919;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 18px;
          flex-shrink: 0;
        }
        .owner-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .side-btn {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          border: 1px solid #2A2A2A;
          background: transparent;
          color: rgba(234,234,234,0.65);
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .side-btn:hover { color: #EAEAEA; border-color: rgba(234,234,234,0.5); }
        .side-btn.primary {
          background: #E61919;
          border-color: #E61919;
          color: #fff;
        }
        .side-btn.primary:hover { background: #FF2A2A; border-color: #FF2A2A; }
        .side-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        @media (max-width: 780px) {
          .detail-grid { grid-template-columns: 1fr; }
          .detail-panel { padding: 24px; }
        }
      `}</style>

      <Navbar />

      <main className="detail-shell">
        <Link className="back-link" to="/home">{"<< Back to discovery"}</Link>

        <div className="detail-grid">
          <section className="detail-panel">
            <p className="detail-id">[ PROJECT / {id?.slice(0, 8)?.toUpperCase() || "----"} ]</p>
            {project.domain && <span className="domain-pill">{project.domain}</span>}
            <h1 className="detail-title">{project.title}</h1>
            <p className="detail-desc">{project.description}</p>

            <div style={{ marginTop: 30 }}>
              <p className="section-label">Tech stack</p>
              {project.techStack?.length > 0 ? (
                <div className="stack-list">
                  {project.techStack.map((tech) => <span key={tech} className="stack-chip">{tech}</span>)}
                </div>
              ) : (
                <p style={{ margin: 0, color: "rgba(234,234,234,0.24)", fontSize: 12 }}>No stack listed.</p>
              )}
            </div>
          </section>

          <aside className="detail-panel">
            <p className="section-label">Owner</p>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
              <div className="owner-avatar">
                {project.ownerPhoto
                  ? <img src={project.ownerPhoto} alt="" />
                  : ownerInitial}
              </div>
              <div>
                <p style={{ color: "#EAEAEA", fontSize: 13, fontWeight: 700, margin: "0 0 4px", textTransform: "uppercase" }}>{project.ownerName || "Unnamed Builder"}</p>
                {project.ownerCollege && <p style={{ color: "rgba(234,234,234,0.4)", fontSize: 11, margin: 0 }}>{project.ownerCollege}</p>}
              </div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <button
                className="side-btn primary"
                type="button"
                disabled={isOwner || !project.openToCollab}
              >
                {isOwner ? "Your project" : project.openToCollab ? "Request collaboration" : "Closed to collab"}
              </button>
              <button className="side-btn" type="button" onClick={() => navigate(`/profile/${project.ownerId}`)}>
                View owner profile
              </button>
              {project.githubUrl && (
                <a className="side-btn" href={project.githubUrl} target="_blank" rel="noreferrer">Open GitHub</a>
              )}
              {project.liveUrl && (
                <a className="side-btn" href={project.liveUrl} target="_blank" rel="noreferrer">Open live app</a>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function ProjectLoader() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @keyframes plblink { 0%, 50% { opacity: 1; } 100% { opacity: 0.2; } }
      `}</style>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(234,234,234,0.4)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.18em", textTransform: "uppercase", animation: "plblink 1.2s steps(2) infinite" }}>
          Loading project...
        </p>
      </div>
    </div>
  );
}

function ProjectNotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 40, fontFamily: "'Archivo Black', sans-serif", fontWeight: 400, color: "#E61919", margin: "0 0 10px" }}>[ 404 ]</p>
        <p style={{ fontSize: 12, color: "rgba(234,234,234,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>This project doesn't exist.</p>
        <Link to="/home" style={{ display: "inline-block", marginTop: 20, color: "#E61919", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none" }}>{"<< Back to home"}</Link>
      </div>
    </div>
  );
}