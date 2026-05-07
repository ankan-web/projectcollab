import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { useAuthStore } from "../../store/authStore";
import { getUserJoinRequests } from "../../services/joinService";
import { globalSearch } from "../../services/searchService";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, setUser, setProfile } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ projects: [], people: [], needs: [] });
  const [searching, setSearching] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState({ uid: "", hasUnread: false });
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    if (user?.uid) {
      getUserJoinRequests(user.uid).then((requests) => {
        const incoming = requests.filter((r) => r.projectOwnerId === user.uid && r.status === "pending");
        setPendingRequests(incoming.length);
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

  const handleSignOut = async () => {
    await signOut(auth);
    sessionStorage.removeItem("github_access_token");
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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        const hamburgerBtn = document.querySelector('.mobile-menu-btn');
        if (hamburgerBtn && !hamburgerBtn.contains(e.target)) {
          setMobileMenuOpen(false);
        }
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
    setMobileMenuOpen(false);
    if (type === "project") navigate(`/projects/${id}`);
    else if (type === "person") navigate(`/profile/${id}`);
    else if (type === "need") navigate(`/needs?id=${id}`);
  };

  const navLinks = [
    { label: "Home", path: "/home" },
    { label: "Opportunities", path: "/needs" },
    { label: "Requests", path: "/requests", badge: pendingRequests },
    { label: "Messages", path: "/chat", dot: unreadMessages.uid === user?.uid && unreadMessages.hasUnread },
  ];

  const initials = profile?.displayName
    ? profile.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        .navbar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(9,9,11,0.85); backdrop-filter: blur(12px);
          border-bottom: 0.5px solid rgba(255,255,255,0.07);
          height: 58px; display: flex; align-items: center; padding: 0 28px; gap: 32px;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 0; }
        .nav-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: #63ffb4; box-shadow: 0 0 10px #63ffb4; }
        .nav-logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 17px; color: #fff; letter-spacing: -0.3px; }
        .nav-links { display: flex; gap: 4px; flex: 1; }
        .nav-link { padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.45); text-decoration: none; transition: all 0.15s; }
        .nav-link:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.05); }
        .nav-link.active { color: #fff; background: rgba(255,255,255,0.07); }
        .nav-link-wrapper { position: relative; display: inline-flex; }
        .nav-badge { position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px; background: #ff5555; color: #fff; font-size: 10px; font-weight: 600; border-radius: 9px; display: flex; align-items: center; justify-content: center; padding: 0 5px; }
        .nav-dot { position: absolute; top: 3px; right: 4px; width: 8px; height: 8px; border-radius: 50%; background: #ff5555; box-shadow: 0 0 0 2px #09090b; }
        .nav-avatar-btn { width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid rgba(99,255,180,0.3); background: rgba(99,255,180,0.1); cursor: pointer; overflow: hidden; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 500; color: #63ffb4; font-family: 'Syne', sans-serif; transition: border-color 0.15s; flex-shrink: 0; }
        .nav-avatar-btn:hover { border-color: rgba(99,255,180,0.7); }
        .nav-dropdown { position: absolute; top: calc(100% + 8px); right: 0; width: 220px; background: #18181b; border: 0.5px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
        .dropdown-header { padding: 14px 16px; border-bottom: 0.5px solid rgba(255,255,255,0.07); }
        .dropdown-name { font-size: 13px; font-weight: 500; color: #fff; margin: 0 0 2px; }
        .dropdown-email { font-size: 12px; color: rgba(255,255,255,0.35); margin: 0; }
        .dropdown-item { display: flex; align-items: center; gap: 10px; padding: 10px 16px; font-size: 13px; color: rgba(255,255,255,0.65); cursor: pointer; transition: background 0.1s, color 0.1s; text-decoration: none; font-family: 'DM Sans', sans-serif; border: none; background: none; width: 100%; text-align: left; }
        .dropdown-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .dropdown-item.danger { color: rgba(255,100,100,0.7); }
        .dropdown-item.danger:hover { background: rgba(255,100,100,0.07); color: #ff6464; }
        .dropdown-divider { height: 0.5px; background: rgba(255,255,255,0.07); }
        .search-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: rgba(255,255,255,0.45); display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .search-btn:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .search-dropdown { position: absolute; top: calc(100% + 8px); right: 0; width: 340px; background: #18181b; border: 0.5px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
        .search-section-title { padding: 8px 14px 6px; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; }
        .search-result { display: flex; align-items: center; gap: 10px; padding: 8px 14px; font-size: 13px; color: rgba(255,255,255,0.65); cursor: pointer; transition: background 0.1s; }
        .search-result:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .search-result svg { flex-shrink: 0; color: rgba(255,255,255,0.35); }
        .search-result span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .mobile-menu-btn { display: none; background: none; border: none; cursor: pointer; padding: 8px; color: rgba(255,255,255,0.7); transition: color 0.15s; }
        .mobile-menu-btn:hover { color: #fff; }
        .mobile-menu { display: none; }
        .nav-actions { display: flex; align-items: center; gap: 12px; }

        @media (max-width: 768px) {
          .navbar { padding: 0 16px; gap: 12px; }
          .nav-links { display: none; }
          .mobile-menu-btn { display: flex; align-items: center; justify-content: center; }
          .nav-actions { margin-left: auto; }
          
          .mobile-menu {
            display: block;
            position: fixed;
            top: 58px;
            left: 0;
            right: 0;
            background: rgba(9,9,11,0.98);
            backdrop-filter: blur(12px);
            border-bottom: 0.5px solid rgba(255,255,255,0.07);
            padding: 12px 16px 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            z-index: 99;
          }
          
          .mobile-nav-links {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          
          .mobile-nav-link {
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            color: rgba(255,255,255,0.65);
            text-decoration: none;
            transition: all 0.15s;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .mobile-nav-link:hover { color: #fff; background: rgba(255,255,255,0.05); }
          .mobile-nav-link.active { color: #fff; background: rgba(255,255,255,0.07); }
          
          .mobile-nav-link-content {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .search-dropdown {
            position: fixed;
            top: 58px;
            left: 16px;
            right: 16px;
            width: auto;
          }
          
          .nav-dropdown {
            position: fixed;
            top: 58px;
            right: 16px;
            width: calc(100vw - 32px);
            max-width: 280px;
          }
        }

        @media (max-width: 480px) {
          .navbar { padding: 0 12px; }
          .nav-logo-text { font-size: 15px; }
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
          <div className="nav-logo-dot" />
          <span className="nav-logo-text">HackHive</span>
        </Link>

        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </>
            )}
          </svg>
        </button>

        <div className="nav-links">
          {navLinks.map((l) => (
            <div key={l.path} className="nav-link-wrapper">
              <Link to={l.path} className={`nav-link ${location.pathname === l.path ? "active" : ""}`}>{l.label}</Link>
              {l.badge > 0 && <span className="nav-badge">{l.badge}</span>}
              {l.dot && <span className="nav-dot" />}
            </div>
          ))}
        </div>

        <div className="nav-actions">
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
                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
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
                <div className="dropdown-divider" />
                <button className="dropdown-item danger" onClick={handleSignOut}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-menu" ref={mobileMenuRef}>
          <div className="mobile-nav-links">
            {navLinks.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className={`mobile-nav-link ${location.pathname === l.path ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="mobile-nav-link-content">
                  <span>{l.label}</span>
                  {l.dot && <span className="nav-dot" style={{ position: 'static', boxShadow: 'none' }} />}
                </div>
                {l.badge > 0 && <span className="nav-badge" style={{ position: 'static' }}>{l.badge}</span>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
