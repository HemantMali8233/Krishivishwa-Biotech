import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Profile.css';

// Backend mounts adminProfileRoutes at "/api/admin/profile"
// and the router itself defines "/profile" and "/change-password"
const API_ROOT =
  (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/admin/profile';

const validatePassword = (password) => {
  if (!password || password.length < 8 || password.length > 20) {
    return 'Password must be 8-20 characters';
  }
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasDigit = /\d/.test(password);
  if (!hasUpperCase) return 'Must contain at least one uppercase letter';
  if (!hasSpecialChar) return 'Must contain at least one special character';
  if (!hasDigit) return 'Must contain at least one digit';
  return '';
};

const Profile = () => {
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const token = sessionStorage.getItem('authToken');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await axios.get(`${API_ROOT}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile({
          username: res.data.username || '',
          email: res.data.email || '',
        });
        setProfileError('');
      } catch (err) {
        setProfileError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoadingProfile(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setLoadingProfile(false);
      setProfileError('Not authenticated');
    }
  }, [token]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setProfileError('');
    setProfileMessage('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileMessage('');
    if (!profile.username.trim() || !profile.email.trim()) {
      setProfileError('Name and email are required');
      return;
    }

    try {
      const trimmedName = profile.username.trim();
      const trimmedEmail = profile.email.trim();

      const res = await axios.patch(
        `${API_ROOT}/profile`,
        { name: trimmedName, email: trimmedEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Keep local profile in sync with any backend normalization
      setProfile({
        username: trimmedName,
        email: trimmedEmail,
      });

      // Also update stored admin so header/user-profile-container picks the new name/email
      const storedUser = sessionStorage.getItem('authUser');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.username = trimmedName;
        parsed.email = trimmedEmail;
        sessionStorage.setItem('authUser', JSON.stringify(parsed));
      }

      setProfileMessage(res.data.message || 'Profile updated successfully');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordMessage('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    const validationMsg = validatePassword(passwords.newPassword);
    if (validationMsg) {
      setPasswordError(validationMsg);
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await axios.post(
        `${API_ROOT}/change-password`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordMessage(res.data.message || 'Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="admin-profile-page">
      <h2 className="profile-title">My Profile</h2>

      <div className="profile-layout">
        {/* Basic Info Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-icon-circle">
              <FiUser />
            </div>
            <div>
              <h3>Account Information</h3>
              <p>View and update your basic details</p>
            </div>
          </div>

          {loadingProfile ? (
            <div className="profile-loading">Loading profile...</div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="profile-field">
                <label>Full Name</label>
                <div className="profile-input-wrapper">
                  <FiUser className="profile-input-icon" />
                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleProfileChange}
                    placeholder="Admin name"
                  />
                </div>
              </div>

              <div className="profile-field">
                <label>Email</label>
                <div className="profile-input-wrapper">
                  <FiMail className="profile-input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              {profileError && <div className="profile-error">{profileError}</div>}
              {profileMessage && <div className="profile-success">{profileMessage}</div>}

              <button type="submit" className="profile-save-btn">
                Save Changes
              </button>
            </form>
          )}
        </div>

        {/* Password Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-icon-circle profile-icon-circle-password">
              <FiLock />
            </div>
            <div>
              <h3>Reset Password</h3>
              <p>Use a strong password for your account</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="profile-form">
            <div className="profile-field">
              <label>Current Password</label>
              <div className="profile-input-wrapper">
                <FiLock className="profile-input-icon" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className="profile-password-toggle"
                  onClick={() => setShowCurrent((v) => !v)}
                >
                  {showCurrent ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="profile-field">
              <label>New Password</label>
              <div className="profile-input-wrapper">
                <FiLock className="profile-input-icon" />
                <input
                  type={showNew ? 'text' : 'password'}
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="New password"
                />
                <button
                  type="button"
                  className="profile-password-toggle"
                  onClick={() => setShowNew((v) => !v)}
                >
                  {showNew ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <small className="password-hint">
                8–20 characters, at least 1 uppercase, 1 special character and 1 digit
              </small>
            </div>

            <div className="profile-field">
              <label>Confirm New Password</label>
              <div className="profile-input-wrapper">
                <FiLock className="profile-input-icon" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  className="profile-password-toggle"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {passwordError && <div className="profile-error">{passwordError}</div>}
            {passwordMessage && <div className="profile-success">{passwordMessage}</div>}

            <button type="submit" className="profile-save-btn" disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

