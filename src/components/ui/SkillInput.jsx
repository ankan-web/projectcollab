import { useState } from "react";

const SUGGESTIONS = [
  "React", "Next.js", "Vue", "Angular", "JavaScript", "TypeScript",
  "Node.js", "Express", "Python", "Django", "FastAPI", "Flask",
  "PostgreSQL", "MongoDB", "Firebase", "Redis", "GraphQL", "REST APIs",
  "React Native", "Flutter", "Swift", "Kotlin", "Docker", "AWS",
  "TailwindCSS", "Figma", "UI/UX", "Machine Learning", "Computer Vision",
  "NLP", "Data Science", "Pandas", "PyTorch", "TensorFlow", "Rust", "Go",
  "Java", "Spring Boot", "C++", "Unity", "Solidity", "Web3",
];

export default function SkillInput({ value = [], onChange, max = 10 }) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);

  const filtered = input.length > 0
    ? SUGGESTIONS.filter(
        (s) =>
          s.toLowerCase().includes(input.toLowerCase()) &&
          !value.includes(s)
      ).slice(0, 6)
    : [];

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed || value.includes(trimmed) || value.length >= max) return;
    onChange([...value, trimmed]);
    setInput("");
  };

  const removeSkill = (skill) => {
    onChange(value.filter((s) => s !== skill));
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addSkill(input);
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeSkill(value[value.length - 1]);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        .skill-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(230,25,25,0.1);
          border: 1px solid rgba(230,25,25,0.4);
          color: #EAEAEA;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 5px 10px;
          border-radius: 0;
          font-family: 'JetBrains Mono', monospace;
        }
        .skill-remove {
          background: none;
          border: none;
          color: rgba(230,25,25,0.7);
          cursor: pointer;
          font-size: 14px;
          line-height: 1;
          padding: 0;
          display: flex;
          align-items: center;
        }
        .skill-remove:hover { color: #E61919; }
        .skill-input-field {
          background: transparent;
          border: none;
          outline: none;
          color: #EAEAEA;
          font-size: 13px;
          font-family: 'JetBrains Mono', monospace;
          min-width: 140px;
          flex: 1;
        }
        .skill-input-field::placeholder { color: rgba(234,234,234,0.25); }
        .suggestions-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0; right: 0;
          background: #131313;
          border: 1px solid #2A2A2A;
          overflow: hidden;
          z-index: 50;
        }
        .suggestion-item {
          padding: 10px 14px;
          font-size: 12px;
          color: rgba(234,234,234,0.7);
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.03em;
          transition: background 0.1s, color 0.1s;
        }
        .suggestion-item:hover { background: #1A1A1A; color: #E61919; }
      `}</style>

      {/* Tag container + input */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          alignItems: "center",
          background: "#111111",
          border: `1px solid ${focused ? "#E61919" : "#2A2A2A"}`,
          borderRadius: 0,
          padding: "11px 14px",
          minHeight: 48,
          transition: "border-color 0.15s",
          cursor: "text",
        }}
        onClick={() => document.getElementById("skill-input-field").focus()}
      >
        {value.map((skill) => (
          <span key={skill} className="skill-tag">
            {skill}
            <button className="skill-remove" onClick={() => removeSkill(skill)}>×</button>
          </span>
        ))}

        {value.length < max && (
          <input
            id="skill-input-field"
            className="skill-input-field"
            value={input}
            placeholder={value.length === 0 ? "Type a skill and press Enter..." : "Add more..."}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
          />
        )}
      </div>

      <p style={{ fontSize: 10, color: "rgba(234,234,234,0.35)", marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {value.length}/{max} skills / enter or comma to add
      </p>

      {/* Suggestions dropdown */}
      {focused && filtered.length > 0 && (
        <div className="suggestions-dropdown">
          {filtered.map((s) => (
            <div key={s} className="suggestion-item" onMouseDown={() => addSkill(s)}>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}