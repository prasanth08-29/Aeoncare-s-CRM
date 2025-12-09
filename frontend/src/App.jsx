import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import Products from "./pages/Products";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";

import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? { token } : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      console.log("App: fetching user me, token:", !!token);
      if (token) {
        try {
          const config = {
            headers: { Authorization: `Bearer ${token}` },
          };
          const res = await axios.get("/api/users/me", config);
          console.log("App: fetched user:", res.data);
          setUser({ ...res.data, token });
        } catch (error) {
          console.error("Failed to fetch user", error);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  console.log("App: render user:", user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h2 className="text-xl font-semibold text-gray-700">Loading Application...</h2>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              user ? (
                <Layout user={user} setUser={setUser}>
                  <ErrorBoundary>
                    <Dashboard user={user} />
                  </ErrorBoundary>
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/products"
            element={
              user ? (
                <Layout user={user} setUser={setUser}>
                  <Products user={user} />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/reports"
            element={
              user ? (
                <Layout user={user} setUser={setUser}>
                  <Reports />
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/settings"
            element={
              user && user.role === "admin" ? (
                <Layout user={user} setUser={setUser}>
                  <Settings />
                </Layout>
              ) : (
                <Navigate to={user ? "/" : "/login"} />
              )
            }
          />
          <Route
            path="/admin"
            element={
              user && user.role === "admin" ? (
                <Layout user={user} setUser={setUser}>
                  <ErrorBoundary>
                    <AdminDashboard />
                  </ErrorBoundary>
                </Layout>
              ) : (
                <Navigate to={user ? "/" : "/login"} />
              )
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
