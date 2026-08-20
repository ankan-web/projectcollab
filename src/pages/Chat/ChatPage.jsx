import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuthStore } from "../../store/authStore";
import { getChatId, subscribeToMessages, sendMessage } from "../../services/chatService";
import Navbar from "../../components/layout/Navbar";

export default function ChatPage() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  const chatWithUid = searchParams.get("chatWith");
  const otherUid = searchParams.get("with");
  const activeOtherUid = chatWithUid || otherUid;
  const currentUserUid = user?.uid;

  const activeChat = useMemo(() => {
    if (!currentUserUid || !activeOtherUid) return null;
    return {
      id: getChatId(currentUserUid, activeOtherUid),
      otherUid: activeOtherUid,
    };
  }, [currentUserUid, activeOtherUid]);

  const activeChatUser = chats.find((c) => c.otherUid === activeChat?.otherUid);
  const unreadCount = chats.filter((c) => c.hasUnread).length;

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(
      doc(db, "chats", "index"),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const userChats = Object.entries(data.userChats?.[user.uid] || {})
            .map(([chatId, info]) => ({ chatId, ...info }))
            .sort(
              (a, b) =>
                (b.lastMessageAt?.seconds || 0) -
                (a.lastMessageAt?.seconds || 0)
            );
          setChats(userChats);
        }
        setLoading(false);
      },
      () => {
        setChats([]);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user?.uid]);

  useEffect(() => {
    if (!activeChat?.id) return;

    const unsubscribe = subscribeToMessages(activeChat.id, (msgs) => {
      setMessages(msgs);
    });

    return unsubscribe;
  }, [activeChat?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeChat?.id || !user?.uid) return;

    updateDoc(doc(db, "chats", "index"), {
      [`userChats.${user.uid}.${activeChat.id}.hasUnread`]: false,
    }).catch(console.error);
  }, [activeChat?.id, messages.length, user?.uid]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat?.id || !user?.uid) return;

    const messageText = newMessage.trim();
    const otherUserUid = activeChat.otherUid;
    setNewMessage("");

    try {
      await sendMessage(activeChat.id, user.uid, messageText, otherUserUid);

      await updateDoc(doc(db, "chats", "index"), {
        [`userChats.${user.uid}.${activeChat.id}.lastMessage`]: messageText,
        [`userChats.${user.uid}.${activeChat.id}.lastMessageAt`]: serverTimestamp(),
        [`userChats.${user.uid}.${activeChat.id}.hasUnread`]: false,
        [`userChats.${otherUserUid}.${activeChat.id}.lastMessage`]: messageText,
        [`userChats.${otherUserUid}.${activeChat.id}.lastMessageAt`]: serverTimestamp(),
        [`userChats.${otherUserUid}.${activeChat.id}.hasUnread`]: true,
      });
    } catch (error) {
      console.error(error);
      setNewMessage(messageText);
    }
  };

  const formatTime = (timestamp) =>
    new Date(timestamp.seconds * 1000).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="chat-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=JetBrains+Mono:wght@400;500;700&display=swap');
        .chat-page {
          min-height: 100dvh;
          background: #0A0A0A;
          color: #EAEAEA;
          font-family: 'JetBrains Mono', monospace;
          position: relative;
          overflow-x: clip;
        }
        .chat-page .crt-overlay {
          position: fixed;
          inset: 0;
          z-index: 90;
          pointer-events: none;
        }
        .chat-page .crt-scanlines {
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.18) 2px,
            rgba(0, 0, 0, 0.18) 4px
          );
        }
        .chat-page .crt-noise {
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .chat-app {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 1px;
          background: #1A1A1A;
          height: calc(100dvh - 58px);
        }
        .chat-sidebar {
          background: #0A0A0A;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }
        .sidebar-head {
          padding: 18px 16px 16px;
          border-bottom: 1px solid #1A1A1A;
          position: relative;
          flex-shrink: 0;
        }
        .sidebar-head::before,
        .sidebar-head::after {
          content: "+";
          position: absolute;
          color: rgba(230, 25, 25, 0.6);
          font-size: 12px;
          line-height: 1;
        }
        .sidebar-head::before { top: 6px; left: 6px; }
        .sidebar-head::after { top: 6px; right: 6px; }
        .macro-title {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: clamp(2rem, 4vw, 2.75rem);
          line-height: 0.9;
          letter-spacing: -0.03em;
          text-transform: uppercase;
          color: #EAEAEA;
          margin: 0 0 16px;
        }
        .macro-title .red { color: #E61919; }
        .rule-red {
          height: 3px;
          background: #E61919;
          margin: 0 0 14px;
          width: 100%;
        }
        .stat-line {
          display: flex;
          gap: 22px;
          margin: 0;
        }
        .stat-line > div { display: flex; align-items: baseline; gap: 7px; }
        .stat-line dt {
          font-size: 10px;
          letter-spacing: 0.1em;
          color: rgba(234, 234, 234, 0.35);
          text-transform: uppercase;
        }
        .stat-line dd {
          margin: 0;
          font-size: 11px;
          font-weight: 700;
          color: #EAEAEA;
          font-variant-numeric: tabular-nums;
        }
        .stat-line dd.red { color: #E61919; }
        .stat-line dd.green { color: #4AF626; }
        .chat-list {
          flex: 1;
          overflow-y: auto;
          background: #0A0A0A;
        }
        .chat-row {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 14px 16px;
          background: transparent;
          border: none;
          border-bottom: 1px solid #1A1A1A;
          border-left: 3px solid transparent;
          cursor: pointer;
          text-align: left;
          font-family: 'JetBrains Mono', monospace;
          transition: background 0.15s;
        }
        .chat-row:hover { background: #141414; }
        .chat-row.active {
          background: #161616;
          border-left-color: #E61919;
        }
        .chat-row.active::after {
          content: "▮";
          color: #E61919;
          margin-left: auto;
          font-size: 10px;
        }
        .row-avatar {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          background: #131313;
          border: 1px solid #2A2A2A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #E61919;
          overflow: hidden;
        }
        .row-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .row-main { flex: 1; min-width: 0; }
        .row-name {
          display: block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #EAEAEA;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .row-msg {
          display: block;
          font-size: 11px;
          color: rgba(234, 234, 234, 0.35);
          margin-top: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .row-side {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
          flex-shrink: 0;
        }
        .row-time {
          font-size: 9px;
          letter-spacing: 0.06em;
          color: rgba(234, 234, 234, 0.3);
          text-transform: uppercase;
          font-variant-numeric: tabular-nums;
        }
        .unread-block {
          width: 8px;
          height: 8px;
          background: #4AF626;
          box-shadow: 0 0 6px rgba(74, 246, 38, 0.6);
        }
        .state-box {
          padding: 40px 24px;
          text-align: center;
          color: rgba(234, 234, 234, 0.35);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .state-macro {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          color: #EAEAEA;
          margin: 0 0 12px;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          line-height: 1;
        }
        .state-macro .red { color: #E61919; }
        .state-cursor {
          display: inline-block;
          width: 9px;
          height: 14px;
          background: #E61919;
          vertical-align: text-bottom;
          margin-left: 6px;
          animation: crt-blink 1s steps(2) infinite;
        }
        @keyframes crt-blink { 0%, 50% { opacity: 1; } 100% { opacity: 0; } }
        .chat-main {
          background: #0A0A0A;
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 0;
        }
        .chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid #1A1A1A;
          background: #0E0E0E;
          flex-shrink: 0;
        }
        .back-btn {
          display: none;
          background: transparent;
          border: 1px solid #2A2A2A;
          color: #E61919;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          padding: 7px 10px;
          cursor: pointer;
        }
        .back-btn:hover { background: #161616; }
        .head-avatar {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          background: #131313;
          border: 1px solid #2A2A2A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #E61919;
          overflow: hidden;
        }
        .head-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .head-meta { min-width: 0; }
        .head-title {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #EAEAEA;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .head-sub {
          font-size: 9px;
          letter-spacing: 0.1em;
          color: rgba(234, 234, 234, 0.3);
          text-transform: uppercase;
          margin-top: 3px;
          font-variant-numeric: tabular-nums;
        }
        .head-status {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 9px;
          letter-spacing: 0.12em;
          color: rgba(234, 234, 234, 0.4);
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .head-status .sq {
          width: 7px;
          height: 7px;
          background: #E61919;
        }
        .msg-area {
          flex: 1;
          overflow-y: auto;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .msg {
          max-width: 78%;
          padding: 10px 13px;
          font-size: 13px;
          line-height: 1.55;
          border: 1px solid #2A2A2A;
          background: #131313;
          color: #EAEAEA;
          overflow-wrap: break-word;
        }
        .msg.own {
          align-self: flex-end;
          background: #EAEAEA;
          color: #0A0A0A;
          border-color: #EAEAEA;
          border-left: 3px solid #E61919;
          text-align: right;
        }
        .msg-text { margin: 0; }
        .msg-prefix { font-weight: 700; color: #E61919; }
        .msg.own .msg-prefix { color: #E61919; }
        .msg.in .msg-prefix { color: rgba(234, 234, 234, 0.4); }
        .msg-time {
          display: block;
          margin-top: 6px;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0.5;
          font-variant-numeric: tabular-nums;
        }
        .msg-form {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-top: 1px solid #1A1A1A;
          background: #0E0E0E;
          flex-shrink: 0;
        }
        .msg-input-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 9px;
          background: #131313;
          border: 1px solid #2A2A2A;
          padding: 0 12px;
          min-width: 0;
        }
        .msg-prompt { color: #E61919; font-weight: 700; font-size: 13px; flex-shrink: 0; }
        .msg-input {
          flex: 1;
          min-width: 0;
          background: transparent;
          border: none;
          outline: none;
          color: #EAEAEA;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          padding: 12px 0;
        }
        .msg-input::placeholder { color: rgba(234, 234, 234, 0.22); }
        .msg-input:focus { border: none; }
        .send-btn {
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          background: #E61919;
          color: #0A0A0A;
          border: none;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;
        }
        .send-btn:hover:not(:disabled) { background: #FF2A2A; }
        .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .chat-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px;
          position: relative;
        }
        .chat-empty::before,
        .chat-empty::after {
          content: "+";
          position: absolute;
          color: rgba(230, 25, 25, 0.5);
          font-size: 14px;
        }
        .chat-empty::before { top: 16px; left: 16px; }
        .chat-empty::after { bottom: 16px; right: 16px; }
        .empty-macro {
          font-family: 'Archivo Black', sans-serif;
          font-weight: 400;
          font-size: clamp(2.5rem, 7vw, 5.5rem);
          line-height: 0.9;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: #EAEAEA;
          margin: 0 0 18px;
        }
        .empty-macro .red { color: #E61919; }
        .empty-sub {
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(234, 234, 234, 0.35);
          margin: 0;
        }
        @media (max-width: 860px) {
          .chat-app {
            grid-template-columns: 1fr;
          }
          .chat-sidebar {
            position: fixed;
            top: 60px;
            bottom: 0;
            left: 0;
            z-index: 40;
            width: min(340px, 88vw);
            transform: translateX(-100%);
            transition: transform 0.3s;
            border-right: 1px solid #1A1A1A;
          }
          .chat-sidebar.open { transform: translateX(0); }
          .back-btn { display: inline-flex; }
          .msg { max-width: 88%; }
        }
      `}</style>

      <Navbar />
      <div className="crt-overlay crt-scanlines" aria-hidden="true" />
      <div className="crt-overlay crt-noise" aria-hidden="true" />

      <div className="chat-app">
        <aside className={`chat-sidebar ${showSidebar ? "open" : ""}`}>
          <div className="sidebar-head">
            <h1 className="macro-title">
              MESS<span className="red">AGES</span>
            </h1>
            <div className="rule-red" aria-hidden="true" />
            <dl className="stat-line">
              <div>
                <dt>Channels</dt>
                <dd><data value={chats.length}>{String(chats.length).padStart(2, "0")}</data></dd>
              </div>
              <div>
                <dt>Unread</dt>
                <dd className={unreadCount > 0 ? "green" : "red"}>
                  <data value={unreadCount}>{String(unreadCount).padStart(2, "0")}</data>
                </dd>
              </div>
              <div>
                <dt>Rev</dt>
                <dd>2.6</dd>
              </div>
            </dl>
          </div>

          <div className="chat-list">
            {loading ? (
              <div className="state-box">
                <span>SCANNING CHANNELS</span>
                <span className="state-cursor" />
              </div>
            ) : chats.length === 0 ? (
              <div className="state-box">
                <p className="state-macro">NO <span className="red">LINK</span></p>
                <span>NO CONVERSATIONS FOUND</span>
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.chatId}
                  onClick={() => {
                    setSearchParams({ chatWith: chat.otherUid });
                    setShowSidebar(false);
                  }}
                  className={`chat-row ${activeChat?.id === chat.chatId ? "active" : ""}`}
                >
                  <div className="row-avatar">
                    {chat.otherPhotoURL ? (
                      <img src={chat.otherPhotoURL} alt="" />
                    ) : (
                      chat.otherName?.[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="row-main">
                    <span className="row-name">{chat.otherName || "UNKNOWN"}</span>
                    <span className="row-msg">
                      <samp>{chat.lastMessage || "NO MESSAGES"}</samp>
                    </span>
                  </div>
                  <div className="row-side">
                    {chat.lastMessageAt && (
                      <time className="row-time" dateTime={new Date(chat.lastMessageAt.seconds * 1000).toISOString()}>
                        {formatTime(chat.lastMessageAt)}
                      </time>
                    )}
                    {chat.hasUnread && <span className="unread-block" aria-label="unread" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="chat-main">
          {activeChat ? (
            <>
              <div className="chat-header">
                <button onClick={() => setShowSidebar(true)} className="back-btn">
                  &lt;&lt;
                </button>

                <div className="head-avatar">
                  {activeChatUser?.otherPhotoURL ? (
                    <img src={activeChatUser.otherPhotoURL} alt="" />
                  ) : (
                    activeChatUser?.otherName?.[0]?.toUpperCase() || "?"
                  )}
                </div>

                <div className="head-meta">
                  <p className="head-title">{activeChatUser?.otherName || "UNKNOWN"}</p>
                  <p className="head-sub">
                    UNIT / {activeChat.otherUid.slice(0, 8).toUpperCase()}
                  </p>
                </div>

                <span className="head-status">
                  <span className="sq" /> LINK ACTIVE
                </span>
              </div>

              <div className="msg-area">
                {messages.map((msg) => {
                  const own = msg.senderId === user?.uid;
                  return (
                    <div key={msg.id} className={`msg ${own ? "own" : "in"}`}>
                      <p className="msg-text">
                        <span className="msg-prefix">{own ? ">>>" : "<<<"}</span>{" "}
                        {msg.text}
                      </p>
                      {msg.createdAt && (
                        <time className="msg-time" dateTime={new Date(msg.createdAt.seconds * 1000).toISOString()}>
                          {formatTime(msg.createdAt)} /// {own ? "TX" : "RX"}
                        </time>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="msg-form">
                <div className="msg-input-wrap">
                  <span className="msg-prompt">&gt;</span>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="TYPE MESSAGE..."
                    className="msg-input"
                    autoComplete="off"
                  />
                </div>
                <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                  {">>>"}
                </button>
              </form>
            </>
          ) : (
            <div className="chat-empty">
              <div>
                <p className="empty-macro">
                  NO <span className="red">LINK</span>
                </p>
                <p className="empty-sub">SELECT A CONVERSATION TO OPEN A CHANNEL</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}