import { useState, useEffect, useRef } from "react";
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
  const messagesEndRef = useRef(null);

  const chatWithUid = searchParams.get("chatWith");
  const otherUid = searchParams.get("with");

  const activeOtherUid = chatWithUid || otherUid;
  const activeChat = (() => {
    if (!user?.uid) return null;
    if (!activeOtherUid) return null;

    return {
      id: getChatId(user.uid, activeOtherUid),
      otherUid: activeOtherUid,
    };
  })();

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(
      doc(db, "chats", "index"),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const userChats = Object.entries(data.userChats?.[user.uid] || {})
            .map(([chatId, info]) => ({
              chatId,
              ...info,
            }))
            .sort((a, b) => (b.lastMessageAt?.seconds || 0) - (a.lastMessageAt?.seconds || 0));
          setChats(userChats);
        }
        setLoading(false);
      },
      () => {
        setChats([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (!activeChat?.id) return;

    const unsubscribe = subscribeToMessages(activeChat.id, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [activeChat?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeChat?.id || !user?.uid) return;

    const chatIndexRef = doc(db, "chats", "index");
    updateDoc(chatIndexRef, {
      [`userChats.${user.uid}.${activeChat.id}.hasUnread`]: false,
    }).catch((error) => {
      console.error("Failed to mark chat as read:", error);
    });
  }, [activeChat?.id, messages.length, user?.uid]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat?.id || !user?.uid) return;

    const messageText = newMessage.trim();
    const otherUserUid = activeChat.otherUid;
    setNewMessage("");

    try {
      await sendMessage(activeChat.id, user.uid, messageText, otherUserUid);
      
      const chatIndexRef = doc(db, "chats", "index");
      await updateDoc(chatIndexRef, {
        [`userChats.${user.uid}.${activeChat.id}.lastMessage`]: messageText,
        [`userChats.${user.uid}.${activeChat.id}.lastMessageAt`]: serverTimestamp(),
        [`userChats.${user.uid}.${activeChat.id}.hasUnread`]: false,
        [`userChats.${otherUserUid}.${activeChat.id}.lastMessage`]: messageText,
        [`userChats.${otherUserUid}.${activeChat.id}.lastMessageAt`]: serverTimestamp(),
        [`userChats.${otherUserUid}.${activeChat.id}.hasUnread`]: true,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setNewMessage(messageText);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        .chat-container {
          display: flex;
          height: calc(100vh - 58px);
          max-width: 1400px;
          margin: 0 auto;
        }
        .chat-sidebar {
          width: 380px;
          border-right: 0.5px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          background: #0c0c0f;
        }
        .sidebar-header {
          padding: 20px;
          border-bottom: 0.5px solid rgba(255,255,255,0.08);
        }
        .sidebar-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 4px;
        }
        .sidebar-subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
        }
        .chat-list {
          flex: 1;
          overflow-y: auto;
        }
        .chat-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          cursor: pointer;
          border-bottom: 0.5px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .chat-item:hover { background: rgba(255,255,255,0.03); }
        .chat-item.active { background: rgba(99,255,180,0.08); }
        .chat-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(99,255,180,0.1);
          border: 1.5px solid rgba(99,255,180,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: #63ffb4;
          overflow: hidden;
          flex-shrink: 0;
        }
        .chat-avatar img { width: 100%; height: 100%; objectFit: cover; }
        .chat-info { flex: 1; min-width: 0; }
        .chat-name {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chat-preview {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chat-time {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          flex-shrink: 0;
        }
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #111113;
        }
        .chat-header {
          padding: 16px 24px;
          border-bottom: 0.5px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .chat-header-name {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
        }
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .message {
          max-width: 65%;
          padding: 10px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
        }
        .message.sent {
          align-self: flex-end;
          background: rgba(99,255,180,0.15);
          border: 0.5px solid rgba(99,255,180,0.2);
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .message.received {
          align-self: flex-start;
          background: rgba(255,255,255,0.06);
          border: 0.5px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.85);
          border-bottom-left-radius: 4px;
        }
        .message-time {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          margin-top: 4px;
        }
        .message-input-area {
          padding: 16px 24px;
          border-top: 0.5px solid rgba(255,255,255,0.08);
          display: flex;
          gap: 12px;
        }
        .message-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 12px 18px;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
        }
        .message-input:focus { border-color: rgba(99,255,180,0.4); }
        .message-input::placeholder { color: rgba(255,255,255,0.25); }
        .send-btn {
          background: #63ffb4;
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s, opacity 0.15s;
        }
        .send-btn:hover { transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .empty-chat {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.3);
        }
        .empty-chat-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .empty-chat-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px;
        }
        .empty-chat-text {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          margin: 0;
        }
      `}</style>

      <Navbar />

      <div className="chat-container">
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Messages</h2>
            <p className="sidebar-subtitle">Your conversations</p>
          </div>
          
          <div className="chat-list">
            {loading ? (
              <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                Loading...
              </div>
            ) : chats.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                No conversations yet.<br />Connect with people to start chatting!
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.chatId}
                  className={`chat-item ${activeChat?.id === chat.chatId ? "active" : ""}`}
                  onClick={() => setSearchParams({ chatWith: chat.otherUid })}
                >
                  <div className="chat-avatar">
                    {chat.otherPhotoURL ? (
                      <img src={chat.otherPhotoURL} alt="" />
                    ) : (
                      chat.otherName?.[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="chat-info">
                    <p className="chat-name">{chat.otherName || "User"}</p>
                    <p className="chat-preview">{chat.lastMessage || "No messages yet"}</p>
                  </div>
                  {chat.lastMessageAt && (
                    <span className="chat-time">
                      {new Date(chat.lastMessageAt.seconds * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="chat-main">
          {activeChat ? (
            <>
              <div className="chat-header">
                <div className="chat-avatar">
                  {chats.find(c => c.otherUid === activeChat.otherUid)?.otherPhotoURL ? (
                    <img src={chats.find(c => c.otherUid === activeChat.otherUid)?.otherPhotoURL} alt="" />
                  ) : (
                    chats.find(c => c.otherUid === activeChat.otherUid)?.otherName?.[0]?.toUpperCase() || "?"
                  )}
                </div>
                <span className="chat-header-name">
                  {chats.find(c => c.otherUid === activeChat.otherUid)?.otherName || "Chat"}
                </span>
              </div>

              <div className="messages-area">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.senderId === user?.uid ? "sent" : "received"}`}
                  >
                    {msg.text}
                    {msg.createdAt && (
                      <div className="message-time">
                        {new Date(msg.createdAt.seconds * 1000).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className="message-input-area" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className="message-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#09090b">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div className="empty-chat">
              <div className="empty-chat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 className="empty-chat-title">Welcome to Messages</h3>
              <p className="empty-chat-text">Select a conversation or connect with someone to start chatting.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
