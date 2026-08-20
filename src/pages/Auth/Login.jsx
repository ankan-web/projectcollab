import { useState } from "react";

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

// ============================================================================
// MOCK BLOCK: For preview environment only. Remove in production!
// ============================================================================
// const useNavigate = () => (path) => console.log("Navigating to:", path);
// const auth = {};
// const githubProvider = {};
// const googleProvider = {};
// const db = {};
// const signInWithPopup = async () => new Promise((res) => setTimeout(res, 800));
// const signInWithEmailAndPassword = async () => new Promise((res) => setTimeout(() => res({ user: { uid: "123" } }), 800));
// const createUserWithEmailAndPassword = async () => new Promise((res) => setTimeout(() => res({ user: { uid: "123" } }), 800));
// const doc = () => ({});
// const getDoc = async () => new Promise((res) => setTimeout(() => res({ data: () => ({ isAdmin: false }) }), 400));
// ============================================================================

export default function App() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser, setProfile } = useAuthStore();

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
    <div className="main-container">
      {/* Google Font import & Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .main-container {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #09090b;
          font-family: 'DM Sans', sans-serif;
        }

        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 14px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.2); }
        .auth-input:focus { border-color: rgba(99,255,180,0.5); background: rgba(255,255,255,0.06); }
        
        .oauth-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 16px;
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          margin-bottom: 10px;
          text-align: left;
        }
        .oauth-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
        .oauth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .submit-btn {
          width: 100%;
          background: #63ffb4;
          color: #09090b;
          border: none;
          border-radius: 10px;
          padding: 13px;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: opacity 0.15s, transform 0.1s;
          margin-top: 4px;
        }
        .submit-btn:hover { opacity: 0.88; }
        .submit-btn:active { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,255,180,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,255,180,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .left-panel {
          position: relative;
          background: #0a0f0d;
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-right: 0.5px solid rgba(255,255,255,0.06);
          overflow: hidden;
        }

        .right-panel {
          background: #111113;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }

        .form-container {
          width: 100%;
          max-width: 400px;
        }

        .mobile-brand {
          display: none;
        }

        /* Responsive Breakpoint */
        @media (max-width: 768px) {
          .main-container {
            display: flex;
            flex-direction: column;
            /* Premium dark gradient background for mobile */
            background: background:
radial-gradient(circle at 20% 10%, rgba(99,255,180,0.08), transparent 25%),
radial-gradient(circle at 80% 20%, rgba(120,119,198,0.08), transparent 25%),
radial-gradient(circle at 50% 100%, rgba(0,140,255,0.06), transparent 30%),
linear-gradient(180deg, #050507 0%, #08080a 50%, #000000 100%);
          }
          .left-panel { display: none !important; }
          
          .right-panel {
            width: 100%;
            min-height: 100vh;
            background: transparent !important; /* Lets the gradient shine through */
            padding: 32px 24px !important;
            align-items: flex-start !important;
            padding-top: 10vh !important;
          }

          .mobile-brand {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 40px;
          }
        }
      `}</style>

      {/* ── LEFT PANEL (Hidden on Mobile) ── */}
      <div className="left-panel">
        <div className="grid-bg" />

        {/* Glow blob */}
        <div
          style={{
            position: "absolute",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,255,180,0.1) 0%, transparent 70%)",
            bottom: -80,
            left: -60,
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#63ffb4",
              boxShadow: "0 0 14px #63ffb4",
            }}
          />
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 20,
              color: "#fff",
              letterSpacing: "-0.3px",
            }}
          >
            HackHive
          </span>
        </div>

        {/* Hero */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 500,
              color: "#63ffb4",
              background: "rgba(99,255,180,0.08)",
              border: "0.5px solid rgba(99,255,180,0.25)",
              padding: "4px 12px",
              borderRadius: 20,
              marginBottom: 20,
              letterSpacing: "0.06em",
            }}
          >
            BETA — STUDENT BUILDERS
          </div>

          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 42,
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.08,
              letterSpacing: "-1.5px",
              marginBottom: 18,
            }}
          >
            Find your
            <br />
            <span style={{ color: "#63ffb4" }}>build crew.</span>
          </h1>

          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.75,
              maxWidth: 300,
            }}
          >
            Connect with skilled students, showcase your projects, and turn ideas
            into shipped products — together.
          </p>
        </div>

        {/* Stats */}
        <div
          style={{ display: "flex", gap: 32, position: "relative", zIndex: 1 }}
        >
          {[
            ["2.4k", "Student builders"],
            ["840", "Open projects"],
            ["120+", "Colleges"],
          ].map(([num, label]) => (
            <div key={label}>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {num}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.3)",
                  marginTop: 3,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL (Forms) ── */}
      <div className="right-panel">
        <div className="form-container">
          
          {/* Mobile Only Brand Element */}
          <div className="mobile-brand">
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: "#63ffb4",
                boxShadow: "0 0 14px #63ffb4",
              }}
            />
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: "#fff",
                letterSpacing: "-0.3px",
              }}
            >
              HackHive
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 26,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.5px",
              marginBottom: 6,
            }}
          >
            {tab === "signin" ? "Welcome back" : "Join HackHive"}
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            {tab === "signin"
              ? "Sign in to discover projects and connect with builders."
              : "Create your account and start building with others."}
          </p>

          {/* Tab toggle */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.04)",
              border: "0.5px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              padding: 3,
              marginBottom: 28,
            }}
          >
            {["signin", "register"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s",
                  background:
                    tab === t ? "rgba(255,255,255,0.09)" : "transparent",
                  color: tab === t ? "#fff" : "rgba(255,255,255,0.35)",
                }}
              >
                {t === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {/* OAuth */}
          <button className="oauth-btn" onClick={handleGitHub} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span style={{ flex: 1 }}>Continue with GitHub</span>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 16 }}>
              →
            </span>
          </button>

          <button className="oauth-btn" onClick={handleGoogle} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span style={{ flex: 1 }}>Continue with Google</span>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 16 }}>
              →
            </span>
          </button>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "20px 0",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "0.5px",
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
              or email
            </span>
            <div
              style={{
                flex: 1,
                height: "0.5px",
                background: "rgba(255,255,255,0.08)",
              }}
            />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth}>
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 6,
                  letterSpacing: "0.02em",
                }}
              >
                Email address
              </label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: 6 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 6,
                  letterSpacing: "0.02em",
                }}
              >
                Password
              </label>
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Error */}
            {error && (
              <p
                style={{
                  fontSize: 12,
                  color: "#ff6b6b",
                  marginTop: 8,
                  marginBottom: 4,
                  lineHeight: 1.5,
                }}
              >
                {error}
              </p>
            )}

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : tab === "signin"
                ? "Sign in →"
                : "Create account →"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "rgba(255,255,255,0.3)",
              marginTop: 20,
            }}
          >
            {tab === "signin"
              ? "Don't have an account? "
              : "Already have an account? "}
            <span
              onClick={() => {
                setTab(tab === "signin" ? "register" : "signin");
                setError("");
              }}
              style={{
                color: "rgba(99,255,180,0.8)",
                cursor: "pointer",
                transition: "color 0.15s",
              }}
              onMouseOver={(e) => (e.target.style.color = "#63ffb4")}
              onMouseOut={(e) => (e.target.style.color = "rgba(99,255,180,0.8)")}
            >
              {tab === "signin" ? "Join HackHive" : "Sign in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
