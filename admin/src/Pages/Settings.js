import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Settings.css";

export default function Settings() {
  const [adminData, setAdminData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  // Fetch current admin profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        setMessage({ text: "Not authenticated. Please log in.", type: "error" });
        setFetchingProfile(false);
        return;
      }

      try {
        setFetchingProfile(true);
        const response = await axios.get("/api/admin/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { username, email } = response.data;
        setAdminData((prev) => ({
          ...prev,
          username,
          email,
        }));
      } catch (error) {
        setMessage({
          text: error.response?.data?.message || "Failed to load profile information.",
          type: "error",
        });
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setAdminData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setMessage({ text: "Not authenticated. Please log in.", type: "error" });
      return;
    }

    if (activeTab === "profile") {
      if (!adminData.username || !adminData.email) {
        setMessage({ text: "Please fill out all fields.", type: "error" });
        return;
      }

      try {
        setLoading(true);
        const response = await axios.patch("/api/admin/profile", 
          {
            name: adminData.username, 
            email: adminData.email,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMessage({ text: response.data.message || "Profile updated successfully.", type: "success" });
      } catch (error) {
        setMessage({ text: error.response?.data?.message || "Failed to update profile.", type: "error" });
      } finally {
        setLoading(false);
      }
    } else if (activeTab === "security") {
      if (!adminData.currentPassword || !adminData.newPassword || !adminData.confirmPassword) {
        setMessage({ text: "Please fill out all password fields.", type: "error" });
        return;
      }

      if (adminData.newPassword !== adminData.confirmPassword) {
        setMessage({ text: "New passwords do not match.", type: "error" });
        return;
      }

      if (adminData.newPassword.length < 8) {
        setMessage({ text: "New password must be at least 8 characters.", type: "error" });
        return;
      }

      try {
        setLoading(true);
        const response = await axios.post("/api/admin/change-password",
          {
            currentPassword: adminData.currentPassword,
            newPassword: adminData.newPassword,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMessage({ text: response.data.message || "Password changed successfully.", type: "success" });
        setAdminData((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      } catch (error) {
        setMessage({ text: error.response?.data?.message || "Failed to change password.", type: "error" });
      } finally {
        setLoading(false);
      }
    }
  };

  if (fetchingProfile) {
    return (<div className="settings"><p>Loading profile...</p></div>);
  }

  return (
    <div className="settings">
      <h2>Admin Settings</h2>
      <p>Manage your administrator account.</p>

      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="tabs">
        <button 
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button 
          className={activeTab === "security" ? "active" : ""}
          onClick={() => setActiveTab("security")}
        >
          Security
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === "profile" && (
          <>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input 
                id="username" 
                type="text" 
                value={adminData.username} 
                onChange={(e) => handleChange("username", e.target.value)} 
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input 
                id="email" 
                type="email" 
                value={adminData.email} 
                onChange={(e) => handleChange("email", e.target.value)} 
              />
            </div>
          </>
        )}

        {activeTab === "security" && (
          <>
            <div className="field">
              <label htmlFor="currentPassword">Current Password</label>
              <input 
                id="currentPassword" 
                type="password" 
                value={adminData.currentPassword} 
                onChange={(e) => handleChange("currentPassword", e.target.value)} 
              />
            </div>
            <div className="field">
              <label htmlFor="newPassword">New Password</label>
              <input 
                id="newPassword" 
                type="password" 
                value={adminData.newPassword} 
                onChange={(e) => handleChange("newPassword", e.target.value)} 
              />
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input 
                id="confirmPassword" 
                type="password" 
                value={adminData.confirmPassword} 
                onChange={(e) => handleChange("confirmPassword", e.target.value)} 
              />
            </div>
          </>
        )}

        <button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
      </form>
    </div>
  );
}
