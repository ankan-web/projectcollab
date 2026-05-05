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
      <FilterBar
        domain={domain}
        setDomain={setDomain}
        search={search}
        setSearch={setSearch}
        collabOnly={collabOnly}
        setCollabOnly={setCollabOnly}
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.4)" }}>
          Loading projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: 48, 
          color: "rgba(255,255,255,0.4)",
          background: "rgba(255,255,255,0.02)",
          borderRadius: 16,
          border: "0.5px solid rgba(255,255,255,0.06)",
        }}>
          {projects.length === 0 
            ? "No projects yet. Be the first to create one!" 
            : "No projects match your filters."}
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 16,
        }}>
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              showOwner
              currentUserId={user?.uid}
              onDelete={handleProjectDelete}
            />
          ))}
        </div>
      )}

      <style>{`
        .discover-feed {
          padding: 24px 0;
        }
      `}</style>
    </div>
  );
}
