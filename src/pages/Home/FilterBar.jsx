const DOMAINS = [
  "All",
  "Web Development",
  "Mobile Apps",
  "Machine Learning / AI",
  "Data Science",
  "DevOps / Cloud",
  "Blockchain / Web3",
  "Game Development",
  "Cybersecurity",
  "Open Source",
];

export default function FilterBar({ 
  domain, setDomain, 
  search, setSearch, 
  collabOnly, setCollabOnly 
}) {
  return (
    <div className="filterbar">
      <style>{`
        .filterbar {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 24px;
        }
        .domain-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .domain-pill {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          border: 0.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.45);
          cursor: pointer;
          transition: all 0.15s;
        }
        .domain-pill:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.6);
        }
        .domain-pill.selected {
          background: rgba(99,255,180,0.1);
          border-color: rgba(99,255,180,0.35);
          color: #63ffb4;
        }
        .filter-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .search-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 10px 14px;
          color: #fff;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s;
        }
        .search-input:focus {
          border-color: rgba(99,255,180,0.45);
        }
        .search-input::placeholder {
          color: rgba(255,255,255,0.22);
        }
        .collab-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px 14px;
          border-radius: 10px;
          border: 0.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          transition: all 0.15s;
        }
        .collab-toggle:hover {
          background: rgba(255,255,255,0.06);
        }
        .collab-toggle.active {
          background: rgba(99,255,180,0.1);
          border-color: rgba(99,255,180,0.35);
        }
        .collab-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transition: background 0.15s;
        }
        .collab-toggle.active .collab-dot {
          background: #63ffb4;
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .collab-label {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          white-space: nowrap;
        }
        .collab-toggle.active .collab-label {
          color: #63ffb4;
        }
      `}</style>

      <div className="domain-pills">
        {DOMAINS.map((d) => (
          <button
            key={d}
            type="button"
            className={`domain-pill ${domain === d ? "selected" : ""}`}
            onClick={() => setDomain(d === "All" ? "" : d)}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="filter-row">
        <input
          type="text"
          className="search-input"
          placeholder="Search by title or tech stack..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className={`collab-toggle ${collabOnly ? "active" : ""}`}
          onClick={() => setCollabOnly(!collabOnly)}
        >
          <span className="collab-dot" />
          <span className="collab-label">Open to collab</span>
        </button>
      </div>
    </div>
  );
}