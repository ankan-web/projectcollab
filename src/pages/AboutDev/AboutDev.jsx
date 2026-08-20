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
          <span className="aboutdev-row-label">Email</span>
          <span className="aboutdev-row-value">{DEV.email}</span>
          <span className={`aboutdev-row-cmd ${copied ? "done" : ""}`}>{copied ? "COPIED_ ✓" : "[ COPY ]"}</span>
        </button>

        {ROWS.map((r) => (
          <a key={r.key} className="aboutdev-row" href={r.href} target="_blank" rel="noreferrer">
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