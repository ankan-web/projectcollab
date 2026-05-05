export default function AlertModal({ isOpen, title, message, type = "success", onClose }) {
  if (!isOpen) return null;

  const colors = {
    success: { bg: "rgba(99,255,180,0.1)", border: "rgba(99,255,180,0.3)", text: "#63ffb4" },
    error: { bg: "rgba(255,80,80,0.1)", border: "rgba(255,80,80,0.3)", text: "#ff5555" },
    info: { bg: "rgba(99,150,255,0.1)", border: "rgba(99,150,255,0.3)", text: "#6396ff" },
  };
  const style = colors[type] || colors.success;

  return (
    <div className="alert-overlay" onClick={onClose}>
      <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
        <style>{`
          .alert-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(4px);
            display: flex; align-items: center; justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.15s ease;
          }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .alert-modal {
            background: #18181b;
            border: 0.5px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 28px;
            width: 90%;
            max-width: 360px;
            text-align: center;
            animation: slideUp 0.2s ease;
          }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .alert-icon {
            width: 52px; height: 52px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 18px;
          }
          .alert-title {
            font-family: 'Syne', sans-serif;
            font-size: 18px; font-weight: 700;
            color: #fff;
            margin: 0 0 8px;
          }
          .alert-message {
            font-size: 14px;
            color: rgba(255,255,255,0.5);
            margin: 0 0 24px;
            line-height: 1.5;
          }
          .alert-btn {
            padding: 12px 32px;
            border-radius: 10px;
            font-family: 'Syne', sans-serif;
            font-size: 13px; font-weight: 700;
            cursor: pointer; transition: all 0.15s;
            border: none;
            background: rgba(255,255,255,0.06);
            color: rgba(255,255,255,0.7);
          }
          .alert-btn:hover {
            background: rgba(255,255,255,0.1);
            color: #fff;
          }
        `}</style>
        <div className="alert-icon" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
          {type === "success" && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={style.text} strokeWidth="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          )}
          {type === "error" && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={style.text} strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          )}
          {type === "info" && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={style.text} strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          )}
        </div>
        <h3 className="alert-title">{title}</h3>
        <p className="alert-message">{message}</p>
        <button className="alert-btn" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}