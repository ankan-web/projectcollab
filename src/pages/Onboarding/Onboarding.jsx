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
    <div style={{
      minHeight: "100vh",
      background: "#09090b",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .ob-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 14px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
          resize: none;
        }
        .ob-input::placeholder { color: rgba(255,255,255,0.2); }
        .ob-input:focus { border-color: rgba(99,255,180,0.5); }
        .domain-pill {
          padding: 7px 16px;
          border-radius: 20px;
          border: 0.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .domain-pill:hover { border-color: rgba(255,255,255,0.25); color: rgba(255,255,255,0.8); }
        .domain-pill.selected {
          background: rgba(99,255,180,0.1);
          border-color: rgba(99,255,180,0.4);
          color: #63ffb4;
        }
        .next-btn {
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
          transition: opacity 0.15s;
        }
        .next-btn:hover { opacity: 0.88; }
        .next-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .skip-btn {
          width: 100%;
          background: transparent;
          color: rgba(255,255,255,0.3);
          border: none;
          padding: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: color 0.15s;
          margin-top: 6px;
        }
        .skip-btn:hover { color: rgba(255,255,255,0.6); }
        .ob-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          margin-bottom: 7px;
          letter-spacing: 0.03em;
        }
        .locked-college {
          width: 100%;
          background: rgba(99,255,180,0.07);
          border: 0.5px solid rgba(99,255,180,0.22);
          border-radius: 10px;
          padding: 12px 14px;
          color: #63ffb4;
          font-size: 14px;
          font-weight: 500;
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40, justifyContent: "center" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#63ffb4", boxShadow: "0 0 12px #63ffb4" }} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-0.3px" }}>
            HackHive
          </span>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 6, marginBottom: 36, alignItems: "center", justifyContent: "center" }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                opacity: i > step ? 0.3 : 1,
                transition: "opacity 0.3s",
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: i < step ? "#63ffb4" : i === step ? "rgba(99,255,180,0.15)" : "rgba(255,255,255,0.06)",
                  border: i === step ? "1.5px solid #63ffb4" : "0.5px solid rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 500,
                  color: i < step ? "#09090b" : i === step ? "#63ffb4" : "rgba(255,255,255,0.4)",
                  transition: "all 0.3s",
                }}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 12, color: i === step ? "#fff" : "rgba(255,255,255,0.35)", fontWeight: i === step ? 500 : 400 }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 28, height: 0.5, background: "rgba(255,255,255,0.1)", margin: "0 2px" }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: "#111113",
          border: "0.5px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "36px 36px 32px",
        }}>

          {/* ── STEP 0: Profile ── */}
          {step === 0 && (
            <div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 6 }}>
                Set up your profile
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 28, lineHeight: 1.6 }}>
                This is how other builders will find and know you.
              </p>

              <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
                {/* Avatar preview */}
                <div style={{
                  width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(99,255,180,0.1)",
                  border: "0.5px solid rgba(99,255,180,0.2)",
                  overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {user?.photoURL
                    ? <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 22, color: "#63ffb4" }}>{form.displayName?.[0]?.toUpperCase() || "?"}</span>
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
                <label className="ob-label">Bio * <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>(what you build, what you're into)</span></label>
                <textarea
                  className="ob-input"
                  rows={3}
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder="e.g. I build full-stack web apps and love shipping products fast. Currently into AI tooling and open source..."
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

          {/* ── STEP 1: Skills ── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 6 }}>
                What's your stack?
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 28, lineHeight: 1.6 }}>
                Add the skills you're confident in. Others will find you through these.
              </p>

              <SkillInput value={form.skills} onChange={(s) => set("skills", s)} max={12} />

              {form.skills.length >= 1 && (
                <div style={{
                  marginTop: 24,
                  padding: "14px 16px",
                  background: "rgba(99,255,180,0.05)",
                  border: "0.5px solid rgba(99,255,180,0.15)",
                  borderRadius: 10,
                }}>
                  <p style={{ fontSize: 12, color: "rgba(99,255,180,0.7)", lineHeight: 1.6 }}>
                    You've added {form.skills.length} skill{form.skills.length > 1 ? "s" : ""}. 
                    Projects looking for <strong style={{ color: "#63ffb4" }}>{form.skills[0]}</strong> will show up in your discovery feed.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Links ── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 6 }}>
                Your links
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 28, lineHeight: 1.6 }}>
                Optional — but a GitHub profile goes a long way.
              </p>

              <div style={{ marginBottom: 18 }}>
                <label className="ob-label">GitHub username</label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                    fontSize: 13, color: "rgba(255,255,255,0.3)",
                  }}>github.com/</span>
                  <input
                    className="ob-input"
                    style={{ paddingLeft: 102 }}
                    value={form.githubUsername}
                    onChange={(e) => set("githubUsername", e.target.value)}
                    placeholder="yourusername"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="ob-label">LinkedIn URL</label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                    fontSize: 13, color: "rgba(255,255,255,0.3)",
                  }}>linkedin.com/in/</span>
                  <input
                    className="ob-input"
                    style={{ paddingLeft: 122 }}
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

              {error && (
                <p style={{ fontSize: 12, color: "#ff6b6b", marginTop: 16, lineHeight: 1.5 }}>{error}</p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div style={{ marginTop: 32 }}>
            {step < STEPS.length - 1 ? (
              <>
                <button className="next-btn" onClick={handleNext} disabled={!canNext()}>
                  Continue →
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
                  {saving ? "Setting up your profile..." : "Let's go →"}
                </button>
                <button className="skip-btn" onClick={handleFinish} disabled={saving}>
                  Skip links for now
                </button>
              </>
            )}

            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  width: "100%", background: "transparent", border: "none",
                  color: "rgba(255,255,255,0.25)", fontSize: 12, cursor: "pointer",
                  marginTop: 8, padding: "8px", fontFamily: "'DM Sans', sans-serif",
                  transition: "color 0.15s",
                }}
              >
                ← Back
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 20, lineHeight: 1.6 }}>
          You can always edit your profile later from settings.
        </p>
      </div>
    </div>
  );
}
