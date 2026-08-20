import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import toast from "react-hot-toast";
import { auth, db } from "../../services/firebase";
import { useAuthStore } from "../../store/authStore";
import { getUserJoinRequests } from "../../services/joinService";
import { getUserGroupJoinRequests } from "../../services/groupService";
import { globalSearch } from "../../services/searchService";
import { getRepoStars, isRepoStarred, setRepoStarred, connectGithub, isConnected } from "../../services/githubService";
import { endAdminSession } from "../../services/adminService";
import StaggeredMenu from "../ui/StaggeredMenu";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, setUser, setProfile } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ projects: [], people: [], needs: [] });
  const [searching, setSearching] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState({ uid: "", hasUnread: false });
  const [ghStars, setGhStars] = useState(0);
  const [isStarred, setIsStarred] = useState(false);
  const [starring, setStarring] = useState(false);
  const [githubConnected, setGithubConnected] = useState(isConnected());
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (user?.uid) {
      Promise.all([getUserJoinRequests(user.uid), getUserGroupJoinRequests(user.uid)]).then(([requests, groupRequests]) => {
        const incoming = requests.filter((r) => r.projectOwnerId === user.uid && r.status === "pending");
        const incomingGroups = groupRequests.filter((r) => r.groupAdminId === user.uid && r.status === "pending");
        setPendingRequests(incoming.length + incomingGroups.length);
      });
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = onSnapshot(
      doc(db, "chats", "index"),
      (snapshot) => {
        const userChats = snapshot.data()?.userChats?.[user.uid] || {};
        setUnreadMessages({
          uid: user.uid,
          hasUnread: Object.values(userChats).some((chat) => chat.hasUnread),
        });
      },
      () => setUnreadMessages({ uid: user.uid, hasUnread: false })
    );
    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    getRepoStars().then(setGhStars).catch(() => {});
    if (user?.uid) {
      isRepoStarred().then(setIsStarred).catch(() => {});
    }
  }, [user?.uid]);

  const handleStar = async () => {
    if (starring) return;
    setStarring(true);
    try {
      if (!isConnected()) {
        await connectGithub();
        setGithubConnected(true);
        toast.success("GitHub connected! Starring now...");
      }
      await setRepoStarred(!isStarred);
      setIsStarred(!isStarred);
      getRepoStars().then(setGhStars).catch(() => {});
      toast.success(isStarred ? "Repo unstarred." : "Star added! Thanks for the support.");
    } catch (e) {
      toast.error(e.message || "Could not update star.");
    } finally {
      setStarring(false);
    }
  };

  const handleConnectGithub = async () => {
    setStarring(true);
    try {
      await connectGithub();
      setGithubConnected(true);
      toast.success("GitHub connected!");
      isRepoStarred().then(setIsStarred).catch(() => {});
    } catch (e) {
      toast.error(e.message || "Could not connect GitHub.");
    } finally {
      setStarring(false);
      setDropdownOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    sessionStorage.removeItem("github_access_token");
    endAdminSession();
    setUser(null);
    setProfile(null);
    navigate("/login");
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults({ projects: [], people: [], needs: [] });
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      return;
    }
    let cancelled = false;
    globalSearch(searchQuery).then((results) => {
      if (!cancelled) {
        setSearchResults(results);
        setSearching(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  const handleSearchResultClick = (type, id) => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults({ projects: [], people: [], needs: [] });
    if (type === "project") navigate(`/projects/${id}`);
    else if (type === "person") navigate(`/profile/${id}`);
    else if (type === "need") navigate(`/needs?id=${id}`);
  };

  const navLinks = [
    { label: "Home", path: "/home" },
    { label: "People", path: "/people" },
    { label: "Opportunities", path: "/needs" },
    { label: "Groups", path: "/groups" },
    { label: "Requests", path: "/requests", badge: pendingRequests },
    { label: "Messages", path: "/chat", dot: unreadMessages.uid === user?.uid && unreadMessages.hasUnread },
    { label: "About dev", path: "/about-dev", highlight: true },
  ];

  const menuItems = navLinks.map((l) => ({
    label: l.label,
    ariaLabel: `Go to ${l.label}`,
    link: l.path,
  }));

  const initials = profile?.displayName
    ? profile.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=JetBrains+Mono:wght@400;500;700&display=swap');
        .navbar {
          position: sticky; top: 0; z-index: 100;
          background: #0E0E0E;
          border-bottom: 2px solid #E61919;
          height: 60px; display: flex; align-items: center; padding: 0 28px; gap: 32px;
          font-family: 'JetBrains Mono', monospace;
          box-shadow: 0 8px 24px -12px rgba(0,0,0,0.9);
        }
        .nav-logo { display: flex; align-items: center; gap: 1px; text-decoration: none; flex-shrink: 0; }
        .nav-logo-dot { width: 28px; height: 28px; flex-shrink: 0; display: block; }
        .nav-logo-text { font-family: 'Archivo Black', sans-serif; font-weight: 400; font-size: 25px; color: #EAEAEA; letter-spacing: -0.01em; }
        .nav-links { display: flex; gap: 2px; flex: 1; }
        .nav-link { padding: 8px 15px; border-radius: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(234,234,234,0.72); text-decoration: none; transition: all 0.15s; }
        .nav-link:hover { color: #FFFFFF; background: #1A1A1A; }
        .nav-link.active { color: #0A0A0A; background: #E61919; }
        .nav-link.highlight {
          border: 1px solid rgba(230, 25, 25, 0.55);
          color: #E61919;
          margin-left: 6px;
        }
        .nav-link.highlight:hover { background: rgba(230, 25, 25, 0.12); border-color: #E61919; }
        .nav-link.highlight.active { background: #E61919; border-color: #E61919; color: #0A0A0A; }
        .nav-link-wrapper { position: relative; display: inline-flex; }
        .nav-badge { position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px; background: #FF2A2A; color: #0A0A0A; font-size: 10px; font-weight: 700; border-radius: 0; display: flex; align-items: center; justify-content: center; padding: 0 5px; }
        .nav-dot { position: absolute; top: 3px; right: 4px; width: 7px; height: 7px; background: #FF2A2A; }
        .nav-avatar-btn { width: 34px; height: 34px; border-radius: 0; border: 1px solid #E61919; background: #131313; cursor: pointer; overflow: hidden; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #E61919; font-family: 'JetBrains Mono', monospace; transition: border-color 0.15s; flex-shrink: 0; }
        .nav-avatar-btn:hover { border-color: #E61919; }
        .nav-dropdown { position: absolute; top: calc(100% + 8px); right: 0; width: 240px; background: #131313; border: 1px solid #2A2A2A; overflow: hidden; }
        .dropdown-header { padding: 14px 16px; border-bottom: 1px solid #1A1A1A; }
        .dropdown-name { font-size: 13px; font-weight: 700; color: #EAEAEA; margin: 0 0 2px; }
        .dropdown-email { font-size: 11px; color: rgba(234,234,234,0.4); margin: 0; overflow-wrap: anywhere; }
        .dropdown-item { display: flex; align-items: center; gap: 10px; padding: 11px 16px; font-size: 12px; color: rgba(234,234,234,0.65); cursor: pointer; transition: background 0.1s, color 0.1s; text-decoration: none; font-family: 'JetBrains Mono', monospace; border: none; background: none; width: 100%; text-align: left; text-transform: uppercase; letter-spacing: 0.04em; }
        .dropdown-item:hover { background: #1A1A1A; color: #EAEAEA; }
        .dropdown-item.danger { color: rgba(255,107,107,0.8); }
        .dropdown-item.danger:hover { background: rgba(230,25,25,0.12); color: #FF6B6B; }
        .dropdown-divider { height: 1px; background: #1A1A1A; }
        .search-btn { background: none; border: 1px solid transparent; cursor: pointer; padding: 6px; color: rgba(234,234,234,0.65); display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .search-btn:hover { color: #EAEAEA; border-color: #2A2A2A; }
        .gh-stars-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          height: 32px; padding: 0 10px; border-radius: 0; white-space: nowrap;
          background: #131313; border: 1px solid #2A2A2A;
          color: rgba(234,234,234,0.85); font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700;
          cursor: pointer; transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .gh-stars-btn:hover { background: #1A1A1A; color: #EAEAEA; border-color: rgba(234,234,234,0.4); }
        .gh-stars-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .gh-stars-btn .gh-stars-icon { color: rgba(234,234,234,0.45); transition: color 0.15s; }
        .gh-stars-btn:hover .gh-stars-icon { color: #E61919; }
        .gh-stars-btn.starred { border-color: rgba(230,25,25,0.6); color: #E61919; }
        .gh-stars-btn.starred .gh-stars-icon { color: #E61919; }
        .gh-stars-count { min-width: 12px; text-align: center; font-variant-numeric: tabular-nums; }
        .search-dropdown { position: absolute; top: calc(100% + 8px); right: 0; width: 340px; background: #131313; border: 1px solid #2A2A2A; overflow: hidden; }
        .search-section-title { padding: 8px 14px 6px; font-size: 10px; font-weight: 700; color: rgba(234,234,234,0.4); text-transform: uppercase; letter-spacing: 0.1em; }
        .search-result { display: flex; align-items: center; gap: 10px; padding: 9px 14px; font-size: 12px; color: rgba(234,234,234,0.65); cursor: pointer; transition: background 0.1s; font-family: 'JetBrains Mono', monospace; }
        .search-result:hover { background: #1A1A1A; color: #EAEAEA; }
        .search-result svg { flex-shrink: 0; color: rgba(234,234,234,0.4); }
        .search-result span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .nav-actions { display: flex; align-items: center; gap: 12px; }

        @media (max-width: 768px) {
          .navbar { padding: 0 16px; gap: 12px; }
          .nav-links { display: none; }
          .nav-logo { margin-left: 76px; }
          .nav-actions { margin-left: auto; }

          .search-dropdown {
            position: fixed;
            top: 60px;
            left: 16px;
            right: 16px;
            width: auto;
          }

          .nav-dropdown {
            position: fixed;
            top: 60px;
            right: 16px;
            width: calc(100vw - 32px);
            max-width: 280px;
          }
        }

        @media (max-width: 480px) {
          .navbar { padding: 0 12px; }
          .nav-logo-text { font-size: 14px; }
          .nav-avatar-btn { width: 32px; height: 32px; }

          .search-dropdown {
            left: 12px;
            right: 12px;
          }

          .nav-dropdown {
            right: 12px;
            width: calc(100vw - 24px);
          }
        }
      `}</style>

      <nav className="navbar">
        <Link to="/home" className="nav-logo">
          <img src="/Newfavicon.svg" alt="HackHive logo" className="nav-logo-dot" />
          <span className="nav-logo-text">ackHive</span>
        </Link>

        <div className="nav-links">
          {navLinks.map((l) => (
            <div key={l.path} className="nav-link-wrapper">
              <Link to={l.path} className={`nav-link ${location.pathname === l.path ? "active" : ""} ${l.highlight ? "highlight" : ""}`}>{l.label}</Link>
              {l.badge > 0 && <span className="nav-badge">{l.badge}</span>}
              {l.dot && <span className="nav-dot" />}
            </div>
          ))}
        </div>

        <div className="nav-actions">
          <button
            className={`gh-stars-btn ${isStarred ? "starred" : ""}`}
            onClick={handleStar}
            disabled={starring}
            title="Star HackHive on GitHub"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="GitHub">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
            </svg>
            <span className="gh-stars-count">{ghStars || 0}</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              className="gh-stars-icon"
              fill={isStarred ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
          <div style={{ position: "relative" }} ref={searchRef}>
            <button className="search-btn" onClick={() => setSearchOpen(!searchOpen)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {searchOpen && (
              <div className="search-dropdown">
                <div style={{ padding: 12, borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
                  <input
                    type="text"
                    placeholder="Search projects, people, opportunities..."
                    value={searchQuery}
                    onChange={(e) => {
                        const val = e.target.value;
                        setSearchQuery(val);
                        if (!val || val.length < 2) {
                          setSearchResults({ projects: [], people: [], needs: [] });
                          setSearching(false);
                        } else {
                          setSearching(true);
                        }
                      }}
                    autoFocus
                    style={{ width: "100%", background: "#111111", border: "1px solid #2A2A2A", borderRadius: 0, padding: "10px 12px", color: "#EAEAEA", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", outline: "none" }}
                  />
                </div>
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {searching && <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Searching...</div>}
                  {!searching && searchQuery.length >= 2 && searchResults.projects.length === 0 && searchResults.people.length === 0 && searchResults.needs.length === 0 && (
                    <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>No results found</div>
                  )}
                  {!searching && searchResults.projects.length > 0 && (
                    <div>
                      <div className="search-section-title">Projects</div>
                      {searchResults.projects.slice(0, 4).map((p) => (
                        <div key={p.id} className="search-result" onClick={() => handleSearchResultClick("project", p.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                          <span>{p.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {!searching && searchResults.people.length > 0 && (
                    <div>
                      <div className="search-section-title">People</div>
                      {searchResults.people.slice(0, 4).map((u) => (
                        <div key={u.uid} className="search-result" onClick={() => handleSearchResultClick("person", u.uid)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                          <span>{u.displayName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {!searching && searchResults.needs.length > 0 && (
                    <div>
                      <div className="search-section-title">Opportunities</div>
                      {searchResults.needs.slice(0, 4).map((n) => (
                        <div key={n.id} className="search-result" onClick={() => handleSearchResultClick("need", n.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                          <span>{n.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button className="nav-avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
              {profile?.photoURL ? <img src={profile.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
            </button>

            {dropdownOpen && (
              <div className="nav-dropdown">
                <div className="dropdown-header">
                  <p className="dropdown-name">{profile?.displayName || "Builder"}</p>
                  <p className="dropdown-email">{user?.email}</p>
                </div>
                <Link to="/profile/me" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  My profile
                </Link>
                <Link to="/projects/new" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                  New project
                </Link>
                {!githubConnected && (
                  <button className="dropdown-item" onClick={handleConnectGithub}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                    Connect GitHub
                  </button>
                )}
                <div className="dropdown-divider" />
                <button className="dropdown-item danger" onClick={handleSignOut}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="sm-mobile-wrap">
          <StaggeredMenu
            isFixed
            position="left"
            items={menuItems}
            displaySocials={false}
            displayItemNumbering
            colors={["#E61919", "#1A1A1A"]}
            menuButtonColor="#EAEAEA"
            openMenuButtonColor="#E61919"
            accentColor="#E61919"
          />
        </div>
      </nav>
    </>
  );
}
