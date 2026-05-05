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

  const activeChat = useMemo(() => {
    if (!user?.uid || !activeOtherUid) return null;
    return {
      id: getChatId(user.uid, activeOtherUid),
      otherUid: activeOtherUid,
    };
  }, [user?.uid, activeOtherUid]);

  const activeChatUser = chats.find((c) => c.otherUid === activeChat?.otherUid);

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

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Navbar />

      <div className="h-[calc(100vh-58px)] flex relative">
        {/* Sidebar */}
        <aside
          className={`
            fixed md:relative z-30 top-[58px] md:top-0 left-0 h-[calc(100vh-58px)]
            w-full sm:w-[380px]
            bg-white/5 backdrop-blur-2xl border-r border-white/10
            transition-transform duration-300
            ${showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div className="p-5 border-b border-white/10 sticky top-0 bg-black/80 backdrop-blur-xl">
            <h2 className="text-xl font-bold">Messages</h2>
            <p className="text-sm text-white/40">Your conversations</p>
          </div>

          <div className="overflow-y-auto h-full pb-20">
            {loading ? (
              <div className="p-6 text-center text-white/40">Loading...</div>
            ) : chats.length === 0 ? (
              <div className="p-8 text-center text-white/40">
                No conversations yet.
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.chatId}
                  onClick={() => {
                    setSearchParams({ chatWith: chat.otherUid });
                    setShowSidebar(false);
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-4 border-b border-white/5 transition ${
                    activeChat?.id === chat.chatId
                      ? "bg-emerald-400/10"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center overflow-hidden shrink-0">
                    {chat.otherPhotoURL ? (
                      <img
                        src={chat.otherPhotoURL}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      chat.otherName?.[0]?.toUpperCase() || "?"
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium truncate">{chat.otherName}</p>
                    <p className="text-sm text-white/40 truncate">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-gradient-to-b from-zinc-950 to-black">
          {activeChat ? (
            <>
              {/* Header */}
              <div className="sticky top-0 z-20 px-4 md:px-6 py-4 border-b border-white/10 bg-black/70 backdrop-blur-xl flex items-center gap-4">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden text-white/70"
                >
                  ←
                </button>

                <div className="w-11 h-11 rounded-full overflow-hidden bg-white/5">
                  {activeChatUser?.otherPhotoURL ? (
                    <img
                      src={activeChatUser.otherPhotoURL}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {activeChatUser?.otherName?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-base md:text-lg truncate">
                  {activeChatUser?.otherName || "Chat"}
                </h3>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 md:px-6 py-5 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[85%] md:max-w-[65%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
                      msg.senderId === user?.uid
                        ? "ml-auto bg-emerald-400/15 border border-emerald-400/20 rounded-br-md"
                        : "bg-white/5 border border-white/10 rounded-bl-md"
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.createdAt && (
                      <span className="block mt-2 text-[10px] text-white/30">
                        {new Date(
                          msg.createdAt.seconds * 1000
                        ).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSendMessage}
                className="sticky bottom-0 p-3 md:p-5 border-t border-white/10 bg-black/80 backdrop-blur-2xl"
              >
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent outline-none text-sm md:text-base placeholder:text-white/25"
                  />

                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-11 h-11 rounded-full bg-emerald-400 text-black font-bold disabled:opacity-40 shrink-0"
                  >
                    ↑
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center px-6 text-white/40">
              Select a conversation to start chatting.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}