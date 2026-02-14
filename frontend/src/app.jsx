import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import HomePage from "./home-page.jsx";
import LoginPage from "./login-page.jsx";
import RegisterPage from "./register-page.jsx";
import DashboardPage from "./dashboard-page.jsx";
import ApplyLeavePage from "./apply-leave-page.jsx";
import MyLeavesPage from "./my-leaves-page.jsx";
import EditLeavePage from "./edit-leave-page.jsx";
import AdminPanelPage from "./admin-panel-page.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch("http://localhost:8080/api/auth/profile", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage setUser={setUser} />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage setUser={setUser} />} />
      <Route path="/dashboard" element={user ? <DashboardPage user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      <Route path="/apply-leave" element={user ? <ApplyLeavePage user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      <Route path="/my-leaves" element={user ? <MyLeavesPage user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      <Route path="/edit-leave/:id" element={user ? <EditLeavePage user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      <Route path="/admin" element={user && user.role === "admin" ? <AdminPanelPage user={user} setUser={setUser} /> : <Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;