import { useNavigate, Link } from "react-router-dom";

const MARQUEE_WORDS = ["LOST BUILD", "404 ERROR", "OFF THE GRID", "WRONG ROUTE", "DEAD END", "NO SIGNAL"];

const DESTINATIONS = [
  {
    key: "home",
    label: "Home",
    desc: "Back to the live feed of projects and people.",
    path: "/home",
    seed: "hackhive-home",
  },
  {
    key: "needs",
    label: "Opportunities",
    desc: "Teammates, mentors, and feedback for your next build.",
    path: "/needs",
    seed: "hackhive-needs",
  },
  {
    key: "groups",
    label: "Groups",
    desc: "Cohorts and circles building in the open.",
    path: "/groups",
    seed: "hackhive-groups",
  },
];

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="nf-page">
      <style>{`
        .nf-page {
          min-height: 100dvh;
          background: #0A0A0A;
          font-family: 'JetBrains Mono', monospace;
          position: relative;
          overflow-x: clip;
          color: #EAEAEA;
          width: 100%;
          max-width: 100%;
        }
        .nf-shell { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .nf-nav {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 0;
        }
        .nf-logo { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
        .nf-logo-dot { width: 18px; height: 18px; display: block; }
        .nf-logo-text { font-family: 'Archivo Black', sans-serif; font-size: 15px; font-weight: 400; text-transform: uppercase; letter-spacing: -0.01em; color: #EAEAEA; }
        .nf-nav-actions { display: flex; align-items: center; gap: 10px; }
        .nf-nav-link {
          padding: 9px 16px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(234,234,234,0.5);
          text-decoration: none;
          transition: color 0.15s;
        }
        .nf-nav-link:hover { color: #EAEAEA; }
        .nf-nav-cta {
          padding: 10px 20px;
          background: #E61919;
          border: 1px solid #E61919;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s;
        }
        .nf-nav-cta:hover { background: #FF2A2A; }
        .nf-hero {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
          align-items: center;
          min-height: calc(100dvh - 140px);
          padding: 40px 0;
        }
        .nf-404 {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: clamp(6rem, 18vw, 13rem);
          line-height: 0.85;
          letter-spacing: -0.03em;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(234,234,234,0.2);
          margin: 0 0 24px;
          user-select: none;
        }
        .nf-404 .nf-404-solid { color: #E61919; -webkit-text-stroke: 0; }
        .nf-title {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: clamp(1.8rem, 4.5vw, 3.2rem);
          line-height: 1.05;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: #EAEAEA;
          margin: 0 0 20px;
          max-width: 620px;
        }
        .nf-title .nf-pill-img {
          display: inline-block;
          width: clamp(3rem, 8vw, 5rem);
          height: clamp(1.4rem, 3.5vw, 2.2rem);
          background-size: cover;
          background-position: center;
          vertical-align: middle;
          margin: 0 10px;
          filter: grayscale(1) contrast(1.15) brightness(0.8);
          border: 1px solid #2A2A2A;
        }
        .nf-sub {
          font-size: 13px;
          color: rgba(234,234,234,0.55);
          line-height: 1.8;
          max-width: 46ch;
          margin: 0 0 36px;
        }
        .nf-ctas { display: flex; gap: 12px; flex-wrap: wrap; }
        .nf-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 26px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          border: 1px solid #2A2A2A;
          background: transparent;
          color: #EAEAEA;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .nf-cta:hover { border-color: rgba(230,25,25,0.5); color: #E61919; }
        .nf-cta.primary { background: #E61919; border-color: #E61919; color: #fff; }
        .nf-cta.primary:hover { background: #FF2A2A; border-color: #FF2A2A; color: #fff; }
        .nf-hero-img-wrap { position: relative; height: 100%; min-height: 480px; display: flex; align-items: flex-end; justify-content: flex-end; padding-bottom: 60px; }
        .nf-hero-img {
          position: relative;
          width: min(400px, 100%);
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: #0E0E0E;
          border: 1px solid #1A1A1A;
          transform: rotate(2deg);
        }
        .nf-hero-img::before,
        .nf-hero-img::after {
          content: ""; position: absolute; width: 26px; height: 26px;
          border-color: rgba(230,25,25,0.8); border-style: solid; z-index: 2; pointer-events: none;
        }
        .nf-hero-img::before { top: 8px; left: 8px; border-width: 1px 0 0 1px; }
        .nf-hero-img::after { bottom: 8px; right: 8px; border-width: 0 1px 1px 0; }
        .nf-hero-img img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.15) brightness(0.8); }
        .nf-hero-img::after { background: none; border-width: 0 1px 1px 0; }
        .nf-hero-float {
          position: absolute;
          left: -30px;
          bottom: 30px;
          padding: 14px 18px;
          background: #0E0E0E;
          border: 1px solid #2A2A2A;
          transform: rotate(-2deg);
          z-index: 3;
        }
        .nf-hero-float .f-label { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(234,234,234,0.4); margin-bottom: 6px; }
        .nf-hero-float .f-value { font-size: 13px; font-weight: 700; color: #EAEAEA; }
        .nf-hero-float .f-value .arrow { color: #E61919; }
        .nf-marquee {
          position: relative;
          z-index: 2;
          border-top: 1px solid #1A1A1A;
          border-bottom: 1px solid #1A1A1A;
          overflow: hidden;
          padding: 18px 0;
          mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }
        .nf-marquee-track {
          display: flex;
          gap: 48px;
          width: max-content;
          animation: nf-marquee 32s linear infinite;
          white-space: nowrap;
        }
        .nf-marquee-track:hover { animation-play-state: paused; }
        @keyframes nf-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .nf-marquee-word {
          font-family: 'Archivo Black', sans-serif;
          font-size: clamp(16px, 3vw, 22px);
          font-weight: 400;
          letter-spacing: 0.04em;
          color: rgba(234,234,234,0.16);
          display: inline-flex;
          align-items: center;
          gap: 48px;
          transition: color 0.2s;
        }
        .nf-marquee-word:hover { color: #E61919; }
        .nf-marquee-dot { color: #E61919; font-size: 12px; }
        .nf-acc-section { padding: 120px 0 40px; }
        .nf-section-head { max-width: 720px; margin-bottom: 56px; }
        .nf-section-head h2 {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: clamp(1.6rem, 4vw, 2.6rem);
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: #EAEAEA;
          margin: 0;
        }
        .nf-accordion { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #1A1A1A; border: 1px solid #1A1A1A; }
        .nf-acc {
          position: relative;
          height: 300px;
          overflow: hidden;
          background: #0E0E0E;
          cursor: pointer;
          transition: background 0.15s;
          text-decoration: none;
          display: flex;
          align-items: flex-end;
          padding: 24px;
          isolation: isolate;
        }
        .nf-acc:hover { background: #101010; }
        .nf-acc-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          filter: grayscale(1) contrast(1.15) brightness(0.5);
          opacity: 0.3;
          transition: opacity 0.3s;
          z-index: -1;
        }
        .nf-acc:hover .nf-acc-bg { opacity: 0.5; }
        .nf-acc-label {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          text-transform: uppercase;
          font-size: 18px;
          color: #EAEAEA;
          margin: 0 0 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nf-acc-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          background: #E61919;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          transition: transform 0.2s;
        }
        .nf-acc:hover .nf-acc-arrow { transform: rotate(-45deg) translate(2px, -2px); }
        .nf-acc-desc {
          font-size: 11px;
          color: rgba(234,234,234,0.55);
          line-height: 1.6;
          margin: 0;
          max-width: 30ch;
        }
        .nf-stack-section { padding: 120px 0 0; }
        .nf-stack-grid { display: flex; flex-direction: column; gap: 1px; background: #1A1A1A; border: 1px solid #1A1A1A; }
        .nf-stack-card {
          background: #0E0E0E;
          padding: 32px 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .nf-stack-title {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          text-transform: uppercase;
          font-size: clamp(1.3rem, 3vw, 1.9rem);
          letter-spacing: -0.02em;
          color: #EAEAEA;
          margin: 0 0 8px;
        }
        .nf-stack-desc {
          font-size: 12px;
          color: rgba(234,234,234,0.5);
          line-height: 1.6;
          max-width: 42ch;
          margin: 0;
        }
        .nf-stack-cta {
          flex-shrink: 0;
          padding: 11px 22px;
          background: transparent;
          border: 1px solid #2A2A2A;
          color: rgba(234,234,234,0.6);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          transition: border-color 0.15s, color 0.15s;
        }
        .nf-stack-cta:hover { border-color: rgba(230,25,25,0.5); color: #E61919; }
        .nf-action { padding: 140px 0 0; }
        .nf-action-inner {
          text-align: center;
          padding: 96px 32px;
          border: 1px solid #1A1A1A;
          background: #0E0E0E;
          position: relative;
          overflow: hidden;
        }
        .nf-action-inner::before {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(60% 100% at 50% 0%, rgba(230,25,25,0.08), transparent 70%);
          pointer-events: none;
        }
        .nf-action h2 {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: clamp(1.8rem, 5vw, 3.2rem);
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: #EAEAEA;
          margin: 0 0 24px;
        }
        .nf-action p {
          color: rgba(234,234,234,0.5);
          max-width: 46ch;
          margin: 0 auto 40px;
          line-height: 1.7;
          font-size: 13px;
        }
        .nf-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          border-top: 1px solid #1A1A1A;
          padding: 32px 0 48px;
          margin-top: 120px;
        }
        .nf-footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
        .nf-footer-links a {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(234,234,234,0.5);
          text-decoration: none;
          transition: color 0.15s;
        }
        .nf-footer-links a:hover { color: #EAEAEA; }
        .nf-footer-copy { font-size: 11px; color: rgba(234,234,234,0.3); }
        @media (max-width: 900px) {
          .nf-hero { grid-template-columns: 1fr; min-height: auto; }
          .nf-hero-img-wrap { min-height: 360px; justify-content: center; padding-bottom: 80px; }
          .nf-hero-img { width: min(320px, 100%); }
          .nf-hero-float { left: 10px; }
          .nf-accordion { grid-template-columns: 1fr; }
          .nf-acc { height: 200px; }
          .nf-stack-card { flex-direction: column; align-items: flex-start; padding: 24px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .nf-marquee-track { animation: none; }
        }
      `}</style>

      <div className="nf-shell">
        <nav className="nf-nav">
          <Link to="/" className="nf-logo">
            <img src="/Newfavicon.svg" alt="HackHive logo" className="nf-logo-dot" />
            <span className="nf-logo-text">ackHive</span>
          </Link>
          <div className="nf-nav-actions">
            <Link to="/needs" className="nf-nav-link">Opportunities</Link>
            <Link to="/groups" className="nf-nav-link">Groups</Link>
            <Link to="/" className="nf-nav-cta">Back home</Link>
          </div>
        </nav>

        <main>
          <section className="nf-hero">
            <div className="nf-hero-text" style={{ maxWidth: 680 }}>
              <h1 className="nf-404">
                4
                <span className="nf-404-solid">0</span>
                4
              </h1>
              <h2 className="nf-title">
                This page went on its own
                <span
                  className="nf-pill-img"
                  style={{ backgroundImage: "url(https://picsum.photos/seed/hackhive-lost/400/120)" }}
                  aria-hidden="true"
                />
                adventure.
              </h2>
              <p className="nf-sub">
                {"//"} The URL you followed led to a dead end. The build continues elsewhere, and it is easy to find.
              </p>
              <div className="nf-ctas">
                <button className="nf-cta primary" onClick={() => navigate("/home")}>
                  Take me home
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
                <Link to="/needs" className="nf-cta secondary">
                  Browse opportunities
                </Link>
              </div>
            </div>

            <div className="nf-hero-img-wrap">
              <div className="nf-hero-img">
                <img
                  src="https://picsum.photos/seed/hackhive-404/800/1000"
                  alt="Abstract sculpture in a dark studio"
                />
              </div>
              <div className="nf-hero-float">
                <div className="f-label">Status</div>
                <div className="f-value"><span className="arrow">/</span> 404 — not found</div>
              </div>
            </div>
          </section>

          <div className="nf-marquee" aria-hidden="true">
            <div className="nf-marquee-track">
              {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
                <span className="nf-marquee-word" key={i}>
                  {w} <span className="nf-marquee-dot">+</span>
                </span>
              ))}
            </div>
          </div>

          <section className="nf-acc-section">
            <div className="nf-section-head">
              <h2>Where do you want to go?</h2>
            </div>
            <div className="nf-accordion">
              {DESTINATIONS.map((d) => (
                <Link
                  key={d.key}
                  to={d.path}
                  className="nf-acc"
                >
                  <div
                    className="nf-acc-bg"
                    style={{ backgroundImage: `url(https://picsum.photos/seed/${d.seed}/800/600)` }}
                  />
                  <div>
                    <p className="nf-acc-label">
                      {d.label}
                      <span className="nf-acc-arrow">{"->"}</span>
                    </p>
                    <p className="nf-acc-desc">{d.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="nf-stack-section">
            <div className="nf-section-head">
              <h2>Start from somewhere real.</h2>
            </div>
            <div className="nf-stack-grid">
              <div className="nf-stack-card">
                <div>
                  <h3 className="nf-stack-title">Find your crew</h3>
                  <p className="nf-stack-desc">Browse live projects and jump into one that needs your skills.</p>
                </div>
                <Link to="/home" className="nf-stack-cta">Explore projects</Link>
              </div>
              <div className="nf-stack-card">
                <div>
                  <h3 className="nf-stack-title">Post a need</h3>
                  <p className="nf-stack-desc">Put what you are looking for on the board and let people come to you.</p>
                </div>
                <Link to="/needs" className="nf-stack-cta">Open the board</Link>
              </div>
              <div className="nf-stack-card">
                <div>
                  <h3 className="nf-stack-title">Join a group</h3>
                  <p className="nf-stack-desc">Cohorts and circles building in the open. Find your people.</p>
                </div>
                <Link to="/groups" className="nf-stack-cta">Browse groups</Link>
              </div>
            </div>
          </section>

          <section className="nf-action">
            <div className="nf-action-inner">
              <h2>You are one tap away from the build.</h2>
              <p>Every great project started somewhere. Yours starts on the next page you open.</p>
              <button className="nf-cta primary" onClick={() => navigate("/home")}>
                Back to the feed
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </section>

          <footer className="nf-footer">
            <div className="nf-footer-links">
              <Link to="/home">Home</Link>
              <Link to="/needs">Opportunities</Link>
              <Link to="/groups">Groups</Link>
              <Link to="/chat">Messages</Link>
            </div>
            <span className="nf-footer-copy">HackHive · 2026</span>
          </footer>
        </main>
      </div>
    </div>
  );
}