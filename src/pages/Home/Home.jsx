import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import DiscoverFeed from "./DiscoverFeed";

const MARQUEE_WORDS = ["COLLABORATE", "BUILD", "SHIP", "LEARN", "CONNECT", "CREATE"];

export default function Home() {
  const feedRef = useRef(null);
  const navigate = useNavigate();

  const goToFeed = () => {
    requestAnimationFrame(() => feedRef.current?.scrollIntoView({ behavior: "smooth" }));
  };

  return (
    <div className="home-page">
      <style>{`
        .home-page {
          min-height: 100dvh;
          background: #0A0A0A;
          font-family: 'JetBrains Mono', monospace;
          position: relative;
          overflow-x: clip;
          color: #EAEAEA;
        }
        .home-shell {
          position: relative;
          z-index: 1;
          width: 100%;
          margin: 0 auto;
          padding-bottom: 120px;
        }
        .hero {
          min-height: calc(100dvh - 60px);
          display: flex;
          align-items: center;
        }
        .hero-inner {
          width: 100%;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 64px;
          align-items: center;
          padding: 72px 0 56px;
        }
        .hero-copy { max-width: 640px; }
        .hero-kicker {
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
          margin-bottom: 32px;
        }
        .hero-kicker .x { color: #E61919; }
        .hero-kicker .dot {
          width: 6px; height: 6px; background: #E61919;
          animation: hblink 1.6s steps(2) infinite;
        }
        @keyframes hblink { 0%, 50% { opacity: 1; } 100% { opacity: 0.2; } }
        .hero-title {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: clamp(2.6rem, 5.2vw, 5rem);
          line-height: 0.98;
          text-transform: uppercase;
          letter-spacing: -0.015em;
          color: #EAEAEA;
          margin: 0 0 28px;
        }
        .hero-title .hl { display: block; }
        .hero-title .hl-red { color: #E61919; }
        .hero-sub {
          font-size: 14px;
          color: rgba(234,234,234,0.55);
          line-height: 1.7;
          max-width: 480px;
          margin: 0 0 44px;
        }
        .hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; }
        .hero-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 26px;
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
        .hero-cta.primary { background: #E61919; border-color: #E61919; color: #fff; }
        .hero-cta.primary:hover { background: #FF2A2A; border-color: #FF2A2A; }
        .hero-cta.secondary:hover { border-color: rgba(230,25,25,0.5); color: #E61919; }
        .hero-media { position: relative; display: flex; justify-content: flex-end; }
        .hero-media-frame {
          position: relative;
          width: min(420px, 100%);
          aspect-ratio: 4 / 5;
          background: #0E0E0E;
          border: 1px solid #1A1A1A;
          overflow: hidden;
        }
        .hero-media-frame::before,
        .hero-media-frame::after {
          content: ""; position: absolute; width: 26px; height: 26px;
          border-color: rgba(230,25,25,0.8); border-style: solid; z-index: 2; pointer-events: none;
        }
        .hero-media-frame::before { top: 8px; left: 8px; border-width: 1px 0 0 1px; }
        .hero-media-frame::after { bottom: 8px; right: 8px; border-width: 0 1px 1px 0; }
        .hero-media-img {
          width: 100%; height: 100%;
          object-fit: cover;
          filter: grayscale(1) contrast(1.15) brightness(0.8);
        }
        .hero-media-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 12px;
          background: rgba(10,10,10,0.85);
          border-bottom: 1px solid #1A1A1A;
          font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(234,234,234,0.5);
          z-index: 3;
        }
        .hero-media-bar .rec {
          display: inline-flex; align-items: center; gap: 6px; color: #E61919;
        }
        .hero-media-bar .rec::before {
          content: ""; width: 6px; height: 6px; background: #E61919;
          animation: hblink 1.6s steps(2) infinite;
        }
        .hero-media-float {
          position: absolute;
          left: -32px;
          bottom: 28px;
          padding: 14px 18px;
          background: #0E0E0E;
          border: 1px solid #2A2A2A;
          z-index: 3;
        }
        .hero-media-float .f-label { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(234,234,234,0.4); margin-bottom: 6px; }
        .hero-media-float .f-value { font-size: 12px; font-weight: 700; letter-spacing: 0.04em; color: #EAEAEA; }
        .hero-media-float .f-value .num { color: #E61919; }
        .marquee {
          position: relative;
          z-index: 1;
          border-top: 1px solid #1A1A1A;
          border-bottom: 1px solid #1A1A1A;
          background: #0A0A0A;
          overflow: hidden;
          padding: 20px 0;
          margin-bottom: 8px;
          mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }
        .marquee-track {
          display: flex;
          gap: 56px;
          width: max-content;
          animation: marquee 30s linear infinite;
          white-space: nowrap;
        }
        .marquee-track:hover { animation-play-state: paused; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-word {
          font-family: 'Archivo Black', sans-serif;
          font-size: clamp(16px, 2.6vw, 24px);
          font-weight: 400;
          letter-spacing: 0.02em;
          color: rgba(234,234,234,0.16);
          display: inline-flex;
          align-items: center;
          gap: 56px;
          transition: color 0.2s;
        }
        .marquee-word:hover { color: #E61919; }
        .marquee-dot { color: #E61919; font-size: 12px; }
        .seg-row {
          display: inline-flex;
          border: 1px solid #1A1A1A;
          background: #0E0E0E;
          margin: 40px 0 28px;
        }
        .seg-btn {
          position: relative;
          padding: 12px 26px;
          border: none;
          border-right: 1px solid #1A1A1A;
          background: transparent;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(234,234,234,0.45);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .seg-btn:last-child { border-right: none; }
        .seg-btn:hover { color: rgba(234,234,234,0.85); }
        .seg-btn.active { background: #E61919; color: #fff; }
        .cta-band {
          margin-top: 120px;
          text-align: center;
          padding: 96px 32px;
          border: 1px solid #1A1A1A;
          background: #0E0E0E;
          position: relative;
          overflow: hidden;
        }
        .cta-band::before {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(60% 100% at 50% 0%, rgba(230,25,25,0.08), transparent 70%);
          pointer-events: none;
        }
        .cta-band .cb-kicker {
          font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(234,234,234,0.4); margin-bottom: 18px;
        }
        .cta-band .cb-kicker .x { color: #E61919; }
        .cta-band h2 {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: clamp(24px, 4vw, 40px);
          text-transform: uppercase;
          letter-spacing: -0.01em;
          color: #EAEAEA;
          margin: 0 0 20px;
        }
        .cta-band p {
          color: rgba(234,234,234,0.5);
          max-width: 460px;
          margin: 0 auto 40px;
          line-height: 1.7;
          font-size: 13px;
        }
        .cta-band-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 34px;
          background: #E61919;
          border: 1px solid #E61919;
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.15s;
        }
        .cta-band-btn:hover { background: #FF2A2A; }
        .cta-band-btn:active { transform: scale(0.98); }
        @media (max-width: 900px) {
          .hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .hero-media { justify-content: center; }
          .hero-media-inner { width: min(360px, 100%); }
        }
        @media (max-width: 768px) {
          .home-shell { padding-bottom: 80px; }
          .hero { min-height: auto; align-items: flex-start; }
          .hero-inner { padding: 48px 0 24px; }
          .hero-media { display: none; }
          .hero-media-float { left: -6px; bottom: 12px; }
          .hero-cta { padding: 14px 20px; }
          .seg-btn { padding: 11px 18px; font-size: 10px; }
          .cta-band { padding: 72px 20px; margin-top: 80px; }
        }
      `}</style>

      <Navbar />

      <main className="home-shell">
        <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <section className="hero">
            <div className="hero-inner">
              <div className="hero-copy">
                <div className="hero-kicker">
                  <span className="x">[</span>
                  <span className="dot" />
                  Student builder network
                  <span className="x">]</span>
                </div>
                <h1 className="hero-title">
                  <span className="hl">Find your crew,</span>
                  <span className="hl">
                    build <span className="hl-red">what matters.</span>
                  </span>
                </h1>
                <p className="hero-sub">
                 Discover projects looking for collaborators, meet builders across
                  campuses, and ship something real together.
                </p>
                <div className="hero-ctas">
                  <button className="hero-cta primary" onClick={goToFeed}>
                    Explore projects
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button className="hero-cta secondary" onClick={() => navigate("/projects/new")}>
                    Create a project
                  </button>
                </div>
              </div>
              <div className="hero-media">
                <div className="hero-media-frame">
                  <div className="hero-media-bar">
                    <span>MEDIA / FEED</span>
                    <span className="rec">REC</span>
                  </div>
                  <img
                    className="hero-media-img"
                    src="https://picsum.photos/seed/hackhive-build/840/1050"
                    alt="Builders collaborating"
                    loading="eager"
                  />
                  <div className="hero-media-float">
                    <div className="f-label">// LIVE TELEMETRY</div>
                    <div className="f-value">
                      <span className="num">47</span> OPEN COLLABORATIONS
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
              <span className="marquee-word" key={i}>
                {w} <span className="marquee-dot">+</span>
              </span>
            ))}
          </div>
        </div>

        <div style={{ width: "100%", maxWidth: 1060, margin: "0 auto", padding: "0 24px" }} ref={feedRef}>
          <DiscoverFeed />
        </div>

        <div style={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <section className="cta-band">
            <div className="cb-kicker">
              <span className="x">[</span> READY TO SHIP? <span className="x">]</span>
            </div>
            <h2>Ready to ship something real?</h2>
            <p>
              Drop your idea, find the right people, and build in the open. Your project starts here.
            </p>
            <button className="cta-band-btn" onClick={() => navigate("/projects/new")}>
              Create a project
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}