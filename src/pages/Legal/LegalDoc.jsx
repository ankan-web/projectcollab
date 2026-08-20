import { Link } from "react-router-dom";

export default function LegalDoc({ docId, revision, effective, title, intro, sections }) {
  return (
    <main className="legal-page">
      <style>{`
        .legal-page {
          min-height: 100dvh;
          background: #0A0A0A;
          font-family: 'JetBrains Mono', monospace;
          color: #EAEAEA;
        }
        .legal-nav {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 24px;
          background: rgba(10, 10, 10, 0.92);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid #1A1A1A;
        }
        .legal-nav-logo { display: inline-flex; align-items: center; gap: 9px; text-decoration: none; }
        .legal-nav-logo img { width: 20px; height: 20px; display: block; }
        .legal-nav-logo span { font-family: 'Archivo Black', sans-serif; font-size: 15px; text-transform: uppercase; color: #EAEAEA; }
        .legal-nav-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(234, 234, 234, 0.55);
          text-decoration: none;
          transition: color 0.15s;
        }
        .legal-nav-back:hover { color: #E61919; }

        .legal-shell { max-width: 780px; margin: 0 auto; padding: 64px 24px 96px; }

        .legal-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(234, 234, 234, 0.35);
          margin-bottom: 18px;
        }
        .legal-meta .meta-red { color: #E61919; }
        .legal-meta .meta-sep { color: rgba(234, 234, 234, 0.18); }

        .legal-title {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: clamp(30px, 6vw, 52px);
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: #EAEAEA;
          margin: 0 0 20px;
        }
        .legal-intro {
          font-size: 13px;
          line-height: 1.8;
          color: rgba(234, 234, 234, 0.55);
          max-width: 60ch;
          margin: 0 0 56px;
          padding-bottom: 24px;
          border-bottom: 1px solid #1A1A1A;
        }

        .legal-section { padding: 28px 0; border-top: 1px solid #1A1A1A; }
        .legal-section-head { display: flex; align-items: baseline; gap: 14px; margin-bottom: 14px; }
        .legal-section-num {
          font-family: 'Archivo Black', sans-serif;
          font-size: 15px;
          color: #E61919;
          flex-shrink: 0;
          min-width: 30px;
        }
        .legal-section h2 {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: 18px;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          color: #EAEAEA;
          margin: 0;
        }
        .legal-section p {
          font-size: 12.5px;
          line-height: 1.85;
          color: rgba(234, 234, 234, 0.6);
          margin: 0 0 12px;
          max-width: 66ch;
        }
        .legal-section p:last-child { margin-bottom: 0; }
        .legal-section ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .legal-section li {
          font-size: 12.5px;
          line-height: 1.7;
          color: rgba(234, 234, 234, 0.6);
          max-width: 66ch;
        }
        .legal-section li::before {
          content: "> ";
          color: #E61919;
          font-weight: 700;
        }
        .legal-section a { color: #E61919; text-decoration: none; }
        .legal-section a:hover { text-decoration: underline; }

        .legal-foot {
          margin-top: 72px;
          padding: 24px 0;
          border-top: 1px solid #1A1A1A;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(234, 234, 234, 0.35);
        }
        .legal-foot-links { display: flex; gap: 20px; flex-wrap: wrap; }
        .legal-foot-links a { color: rgba(234, 234, 234, 0.45); text-decoration: none; transition: color 0.15s; }
        .legal-foot-links a:hover { color: #E61919; }

        @media (max-width: 600px) {
          .legal-shell { padding: 40px 16px 72px; }
        }
      `}</style>

      <nav className="legal-nav">
        <Link to="/" className="legal-nav-logo">
          <img src="/Newfavicon.svg" alt="HackHive logo" />
          <span>ackHive</span>
        </Link>
        <Link to="/login" className="legal-nav-back">
          <span>{"<"}</span> Back to login
        </Link>
      </nav>

      <div className="legal-shell">
        <div className="legal-meta">
          <span className="meta-red">{docId}</span>
          <span className="meta-sep">//</span>
          <span>REV {revision}</span>
          <span className="meta-sep">//</span>
          <span>EFFECTIVE {effective}</span>
        </div>

        <h1 className="legal-title">{title}</h1>
        <p className="legal-intro">{intro}</p>

        {sections.map((s, i) => (
          <section className="legal-section" key={s.id}>
            <div className="legal-section-head">
              <span className="legal-section-num">{"//"}{String(i + 1).padStart(2, "0")}</span>
              <h2>{s.title}</h2>
            </div>
            {s.body}
          </section>
        ))}
      </div>

      <footer className="legal-foot" style={{ maxWidth: 780, margin: "0 auto", padding: "24px" }}>
        <span>© {new Date().getFullYear()} HackHive</span>
        <div className="legal-foot-links">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/about">About</Link>
        </div>
      </footer>
    </main>
  );
}