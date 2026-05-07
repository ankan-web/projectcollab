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
    <div style={{ minHeight: "100vh", background: "#09090b", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .detail-shell { max-width: 920px; margin: 0 auto; padding: 42px 24px 80px; }
        .back-link { color: rgba(255,255,255,0.42); font-size: 13px; text-decoration: none; }
        .detail-grid { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 18px; margin-top: 18px; align-items: start; }
        .detail-panel {
          background: #111113;
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 30px 32px;
        }
        .detail-title {
          font-family: 'Syne', sans-serif;
          font-size: 30px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.6px;
          margin: 0 0 14px;
          line-height: 1.2;
        }
        .detail-desc { color: rgba(255,255,255,0.58); font-size: 15px; line-height: 1.8; margin: 0; white-space: pre-wrap; }
        .domain-pill {
          display: inline-flex;
          padding: 5px 12px;
          border-radius: 999px;
          background: rgba(99,255,180,0.08);
          border: 0.5px solid rgba(99,255,180,0.22);
          color: #63ffb4;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 16px;
        }
        .section-label {
          color: rgba(255,255,255,0.32);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0 0 12px;
        }
        .stack-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .stack-chip {
          display: inline-flex;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.05);
          border: 0.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.62);
          font-size: 12px;
          font-weight: 500;
        }
        .owner-avatar {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(99,255,180,0.1);
          border: 1px solid rgba(99,255,180,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #63ffb4;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
        }
        .primary-btn {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          min-height: 42px;
          border-radius: 10px;
          border: none;
          background: #63ffb4;
          color: #09090b;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          text-decoration: none;
        }
        .secondary-btn {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          min-height: 40px;
          border-radius: 10px;
          border: 0.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.65);
          font-size: 13px;
          text-decoration: none;
        }
        @media (max-width: 780px) {
          .detail-grid { grid-template-columns: 1fr; }
          .detail-panel { padding: 24px; }
        }
      `}</style>

      <Navbar />

      <main className="detail-shell">
        <Link className="back-link" to="/home">← Back to discovery</Link>

        <div className="detail-grid">
          <section className="detail-panel">
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
                <p style={{ margin: 0, color: "rgba(255,255,255,0.24)", fontSize: 13 }}>No stack listed.</p>
              )}
            </div>
          </section>

          <aside className="detail-panel">
            <p className="section-label">Owner</p>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
              <div className="owner-avatar">
                {project.ownerPhoto
                  ? <img src={project.ownerPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : ownerInitial}
              </div>
              <div>
                <p style={{ color: "#fff", fontSize: 14, fontWeight: 500, margin: "0 0 4px" }}>{project.ownerName || "Unnamed Builder"}</p>
                {project.ownerCollege && <p style={{ color: "rgba(255,255,255,0.34)", fontSize: 12, margin: 0 }}>{project.ownerCollege}</p>}
              </div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <button
                className="primary-btn"
                type="button"
                disabled={isOwner || !project.openToCollab}
                style={{ opacity: isOwner || !project.openToCollab ? 0.45 : 1, cursor: isOwner || !project.openToCollab ? "not-allowed" : "pointer" }}
              >
                {isOwner ? "Your project" : project.openToCollab ? "Request collaboration" : "Closed to collab"}
              </button>
              <button className="secondary-btn" type="button" onClick={() => navigate(`/profile/${project.ownerId}`)}>
                View owner profile
              </button>
              {project.githubUrl && (
                <a className="secondary-btn" href={project.githubUrl} target="_blank" rel="noreferrer">Open GitHub</a>
              )}
              {project.liveUrl && (
                <a className="secondary-btn" href={project.liveUrl} target="_blank" rel="noreferrer">Open live app</a>
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
    <div style={{ minHeight: "100vh", background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#63ffb4", margin: "0 auto 16px", animation: "pulse 1.2s ease-in-out infinite" }} />
        <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}}`}</style>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans',sans-serif" }}>Loading project...</p>
      </div>
    </div>
  );
}

function ProjectNotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 32, fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "#fff", marginBottom: 10 }}>404</p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>This project doesn't exist.</p>
        <Link to="/home" style={{ display: "inline-block", marginTop: 20, color: "#63ffb4", fontSize: 13 }}>← Back to home</Link>
      </div>
    </div>
  );
}
