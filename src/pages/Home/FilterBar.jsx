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
          gap: 18px;
          margin-bottom: 36px;
          font-family: 'JetBrains Mono', monospace;
        }
        .domain-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .domain-pill {
          padding: 8px 14px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid #2A2A2A;
          background: transparent;
          color: rgba(234,234,234,0.45);
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s, color 0.15s;
          font-family: 'JetBrains Mono', monospace;
        }
        .domain-pill:hover {
          color: rgba(234,234,234,0.85);
          border-color: rgba(234,234,234,0.4);
        }
        .domain-pill.selected {
          background: #E61919;
          border-color: #E61919;
          color: #fff;
        }
        .filter-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .search-wrap {
          position: relative;
          flex: 1;
          min-width: 0;
        }
        .search-prompt {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #E61919;
          font-size: 13px;
          font-weight: 700;
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          background: #0E0E0E;
          border: 1px solid #1A1A1A;
          padding: 12px 16px 12px 34px;
          color: #EAEAEA;
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          outline: none;
          transition: border-color 0.15s;
        }
        .search-input:focus { border-color: rgba(230,25,25,0.55); }
        .search-input::placeholder { color: rgba(234,234,234,0.25); }
        .collab-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 10px 16px;
          border: 1px solid #2A2A2A;
          background: #0E0E0E;
          transition: border-color 0.15s, background 0.15s;
          user-select: none;
          flex-shrink: 0;
        }
        .collab-toggle:hover { border-color: rgba(234,234,234,0.4); }
        .collab-toggle.active {
          background: rgba(230,25,25,0.08);
          border-color: rgba(230,25,25,0.5);
        }
        .collab-box {
          width: 12px;
          height: 12px;
          border: 1px solid #2A2A2A;
          background: transparent;
          flex-shrink: 0;
          transition: background 0.15s, border-color 0.15s;
        }
        .collab-toggle.active .collab-box {
          background: #E61919;
          border-color: #E61919;
        }
        .collab-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(234,234,234,0.5);
          white-space: nowrap;
          transition: color 0.15s;
        }
        .collab-toggle.active .collab-label { color: #E61919; }
        @media (max-width: 640px) {
          .filter-row {
            flex-direction: column;
            align-items: stretch;
          }
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
        <div className="search-wrap">
          <span className="search-prompt">&gt;</span>
          <input
            type="text"
            className="search-input"
            placeholder="search by title or tech stack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          className={`collab-toggle ${collabOnly ? "active" : ""}`}
          onClick={() => setCollabOnly(!collabOnly)}
        >
          <span className="collab-box" />
          <span className="collab-label">Open to collab</span>
        </button>
      </div>
    </div>
  );
}