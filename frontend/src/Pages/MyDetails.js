import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMessageSquare, FiCalendar, FiPackage, FiDownload } from "react-icons/fi";
import { FaCreditCard, FaCheckCircle } from "react-icons/fa";
import "./MyDetails.css";
import Loader from "../Components/Loader";

const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api";
const BACKEND_ROOT = process.env.REACT_APP_API_URL || "http://localhost:5000";

function MyDetails() {
  const { user, token, updateUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("profile");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editProfile, setEditProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ name: "", email: "", phone: "" });
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [editProfileError, setEditProfileError] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordForm, setResetPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState("");
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isAppointmentPaying, setIsAppointmentPaying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) return;
    const fetchData = async () => {
      try {
        const [messagesRes, appointmentsRes, ordersByUserRes] = await Promise.all([
          axios.get(`${API_BASE}/messages/my`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/appointments/my`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/orders/my`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        let combinedOrders = ordersByUserRes.data || [];
        const contactSearch = user.email || user.phone || "";
        if (combinedOrders.length === 0 && contactSearch) {
          const searchRes = await axios.get(`${API_BASE}/orders`, { params: { search: contactSearch } });
          if (searchRes.data && Array.isArray(searchRes.data.orders)) {
            combinedOrders = searchRes.data.orders;
          }
        }
        setMessages(messagesRes.data || []);
        setAppointments(appointmentsRes.data || []);
        setOrders(combinedOrders || []);
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, token]);

  const emailDisplay = user?.email || "Not provided";
  const phoneDisplay = user?.phone || "Not provided";
  const loginMethod = user?.email ? "Email" : user?.phone ? "Phone" : "Unknown";

  const writeMessages = messages.filter((msg) => msg.category && msg.category.toLowerCase().includes("write"));
  const contactMessages = messages.filter((msg) => msg.category && msg.category.toLowerCase().includes("contact"));

  const handleEditProfileOpen = () => {
    setEditProfile(true);
    setEditProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setEditProfileError("");
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    setEditProfileError("");
    setEditProfileLoading(true);
    try {
      const res = await axios.patch(`${API_BASE}/auth/profile`, editProfileForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.user) {
        updateUser(res.data.user);
        setEditProfile(false);
      }
    } catch (err) {
      setEditProfileError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setEditProfileLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetPasswordError("");
    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
      setResetPasswordError("New passwords do not match");
      return;
    }
    if (resetPasswordForm.newPassword.length < 6) {
      setResetPasswordError("Password must be at least 6 characters");
      return;
    }
    setResetPasswordLoading(true);
    try {
      await axios.post(
        `${API_BASE}/auth/change-password`,
        {
          currentPassword: resetPasswordForm.currentPassword,
          newPassword: resetPasswordForm.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResetPasswordSuccess(true);
      setResetPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setShowResetPassword(false);
        setResetPasswordSuccess(false);
      }, 2000);
    } catch (err) {
      setResetPasswordError(err.response?.data?.message || "Failed to change password");
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const openCancelModal = (order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    try {
      const res = await axios.patch(
        `${API_BASE}/orders/user-cancel/${orderToCancel._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.order) {
        setOrders((prev) => prev.map((o) => (o._id === orderToCancel._id ? res.data.order : o)));
        if (selectedOrder?._id === orderToCancel._id) setSelectedOrder(res.data.order);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setShowCancelModal(false);
      setOrderToCancel(null);
    }
  };

  const getOrderThumbnail = (order) => {
    const first = Array.isArray(order.items) && order.items[0];
    if (!first) return null;
    const img = first.image;
    if (img && img.startsWith("/")) return BACKEND_ROOT + img;
    if (img && img.startsWith("http")) return img;
    return null;
  };

  const getOrderSummary = (order) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const count = items.length;
    const firstName = count ? items[0].name || items[0].title : "Order";
    return count > 1 ? `${firstName} +${count - 1} more` : firstName;
  };

  const downloadInvoice = (order) => {
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${order.orderId}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #22c55e; padding-bottom: 20px; }
    .header h1 { color: #166534; margin: 0; font-size: 28px; }
    .header p { margin: 5px 0; color: #64748b; }
    .invoice-info { display: flex; justify-content: space-between; margin: 20px 0; }
    .invoice-info div { flex: 1; }
    .invoice-info h3 { margin: 0 0 10px 0; color: #334155; font-size: 14px; text-transform: uppercase; }
    .invoice-info p { margin: 5px 0; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f0fdf4; color: #166534; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #22c55e; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    .text-right { text-align: right; }
    .total-row { font-weight: 700; font-size: 16px; color: #166534; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Krishivishwa Biotech</h1>
    <p>Invoice</p>
  </div>
  
  <div class="invoice-info">
    <div>
      <h3>Bill To:</h3>
      <p><strong>${order.customerInfo?.firstName || ''} ${order.customerInfo?.lastName || ''}</strong></p>
      <p>${order.customerInfo?.email || ''}</p>
      <p>${order.customerInfo?.phone || ''}</p>
      <p>${order.customerInfo?.address || ''}, ${order.customerInfo?.city || ''}, ${order.customerInfo?.state || ''} ${order.customerInfo?.zipCode || ''}</p>
    </div>
    <div>
      <h3>Invoice Details:</h3>
      <p><strong>Invoice #:</strong> ${order.orderId}</p>
      <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString('en-IN')}</p>
      ${order.deliveredAt ? `<p><strong>Delivered Date:</strong> ${new Date(order.deliveredAt).toLocaleDateString('en-IN')}</p>` : ''}
      <p><strong>Payment Method:</strong> ${order.paymentMethod === 'online' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}</p>
      <p><strong>Payment Status:</strong> ${order.paymentMethod === 'online' || order.status === 'delivered' ? 'Paid' : 'Unpaid'}</p>
      ${order.paymentData?.razorpayPaymentId ? `<p><strong>Payment ID:</strong> ${order.paymentData.razorpayPaymentId}</p>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Quantity</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${order.items?.map(item => `
        <tr>
          <td>${item.name || item.title || 'Product'}</td>
          <td>${item.quantity}</td>
          <td class="text-right">₹${item.price?.toLocaleString() || '0'}</td>
          <td class="text-right">₹${((item.quantity || 0) * (item.price || 0)).toLocaleString()}</td>
        </tr>
      `).join('') || ''}
      <tr>
        <td colspan="3" class="text-right"><strong>Subtotal:</strong></td>
        <td class="text-right">₹${order.pricing?.subtotal?.toLocaleString() || '0'}</td>
      </tr>
      <tr>
        <td colspan="3" class="text-right">Shipping:</td>
        <td class="text-right">${order.pricing?.shippingFee === 0 ? 'FREE' : `₹${order.pricing?.shippingFee?.toLocaleString() || '0'}`}</td>
      </tr>
      <tr>
        <td colspan="3" class="text-right">Tax (GST):</td>
        <td class="text-right">₹${order.pricing?.tax?.toLocaleString() || '0'}</td>
      </tr>
      <tr class="total-row">
        <td colspan="3" class="text-right"><strong>Total Amount:</strong></td>
        <td class="text-right"><strong>₹${order.pricing?.total?.toLocaleString() || '0'}</strong></td>
      </tr>
    </tbody>
  </table>

  ${order.assignedTo ? `
    <div style="margin-top: 20px;">
      <h3 style="font-size: 14px; color: #334155; margin-bottom: 10px;">Delivery Information:</h3>
      <p><strong>Assigned To:</strong> ${order.assignedTo}</p>
      ${order.deliveredBy ? `<p><strong>Delivered By:</strong> ${order.deliveredBy}</p>` : ''}
      ${order.deliveredAt ? `<p><strong>Delivered At:</strong> ${new Date(order.deliveredAt).toLocaleString('en-IN')}</p>` : ''}
    </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>Krishivishwa Biotech - Quality Agricultural Solutions</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${order.orderId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Also open print dialog for PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const downloadAppointmentInvoice = (ap) => {
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Appointment Invoice - ${ap.farmerName || 'Appointment'}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #22c55e; padding-bottom: 20px; }
    .header h1 { color: #166534; margin: 0; font-size: 28px; }
    .header p { margin: 5px 0; color: #64748b; }
    .invoice-info { display: flex; justify-content: space-between; margin: 20px 0; }
    .invoice-info div { flex: 1; }
    .invoice-info h3 { margin: 0 0 10px 0; color: #334155; font-size: 14px; text-transform: uppercase; }
    .invoice-info p { margin: 5px 0; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f0fdf4; color: #166534; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #22c55e; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    .text-right { text-align: right; }
    .total-row { font-weight: 700; font-size: 16px; color: #166534; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Krishivishwa Biotech</h1>
    <p>Appointment Invoice</p>
  </div>

  <div class="invoice-info">
    <div>
      <h3>Customer Details:</h3>
      <p><strong>${ap.farmerName || ''}</strong></p>
      <p>${ap.email || ''}</p>
      <p>${ap.mobile || ''}</p>
      <p>${ap.location || ''}</p>
    </div>
    <div>
      <h3>Invoice Details:</h3>
      <p><strong>Consultation:</strong> ${ap.consultationType || ''}</p>
      <p><strong>Booked On:</strong> ${ap.createdAt ? new Date(ap.createdAt).toLocaleDateString('en-IN') : '—'}</p>
      <p><strong>Appointment Date:</strong> ${ap.scheduledDateTime ? new Date(ap.scheduledDateTime).toLocaleDateString('en-IN') : ap.date ? new Date(ap.date).toLocaleDateString('en-IN') : '—'}</p>
      <p><strong>Payment Method:</strong> ${ap.completionPaymentType || (ap.paymentStatus === 'Paid' ? 'Online (Razorpay)' : ap.paymentStatus === 'COD Collected' ? 'Cash on Delivery' : '—')}</p>
      <p><strong>Payment Status:</strong> ${ap.paymentStatus || 'Pending'}</p>
      ${ap.paymentData?.razorpayPaymentId ? `<p><strong>Payment ID:</strong> ${ap.paymentData.razorpayPaymentId}</p>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Details</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${ap.consultationType || 'Appointment'}</td>
        <td>${ap.cropType ? `Crop: ${ap.cropType}` : ''}${ap.farmSize ? ` | Farm: ${ap.farmSize}` : ''}</td>
        <td class="text-right">₹${ap.amount?.toLocaleString() || '0'}</td>
      </tr>
      <tr class="total-row">
        <td colspan="2" class="text-right"><strong>Total Amount:</strong></td>
        <td class="text-right"><strong>₹${ap.amount?.toLocaleString() || '0'}</strong></td>
      </tr>
    </tbody>
  </table>

  ${ap.appointmentConductedBy || ap.completionConductedBy ? `
    <div style="margin-top: 20px;">
      <h3 style="font-size: 14px; color: #334155; margin-bottom: 10px;">Service Information:</h3>
      ${ap.appointmentConductedBy ? `<p><strong>Conducted By:</strong> ${ap.appointmentConductedBy}</p>` : ''}
      ${ap.completionConfirmedBy ? `<p><strong>Confirmed By:</strong> ${ap.completionConfirmedBy}</p>` : ''}
      ${ap.approvedByAdminName ? `<p><strong>Approved By:</strong> ${ap.approvedByAdminName}</p>` : ''}
    </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for choosing Krishivishwa Biotech!</p>
    <p>Krishivishwa Biotech - Quality Agricultural Solutions</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Appointment-Invoice-${ap.farmerName || 'appointment'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (!user || !token) {
    return (
      <div className="mydetails-page">
        <p className="mydetails-login-prompt">Please log in to view your details.</p>
      </div>
    );
  }

  if (loading) {
    return <Loader text="Loading your dashboard..." height="70vh" />;
  }

  const sections = [
    { id: "profile", label: "My Information", icon: FiUser },
    { id: "messages", label: "Messages", icon: FiMessageSquare },
    { id: "appointments", label: "Appointments", icon: FiCalendar },
    { id: "orders", label: "Orders", icon: FiPackage },
  ];

  return (
    <div className="mydetails-page">
      <button className="mydetails-back" onClick={() => navigate("/")}>
        ← Back to Home
      </button>

      <header className="mydetails-header">
        <h1 className="mydetails-title">My Account</h1>
        <p className="mydetails-subtitle">Welcome back, {user.name}</p>
      </header>

      <div className="mydetails-dashboard-cards">
        {sections.map((s) => {
          const IconComponent = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              className={`mydetails-card ${activeSection === s.id ? "mydetails-card--active" : ""}`}
              onClick={() => setActiveSection(s.id)}
            >
              <IconComponent className="mydetails-card-icon" />
              <span className="mydetails-card-label">{s.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mydetails-content">
        {activeSection === "profile" && (
          <section className="mydetails-panel mydetails-panel--profile">
            <h2 className="mydetails-panel-title">My Information</h2>
            {!editProfile ? (
              <div className="mydetails-profile-card">
                <div className="mydetails-profile-grid">
                  <div className="mydetails-profile-item">
                    <span className="mydetails-profile-label">Name</span>
                    <span className="mydetails-profile-value">{user.name}</span>
                  </div>
                  <div className="mydetails-profile-item">
                    <span className="mydetails-profile-label">Email</span>
                    <span className="mydetails-profile-value">{emailDisplay}</span>
                  </div>
                  <div className="mydetails-profile-item">
                    <span className="mydetails-profile-label">Phone</span>
                    <span className="mydetails-profile-value">{phoneDisplay}</span>
                  </div>
                  <div className="mydetails-profile-item">
                    <span className="mydetails-profile-label">Login method</span>
                    <span className="mydetails-profile-value">{loginMethod}</span>
                  </div>
                </div>
                <div className="mydetails-profile-actions">
                  <button type="button" className="mydetails-btn mydetails-btn--primary" onClick={handleEditProfileOpen}>
                    Edit profile
                  </button>
                  <button
                    type="button"
                    className="mydetails-btn mydetails-btn--secondary"
                    onClick={() => setShowResetPassword(true)}
                  >
                    Reset password
                  </button>
                </div>
              </div>
            ) : (
              <form className="mydetails-form-card" onSubmit={handleEditProfileSubmit}>
                <h3 className="mydetails-form-title">Edit profile</h3>
                {editProfileError && <p className="mydetails-form-error">{editProfileError}</p>}
                <div className="mydetails-form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editProfileForm.name}
                    onChange={(e) => setEditProfileForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="mydetails-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editProfileForm.email}
                    onChange={(e) => setEditProfileForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="Optional if you use phone"
                  />
                </div>
                <div className="mydetails-form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={editProfileForm.phone}
                    onChange={(e) => setEditProfileForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="10-digit (optional if you use email)"
                  />
                </div>
                <div className="mydetails-form-actions">
                  <button type="submit" className="mydetails-btn mydetails-btn--primary" disabled={editProfileLoading}>
                    {editProfileLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="mydetails-btn mydetails-btn--outline"
                    onClick={() => setEditProfile(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {showResetPassword && (
              <div className="mydetails-form-card mydetails-reset-card">
                <h3 className="mydetails-form-title">Reset password</h3>
                {resetPasswordSuccess && <p className="mydetails-form-success">Password changed successfully.</p>}
                {resetPasswordError && <p className="mydetails-form-error">{resetPasswordError}</p>}
                <form onSubmit={handleResetPasswordSubmit}>
                  <div className="mydetails-form-group">
                    <label>Current password</label>
                    <input
                      type="password"
                      value={resetPasswordForm.currentPassword}
                      onChange={(e) => setResetPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mydetails-form-group">
                    <label>New password</label>
                    <input
                      type="password"
                      value={resetPasswordForm.newPassword}
                      onChange={(e) => setResetPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="mydetails-form-group">
                    <label>Confirm new password</label>
                    <input
                      type="password"
                      value={resetPasswordForm.confirmPassword}
                      onChange={(e) => setResetPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mydetails-form-actions">
                    <button type="submit" className="mydetails-btn mydetails-btn--primary" disabled={resetPasswordLoading}>
                      {resetPasswordLoading ? "Updating..." : "Change password"}
                    </button>
                    <button
                      type="button"
                      className="mydetails-btn mydetails-btn--outline"
                      onClick={() => {
                        setShowResetPassword(false);
                        setResetPasswordError("");
                        setResetPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      }}
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        )}

        {activeSection === "messages" && (
          <section className="mydetails-panel mydetails-panel--messages">
            <h2 className="mydetails-panel-title">Messages</h2>
            <div className="mydetails-two-cols">
              <div className="mydetails-box">
                <h3 className="mydetails-box-title">Write to Us</h3>
                {writeMessages.length === 0 ? (
                  <p className="mydetails-empty">No messages sent via Write to Us yet.</p>
                ) : (
                  <ul className="mydetails-list">
                    {writeMessages.map((msg) => (
                      <li key={msg._id} className="mydetails-list-item">
                        <p className="mydetails-list-msg">{msg.message}</p>
                        <span className="mydetails-list-meta">Sent: {new Date(msg.createdAt).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mydetails-box">
                <h3 className="mydetails-box-title">Contact Us</h3>
                {contactMessages.length === 0 ? (
                  <p className="mydetails-empty">No messages sent via Contact Us yet.</p>
                ) : (
                  <ul className="mydetails-list">
                    {contactMessages.map((msg) => (
                      <li key={msg._id} className="mydetails-list-item">
                        <p className="mydetails-list-msg">{msg.message}</p>
                        <span className="mydetails-list-meta">Sent: {new Date(msg.createdAt).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}

        {activeSection === "appointments" && (
          <section className="mydetails-panel mydetails-panel--appointments">
            <h2 className="mydetails-panel-title">Appointments</h2>
            {appointments.length === 0 ? (
              <p className="mydetails-empty">No appointments booked yet.</p>
            ) : (
              <div className="mydetails-orders-list">
                {appointments.map((ap) => (
                  <div
                    key={ap._id}
                    className="mydetails-order-row"
                    onClick={() => setSelectedAppointment(ap)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedAppointment(ap)}
                  >
                    <div className="mydetails-order-row-img">
                      <div className="mydetails-order-row-placeholder"><FiCalendar size={24} color="#16a34a" /></div>
                    </div>
                    <div className="mydetails-order-row-info">
                      <span className="mydetails-order-row-id">
                        {ap.consultationType || "Appointment"}
                      </span>
                      <span className="mydetails-order-row-products">
                        {ap.location || "Location not specified"}
                      </span>
                      <span className="mydetails-order-row-meta">
                        {ap.date ? new Date(ap.date).toLocaleDateString() : "—"} ·{" "}
                        {ap.time} · {ap.paymentStatus || "Pending"}
                      </span>
                    </div>
                    <div className="mydetails-order-row-right">
                      <span className={`mydetails-status mydetails-status--${(ap.status || "").toLowerCase()}`}>
                        {ap.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === "orders" && (
          <section className="mydetails-panel mydetails-panel--orders">
            <h2 className="mydetails-panel-title">Orders</h2>
            {orders.length === 0 ? (
              <p className="mydetails-empty">No orders placed yet.</p>
            ) : (
              <div className="mydetails-orders-list">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="mydetails-order-row"
                    onClick={() => setSelectedOrder(order)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedOrder(order)}
                  >
                    <div className="mydetails-order-row-img">
                      {getOrderThumbnail(order) ? (
                        <img src={getOrderThumbnail(order)} alt="" />
                      ) : (
                        <div className="mydetails-order-row-placeholder">📦</div>
                      )}
                    </div>
                    <div className="mydetails-order-row-info">
                      <span className="mydetails-order-row-id">{order.orderId}</span>
                      <span className="mydetails-order-row-products">{getOrderSummary(order)}</span>
                      <span className="mydetails-order-row-meta">
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "—"} · ₹{order.pricing?.total?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div className="mydetails-order-row-right">
                      <span className={`mydetails-status mydetails-status--${(order.status || "").toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {selectedAppointment && (
        <div
          className="mydetails-order-overlay"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="mydetails-order-detail mydetails-appt-detail"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mydetails-order-detail-header">
              <h3>{selectedAppointment.consultationType || "Appointment"}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {(selectedAppointment.status === "Finished" || selectedAppointment.status === "Meeting Finished") &&
                  (selectedAppointment.paymentStatus === "Paid" || selectedAppointment.paymentStatus === "COD Collected") && (
                  <button
                    type="button"
                    className="mydetails-btn mydetails-btn--primary"
                    onClick={() => downloadAppointmentInvoice(selectedAppointment)}
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <FiDownload /> Invoice
                  </button>
                )}
                <button
                  type="button"
                  className="mydetails-order-detail-close"
                  onClick={() => setSelectedAppointment(null)}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Timeline - Normal flow (not cancelled) */}
            {selectedAppointment.status !== "Cancelled" && (
              <div className="mydetails-order-progress">
                <div className="mydetails-progress-step done">
                  <span className="mydetails-progress-dot" />
                  <span className="mydetails-progress-label">Pending</span>
                  <span className="mydetails-progress-date">
                    {selectedAppointment.createdAt
                      ? new Date(selectedAppointment.createdAt).toLocaleDateString()
                      : "\u2014"}
                  </span>
                </div>
                <div className="mydetails-progress-connector" />
                <div
                  className={`mydetails-progress-step ${
                    ["Approved", "Confirmed", "Finished", "Meeting Finished"].includes(selectedAppointment.status) ? "done" : ""
                  }`}
                >
                  <span className="mydetails-progress-dot" />
                  <span className="mydetails-progress-label">Approved</span>
                  <span className="mydetails-progress-date">
                    {selectedAppointment.scheduledDateTime
                      ? new Date(selectedAppointment.scheduledDateTime).toLocaleDateString()
                      : "\u2014"}
                  </span>
                </div>
                <div className="mydetails-progress-connector" />
                <div
                  className={`mydetails-progress-step ${
                    selectedAppointment.paymentStatus === "Paid" || selectedAppointment.paymentStatus === "COD Collected" ? "done" : ""
                  }`}
                >
                  <span className="mydetails-progress-dot" />
                  <span className="mydetails-progress-label">Payment</span>
                  <span className="mydetails-progress-date">
                    {selectedAppointment.paymentDate
                      ? new Date(selectedAppointment.paymentDate).toLocaleDateString()
                      : "\u2014"}
                  </span>
                </div>
                <div className="mydetails-progress-connector" />
                <div
                  className={`mydetails-progress-step ${
                    ["Confirmed", "Finished", "Meeting Finished"].includes(selectedAppointment.status) ? "done" : ""
                  }`}
                >
                  <span className="mydetails-progress-dot" />
                  <span className="mydetails-progress-label">Confirmed</span>
                  <span className="mydetails-progress-date">{'\u2014'}</span>
                </div>
                <div className="mydetails-progress-connector" />
                <div
                  className={`mydetails-progress-step ${
                    selectedAppointment.status === "Finished" || selectedAppointment.status === "Meeting Finished" ? "done" : ""
                  }`}
                >
                  <span className="mydetails-progress-dot" />
                  <span className="mydetails-progress-label">Finished</span>
                  <span className="mydetails-progress-date">{'\u2014'}</span>
                </div>
              </div>
            )}

            {/* Timeline - Cancelled flow */}
            {selectedAppointment.status === "Cancelled" && (
              <div className="mydetails-order-progress mydetails-order-progress--ended">
                <div className="mydetails-progress-step done">
                  <span className="mydetails-progress-dot" />
                  <span className="mydetails-progress-label">Pending</span>
                  <span className="mydetails-progress-date">
                    {selectedAppointment.createdAt
                      ? new Date(selectedAppointment.createdAt).toLocaleDateString()
                      : "\u2014"}
                  </span>
                </div>
                <div className="mydetails-progress-connector" />
                <div
                  className={`mydetails-progress-step ${
                    selectedAppointment.approvedByAdminName || selectedAppointment.scheduledDateTime ? "done" : ""
                  }`}
                >
                  <span className="mydetails-progress-dot" />
                  <span className="mydetails-progress-label">Approved</span>
                  <span className="mydetails-progress-date">
                    {selectedAppointment.scheduledDateTime
                      ? new Date(selectedAppointment.scheduledDateTime).toLocaleDateString()
                      : "\u2014"}
                  </span>
                </div>
                <div className="mydetails-progress-connector" />
                <div className="mydetails-progress-step ended">
                  <span className="mydetails-progress-dot" />
                  <span className="mydetails-progress-label">Cancelled</span>
                  <span className="mydetails-progress-date">
                    {selectedAppointment.cancelledAt
                      ? new Date(selectedAppointment.cancelledAt).toLocaleDateString()
                      : "\u2014"}
                  </span>
                </div>
              </div>
            )}

            <div className="mydetails-order-detail-body">

              {/* ── Section 1: Booking Details ── */}
              <div className="mydetails-appt-section">
                <div className="mydetails-appt-section-header">
                  <FiCalendar className="mydetails-appt-section-icon" />
                  <h4>Booking Details</h4>
                </div>
                <div className="mydetails-order-detail-grid">
                  <div className="mydetails-order-detail-item">
                    <span className="mydetails-order-detail-label">Booked on</span>
                    <span>
                      {selectedAppointment.createdAt
                        ? new Date(selectedAppointment.createdAt).toLocaleString()
                        : selectedAppointment.date
                        ? new Date(selectedAppointment.date).toLocaleString()
                        : "\u2014"}
                    </span>
                  </div>
                  <div className="mydetails-order-detail-item">
                    <span className="mydetails-order-detail-label">Consultation type</span>
                    <span>{selectedAppointment.consultationType}</span>
                  </div>
                  <div className="mydetails-order-detail-item">
                    <span className="mydetails-order-detail-label">Requested date & time</span>
                    <span>
                      {selectedAppointment.date
                        ? new Date(selectedAppointment.date).toLocaleDateString()
                        : "\u2014"}{" "}
                      {selectedAppointment.time && `at ${selectedAppointment.time}`}
                    </span>
                  </div>
                  <div className="mydetails-order-detail-item">
                    <span className="mydetails-order-detail-label">Status</span>
                    <span
                      className={`mydetails-status mydetails-status--${(selectedAppointment.status || "pending")
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {selectedAppointment.status || "Pending"}
                    </span>
                  </div>
                  <div className="mydetails-order-detail-item">
                    <span className="mydetails-order-detail-label">Location</span>
                    <span>{selectedAppointment.location || "Not specified"}</span>
                  </div>
                  <div className="mydetails-order-detail-item">
                    <span className="mydetails-order-detail-label">Crop / Farm</span>
                    <span>
                      {selectedAppointment.cropType || "\u2014"}
                      {selectedAppointment.farmSize ? ` (${selectedAppointment.farmSize})` : ""}
                    </span>
                  </div>
                </div>
                {selectedAppointment.description && (
                  <div className="mydetails-appt-notes">
                    <span className="mydetails-order-detail-label">Notes</span>
                    <p>{selectedAppointment.description}</p>
                  </div>
                )}
              </div>

              {/* ── Section 2: Approved Details ── */}
              {["Approved", "Confirmed", "Finished", "Meeting Finished"].includes(selectedAppointment.status) && (
                <div className="mydetails-appt-section">
                  <div className="mydetails-appt-section-header">
                    <FaCheckCircle className="mydetails-appt-section-icon mydetails-appt-section-icon--green" />
                    <h4>Approved Details</h4>
                  </div>
                  <div className="mydetails-order-detail-grid">
                    <div className="mydetails-order-detail-item">
                      <span className="mydetails-order-detail-label">Approved by</span>
                      <span>{selectedAppointment.approvedByAdminName || "\u2014"}</span>
                    </div>
                    <div className="mydetails-order-detail-item">
                      <span className="mydetails-order-detail-label">Will be conducted by</span>
                      <span>{selectedAppointment.appointmentConductedBy || "\u2014"}</span>
                    </div>
                    <div className="mydetails-order-detail-item">
                      <span className="mydetails-order-detail-label">Scheduled date & time</span>
                      <span>
                        {selectedAppointment.scheduledDateTime
                          ? new Date(selectedAppointment.scheduledDateTime).toLocaleString()
                          : "\u2014"}
                      </span>
                    </div>
                  </div>
                  {selectedAppointment.scheduledDateTime &&
                    selectedAppointment.date &&
                    new Date(selectedAppointment.scheduledDateTime).toDateString() !==
                      new Date(selectedAppointment.date).toDateString() && (
                      <div className="mydetails-appt-schedule-notice">
                        <FiCalendar size={14} />
                        <span>
                          Your appointment has been rescheduled to{" "}
                          <strong>{new Date(selectedAppointment.scheduledDateTime).toLocaleDateString()}</strong>.
                        </span>
                      </div>
                    )}
                </div>
              )}

              {/* ── Section 3: Confirmation Details ── */}
              {["Confirmed", "Finished", "Meeting Finished"].includes(selectedAppointment.status) && (
                <div className="mydetails-appt-section">
                  <div className="mydetails-appt-section-header">
                    <FaCheckCircle className="mydetails-appt-section-icon mydetails-appt-section-icon--blue" />
                    <h4>Confirmation Details</h4>
                  </div>
                  <div className="mydetails-appt-confirmation-msg">
                    <FaCheckCircle />
                    <span>Your appointment is confirmed. {selectedAppointment.consultationType === "Phone Call" ? "You will receive a call at the scheduled time." : "The team will visit your location at the scheduled time."}</span>
                  </div>
                </div>
              )}

              {/* ── Section 4: Payment Details ── */}
              <div className="mydetails-appt-section">
                <div className="mydetails-appt-section-header">
                  <FaCreditCard className="mydetails-appt-section-icon mydetails-appt-section-icon--teal" />
                  <h4>Payment Details</h4>
                </div>
                <div className="mydetails-order-detail-grid">
                  <div className="mydetails-order-detail-item">
                    <span className="mydetails-order-detail-label">Payment status</span>
                    <span className={`mydetails-appt-pay-badge ${
                      selectedAppointment.paymentStatus === "Paid" || selectedAppointment.paymentStatus === "COD Collected"
                        ? "mydetails-appt-pay-badge--paid"
                        : selectedAppointment.paymentStatus === "Refunded"
                        ? "mydetails-appt-pay-badge--refunded"
                        : "mydetails-appt-pay-badge--pending"
                    }`}>
                      {selectedAppointment.paymentStatus || "Pending"}
                    </span>
                  </div>
                  <div className="mydetails-order-detail-item">
                    <span className="mydetails-order-detail-label">Amount</span>
                    <span className="mydetails-order-detail-total">
                      {selectedAppointment.amount ? `\u20b9${selectedAppointment.amount.toLocaleString()}` : "\u2014"}
                    </span>
                  </div>
                  <div className="mydetails-order-detail-item">
                    <span className="mydetails-order-detail-label">Payment method</span>
                    <span>
                      {selectedAppointment.completionPaymentType ||
                        (selectedAppointment.paymentStatus === "Paid"
                          ? "Online (Razorpay)"
                          : selectedAppointment.paymentStatus === "COD Collected"
                          ? "Cash on Delivery"
                          : "\u2014")}
                    </span>
                  </div>
                  {selectedAppointment.paymentDate && (
                    <div className="mydetails-order-detail-item">
                      <span className="mydetails-order-detail-label">Paid on</span>
                      <span>{new Date(selectedAppointment.paymentDate).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedAppointment.paymentData?.razorpayPaymentId && (
                    <div className="mydetails-order-detail-item">
                      <span className="mydetails-order-detail-label">Transaction ID</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {selectedAppointment.paymentData.razorpayPaymentId}
                      </span>
                    </div>
                  )}
                  {selectedAppointment.paymentCollectedBy && (
                    <div className="mydetails-order-detail-item">
                      <span className="mydetails-order-detail-label">Collected by</span>
                      <span>{selectedAppointment.paymentCollectedBy}</span>
                    </div>
                  )}
                </div>

                {/* Pending payment notice when appointment is not yet approved */}
                {selectedAppointment.paymentStatus !== "Paid" &&
                  selectedAppointment.paymentStatus !== "COD Collected" &&
                  selectedAppointment.status === "Pending" && (
                    <div className="mydetails-appt-pending-pay-note">
                      You can pay the amount only when your appointment gets approved by the organization.
                    </div>
                  )}

                {/* Pay button section (when approved and payable) */}
                {["Approved", "Confirmed", "Finished", "Meeting Finished"].includes(
                  selectedAppointment.status
                ) &&
                  (selectedAppointment.consultationType === "Phone Call" ||
                    selectedAppointment.consultationType === "Field Visit") && (
                    <AppointmentPaymentSection
                      appointment={selectedAppointment}
                      token={token}
                      apiBase={API_BASE}
                      onPaid={(updated) => {
                        setAppointments((prev) =>
                          prev.map((a) => (a._id === updated._id ? updated : a))
                        );
                        setSelectedAppointment(updated);
                      }}
                      isProcessing={isAppointmentPaying}
                      setIsProcessing={setIsAppointmentPaying}
                    />
                  )}

                {/* Invoice download for finished appointments */}
                {(selectedAppointment.status === "Finished" || selectedAppointment.status === "Meeting Finished") &&
                  (selectedAppointment.paymentStatus === "Paid" || selectedAppointment.paymentStatus === "COD Collected") && (
                  <div className="mydetails-appt-invoice-bar">
                    <span>Your appointment is complete. Download your invoice below.</span>
                    <button
                      type="button"
                      className="mydetails-btn mydetails-btn--primary"
                      onClick={() => downloadAppointmentInvoice(selectedAppointment)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <FiDownload /> Download Invoice
                    </button>
                  </div>
                )}
              </div>

              {/* ── Section 5: Finished Details ── */}
              {(selectedAppointment.status === "Finished" ||
                selectedAppointment.status === "Meeting Finished") && (
                <div className="mydetails-appt-section mydetails-appt-section--finished">
                  <div className="mydetails-appt-section-header">
                    <FaCheckCircle className="mydetails-appt-section-icon mydetails-appt-section-icon--green" />
                    <h4>Finished Details</h4>
                  </div>
                  <div className="mydetails-order-detail-grid">
                    <div className="mydetails-order-detail-item">
                      <span className="mydetails-order-detail-label">Conducted by</span>
                      <span>
                        {selectedAppointment.completionConductedBy ||
                          selectedAppointment.appointmentConductedBy ||
                          "\u2014"}
                      </span>
                    </div>
                    <div className="mydetails-order-detail-item">
                      <span className="mydetails-order-detail-label">Confirmed by</span>
                      <span>{selectedAppointment.completionConfirmedBy || "\u2014"}</span>
                    </div>
                  </div>
                  <div className="mydetails-appt-finished-msg">
                    <FaCheckCircle /> Appointment completed successfully. Thank you for choosing Krishivishwa Biotech!
                  </div>
                </div>
              )}

              {/* ── Section 6: Cancellation Details ── */}
              {selectedAppointment.status === "Cancelled" && (
                <div className="mydetails-appt-section mydetails-appt-section--cancelled">
                  <div className="mydetails-appt-section-header">
                    <FiCalendar className="mydetails-appt-section-icon mydetails-appt-section-icon--red" />
                    <h4>Cancellation Details</h4>
                  </div>
                  <div className="mydetails-order-detail-grid">
                    <div className="mydetails-order-detail-item">
                      <span className="mydetails-order-detail-label">Cancelled by</span>
                      <span>{selectedAppointment.cancelledBy || "\u2014"}</span>
                    </div>
                    <div className="mydetails-order-detail-item">
                      <span className="mydetails-order-detail-label">Cancelled on</span>
                      <span>
                        {selectedAppointment.cancelledAt
                          ? new Date(selectedAppointment.cancelledAt).toLocaleString()
                          : "\u2014"}
                      </span>
                    </div>
                  </div>
                  {selectedAppointment.refundTransactionId && (
                    <div className="mydetails-appt-refund-info">
                      <strong>Refund ID:</strong> {selectedAppointment.refundTransactionId}
                      <br />
                      Your amount has been refunded. It will be sent to you in the next 5\u20137 working days.
                    </div>
                  )}
                  {!selectedAppointment.refundTransactionId &&
                    (selectedAppointment.paymentStatus === "Paid") && (
                    <div className="mydetails-appt-refund-info mydetails-appt-refund-info--pending">
                      Your refund is being processed. It will be credited within 5\u20137 working days.
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="mydetails-order-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="mydetails-order-detail" onClick={(e) => e.stopPropagation()}>
            <div className="mydetails-order-detail-header">
              <h3>Order {selectedOrder.orderId}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {selectedOrder.status === 'delivered' && (
                  <button
                    type="button"
                    className="mydetails-btn mydetails-btn--primary"
                    onClick={() => downloadInvoice(selectedOrder)}
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <FiDownload /> Invoice
                  </button>
                )}
                <button type="button" className="mydetails-order-detail-close" onClick={() => setSelectedOrder(null)}>
                  ×
                </button>
              </div>
            </div>

            {!["rejected", "cancelled"].includes(selectedOrder.status) && (
              <div className="mydetails-order-progress">
                <div className={`mydetails-progress-step ${["pending", "assigned", "delivered"].includes(selectedOrder.status) ? "done" : ""}`}>
                  <span className="mydetails-progress-dot" />
                  <span className="mydetails-progress-label">Pending</span>
                  <span className="mydetails-progress-date">
                    {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className="mydetails-progress-connector" />
                <div className={`mydetails-progress-step ${["assigned", "delivered"].includes(selectedOrder.status) ? "done" : ""}`}>
                  <span className="mydetails-progress-dot" />
                  <span className="mydetails-progress-label">Assigned</span>
                  <span className="mydetails-progress-date">
                    {selectedOrder.assignedAt ? new Date(selectedOrder.assignedAt).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className="mydetails-progress-connector" />
                <div className={`mydetails-progress-step ${selectedOrder.status === "delivered" ? "done" : ""}`}>
                  <span className="mydetails-progress-dot" />
                  <span className="mydetails-progress-label">Delivered</span>
                  <span className="mydetails-progress-date">
                    {selectedOrder.deliveredAt ? new Date(selectedOrder.deliveredAt).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
            )}

            {["rejected", "cancelled"].includes(selectedOrder.status) && (
              <div className="mydetails-order-progress mydetails-order-progress--ended">
                <div className="mydetails-progress-step done">
                  <span className="mydetails-progress-dot" />
                  <span className="mydetails-progress-label">Pending</span>
                  <span className="mydetails-progress-date">
                    {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className="mydetails-progress-connector" />
                <div className={`mydetails-progress-step ${selectedOrder.assignedAt ? "done" : ""}`}>
                  <span className="mydetails-progress-dot" />
                  <span className="mydetails-progress-label">Assigned</span>
                  <span className="mydetails-progress-date">
                    {selectedOrder.assignedAt ? new Date(selectedOrder.assignedAt).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className="mydetails-progress-connector" />
                <div className="mydetails-progress-step ended">
                  <span className="mydetails-progress-dot" />
                  <span className="mydetails-progress-label">{selectedOrder.status === "rejected" ? "Rejected" : "Cancelled"}</span>
                  <span className="mydetails-progress-date">
                    {selectedOrder.cancelledAt
                      ? new Date(selectedOrder.cancelledAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
            )}

            <div className="mydetails-order-detail-body">
              <div className="mydetails-order-detail-grid">
                <div className="mydetails-order-detail-item">
                  <span className="mydetails-order-detail-label">Placed on</span>
                  <span>{selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleString() : "—"}</span>
                </div>
                <div className="mydetails-order-detail-item">
                  <span className="mydetails-order-detail-label">Total</span>
                  <span className="mydetails-order-detail-total">₹{selectedOrder.pricing?.total?.toLocaleString()}</span>
                </div>
                <div className="mydetails-order-detail-item">
                  <span className="mydetails-order-detail-label">Payment</span>
                  <span>{selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Online (Razorpay)"}</span>
                </div>
                <div className="mydetails-order-detail-item">
                  <span className="mydetails-order-detail-label">Status</span>
                  <span className={`mydetails-status mydetails-status--${(selectedOrder.status || "").toLowerCase()}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {selectedOrder.assignedTo && (
                <div className="mydetails-order-detail-block">
                  <h4>Delivery</h4>
                  <p>Assigned to: <strong>{selectedOrder.assignedTo}</strong></p>
                  {selectedOrder.deliveredBy && (
                    <p>Delivered by: <strong>{selectedOrder.deliveredBy}</strong></p>
                  )}
                </div>
              )}

              {selectedOrder.customerInfo && (
                <div className="mydetails-order-detail-block">
                  <h4>Delivery address</h4>
                  <p>
                    {selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}<br />
                    {selectedOrder.customerInfo.address}, {selectedOrder.customerInfo.city},{" "}
                    {selectedOrder.customerInfo.state} {selectedOrder.customerInfo.zipCode}<br />
                    Phone: {selectedOrder.customerInfo.phone}
                  </p>
                </div>
              )}

              {selectedOrder.status === "cancelled" && selectedOrder.paymentMethod === "online" && (
                <div className="mydetails-order-detail-refund">
                  {selectedOrder.refundTransactionId
                    ? `Refund has been processed. Refund ID: ${selectedOrder.refundTransactionId}. The refund amount will be transferred to your account in the next 5–7 working days.`
                    : "Refund will be processed in 2-3 business days."}
                </div>
              )}

              <div className="mydetails-order-detail-block">
                <h4>Items</h4>
                <ul className="mydetails-order-items">
                  {Array.isArray(selectedOrder.items) &&
                    selectedOrder.items.map((item, idx) => (
                      <li key={idx} className="mydetails-order-item">
                        <span className="mydetails-order-item-name">{item.name || item.title}</span>
                        <span className="mydetails-order-item-meta">
                          Qty: {item.quantity} × ₹{item.price?.toLocaleString()} = ₹{(item.quantity * item.price).toLocaleString()}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>

              {selectedOrder.status === "pending" && (
                <div className="mydetails-order-detail-actions">
                  <button
                    type="button"
                    className="mydetails-btn mydetails-btn--danger"
                  onClick={() => openCancelModal(selectedOrder)}
                  >
                    Cancel order
                  </button>
                <p className="mydetails-cancel-note">
                  You can cancel the order only while it is in <strong>Pending</strong> state. Once it is
                  <strong> Assigned</strong>, cancellation is no longer possible.
                </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showCancelModal && (
        <div className="mydetails-cancel-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="mydetails-cancel-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel order?</h3>
            <p className="mydetails-cancel-text">
              This will cancel your order and stop further processing.
            </p>
            <p className="mydetails-cancel-text">
              Order ID: <strong>{orderToCancel?.orderId}</strong>
            </p>
            <div className="mydetails-cancel-actions">
              <button
                type="button"
                className="mydetails-btn mydetails-btn--secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Keep order
              </button>
              <button
                type="button"
                className="mydetails-btn mydetails-btn--danger"
                onClick={handleCancelOrder}
              >
                Confirm cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const AppointmentPaymentSection = ({
  appointment,
  token,
  apiBase,
  onPaid,
  isProcessing,
  setIsProcessing,
}) => {
  const amount =
    appointment.amount ||
    (appointment.consultationType === "Phone Call" ? 500 : 2500);

  const shouldShowPayNow =
    appointment.paymentStatus !== "Paid" &&
    appointment.paymentStatus !== "COD Collected" &&
    appointment.status === "Approved" &&
    appointment.consultationType === "Phone Call";

  const canPayOptional =
    appointment.consultationType === "Field Visit" &&
    appointment.paymentStatus !== "Paid" &&
    appointment.paymentStatus !== "COD Collected" &&
    appointment.status === "Approved";

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayNow = async () => {
    try {
      setIsProcessing(true);
      const createRes = await axios.post(
        `${apiBase}/payments/create-order`,
        {
          amount,
          currency: "INR",
          receipt: `appointment_${appointment._id}`,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!createRes.data?.success) {
        alert("Failed to initialize payment. Please try again.");
        setIsProcessing(false);
        return;
      }

      const { order, keyId } = createRes.data;

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Krishivishwa Biotech",
        description: `Appointment Payment - ${appointment.consultationType}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              `${apiBase}/payments/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (!verifyRes.data?.success) {
              alert(
                "Payment verification failed. Please contact support with payment ID."
              );
              setIsProcessing(false);
              return;
            }

            const updateRes = await axios.put(
              `${apiBase}/appointments/${appointment._id}`,
              {
                paymentStatus: "Paid",
                status: "Confirmed",
                amount,
                paymentDate: new Date(),
                paymentData: {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  method: "razorpay",
                },
              },
              {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              }
            );

            onPaid(updateRes.data);
          } catch (err) {
            console.error("Error completing appointment payment:", err);
            alert(
              "Payment completed but updating appointment failed. Please contact support."
            );
          } finally {
            setIsProcessing(false);
          }
        },
        theme: {
          color: "#22c55e",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (resp) {
        alert(`Payment failed: ${resp.error.description}`);
        setIsProcessing(false);
      });
      razorpay.open();
    } catch (err) {
      console.error("Error starting appointment payment:", err);
      alert("Unable to start payment. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <p className="mydetails-appointment-pay-note">
        {appointment.consultationType === "Phone Call"
          ? "Payment must be completed before the appointment is confirmed."
          : "Payment can be made online or in cash during the field visit."}
      </p>
      {(shouldShowPayNow || canPayOptional) && (
        <button
          type="button"
          className="mydetails-btn mydetails-btn--primary"
          onClick={handlePayNow}
          disabled={isProcessing}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
        >
          {isProcessing ? (
            "Processing..."
          ) : (
            <>
              <FaCreditCard /> Pay ₹{amount}
            </>
          )}
        </button>
      )}
      {(appointment.paymentStatus === "Paid" ||
        appointment.paymentStatus === "COD Collected") && (
        <p className="mydetails-appointment-pay-success">
          <FaCheckCircle /> Payment received. Your appointment is confirmed.
        </p>
      )}
    </div>
  );
};

export default MyDetails;
