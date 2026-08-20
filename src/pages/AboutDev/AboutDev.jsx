import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import "./AboutDev.css";

const DEV = {
  name: "Ankan Mondal",
  role: "Web Dev",
  email: "ankanmondal9280@gmail.com",
  github: "ankan-web",
  insta: "sudo.ankan",
  linkedin: "https://www.linkedin.com/in/ankan-mondal-a05212417?utm_source=share_via&utm_content=profile&utm_medium=member_android",
};

const ROWS = [
  { key: "github", label: "GitHub", value: `github.com/${DEV.github}`, href: `https://github.com/${DEV.github}` },
  { key: "insta", label: "Instagram", value: `@${DEV.insta}`, href: `https://instagram.com/${DEV.insta}` },
  { key: "linkedin", label: "LinkedIn", value: "in/ankan-mondal", href: DEV.linkedin },
];

const ICONS = {
  email: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  github: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
  insta: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  ),
  linkedin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
};

export default function AboutDev() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(DEV.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="aboutdev">
      <section className="aboutdev-hero">
        <div className="aboutdev-rail">
          <span className="aboutdev-kicker">// ABOUT THE DEV</span>
          <span className="aboutdev-rail-line" />
          <span className="aboutdev-rail-tag">AN IDENTITY CARD</span>
        </div>

        <div className="aboutdev-hero-body">
          <h1 className="aboutdev-name">{DEV.name}</h1>
          <p className="aboutdev-role">{DEV.role}</p>
        </div>
      </section>

      <section className="aboutdev-list">
        <button className="aboutdev-row" onClick={copyEmail}>
          <span className="aboutdev-row-icon">{ICONS.email}</span>
          <span className="aboutdev-row-label">Email</span>
          <span className="aboutdev-row-value">{DEV.email}</span>
          <span className={`aboutdev-row-cmd ${copied ? "done" : ""}`}>{copied ? "COPIED_ ✓" : "[ COPY ]"}</span>
        </button>

        {ROWS.map((r) => (
          <a key={r.key} className="aboutdev-row" href={r.href} target="_blank" rel="noreferrer">
            <span className="aboutdev-row-icon">{ICONS[r.key]}</span>
            <span className="aboutdev-row-label">{r.label}</span>
            <span className="aboutdev-row-value">{r.value}</span>
            <span className="aboutdev-row-cmd">{">>"}</span>
          </a>
        ))}
      </section>

      <footer className="aboutdev-foot">
        <span>// {DEV.name}</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
      </main>
    </>
  );
}