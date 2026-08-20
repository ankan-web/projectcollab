import { useState, useEffect } from "react";

// ============================================================================
// ORIGINAL IMPORTS: Uncomment these when pasting into your project
// ============================================================================
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GithubAuthProvider,
} from "firebase/auth";
import { auth, githubProvider, googleProvider } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { createUserDoc, checkUserExists } from "../../services/userService";
import { useAuthStore } from "../../store/authStore";
import { isAdminCredentials, startAdminSession, adminUser, adminProfile } from "../../services/adminService";

const TERM_LINES = [
  { p: "establishing secure channel", v: "OK" },
  { p: "loading hive state", v: "OK" },
  { p: "syncing build network", v: "OK" },
];

const TERM_STATS = [
  { p: "users online", v: "2,384" },
  { p: "projects live", v: "847" },
  { p: "groups active", v: "126" },
];

const TICKER_WORDS = ["COLLABORATE", "BUILD", "SHIP", "LEARN", "CONNECT", "CREATE"];

export default function App() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(TERM_STATS.map(() => 0));
  const { setUser, setProfile } = useAuthStore();

  useEffect(() => {
    const timeouts = [];
    TERM_STATS.forEach((s, i) => {
      const target = parseInt(s.v.replace(/,/g, ""), 10);
      timeouts.push(
        setTimeout(() => {
          const start = performance.now();
          const dur = [1400, 1200, 900][i];
          const tick = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = Math.round(target * eased);
            setStats((prev) => prev.map((x, j) => (j === i ? val : x)));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }, 1000 + i * 260)
      );
    });
    return () => timeouts.forEach(clearTimeout);
  }, []);

  const syncSignedInUser = async (firebaseUser, githubAccessToken = null) => {
    const profile = await createUserDoc(firebaseUser, githubAccessToken);
    setUser(firebaseUser);
    setProfile(profile);
  };

  const handleGitHub = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const githubCredential = GithubAuthProvider.credentialFromResult(result);
      const githubAccessToken = githubCredential?.accessToken || null;
      if (githubAccessToken) {
        sessionStorage.setItem("github_access_token", githubAccessToken);
      }
      await syncSignedInUser(result.user, githubAccessToken);
      navigate("/home");
    } catch (e) {
      setError(e.message || "Failed to sign in with GitHub.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      sessionStorage.removeItem("github_access_token");
      const result = await signInWithPopup(auth, googleProvider);
      await syncSignedInUser(result.user);
      navigate("/home");
    } catch (e) {
      setError(e.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isAdminCredentials(email, password)) {
      startAdminSession();
      setUser(adminUser());
      setProfile(adminProfile());
      navigate("/admin");
      setLoading(false);
      return;
    }

    try {
      sessionStorage.removeItem("github_access_token");

      if (tab === "register") {
        const existingUser = await checkUserExists(email);
        if (existingUser.exists) {
          setError("An account with this email already exists. Please sign in.");
          setLoading(false);
          return;
        }
      }

      const userCredential =
        tab === "signin"
          ? await signInWithEmailAndPassword(auth, email, password)
          : await createUserWithEmailAndPassword(auth, email, password);

      const profile = await createUserDoc(userCredential.user);

      if (profile?.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (e) {
      if (e.code === "auth/user-not-found" && tab === "signin") {
        setError("User not found. Please create an account.");
      } else if (e.code === "auth/email-already-in-use" && tab === "register") {
        setError("Account already exists. Please sign in.");
      } else {
        setError(e.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-main">
      <style>{`
        /* ══ BASE ══ */
        .login-main {
          min-height: 100dvh;
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          gap: 1px;
          background: #1A1A1A;
          font-family: 'JetBrains Mono', monospace;
          color: #EAEAEA;
          overflow: hidden;
        }

        /* Film grain overlay */
        .login-main::after {
          content: "";
          position: fixed;
          inset: 0;
          z-index: 40;
          pointer-events: none;
          opacity: 0.05;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* Motion primitives (CSS only, transform/opacity) */
        .anim { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: var(--d, 0s); }
        @keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .blink { animation: blink 1.1s steps(1) infinite; }
        @keyframes blink { 0%, 55% { opacity: 1; } 56%, 100% { opacity: 0; } }
        .pulse { animation: pulse 1.6s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        @keyframes breathe {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.9; }
        }
        @keyframes scan {
          0% { transform: translateY(-15vh); }
          100% { transform: translateY(115vh); }
        }
        @keyframes wipein {
          to { clip-path: inset(0 0 0 0); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.86; }
          94% { opacity: 1; }
          97% { opacity: 0.94; }
          98% { opacity: 1; }
        }

        /* ══ LEFT PANEL ══ */
        .left-panel {
          position: relative;
          background:
            radial-gradient(58% 42% at 14% 16%, rgba(230, 25, 25, 0.12), transparent 72%),
            radial-gradient(46% 40% at 88% 92%, rgba(230, 25, 25, 0.06), transparent 70%),
            #0A0A0A;
          padding: clamp(32px, 5vw, 56px) clamp(76px, 7vw, 96px) clamp(28px, 4vw, 48px) clamp(32px, 5vw, 56px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          min-height: 100dvh;
          animation: flicker 9s steps(1) infinite;
        }
        .left-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(50% 40% at 18% 28%, rgba(230, 25, 25, 0.16), transparent 72%);
          animation: breathe 6s ease-in-out infinite;
        }
        .left-panel::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(rgba(230, 25, 25, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(230, 25, 25, 0.05) 1px, transparent 1px);
          background-size: 44px 44px;
          pointer-events: none;
          mask-image: radial-gradient(120% 100% at 0% 0%, #000 30%, transparent 90%);
          -webkit-mask-image: radial-gradient(120% 100% at 0% 0%, #000 30%, transparent 90%);
        }
        .scanline {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 120px;
          z-index: 2;
          pointer-events: none;
          background: linear-gradient(to bottom, transparent, rgba(230, 25, 25, 0.07), transparent);
          animation: scan 8s linear infinite;
        }
        .rail {
          position: absolute;
          top: 0;
          left: 20px;
          height: 100%;
          display: flex;
          align-items: center;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font-size: 9px;
          letter-spacing: 0.22em;
          color: rgba(234, 234, 234, 0.18);
        }
        .rail .rail-red { color: #E61919; }

        .lp-header {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .login-logo { display: flex; align-items: center; gap: 10px; }
        .login-logo-sq { width: 30px; height: 30px; display: block; }
        .login-logo-text { font-family: 'Archivo Black', sans-serif; font-size: 26px; letter-spacing: -0.01em; color: #EAEAEA; }
        .lp-tag {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: rgba(234, 234, 234, 0.35);
          text-align: right;
        }

        .lp-hero { position: relative; z-index: 3; max-width: 540px; }
        .kicker {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(234, 234, 234, 0.5);
          margin: 0 0 20px;
        }
        .kicker::before { content: ""; width: 7px; height: 7px; background: #E61919; box-shadow: 0 0 12px rgba(230, 25, 25, 0.8); }

        .hero-macro {
          font-family: 'Archivo Black', sans-serif;
          font-size: clamp(2.6rem, 5.5vw, 4.4rem);
          line-height: 0.92;
          letter-spacing: -0.03em;
          text-transform: uppercase;
          color: #EAEAEA;
          margin: 0 0 22px;
        }
        .hero-macro .red {
          color: #E61919;
          text-shadow: 0 0 80px rgba(230, 25, 25, 0.4);
        }

        .hero-copy {
          font-size: 12px;
          line-height: 1.8;
          color: rgba(234, 234, 234, 0.5);
          max-width: 42ch;
          margin: 0 0 34px;
        }

        /* Terminal window */
        .term-window {
          position: relative;
          border: 1px solid #2A2A2A;
          background: #0E0E0E;
          box-shadow: 0 24px 60px -24px rgba(0, 0, 0, 0.85);
        }
        .term-window::before,
        .term-window::after {
          content: "";
          position: absolute;
          width: 18px;
          height: 18px;
          border-color: rgba(230, 25, 25, 0.8);
          border-style: solid;
          pointer-events: none;
        }
        .term-window::before { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
        .term-window::after { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }
        .term-bar {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 11px 14px;
          border-bottom: 1px solid #1A1A1A;
          background: #111111;
        }
        .diode { width: 8px; height: 8px; }
        .diode.red { background: #E61919; box-shadow: 0 0 8px rgba(230, 25, 25, 0.9); }
        .diode.dim { background: #2A2A2A; }
        .term-title {
          margin-left: auto;
          font-size: 10px;
          color: rgba(234, 234, 234, 0.35);
          letter-spacing: 0.06em;
        }
        .term-body { padding: 16px 14px 18px; font-size: 11px; line-height: 1.9; color: rgba(234, 234, 234, 0.7); }
        .term-line {
          display: flex;
          align-items: baseline;
          gap: 10px;
          clip-path: inset(0 100% 0 0);
          animation: wipein 0.45s steps(14) forwards;
          animation-delay: calc(var(--i) * 140ms + 0.3s);
        }
        .term-p { color: rgba(234, 234, 234, 0.72); white-space: nowrap; }
        .term-dots { flex: 1; border-bottom: 1px dotted rgba(234, 234, 234, 0.22); transform: translateY(-3px); }
        .term-v { color: #EAEAEA; font-weight: 700; font-variant-numeric: tabular-nums; }
        .term-v.green { color: #4AF626; text-shadow: 0 0 10px rgba(74, 246, 38, 0.5); }
        .term-stat { margin-top: 2px; }
        .term-stat .term-p .colon { color: #E61919; }
        .term-cursor { margin-top: 12px; color: rgba(234, 234, 234, 0.6); font-size: 11px; }
        .cursor-block { color: #E61919; }

        .lp-status {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(234, 234, 234, 0.35);
        }
        .lp-status-left { display: flex; align-items: center; gap: 9px; }
        .status-dot {
          width: 7px;
          height: 7px;
          background: #4AF626;
          display: inline-block;
          box-shadow: 0 0 10px rgba(74, 246, 38, 0.7);
        }

        /* Status ticker */
        .lp-ticker {
          position: relative;
          z-index: 3;
          margin-top: 18px;
          border-top: 1px solid #1A1A1A;
          overflow: hidden;
          white-space: nowrap;
          font-size: 9px;
          letter-spacing: 0.2em;
          color: rgba(234, 234, 234, 0.28);
          padding: 10px 0 0;
          mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
        }
        .lp-ticker-track {
          display: inline-flex;
          gap: 48px;
          animation: ticker 28s linear infinite;
        }
        .lp-ticker-track span { display: inline-flex; align-items: center; gap: 48px; }
        .lp-ticker-track i { font-style: normal; color: #E61919; }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ══ RIGHT PANEL ══ */
        .right-panel {
          background: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(32px, 5vw, 56px) 40px;
          min-height: 100dvh;
        }
        .form-container { width: 100%; max-width: 400px; }

        .auth-kicker {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(234, 234, 234, 0.35);
          margin: 0 0 26px;
        }
        .auth-kicker .slash { color: #E61919; }
        .dot-online { color: #4AF626; }

        .auth-head-title {
          font-family: 'Archivo Black', sans-serif;
          font-size: 26px;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: #EAEAEA;
          margin: 0 0 8px;
        }
        .auth-head-sub {
          font-size: 11px;
          color: rgba(234, 234, 234, 0.5);
          margin: 0 0 28px;
          line-height: 1.7;
        }

        /* Sliding segmented control */
        .auth-seg {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          background: #0E0E0E;
          border: 1px solid #2A2A2A;
          margin-bottom: 24px;
        }
        .auth-seg-thumb {
          position: absolute;
          top: 1px;
          bottom: 1px;
          left: 1px;
          width: calc(50% - 1px);
          background: #E61919;
          box-shadow: 0 0 24px rgba(230, 25, 25, 0.4);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 0;
        }
        .auth-seg-thumb.right { transform: translateX(100%); }
        .auth-seg-btn {
          position: relative;
          z-index: 1;
          background: none;
          border: none;
          cursor: pointer;
          padding: 13px 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(234, 234, 234, 0.45);
          transition: color 0.2s;
        }
        .auth-seg-btn:hover { color: #EAEAEA; }
        .auth-seg-btn.active { color: #0A0A0A; }

        .oauth-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 16px;
          background: #131313;
          border: 1px solid #2A2A2A;
          color: #EAEAEA;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.1s;
          margin-bottom: 10px;
          text-align: left;
          border-radius: 0;
        }
        .oauth-btn:hover { background: #1A1A1A; border-color: rgba(230, 25, 25, 0.55); }
        .oauth-btn:active { transform: translateY(1px); }
        .oauth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .oauth-arrow { color: rgba(234, 234, 234, 0.3); font-size: 14px; transition: color 0.15s, transform 0.15s; }
        .oauth-btn:hover .oauth-arrow { color: #E61919; transform: translateX(2px); }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0;
        }
        .divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #2A2A2A, transparent); }
        .divider-text { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(234, 234, 234, 0.35); }

        .form-field { margin-bottom: 16px; }
        .form-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(234, 234, 234, 0.5);
          margin-bottom: 7px;
        }
        .field-input-wrap { position: relative; }
        .field-prompt {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: rgba(234, 234, 234, 0.35);
          pointer-events: none;
          transition: color 0.15s;
          z-index: 1;
        }
        .field-input-wrap:focus-within .field-prompt { color: #E61919; }
        .auth-input {
          width: 100%;
          background: #111111;
          border: 1px solid #2A2A2A;
          border-radius: 0;
          padding: 13px 42px 13px 30px;
          color: #EAEAEA;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
        }
        .auth-input::placeholder { color: rgba(234, 234, 234, 0.25); }
        .auth-input:focus {
          border-color: #E61919;
          background: #141414;
          box-shadow: 0 0 0 1px rgba(230, 25, 25, 0.35), 0 0 28px rgba(230, 25, 25, 0.12);
        }
        .pass-toggle {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(234, 234, 234, 0.4);
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s;
        }
        .pass-toggle:hover { color: #EAEAEA; }

        .submit-btn {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #E61919;
          color: #0A0A0A;
          border: none;
          border-radius: 0;
          padding: 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          margin-top: 4px;
          overflow: hidden;
        }
        .submit-btn::after {
          content: "";
          position: absolute;
          top: 0;
          left: -60%;
          width: 40%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
          transform: skewX(-20deg);
          transition: left 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }
        .submit-btn:hover:not(:disabled)::after { left: 120%; }
        .submit-btn:hover:not(:disabled) { background: #FF2A2A; }
        .submit-btn:active:not(:disabled) { transform: translateY(1px); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .auth-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 11px;
          color: #FF6B6B;
          margin: 12px 0 2px;
          line-height: 1.5;
        }
        .auth-error .err-mark { color: #E61919; }

        .auth-switch {
          text-align: center;
          font-size: 11px;
          color: rgba(234, 234, 234, 0.4);
          margin-top: 24px;
        }
        .auth-switch span {
          color: #E61919;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 700;
        }
        .auth-switch span:hover { text-decoration: underline; }

        .mobile-brand { display: none; }

        @media (max-width: 860px) {
          .login-main { display: flex; flex-direction: column; overflow: auto; }
          .left-panel { display: none !important; }
          .right-panel {
            width: 100%;
            min-height: 100dvh;
            background: #0A0A0A;
            padding: 7vh 24px 40px;
            align-items: flex-start;
          }
          .mobile-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 42px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .anim, .term-line, .blink, .pulse, .scanline,
          .left-panel, .lp-ticker-track, .submit-btn::after { animation: none !important; }
          .left-panel::before { animation: none !important; }
          * { transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* ── LEFT PANEL (Hidden on Mobile) ── */}
      <div className="left-panel">
        <div className="rail"><span className="rail-red">///</span> SECURE CHANNEL — CH-01</div>
        <div className="scanline" aria-hidden="true" />

        <header className="lp-header">
          <div className="login-logo">
            <img src="/Newfavicon.svg" alt="HackHive logo" className="login-logo-sq" />
            <span className="login-logo-text">ackHive</span>
          </div>
          <span className="lp-tag">SYS-04 // Student builder network</span>
        </header>

        <div className="lp-hero">
          <p className="kicker anim" style={{ "--d": "0.05s" }}>Student builder network</p>
          <h1 className="hero-macro anim" style={{ "--d": "0.12s" }}>
            Find your<br />
            <span className="red">build crew</span>
          </h1>
          <p className="hero-copy anim" style={{ "--d": "0.2s" }}>
            Connect with skilled students, showcase your builds, and ship
            products together. No proposals, no cold intros — just the work.
          </p>

          <div className="term-window anim" style={{ "--d": "0.3s" }}>
            <div className="term-bar">
              <span className="diode red" />
              <span className="diode dim" />
              <span className="diode dim" />
              <span className="term-title">hackhive@core:~$</span>
            </div>
            <div className="term-body">
              {TERM_LINES.map((l, i) => (
                <div className="term-line" style={{ "--i": i }} key={l.p}>
                  <span className="term-p">{"> "}{l.p}</span>
                  <span className="term-dots" />
                  <span className="term-v green">{l.v}</span>
                </div>
              ))}
              <div className="term-line term-stat" style={{ "--i": 3 }}>
                <span className="term-p">
                  {"> "}signal <span className="colon">::</span> 99.4%
                </span>
              </div>
              {TERM_STATS.map((s, i) => (
                <div className="term-line term-stat" style={{ "--i": i + 4 }} key={s.p}>
                  <span className="term-p">{"> "}{s.p} <span className="colon">::</span></span>
                  <span className="term-dots" />
                  <span className="term-v">{stats[i].toLocaleString()}</span>
                </div>
              ))}
              <div className="term-cursor anim" style={{ "--d": "0.9s" }}>
                {"> "}_
                <span className="cursor-block blink">▮</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <footer className="lp-status anim" style={{ "--d": "0.55s" }}>
            <span className="lp-status-left">
              <span className="status-dot pulse" />
              Sys status: operational
            </span>
            <span>REV 2.6 /// CH-01</span>
          </footer>
          <div className="lp-ticker anim" style={{ "--d": "0.7s" }} aria-hidden="true">
            <div className="lp-ticker-track">
              {[...TICKER_WORDS, ...TICKER_WORDS].map((w, i) => (
                <span key={i}>{w} <i>+</i></span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Forms) ── */}
      <div className="right-panel">
        <div className="form-container">
          <div className="mobile-brand">
            <img src="/Newfavicon.svg" alt="HackHive logo" className="login-logo-sq" />
            <span className="login-logo-text">ackHive</span>
          </div>

          <p className="auth-kicker anim" style={{ "--d": "0.05s" }}>
            <span className="slash">{"/"}{"/"}</span> AUTH_SERVER v2.6
            <span className="dot-online pulse">● ONLINE</span>
          </p>

          <h2 className="auth-head-title anim" style={{ "--d": "0.12s" }}>
            {tab === "signin" ? "Welcome back" : "Join HackHive"}
          </h2>
          <p className="auth-head-sub anim" style={{ "--d": "0.18s" }}>
            {tab === "signin"
              ? "Sign in to discover projects and connect with builders."
              : "Create your account and start building with others."}
          </p>

          <div className="auth-seg anim" style={{ "--d": "0.25s" }}>
            <span className={`auth-seg-thumb ${tab === "register" ? "right" : ""}`} aria-hidden="true" />
            {["signin", "register"].map((t) => (
              <button
                key={t}
                className={`auth-seg-btn ${tab === t ? "active" : ""}`}
                onClick={() => {
                  setTab(t);
                  setError("");
                }}
              >
                {t === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <button className="oauth-btn anim" style={{ "--d": "0.32s" }} onClick={handleGitHub} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span style={{ flex: 1 }}>Continue with GitHub</span>
            <span className="oauth-arrow">{" >>"}</span>
          </button>

          <button className="oauth-btn anim" style={{ "--d": "0.38s" }} onClick={handleGoogle} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span style={{ flex: 1 }}>Continue with Google</span>
            <span className="oauth-arrow">{" >>"}</span>
          </button>

          <div className="divider anim" style={{ "--d": "0.44s" }}>
            <div className="divider-line" />
            <span className="divider-text">or email</span>
            <div className="divider-line" />
          </div>

          <form onSubmit={handleEmailAuth}>
            <div className="form-field anim" style={{ "--d": "0.5s" }}>
              <label className="form-label" htmlFor="login-email">Email address</label>
              <div className="field-input-wrap">
                <span className="field-prompt">{" >"}</span>
                <input
                  id="login-email"
                  className="auth-input"
                  type="email"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field anim" style={{ "--d": "0.56s" }}>
              <label className="form-label" htmlFor="login-pass">Password</label>
              <div className="field-input-wrap">
                <span className="field-prompt">{" >"}</span>
                <input
                  id="login-pass"
                  className="auth-input"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="auth-error anim" style={{ "--d": "0.6s" }} role="alert">
                <span className="err-mark">!!</span>
                {error}
              </p>
            )}

            <button className="submit-btn anim" style={{ "--d": "0.62s" }} type="submit" disabled={loading}>
              {loading ? (
                <>
                  Authenticating<span className="blink">_</span>
                </>
              ) : (
                <>
                  {tab === "signin" ? "Sign in" : "Create account"}
                  <span>{">>>"}</span>
                </>
              )}
            </button>
          </form>

          <p className="auth-switch anim" style={{ "--d": "0.7s" }}>
            {tab === "signin"
              ? "Don't have an account? "
              : "Already have an account? "}
            <span
              onClick={() => {
                setTab(tab === "signin" ? "register" : "signin");
                setError("");
              }}
            >
              {tab === "signin" ? "Join HackHive" : "Sign in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}