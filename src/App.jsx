import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import { useAuthStore } from "./store/authStore";
import Login from "./pages/Auth/Login";
import Onboarding from "./pages/Onboarding/Onboarding";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import CreateProject from "./pages/Projects/CreateProject";
import ProjectDetail from "./pages/Projects/ProjectDetail";
import ChatPage from "./pages/Chat/ChatPage";
import NeedBoard from "./pages/Needs/NeedBoard";
import Groups from "./pages/Groups/Groups";
import JoinRequests from "./pages/Requests/JoinRequests";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import NotificationListener from "./components/layout/NotificationListener";
import GlobalResponsiveStyles from "./styles/GlobalResponsiveStyles";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <AppLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function OnboardedRoute({ children }) {
  const { user, profile, loading } = useAuthStore();
  if (loading) return <AppLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (profile && !profile.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

function HomeOrLogin() {
  const { user, profile, loading } = useAuthStore();
  if (loading) return <AppLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile?.onboarded) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/home" replace />;
}

function AppLoader() {
  return (
    <div style={{
      minHeight: "100vh", background: "#09090b",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: "#63ffb4", boxShadow: "0 0 16px #63ffb4",
          margin: "0 auto 16px",
          animation: "pulse 1.2s ease-in-out infinite",
        }} />
        <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}}`}</style>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  useAuth();

  return (
    <BrowserRouter>
      <GlobalResponsiveStyles />
      <Toaster position="top-center" toastOptions={{ style: { background: "#18181b", color: "#fff", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 10 } }} />
      <NotificationListener />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={
          <ProtectedRoute><Onboarding /></ProtectedRoute>
        } />
        <Route path="/home" element={
          <OnboardedRoute><Home /></OnboardedRoute>
        } />
        <Route path="/profile/:uid" element={
          <OnboardedRoute><Profile /></OnboardedRoute>
        } />
        <Route path="/projects/new" element={
          <OnboardedRoute><CreateProject /></OnboardedRoute>
        } />
        <Route path="/projects/:id" element={
          <OnboardedRoute><ProjectDetail /></OnboardedRoute>
        } />
        <Route path="/chat" element={
          <OnboardedRoute><ChatPage /></OnboardedRoute>
        } />
        <Route path="/needs" element={
          <OnboardedRoute><NeedBoard /></OnboardedRoute>
        } />
        <Route path="/groups" element={
          <OnboardedRoute><Groups /></OnboardedRoute>
        } />
        <Route path="/requests" element={
          <OnboardedRoute><JoinRequests /></OnboardedRoute>
        } />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={<HomeOrLogin />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
