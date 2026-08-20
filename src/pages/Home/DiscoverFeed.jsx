import { useState, useEffect, useMemo } from "react";
import { subscribeToProjects } from "../../services/projectService";
import { useAuthStore } from "../../store/authStore";
import FilterBar from "./FilterBar";
import ProjectCard from "../Projects/ProjectCard";

export default function DiscoverFeed() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState("");
  const [search, setSearch] = useState("");
  const [collabOnly, setCollabOnly] = useState(false);

  const handleProjectDelete = (projectId) => {
    setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectId));
  };

  useEffect(() => {
    const unsubscribe = subscribeToProjects(
      (data) => {
        setProjects(data);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to subscribe to projects:", error);
        setProjects([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (collabOnly && !p.openToCollab) return false;
      if (domain && p.domain !== domain) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = p.title?.toLowerCase().includes(q);
        const matchStack = p.techStack?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchStack) return false;
      }
      return true;
    });
  }, [projects, domain, search, collabOnly]);

  return (
    <div className="discover-feed">
      <style>{`
        .discover-feed { padding: 0 0 24px; }
        .bento-grid {
          display: grid;
          grid-auto-flow: dense;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1px;
          background: #1A1A1A;
          border: 1px solid #1A1A1A;
        }
        .bento-grid .bento-item:first-child {
          grid-column: 1 / -1;
        }
        .bento-item {
          min-width: 0;
          background: #0A0A0A;
        }
        .feed-state {
          text-align: center;
          padding: 72px 24px;
          color: rgba(234,234,234,0.45);
          border: 1px solid #1A1A1A;
          background: #0E0E0E;
          font-size: 13px;
          font-family: 'JetBrains Mono', monospace;
        }
        .skeleton-card {
          border: 1px solid #1A1A1A;
          background: #0E0E0E;
          min-height: 180px;
        }
        .skeleton-card.wide { min-height: 260px; }
        .skeleton-card::after {
          content: "LOADING...";
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(234,234,234,0.2);
          animation: hblink 1.4s steps(2) infinite;
        }
        @keyframes hblink { 0%, 50% { opacity: 1; } 100% { opacity: 0.25; } }
        @media (max-width: 768px) {
          .bento-grid { grid-template-columns: 1fr; }
          .bento-grid .bento-item:first-child { grid-column: auto; }
        }
      `}</style>

      <FilterBar
        domain={domain}
        setDomain={setDomain}
        search={search}
        setSearch={setSearch}
        collabOnly={collabOnly}
        setCollabOnly={setCollabOnly}
      />

      {loading ? (
        <div className="bento-grid" aria-hidden="true">
          <div className="skeleton-card wide" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="feed-state">
          {projects.length === 0
            ? "NO PROJECTS YET. BE THE FIRST TO CREATE ONE."
            : "NO PROJECTS MATCH YOUR FILTERS."}
        </div>
      ) : (
        <div className="bento-grid">
          {filteredProjects.map((project, i) => (
            <div key={project.id} className="bento-item">
              <ProjectCard
                project={project}
                showOwner
                featured={i === 0}
                currentUserId={user?.uid}
                onDelete={handleProjectDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}