import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { isRepoStarred, setRepoStarred, connectGithub, isConnected, getRepoUrl } from "../../services/githubService";

const DONE_KEY = "hackhive_star_banner_done";

export default function StarBanner() {
  const { user } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user?.uid || user.isAdmin) return;
    if (sessionStorage.getItem(DONE_KEY)) return;

    let cancelled = false;
    isRepoStarred()
      .then((starred) => {
        if (cancelled) return;
        if (starred) {
          sessionStorage.setItem(DONE_KEY, "1");
          return;
        }
        setVisible(true);
        sessionStorage.setItem(DONE_KEY, "1");
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [user?.uid, user?.isAdmin]);

  const dismiss = () => {
    sessionStorage.setItem(DONE_KEY, "1");
    setVisible(false);
  };

  const handleStar = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!isConnected()) {
        await connectGithub();
        toast.success("GitHub connected! Starring now...");
      }
      await setRepoStarred(true);
      toast.success("Star added! Thanks for the support.");
      dismiss();
    } catch (e) {
      toast.error(e.message || "Could not star the repo.");
    } finally {
      setBusy(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="star-banner" role="dialog" aria-label="Star HackHive on GitHub">
      <style>{`
        .star-banner {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 90;
          width: min(340px, calc(100vw - 32px));
          background: #0E0E0E;
          border: 1px solid #2A2A2A;
          font-family: 'JetBrains Mono', monospace;
          color: #EAEAEA;
          box-shadow: 0 24px 60px -20px rgba(0, 0, 0, 0.85);
          animation: starBannerIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .star-banner::before,
        .star-banner::after {
          content: "";
          position: absolute;
          width: 14px;
          height: 14px;
          border-color: rgba(230, 25, 25, 0.8);
          border-style: solid;
          pointer-events: none;
        }
        .star-banner::before { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
        .star-banner::after { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }
        @keyframes starBannerIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .sb-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid #1A1A1A;
          background: #111111;
        }
        .sb-kicker {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(234, 234, 234, 0.5);
        }
        .sb-kicker .red { color: #E61919; }
        .sb-close {
          background: none;
          border: none;
          color: rgba(234, 234, 234, 0.4);
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          padding: 2px;
          transition: color 0.15s;
        }
        .sb-close:hover { color: #E61919; }

        .sb-body { padding: 16px; }
        .sb-title {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: 15px;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          color: #EAEAEA;
          margin: 0 0 8px;
        }
        .sb-desc {
          font-size: 11px;
          line-height: 1.7;
          color: rgba(234, 234, 234, 0.55);
          margin: 0 0 4px;
        }
        .sb-repo {
          display: inline-block;
          font-size: 10px;
          letter-spacing: 0.06em;
          color: #E61919;
          margin-bottom: 14px;
          text-decoration: none;
        }
        .sb-repo:hover { text-decoration: underline; }
        .sb-actions { display: flex; gap: 8px; }
        .sb-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px;
          border: none;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .sb-btn.star { background: #E61919; color: #0A0A0A; }
        .sb-btn.star:hover:not(:disabled) { background: #FF2A2A; }
        .sb-btn.star:disabled { opacity: 0.5; cursor: not-allowed; }
        .sb-btn.later {
          background: transparent;
          border: 1px solid #2A2A2A;
          color: rgba(234, 234, 234, 0.6);
        }
        .sb-btn.later:hover { border-color: rgba(230, 25, 25, 0.5); color: #E61919; }

        @media (max-width: 600px) {
          .star-banner { right: 16px; bottom: 16px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .star-banner { animation: none !important; }
        }
      `}</style>

      <div className="sb-head">
        <span className="sb-kicker"><span className="red">//</span> SUPPORT THE BUILD</span>
        <button className="sb-close" onClick={dismiss} aria-label="Dismiss">✕</button>
      </div>

      <div className="sb-body">
        <h3 className="sb-title">Enjoying HackHive?</h3>
        <p className="sb-desc">
          Star the repo on GitHub — it takes one second and keeps the build going.
        </p>
        <a href={getRepoUrl()} target="_blank" rel="noreferrer" className="sb-repo">
          github.com/ankan-web/projectcollab
        </a>
        <div className="sb-actions">
          <button className="sb-btn star" onClick={handleStar} disabled={busy}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <path d="M12 2l2.9 6.26 6.6.72-4.9 4.52 1.33 6.5L12 16.76l-5.93 3.24 1.33-6.5L2.5 8.98l6.6-.72L12 2z" />
            </svg>
            {busy ? "Starring..." : "Star"}
          </button>
          <button className="sb-btn later" onClick={dismiss}>Later</button>
        </div>
      </div>
    </div>
  );
}