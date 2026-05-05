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
          gap: 6px;
          background: rgba(99,255,180,0.1);
          border: 0.5px solid rgba(99,255,180,0.3);
          color: #63ffb4;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 20px;
          font-family: 'DM Sans', sans-serif;
        }
        .skill-remove {
          background: none;
          border: none;
          color: rgba(99,255,180,0.6);
          cursor: pointer;
          font-size: 14px;
          line-height: 1;
          padding: 0;
          display: flex;
          align-items: center;
        }
        .skill-remove:hover { color: #63ffb4; }
        .skill-input-field {
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          min-width: 120px;
          flex: 1;
        }
        .skill-input-field::placeholder { color: rgba(255,255,255,0.25); }
        .suggestions-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0; right: 0;
          background: #1a1a1e;
          border: 0.5px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          overflow: hidden;
          z-index: 50;
        }
        .suggestion-item {
          padding: 9px 14px;
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.1s;
        }
        .suggestion-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
      `}</style>

      {/* Tag container + input */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          alignItems: "center",
          background: "rgba(255,255,255,0.04)",
          border: `0.5px solid ${focused ? "rgba(99,255,180,0.5)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 10,
          padding: "10px 14px",
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

      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>
        {value.length}/{max} skills · Press Enter or comma to add
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