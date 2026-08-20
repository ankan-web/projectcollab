import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUserDoc } from "../../services/userService";
import { useAuthStore } from "../../store/authStore";
import SkillInput from "../../components/ui/SkillInput";

const STEPS = ["Profile", "Skills", "Links"];
const DEFAULT_COLLEGE = "Adamas University";

const DOMAINS = [
  "Web Development", "Mobile Apps", "Machine Learning / AI",
  "Data Science", "DevOps / Cloud", "Blockchain / Web3",
  "Game Development", "Cybersecurity", "Open Source", "Other",
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setProfile } = useAuthStore();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    displayName: user?.displayName || "",
    college: DEFAULT_COLLEGE,
    bio: "",
    domain: "",
    skills: [],
    githubUsername: "",
    linkedIn: "",
    portfolio: "",
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const canNext = () => {
    if (step === 0) return form.displayName.trim() && form.bio.trim();
    if (step === 1) return form.skills.length >= 1;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleFinish = async () => {
    setSaving(true);
    setError("");
    try {
      const data = { ...form, college: DEFAULT_COLLEGE, onboarded: true };
      await updateUserDoc(user.uid, data);
      setProfile({ ...data, uid: user.uid });
      navigate("/home");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ob-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .ob-page {
          min-height: 100dvh;
          background: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          font-family: 'JetBrains Mono', monospace;
          color: #EAEAEA;
        }
        .ob-wrap { width: 100%; max-width: 560px; }
        .ob-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 44px;
        }
        .ob-logo-sq { width: 10px; height: 10px; background: #E61919; }
        .ob-logo-text {
          font-family: 'Archivo Black', sans-serif;
          font-size: 16px;
          color: #EAEAEA;
          letter-spacing: -0.01em;
        }

        .ob-steps {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          align-items: center;
          justify-content: center;
        }
        .ob-step {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ob-step-box {
          min-width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #2A2A2A;
          background: #131313;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          color: rgba(234,234,234,0.4);
        }
        .ob-step-box.done { background: #E61919; border-color: #E61919; color: #0A0A0A; }
        .ob-step-box.current { border-color: #E61919; color: #E61919; }
        .ob-step-label {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(234,234,234,0.35);
        }
        .ob-step-label.on { color: #EAEAEA; }
        .ob-step-line { width: 26px; height: 1px; background: #2A2A2A; }

        .ob-card {
          background: #131313;
          border: 1px solid #1A1A1A;
          padding: 32px;
        }
        .ob-title {
          font-family: 'Archivo Black', sans-serif;
          font-size: 22px;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: #EAEAEA;
          margin: 0 0 8px;
        }
        .ob-sub {
          font-size: 11px;
          color: rgba(234,234,234,0.5);
          margin: 0 0 26px;
          line-height: 1.7;
        }
        .ob-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(234,234,234,0.5);
          margin-bottom: 7px;
        }
        .ob-input {
          width: 100%;
          background: #111111;
          border: 1px solid #2A2A2A;
          border-radius: 0;
          padding: 12px 14px;
          color: #EAEAEA;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s;
          resize: none;
        }
        .ob-input::placeholder { color: rgba(234,234,234,0.25); }
        .ob-input:focus { border-color: #E61919; background: #141414; }
        .ob-avatar-row { display: flex; gap: 14px; margin-bottom: 18px; }
        .ob-avatar {
          width: 64px;
          height: 64px;
          flex-shrink: 0;
          background: #111111;
          border: 1px solid #2A2A2A;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 22px;
          font-weight: 700;
          color: #E61919;
        }
        .ob-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .locked-college {
          width: 100%;
          background: rgba(230,25,25,0.06);
          border: 1px solid rgba(230,25,25,0.4);
          border-radius: 0;
          padding: 12px 14px;
          color: #E61919;
          font-size: 13px;
          font-weight: 500;
        }
        .domain-pill {
          padding: 8px 14px;
          border-radius: 0;
          border: 1px solid #2A2A2A;
          background: #111111;
          color: rgba(234,234,234,0.5);
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          cursor: pointer;
          transition: all 0.12s;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .domain-pill:hover { border-color: rgba(234,234,234,0.4); color: #EAEAEA; }
        .domain-pill.selected {
          background: rgba(230,25,25,0.12);
          border-color: #E61919;
          color: #E61919;
        }
        .skills-note {
          margin-top: 24px;
          padding: 14px 16px;
          background: rgba(230,25,25,0.06);
          border: 1px solid rgba(230,25,25,0.35);
          border-radius: 0;
          font-size: 11px;
          color: rgba(234,234,234,0.6);
          line-height: 1.7;
        }
        .skills-note strong { color: #E61919; }
        .next-btn {
          width: 100%;
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
          transition: background 0.15s;
        }
        .next-btn:hover:not(:disabled) { background: #FF2A2A; }
        .next-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .skip-btn {
          width: 100%;
          background: transparent;
          color: rgba(234,234,234,0.35);
          border: none;
          padding: 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.15s;
          margin-top: 6px;
        }
        .skip-btn:hover { color: rgba(234,234,234,0.7); }
        .back-btn {
          width: 100%;
          background: transparent;
          border: 1px solid transparent;
          color: rgba(234,234,234,0.35);
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          margin-top: 10px;
          padding: 8px;
          font-family: 'JetBrains Mono', monospace;
          transition: color 0.15s, border-color 0.15s;
        }
        .back-btn:hover { color: #EAEAEA; border-color: #2A2A2A; }
        .prefix-wrap { position: relative; }
        .prefix {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: rgba(234,234,234,0.35);
        }
        .ob-foot {
          text-align: center;
          font-size: 10px;
          color: rgba(234,234,234,0.3);
          margin-top: 20px;
          line-height: 1.6;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .ob-error {
          font-size: 11px;
          color: #FF6B6B;
          margin-top: 16px;
          line-height: 1.5;
        }
      `}</style>

      <div className="ob-wrap">
        <div className="ob-logo">
          <div className="ob-logo-sq" />
          <span className="ob-logo-text">HackHive</span>
        </div>

        <div className="ob-steps">
          {STEPS.map((s, i) => (
            <div key={s} className="ob-step">
              <div
                className={`ob-step-box ${i < step ? "done" : i === step ? "current" : ""}`}
              >
                {i < step ? "OK" : i + 1}
              </div>
              <span className={`ob-step-label ${i === step ? "on" : ""}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="ob-step-line" />}
            </div>
          ))}
        </div>

        <div className="ob-card">
          <p style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(234,234,234,0.3)", margin: "0 0 14px" }}>
            [ SETUP / STEP-{step + 1} / {STEPS.length} ]
          </p>

          {step === 0 && (
            <div>
              <h2 className="ob-title">Set up your profile</h2>
              <p className="ob-sub">This is how other builders will find and know you.</p>

              <div className="ob-avatar-row">
                <div className="ob-avatar">
                  {user?.photoURL
                    ? <img src={user.photoURL} alt="" />
                    : form.displayName?.[0]?.toUpperCase() || "?"
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <label className="ob-label">Display name *</label>
                  <input
                    className="ob-input"
                    value={form.displayName}
                    onChange={(e) => set("displayName", e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="ob-label">College / University *</label>
                <div className="locked-college">{DEFAULT_COLLEGE}</div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="ob-label">Bio *</label>
                <textarea
                  className="ob-input"
                  rows={3}
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder="What you build and what you're into..."
                />
              </div>

              <div>
                <label className="ob-label">Primary domain</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {DOMAINS.map((d) => (
                    <button
                      key={d}
                      className={`domain-pill ${form.domain === d ? "selected" : ""}`}
                      onClick={() => set("domain", form.domain === d ? "" : d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="ob-title">What's your stack?</h2>
              <p className="ob-sub">Add the skills you're confident in. Others will find you through these.</p>

              <SkillInput value={form.skills} onChange={(s) => set("skills", s)} max={12} />

              {form.skills.length >= 1 && (
                <div className="skills-note">
                  You've added <strong>{form.skills.length}</strong> skill{form.skills.length > 1 ? "s" : ""}.
                  Projects looking for <strong>{form.skills[0]}</strong> will show up in your discovery feed.
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="ob-title">Your links</h2>
              <p className="ob-sub">Optional — but a GitHub profile goes a long way.</p>

              <div style={{ marginBottom: 18 }}>
                <label className="ob-label">GitHub username</label>
                <div className="prefix-wrap">
                  <span className="prefix">github.com/</span>
                  <input
                    className="ob-input"
                    style={{ paddingLeft: 104 }}
                    value={form.githubUsername}
                    onChange={(e) => set("githubUsername", e.target.value)}
                    placeholder="yourusername"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="ob-label">LinkedIn URL</label>
                <div className="prefix-wrap">
                  <span className="prefix">linkedin.com/in/</span>
                  <input
                    className="ob-input"
                    style={{ paddingLeft: 128 }}
                    value={form.linkedIn}
                    onChange={(e) => set("linkedIn", e.target.value)}
                    placeholder="yourprofile"
                  />
                </div>
              </div>

              <div>
                <label className="ob-label">Portfolio / personal site</label>
                <input
                  className="ob-input"
                  value={form.portfolio}
                  onChange={(e) => set("portfolio", e.target.value)}
                  placeholder="https://yoursite.com"
                />
              </div>

              {error && <p className="ob-error">{error}</p>}
            </div>
          )}

          <div style={{ marginTop: 32 }}>
            {step < STEPS.length - 1 ? (
              <>
                <button className="next-btn" onClick={handleNext} disabled={!canNext()}>
                  {"Continue >>>"}
                </button>
                {step === 2 && (
                  <button className="skip-btn" onClick={handleFinish}>
                    Skip for now
                  </button>
                )}
              </>
            ) : (
              <>
                <button className="next-btn" onClick={handleFinish} disabled={saving}>
                  {saving ? "Setting up..." : "Let's go >>>"}
                </button>
                <button className="skip-btn" onClick={handleFinish} disabled={saving}>
                  Skip links for now
                </button>
              </>
            )}

            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="back-btn"
              >
                {"<< Back"}
              </button>
            )}
          </div>
        </div>

        <p className="ob-foot">
          You can always edit your profile later from settings.
        </p>
      </div>
    </div>
  );
}