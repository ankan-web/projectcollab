import { useState } from "react";
import Navbar from "../../components/layout/Navbar";
import DiscoverFeed from "./DiscoverFeed";
import PeopleSearch from "./PeopleSearch";

export default function Home() {
  const [activeTab, setActiveTab] = useState("projects");

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        .home-shell {
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          padding: 24px 16px 64px;
        }
        .home-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(20px, 5vw, 24px);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          margin: 0 0 20px;
        }
        .tab-row {
          display: flex;
          gap: 8px;
          border-bottom: 0.5px solid rgba(255,255,255,0.08);
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .tab-btn {
          padding: 10px 20px;
          border-radius: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
          background: transparent;
          color: rgba(255,255,255,0.4);
        }
        .tab-btn:hover {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.6);
        }
        .tab-btn.active {
          background: rgba(99,255,180,0.1);
          color: #63ffb4;
        }
      `}</style>

      <Navbar />

      <main className="home-shell">
        {/* toast.success("Welcome to ProjectCollab! Explore projects and connect with collaborators."); */}
        <h1 className="home-title">Discover</h1>

        <div className="tab-row">
          <button
            className={`tab-btn ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            Projects
          </button>
          <button
            className={`tab-btn ${activeTab === "people" ? "active" : ""}`}
            onClick={() => setActiveTab("people")}
          >
            People
          </button>
        </div>

        {activeTab === "projects" ? <DiscoverFeed /> : <PeopleSearch />}
      </main>
    </div>
  );
}