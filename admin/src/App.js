import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Admin from "./Pages/Admin";
import Product from "./Pages/Product";
import Appointment from "./Pages/Appointment";
import Messages from "./Pages/Messages";
import Gallery from "./Pages/Gallery";
import Settings from "./Pages/Settings";
import AddProduct from "./Components/AddProduct";
import Dashboard from "./Pages/Dashboard";
import Login from "./Pages/Login";
import Content from "./Pages/Content";
import Updates from "./Pages/Updates"


// Simple Protected Route wrapper
function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Store logged-in admin data

  // On app load, check sessionStorage for token and user
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    const storedUser = sessionStorage.getItem("authUser");

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Called when admin successfully logs in
  const handleLogin = (userData, token) => {
    sessionStorage.setItem("authUser", JSON.stringify(userData));
    sessionStorage.setItem("authToken", token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Called when admin logs out
  const handleLogout = () => {
    sessionStorage.removeItem("authUser");
    sessionStorage.removeItem("authToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Protected Dashboard Home */}
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard onLogout={handleLogout} username={user?.username}>
                <Admin />
              </Dashboard>
            </ProtectedRoute>
          }
        />

        {/* Other protected pages */}
        <Route
          path="/products"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard onLogout={handleLogout} username={user?.username}>
                <Product />
              </Dashboard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard onLogout={handleLogout} username={user?.username}>
                <Appointment />
              </Dashboard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard onLogout={handleLogout} username={user?.username}>
                <Messages />
              </Dashboard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard onLogout={handleLogout} username={user?.username}>
                <AddProduct />
              </Dashboard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/gallery"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard onLogout={handleLogout} username={user?.username}>
                <Gallery />
              </Dashboard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/contents"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard onLogout={handleLogout} username={user?.username}>
                <Content />
              </Dashboard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/updates"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard onLogout={handleLogout} username={user?.username}>
                <Updates />
              </Dashboard>
            </ProtectedRoute>
          }
        />

      

        <Route
          path="/settings"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard onLogout={handleLogout} username={user?.username}>
                <Settings />
              </Dashboard>
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
