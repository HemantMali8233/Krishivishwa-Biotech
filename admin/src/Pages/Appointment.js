import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiCheck,
  FiX,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiPhone,
  FiMail,
  FiCalendar,
  FiUserCheck,
  FiFlag,
  FiEye,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import './Appointment.css';


const backendURL = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/appointments";
const appointmentsPerPage = 4;

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [paymentFilter, setPaymentFilter] = useState('All Payments');
  const [dateFilter, setDateFilter] = useState(""); // for filtering appointments by Booking date (YYYY-MM-DD)
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [scheduledDateFilter, setScheduledDateFilter] = useState(""); // for filtering by scheduled date
  const [useScheduleView, setUseScheduleView] = useState(false); // toggle for schedule-only view
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAppointments, setTotalAppointments] = useState(0);

  const [viewingAppointmentId, setViewingAppointmentId] = useState(null);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPaymentWarning, setShowPaymentWarning] = useState(false);
  const [paymentWarningMessage, setPaymentWarningMessage] = useState("");

  // Filter panel state
  const [isFilterPanelCollapsed, setIsFilterPanelCollapsed] = useState(false);
  const [filterPanelStatus, setFilterPanelStatus] = useState('all');
  const [filterPanelPayment, setFilterPanelPayment] = useState('all');
  const [allAppointments, setAllAppointments] = useState([]);

  const [approveForm, setApproveForm] = useState({
    conductedBy: "",
    scheduledDateTime: "",
    approvedBy: "",
  });

  const [completeForm, setCompleteForm] = useState({
    completionConductedBy: "",
    completionConfirmedBy: "",
    paymentCollectedBy: "",
    completionPaymentType: "COD",
  });

  const [cancelForm, setCancelForm] = useState({
    cancelledBy: "",
    refundTransactionId: "",
  });
  const [cancelError, setCancelError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [notif, setNotif] = useState({ show: false, type: "", msg: "" });


  // Fetch all appointments for stats (no pagination)
  useEffect(() => {
    const fetchAllAppointments = async () => {
      try {
        const { data } = await axios.get(backendURL, { params: { limit: 10000 } });
        setAllAppointments(data.appointments || []);
      } catch (err) {
        console.error("Failed to load all appointments for stats", err);
      }
    };
    fetchAllAppointments();
  }, [appointments]); // Refetch when appointments change

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const params = { page: currentPage, limit: appointmentsPerPage };

        // If schedule view is active, only use scheduled date filter (ignore other filters)
        if (useScheduleView && scheduledDateFilter) {
          if (searchTerm.trim()) params.search = searchTerm.trim();
          params.scheduledDate = scheduledDateFilter;
        } else {
          // Normal filtering mode
          if (searchTerm.trim()) params.search = searchTerm.trim();
          if (statusFilter && statusFilter !== "All Status") params.status = statusFilter;
          if (paymentFilter && paymentFilter !== "All Payments") params.paymentStatus = paymentFilter;
          if (fromDate) params.fromDate = fromDate;
          if (toDate) params.toDate = toDate;
        }

        const { data } = await axios.get(backendURL, { params });
        setAppointments(data.appointments || []);
        setTotalAppointments(data.total || 0);
      } catch (err) {
        setNotif({ show: true, type: "error", msg: "Failed to load appointments." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, [currentPage, searchTerm, statusFilter, paymentFilter, fromDate, toDate, scheduledDateFilter, useScheduleView]);

  const totalPages = Math.ceil(totalAppointments / appointmentsPerPage);

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, "...", totalPages];
    if (currentPage >= totalPages - 2)
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${backendURL}/${id}`, { status: newStatus });
      setAppointments((apps) =>
        apps.map((app) =>
          (app._id || app.id) === id ? { ...app, status: newStatus } : app
        )
      );
      setNotif({ show: true, type: "success", msg: `Status set to ${newStatus}.` });
    } catch {
      setNotif({ show: true, type: "error", msg: "Failed to update status." });
    }
  };

  const openApproveModal = (appointment) => {
    setActiveAppointment(appointment);
    setApproveForm({
      conductedBy: appointment.appointmentConductedBy || "",
      scheduledDateTime: appointment.scheduledDateTime
        ? new Date(appointment.scheduledDateTime).toISOString().slice(0, 16)
        : "",
      approvedBy: appointment.approvedByAdminName || "",
    });
    setShowApproveModal(true);
  };

  const submitApprove = async (e) => {
    e.preventDefault();
    if (!activeAppointment) return;
    try {
      const baseAmount =
        activeAppointment.amount ||
        (activeAppointment.consultationType === "Phone Call"
          ? 500
          : 2500);

      const nextStatus =
        activeAppointment.status === "Pending"
          ? "Approved"
          : activeAppointment.status;

      const payload = {
        status: nextStatus,
        approvedByAdminName: approveForm.approvedBy,
        appointmentConductedBy: approveForm.conductedBy,
        scheduledDateTime: approveForm.scheduledDateTime
          ? new Date(approveForm.scheduledDateTime)
          : null,
        amount: baseAmount,
      };

      const { data } = await axios.put(
        `${backendURL}/${activeAppointment._id || activeAppointment.id}`,
        payload
      );

      setAppointments((apps) =>
        apps.map((app) =>
          (app._id || app.id) === (activeAppointment._id || activeAppointment.id)
            ? data
            : app
        )
      );
      setNotif({ show: true, type: "success", msg: "Appointment approved." });
      setShowApproveModal(false);
      setActiveAppointment(null);
    } catch {
      setNotif({
        show: true,
        type: "error",
        msg: "Failed to approve appointment.",
      });
    }
  };

  const openCompleteModal = (appointment) => {
    setActiveAppointment(appointment);
    setCompleteForm({
      completionConductedBy:
        appointment.completionConductedBy ||
        appointment.appointmentConductedBy ||
        "",
      completionConfirmedBy: appointment.completionConfirmedBy || "",
      paymentCollectedBy: appointment.paymentCollectedBy || "",
      completionPaymentType: appointment.completionPaymentType || "COD",
    });
    setShowCompleteModal(true);
  };

  const openCancelModal = (appointment) => {
    setActiveAppointment(appointment);
    setCancelForm({
      cancelledBy: "",
      refundTransactionId: "",
    });
    setCancelError("");
    setShowCancelModal(true);
  };

  const submitCancel = async (e) => {
    e.preventDefault();
    if (!activeAppointment) return;

    try {
      if (!cancelForm.cancelledBy.trim()) {
        setCancelError("Please enter who is cancelling this appointment.");
        return;
      }

      const isPaid =
        activeAppointment.paymentStatus === "Paid" ||
        activeAppointment.paymentStatus === "COD Collected";

      const needsRefundId =
        activeAppointment.status === "Confirmed" && isPaid;

      if (needsRefundId && !cancelForm.refundTransactionId.trim()) {
        setCancelError("Refund transaction ID is required for paid confirmed appointments.");
        return;
      }

      // When refund ID is required, verify it with Razorpay via backend before cancelling
      if (needsRefundId) {
        const paymentId = activeAppointment.paymentData?.razorpayPaymentId;
        if (!paymentId) {
          setCancelError(
            "No Razorpay payment ID found for this appointment. Please check the payment details or contact support."
          );
          return;
        }

        const paymentsVerifyURL = backendURL.replace(
          "/appointments",
          "/payments/verify-refund"
        );

        const verifyRes = await axios.post(paymentsVerifyURL, {
          refundId: cancelForm.refundTransactionId.trim(),
          paymentId,
        });

        if (!verifyRes.data?.success || !verifyRes.data?.verified) {
          setCancelError(
            verifyRes.data?.message ||
            "Refund verification failed. Please confirm the Refund ID from Razorpay and try again."
          );
          return;
        }
      }

      const payload = {
        status: "Cancelled",
        cancelledBy: cancelForm.cancelledBy.trim(),
        cancelledAt: new Date(),
      };

      if (needsRefundId) {
        payload.refundTransactionId = cancelForm.refundTransactionId.trim();
      }

      const { data } = await axios.put(
        `${backendURL}/${activeAppointment._id || activeAppointment.id}`,
        payload
      );

      setAppointments((apps) =>
        apps.map((app) =>
          (app._id || app.id) === (activeAppointment._id || activeAppointment.id)
            ? data
            : app
        )
      );

      setNotif({
        show: true,
        type: "success",
        msg: "Appointment cancelled.",
      });
      setShowCancelModal(false);
      setActiveAppointment(null);
    } catch {
      setNotif({
        show: true,
        type: "error",
        msg: "Failed to cancel appointment.",
      });
    }
  };

  const submitComplete = async (e) => {
    e.preventDefault();
    if (!activeAppointment) return;

    try {
      const isFieldVisit =
        activeAppointment.consultationType === "Field Visit";
      const alreadyPaid =
        activeAppointment.paymentStatus === "Paid" ||
        activeAppointment.paymentStatus === "COD Collected";

      // For Phone Call appointments: block finish if payment is still pending
      if (!isFieldVisit && !alreadyPaid) {
        setPaymentWarningMessage(
          "Payment is still pending. To finish this appointment, payment must be marked as Paid."
        );
        // Close finish modal and show a dedicated OK dialog
        setShowCompleteModal(false);
        setActiveAppointment(null);
        setShowPaymentWarning(true);
        return;
      }

      const payload = {
        status: "Finished",
        completionConductedBy: completeForm.completionConductedBy,
        completionConfirmedBy: completeForm.completionConfirmedBy,
      };

      if (isFieldVisit && !alreadyPaid) {
        payload.paymentCollectedBy = completeForm.paymentCollectedBy;
        payload.completionPaymentType = completeForm.completionPaymentType;
        payload.paymentStatus =
          completeForm.completionPaymentType === "COD"
            ? "COD Collected"
            : "Paid";
        payload.paymentDate = new Date();
      }

      const { data } = await axios.put(
        `${backendURL}/${activeAppointment._id || activeAppointment.id}`,
        payload
      );

      setAppointments((apps) =>
        apps.map((app) =>
          (app._id || app.id) === (activeAppointment._id || activeAppointment.id)
            ? data
            : app
        )
      );
      setNotif({
        show: true,
        type: "success",
        msg: "Appointment marked as completed.",
      });
      setShowCompleteModal(false);
      setActiveAppointment(null);
    } catch {
      setNotif({
        show: true,
        type: "error",
        msg: "Failed to complete appointment.",
      });
    }
  };

  // WhatsApp helper with predefined, emoji-friendly message (mobile/desktop compatible)
  const handleWhatsApp = (appointment) => {
    const phone = (appointment?.mobile || "").replace(/\D/g, "");
    if (!phone) return;
    const d = appointment?.date ? new Date(appointment.date) : null;
    const dateStr = d && !isNaN(d.getTime()) ? d.toLocaleDateString() : "N/A";
    let timeStr = appointment?.time || "N/A";
    if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
      const [h, m] = timeStr.split(":");
      let hh = parseInt(h, 10);
      const ampm = hh >= 12 ? "PM" : "AM";
      hh = hh % 12 || 12;
      timeStr = `${hh}:${m.padStart(2, "0")} ${ampm}`;
    }
    const lines = [
      `Hello ${appointment?.farmerName || ""},`,
      `We’re following up from Krishivishwa Biotech about your appointment.`,
      ``,
      `Appointment Details`,
      `🗓️ Date: ${dateStr}`,
      `🕒 Time: ${timeStr}`,
      appointment?.consultationType ? `📌 Type: ${appointment.consultationType}` : ``,
      appointment?.location ? `📍 Location: ${appointment.location}` : ``,
      appointment?.cropType ? `🌱 Crop: ${appointment.cropType}` : ``,
      ``,
      `✅ Please reply here if you need any changes or have questions.`,
      `- Krishivishwa Biotech`,
    ].filter(Boolean);
    const message = lines.join("\n");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;

  // Format booking date/time from .date + .time fields
  const getBookingDateTime = (appointment) => {
    const d = appointment.date ? new Date(appointment.date) : null;
    if (!d || isNaN(d.getTime())) return "N/A";
    const dateStr = d.toLocaleDateString();
    let timeStr = appointment.time || "N/A";
    // Format time string as HH:mm if it's in that form, else just show as is
    if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
      const [hour, min] = timeStr.split(":");
      let h = parseInt(hour, 10);
      const m = min.padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      timeStr = `${h}:${m} ${ampm}`;
    }
    return `${dateStr} ${timeStr}`;
  };

  // Calculate stats for filter panel using all appointments
  const stats = {
    total: allAppointments.length,
    pending: allAppointments.filter(a => a.status === 'Pending').length,
    approved: allAppointments.filter(a => a.status === 'Approved').length,
    confirmed: allAppointments.filter(a => a.status === 'Confirmed').length,
    finished: allAppointments.filter(a => a.status === 'Finished' || a.status === 'Meeting Finished').length,
    cancelled: allAppointments.filter(a => a.status === 'Cancelled').length,
    paid: allAppointments.filter(a => a.paymentStatus === 'Paid').length,
    pending_payment: allAppointments.filter(a => a.paymentStatus === 'Pending').length,
    cod_collected: allAppointments.filter(a => a.paymentStatus === 'COD Collected').length,
    refunded: allAppointments.filter(a => a.paymentStatus === 'Refunded').length,
  };

  // Filter panel handlers - both filters work together
  const handleFilterStatus = (status) => {
    setFilterPanelStatus(status);

    if (status === 'all') {
      setStatusFilter('All Status');
    } else if (status === 'pending') {
      setStatusFilter('Pending');
    } else if (status === 'approved') {
      setStatusFilter('Approved');
    } else if (status === 'confirmed') {
      setStatusFilter('Confirmed');
    } else if (status === 'finished') {
      setStatusFilter('Finished');
    } else if (status === 'cancelled') {
      setStatusFilter('Cancelled');
    }
    setCurrentPage(1);
  };

  const handleFilterPayment = (payment) => {
    setFilterPanelPayment(payment);

    if (payment === 'all') {
      setPaymentFilter('All Payments');
    } else if (payment === 'paid') {
      setPaymentFilter('Paid');
    } else if (payment === 'pending') {
      setPaymentFilter('Pending');
    } else if (payment === 'cod_collected') {
      setPaymentFilter('COD Collected');
    } else if (payment === 'refunded') {
      setPaymentFilter('Refunded');
    }
    setCurrentPage(1);
  };

  return (
    <div className="appointment-container">
      {notif.show && (
        <div className={`notification ${notif.type}`}>
          {notif.msg}
          <button className="notification-close" onClick={() => setNotif({ ...notif, show: false })}>×</button>
        </div>
      )}

      <div className="appointment-header">
        <div className="header-content">
          {/* Left side: Icon, Title, Subtitle */}
          <div className="header-left">
            <div className="header-icon">
              <FiCalendar />
            </div>
            <div>
              <h1>Appointment & Consultancy</h1>
              <p>Farmer Appointment Management Portal</p>
            </div>
          </div>

          {/* Right side: Stats */}
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-number">{totalAppointments}</span>
              <span className="stat-label">Total Appointments</span>
            </div>
          </div>
        </div>
      </div>
      <div className="table-controls">
        <h3>
          <span className="table-icon">📅</span>
          Appointment Schedule
        </h3>
        <div className="controls-right">
          <div className="appointment-search-box">
            <FiSearch className="appointment-search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="orders-date-range">
            <div className="orders-date-field">
              <label>From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="orders-date-field">
              <label>To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="appointment-content--with-panel">
        {/* Filter Panel */}
        <aside className={`appointment-filter-panel ${isFilterPanelCollapsed ? 'collapsed' : ''}`}>
          <div className="filter-panel-header">
            <h4>Panel</h4>
            <button
              type="button"
              className="filter-panel-collapse-btn"
              onClick={() => setIsFilterPanelCollapsed(v => !v)}
              title={isFilterPanelCollapsed ? 'Expand panel' : 'Collapse panel'}
            >
              {isFilterPanelCollapsed ? '›' : '‹'}
            </button>
          </div>

          {!isFilterPanelCollapsed && (

            <div className="filter-panel-content">
              {/* PART 2: SCHEDULE */}
              <div className="filter-panel-part schedule-part">
                <div className="filter-panel-part-header">
                  <h5>Schedule</h5>
                </div>
                <div className="schedule-content">
                  <p className="schedule-description">View appointments by scheduled date (works on all appointments)</p>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    marginBottom: '0.5rem',
                    marginTop: '0.75rem'
                  }}>
                    Select scheduled date
                  </label>
                  <input
                    type="date"
                    value={scheduledDateFilter}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setScheduledDateFilter(newDate);
                      setUseScheduleView(true);
                      setCurrentPage(1);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: useScheduleView ? '2px solid #3b82f6' : '1px solid rgba(226, 232, 240, 0.9)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      background: useScheduleView ? 'rgba(59, 130, 246, 0.05)' : '#fff'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        setScheduledDateFilter(today);
                        setUseScheduleView(true);
                        setCurrentPage(1);
                      }}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                      }}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScheduledDateFilter('');
                        setUseScheduleView(false);
                        setCurrentPage(1);
                      }}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: '#fff',
                        border: '1px solid rgba(226, 232, 240, 0.9)',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#6b7280',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                        e.target.style.color = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#fff';
                        e.target.style.borderColor = 'rgba(226, 232, 240, 0.9)';
                        e.target.style.color = '#6b7280';
                      }}
                    >
                      Clear
                    </button>
                  </div>
                  {useScheduleView && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#1e40af',
                      textAlign: 'center'
                    }}>
                      📅 Schedule View Active
                      <br />
                      <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Filters are bypassed</span>
                    </div>
                  )}
                </div>
              </div>
              {/* End of PART 2: SCHEDULE */}
              {/* PART 1: FILTERS */}
              <div className="filter-panel-part">
                <div className="filter-panel-part-header">
                  <h5>Filters</h5>
                </div>
                <>
                  <div className="filter-panel-section">
                    <p className="filter-panel-section-title">Appointment Status</p>
                    <button
                      type="button"
                      className={`filter-row ${filterPanelStatus === 'all' ? 'active' : ''}`}
                      onClick={() => handleFilterStatus('all')}
                    >
                      <span>All Appointments</span>
                      <span className="count-badge">{stats.total}</span>
                    </button>
                    <button
                      type="button"
                      className={`filter-row ${filterPanelStatus === 'pending' ? 'active' : ''}`}
                      onClick={() => handleFilterStatus('pending')}
                    >
                      <span>Pending</span>
                      <span className="count-badge">{stats.pending}</span>
                    </button>
                    <button
                      type="button"
                      className={`filter-row ${filterPanelStatus === 'approved' ? 'active' : ''}`}
                      onClick={() => handleFilterStatus('approved')}
                    >
                      <span>Approved</span>
                      <span className="count-badge">{stats.approved}</span>
                    </button>
                    <button
                      type="button"
                      className={`filter-row ${filterPanelStatus === 'confirmed' ? 'active' : ''}`}
                      onClick={() => handleFilterStatus('confirmed')}
                    >
                      <span>Confirmed</span>
                      <span className="count-badge">{stats.confirmed}</span>
                    </button>
                    <button
                      type="button"
                      className={`filter-row success ${filterPanelStatus === 'finished' ? 'active' : ''}`}
                      onClick={() => handleFilterStatus('finished')}
                    >
                      <span>Finished</span>
                      <span className="count-badge">{stats.finished}</span>
                    </button>
                    <button
                      type="button"
                      className={`filter-row warn ${filterPanelStatus === 'cancelled' ? 'active' : ''}`}
                      onClick={() => handleFilterStatus('cancelled')}
                    >
                      <span>Cancelled</span>
                      <span className="count-badge">{stats.cancelled}</span>
                    </button>
                  </div>

                  <div className="filter-panel-section">
                    <p className="filter-panel-section-title">Payment Status</p>
                    <button
                      type="button"
                      className={`filter-row ${filterPanelPayment === 'all' ? 'active' : ''}`}
                      onClick={() => handleFilterPayment('all')}
                    >
                      <span>All Payments</span>
                      <span className="count-badge">{stats.total}</span>
                    </button>
                    <button
                      type="button"
                      className={`filter-row success ${filterPanelPayment === 'paid' ? 'active' : ''}`}
                      onClick={() => handleFilterPayment('paid')}
                    >
                      <span>Paid</span>
                      <span className="count-badge">{stats.paid}</span>
                    </button>
                    <button
                      type="button"
                      className={`filter-row ${filterPanelPayment === 'pending' ? 'active' : ''}`}
                      onClick={() => handleFilterPayment('pending')}
                    >
                      <span>Pending</span>
                      <span className="count-badge">{stats.pending_payment}</span>
                    </button>
                    <button
                      type="button"
                      className={`filter-row success ${filterPanelPayment === 'cod_collected' ? 'active' : ''}`}
                      onClick={() => handleFilterPayment('cod_collected')}
                    >
                      <span>COD Collected</span>
                      <span className="count-badge">{stats.cod_collected}</span>
                    </button>
                    <button
                      type="button"
                      className={`filter-row warn ${filterPanelPayment === 'refunded' ? 'active' : ''}`}
                      onClick={() => handleFilterPayment('refunded')}
                    >
                      <span>Refunded</span>
                      <span className="count-badge">{stats.refunded}</span>
                    </button>
                  </div>
                </>
              </div>
              {/* End of PART 1: FILTERS */}


            </div>
          )}
        </aside>

        <div className="appointment-table-wrap">
          <div className="table-wrapper">
            <table className="appointment-table">
              <thead>
                <tr>
                  <th style={{ width: 150 }}>Booking Date</th>
                  <th className="farmer-col">Farmer Details</th>
                  <th className="farm-col">Farm Info</th>
                  <th className="crop-col" style={{ textAlign: "center" }}>
                    Counsaltancy Type
                  </th>
                  <th className="contact-col">Contact Info</th>
                  <th className="payment-col">Payment</th>
                  <th className="status-col">Status</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="loading-cell">
                      Loading...
                    </td>
                  </tr>
                ) : appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <React.Fragment key={appointment._id || appointment.id}>
                      <tr>
                        {/* Booking Date/Time */}
                        <td style={{ fontWeight: 600, fontSize: "1em", color: "#34693d" }}>
                          <FiCalendar style={{ marginRight: 6, fontSize: "1.18em", verticalAlign: "-2px" }} />
                          {getBookingDateTime(appointment)}
                        </td>
                        {/* Farmer Details */}
                        <td className="farmer-info">
                          <div className="farmer-details">
                            <h4>{appointment.farmerName}</h4>
                            <p className="farmer-location">{appointment.location}</p>
                          </div>
                        </td>
                        <td className="farm-info">
                          <div className="farm-size"><strong>Farm Size:</strong> {appointment.farmSize}</div>
                          <div className="crop-type"><strong>Crop:</strong> {appointment.cropType}</div>
                        </td>
                        <td className="crop-info centered-consultancy" style={{ textAlign: 'center' }}>
                          <div className="crop-badge">{appointment.consultationType}</div>
                        </td>
                        <td className="contact-info">
                          <div className="contact-item">
                            <FiPhone className="contact-icon" />
                            <a href={`tel:${appointment.mobile}`}>{appointment.mobile}</a>
                          </div>
                          <div className="contact-item">
                            <FiMail className="contact-icon" />
                            <a href={`mailto:${appointment.email}`}>{appointment.email}</a>
                          </div>
                        </td>
                        {/* Payment toggle */}
                        <td>
                          <span
                            className={`payment-badge ${appointment.paymentStatus?.toLowerCase().replace(
                              " ",
                              "-"
                            )}`}
                          >
                            {appointment.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                            {appointment.status}
                            {appointment.status === "Pending" && (
                              <span className="status-pulse"></span>
                            )}
                          </span>
                        </td>
                        <td className="appointment-action-buttons">
                          <div className="actions-container-two-rows">
                            {/* Row 1: Approve/Complete and Cancel buttons */}
                            <div className="actions-row">
                              {appointment.status === "Pending" && (
                                <button
                                  className="btn-action approve"
                                  onClick={() => openApproveModal(appointment)}
                                  title="Approve appointment"
                                >
                                  <FiUserCheck />
                                </button>
                              )}
                              {(appointment.status === "Approved" ||
                                appointment.status === "Confirmed") && (
                                  <button
                                    className="btn-action approve"
                                    onClick={() => openCompleteModal(appointment)}
                                    title={
                                      appointment.consultationType === "Field Visit"
                                        ? "Mark visit as complete"
                                        : "Mark call as finished"
                                    }
                                  >
                                    <FiFlag />
                                  </button>
                                )}
                              {appointment.status !== "Cancelled" &&
                                appointment.status !== "Finished" &&
                                appointment.status !== "Meeting Finished" && (
                                  <button
                                    className="btn-action cancel"
                                    onClick={() => openCancelModal(appointment)}
                                    title="Cancel appointment"
                                  >
                                    <FiX />
                                  </button>
                                )}
                            </div>
                            {/* Row 2: View and WhatsApp buttons */}
                            <div className="actions-row">
                              <button
                                className="btn-action view-details"
                                onClick={() => {
                                  const id = appointment._id || appointment.id;
                                  setViewingAppointmentId((prev) => (prev === id ? null : id));
                                }}
                                title="View booking details"
                              >
                                <FiEye />
                              </button>
                              <button
                                className="btn-action whatsapp"
                                onClick={() => handleWhatsApp(appointment)}
                                title="Message on WhatsApp"
                              >
                                <FaWhatsapp />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                      {viewingAppointmentId === (appointment._id || appointment.id) && (
                        <tr className="order-details-row">
                          <td colSpan="8" className="order-details-cell">
                            <div className="inline-order-details">
                              <div className="inline-details-header">
                                <div className="inline-header-content">
                                  <FiCalendar className="inline-icon" />
                                  <h4 className="inline-title">
                                    Appointment Details - {appointment.farmerName}
                                  </h4>
                                </div>
                                <button
                                  className="inline-close-btn"
                                  type="button"
                                  onClick={() => setViewingAppointmentId(null)}
                                  title="Close details"
                                >
                                  ×
                                </button>
                              </div>

                              <div className="inline-details-content">
                                {/* Timeline */}
                                <div className="order-progress-path">
                                  {["Pending", "Approved", "Payment Paid / COD", "Confirmed", "Finished"].map(
                                    (label, idx) => {
                                      const status = appointment.status || "Pending";
                                      const paid =
                                        appointment.paymentStatus === "Paid" ||
                                        appointment.paymentStatus === "COD Collected";
                                      const isDone = (() => {
                                        if (label === "Pending") return true;
                                        if (label === "Approved")
                                          return ["Approved", "Confirmed", "Finished", "Meeting Finished"].includes(
                                            status
                                          );
                                        if (label === "Payment Paid / COD") return paid;
                                        if (label === "Confirmed")
                                          return ["Confirmed", "Finished", "Meeting Finished"].includes(status);
                                        if (label === "Finished")
                                          return status === "Finished" || status === "Meeting Finished";
                                        return false;
                                      })();

                                      return (
                                        <React.Fragment key={label}>
                                          <div className={`progress-step ${isDone ? "done" : ""}`}>
                                            <span className="progress-dot" />
                                            <span className="progress-label">{label}</span>
                                          </div>
                                          {idx < 4 && (
                                            <div className="progress-connector progress-connector--dotted" />
                                          )}
                                        </React.Fragment>
                                      );
                                    }
                                  )}

                                  {appointment.status === "Cancelled" && (
                                    <>
                                      <div className="progress-connector progress-connector--dotted" />
                                      <div className="progress-step done">
                                        <span className="progress-dot" />
                                        <span className="progress-label">Cancelled</span>
                                      </div>
                                    </>
                                  )}
                                </div>

                                {/* Booking Details */}
                                <div className="inline-section">
                                  <div className="inline-section-header">
                                    <FiCalendar className="inline-section-icon" />
                                    <h5>Booking Details</h5>
                                  </div>
                                  <div className="inline-details-grid">
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Farmer</span>
                                      <span className="inline-value">{appointment.farmerName}</span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Phone</span>
                                      <span className="inline-value">{appointment.mobile}</span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Email</span>
                                      <span className="inline-value">{appointment.email || "—"}</span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Type</span>
                                      <span className="inline-value">{appointment.consultationType}</span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Booked on</span>
                                      <span className="inline-value">
                                        {appointment.createdAt
                                          ? new Date(appointment.createdAt).toLocaleString()
                                          : getBookingDateTime(appointment)}
                                      </span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Location</span>
                                      <span className="inline-value">{appointment.location || "—"}</span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Crop / Farm</span>
                                      <span className="inline-value">
                                        {appointment.cropType || "—"} {appointment.farmSize ? `(${appointment.farmSize})` : ""}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Approval Details */}
                                <div className="inline-section">
                                  <div className="inline-section-header">
                                    <FiUserCheck className="inline-section-icon" />
                                    <h5>Approval Details</h5>
                                  </div>
                                  <div className="inline-details-grid">
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Approving admin</span>
                                      <span className="inline-value">{appointment.approvedByAdminName || "—"}</span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Conducting person</span>
                                      <span className="inline-value">{appointment.appointmentConductedBy || "—"}</span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Scheduled</span>
                                      <span className="inline-value">
                                        {appointment.scheduledDateTime ? new Date(appointment.scheduledDateTime).toLocaleString() : "—"}
                                      </span>
                                    </div>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem" }}>
                                    <button
                                      type="button"
                                      className="inline-download-btn"
                                      onClick={() => openApproveModal(appointment)}
                                    >
                                      Extend Schedule
                                    </button>
                                  </div>
                                </div>

                                {/* Confirmation Details */}
                                <div className="inline-section">
                                  <div className="inline-section-header">
                                    <FiCheck className="inline-section-icon" />
                                    <h5>Confirmation Details</h5>
                                  </div>
                                  <div className="inline-details-grid">
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Status</span>
                                      <span className="inline-value">{appointment.status}</span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Scheduled</span>
                                      <span className="inline-value">
                                        {appointment.scheduledDateTime ? new Date(appointment.scheduledDateTime).toLocaleString() : "—"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Payment Details */}
                                <div className="inline-section">
                                  <div className="inline-section-header">
                                    <FiMail className="inline-section-icon" />
                                    <h5>Payment Details</h5>
                                  </div>
                                  <div className="inline-details-grid">
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Payment status</span>
                                      <span className="inline-value">{appointment.paymentStatus || "Pending"}</span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Amount</span>
                                      <span className="inline-value">
                                        {typeof appointment.amount === "number" ? `₹${appointment.amount}` : "—"}
                                      </span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Payment date</span>
                                      <span className="inline-value">
                                        {appointment.paymentDate
                                          ? new Date(appointment.paymentDate).toLocaleString()
                                          : appointment.paymentData?.createdAt
                                            ? new Date(appointment.paymentData.createdAt).toLocaleString()
                                            : "—"}
                                      </span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Payment type</span>
                                      <span className="inline-value">
                                        {appointment.completionPaymentType ||
                                          (appointment.paymentStatus === "Paid"
                                            ? "Online"
                                            : appointment.paymentStatus === "COD Collected"
                                              ? "COD"
                                              : "—")}
                                      </span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Collected by</span>
                                      <span className="inline-value">{appointment.paymentCollectedBy || "—"}</span>
                                    </div>
                                    {appointment.paymentData?.razorpayPaymentId && (
                                      <div className="inline-detail-item inline-full-width">
                                        <span className="inline-label">Razorpay Payment ID</span>
                                        <span className="inline-value">
                                          <code>{appointment.paymentData.razorpayPaymentId}</code>
                                          <a
                                            href={`https://dashboard.razorpay.com/app/payments/${appointment.paymentData.razorpayPaymentId}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="razorpay-link"
                                            style={{ marginLeft: "0.5rem" }}
                                          >
                                            View in Razorpay
                                          </a>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Completion / Finished Details */}
                                <div className="inline-section">
                                  <div className="inline-section-header">
                                    <FiFlag className="inline-section-icon" />
                                    <h5>Completion / Finished Details</h5>
                                  </div>
                                  <div className="inline-details-grid">
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Conducted by</span>
                                      <span className="inline-value">
                                        {appointment.completionConductedBy || appointment.appointmentConductedBy || "—"}
                                      </span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Confirmed by</span>
                                      <span className="inline-value">{appointment.completionConfirmedBy || "—"}</span>
                                    </div>
                                  </div>
                                </div>

                                {appointment.status === "Cancelled" && (
                                  <div className="inline-section">
                                    <div className="inline-section-header">
                                      <FiX className="inline-section-icon" />
                                      <h5>Cancellation Details</h5>
                                    </div>
                                    <div className="inline-details-grid">
                                      <div className="inline-detail-item">
                                        <span className="inline-label">Cancelled by</span>
                                        <span className="inline-value">
                                          {appointment.cancelledBy || "—"}
                                        </span>
                                      </div>
                                      <div className="inline-detail-item">
                                        <span className="inline-label">Cancelled at</span>
                                        <span className="inline-value">
                                          {appointment.cancelledAt
                                            ? new Date(appointment.cancelledAt).toLocaleString()
                                            : "—"}
                                        </span>
                                      </div>
                                      <div className="inline-detail-item">
                                        <span className="inline-label">Refund transaction ID</span>
                                        <span className="inline-value">
                                          {appointment.refundTransactionId || "—"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {appointment.description && (
                                  <div className="inline-section">
                                    <div className="inline-section-header">
                                      <FiMail className="inline-section-icon" />
                                      <h5>Notes</h5>
                                    </div>
                                    <div className="inline-details-grid">
                                      <div className="inline-detail-item inline-full-width">
                                        <span className="inline-value">{appointment.description}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr className="no-results">
                    <td colSpan="8">
                      <div className="no-results-content">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
                          alt="No results"
                        />
                        <p>No appointments found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="table-footer">
            <div className="footer-info">
              Showing {indexOfFirstAppointment + 1}-
              {Math.min(indexOfLastAppointment, totalAppointments)} of {totalAppointments} appointments
            </div>
            <div className="pagination-controls">
              <button
                className={`page-btn prev ${currentPage === 1 ? "disabled" : ""}`}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FiChevronLeft /> Previous
              </button>
              {getPageNumbers().map((number, idx) =>
                number === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="page-btn disabled"
                    style={{ cursor: "default" }}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={number}
                    className={`page-btn ${currentPage === number ? "active" : ""}`}
                    onClick={() => setCurrentPage(number)}
                  >
                    {number}
                  </button>
                )
              )}
              <button
                className={`page-btn next ${currentPage === totalPages ? "disabled" : ""}`}
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showApproveModal && activeAppointment && (
        <div className="appointment-modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Approve Booking</h3>
            <p className="appointment-modal-subtitle">
              Fill the details before approving this{" "}
              {activeAppointment.consultationType} appointment.
            </p>
            <form onSubmit={submitApprove} className="appointment-modal-form">
              <label>
                Name of person conducting the appointment
                <input
                  type="text"
                  value={approveForm.conductedBy}
                  onChange={(e) =>
                    setApproveForm((f) => ({ ...f, conductedBy: e.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Scheduled date &amp; time
                <input
                  type="datetime-local"
                  value={approveForm.scheduledDateTime}
                  onChange={(e) =>
                    setApproveForm((f) => ({
                      ...f,
                      scheduledDateTime: e.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label>
                Name of approving admin
                <input
                  type="text"
                  value={approveForm.approvedBy}
                  onChange={(e) =>
                    setApproveForm((f) => ({ ...f, approvedBy: e.target.value }))
                  }
                  required
                />
              </label>
              <div className="appointment-modal-actions">
                <button
                  type="button"
                  className="modal-btn secondary"
                  onClick={() => setShowApproveModal(false)}
                >
                  Close
                </button>
                <button type="submit" className="modal-btn primary">
                  Approve Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCompleteModal && activeAppointment && (
        <div className="appointment-modal-overlay" onClick={() => setShowCompleteModal(false)}>
          <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {activeAppointment.consultationType === "Field Visit"
                ? "Complete Field Visit"
                : "Finish Phone Call"}
            </h3>
            <form onSubmit={submitComplete} className="appointment-modal-form">
              <label>
                Person who conducted the appointment
                <input
                  type="text"
                  value={completeForm.completionConductedBy}
                  onChange={(e) =>
                    setCompleteForm((f) => ({
                      ...f,
                      completionConductedBy: e.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label>
                Person confirming completion
                <input
                  type="text"
                  value={completeForm.completionConfirmedBy}
                  onChange={(e) =>
                    setCompleteForm((f) => ({
                      ...f,
                      completionConfirmedBy: e.target.value,
                    }))
                  }
                  required
                />
              </label>

              {activeAppointment.consultationType === "Field Visit" &&
                activeAppointment.paymentStatus !== "Paid" && (
                  <>
                    <label>
                      Who collected the payment
                      <input
                        type="text"
                        value={completeForm.paymentCollectedBy}
                        onChange={(e) =>
                          setCompleteForm((f) => ({
                            ...f,
                            paymentCollectedBy: e.target.value,
                          }))
                        }
                        required
                      />
                    </label>
                    <label>
                      Payment type
                      <select
                        value={completeForm.completionPaymentType}
                        onChange={(e) =>
                          setCompleteForm((f) => ({
                            ...f,
                            completionPaymentType: e.target.value,
                          }))
                        }
                      >
                        <option value="COD">COD</option>
                        <option value="Online">Online</option>
                      </select>
                    </label>
                  </>
                )}

              <div className="appointment-modal-actions">
                <button
                  type="button"
                  className="modal-btn secondary"
                  onClick={() => setShowCompleteModal(false)}
                >
                  Close
                </button>
                <button type="submit" className="modal-btn primary">
                  {activeAppointment.consultationType === "Field Visit"
                    ? "Mark Completed"
                    : "Mark Finished"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCancelModal && activeAppointment && (
        <div
          className="appointment-modal-overlay"
          onClick={() => setShowCancelModal(false)}
        >
          <div
            className="appointment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Cancel Appointment</h3>
            <form onSubmit={submitCancel} className="appointment-modal-form">
              <label>
                Who is cancelling this appointment?
                <input
                  type="text"
                  value={cancelForm.cancelledBy}
                  onChange={(e) =>
                    setCancelForm((f) => ({
                      ...f,
                      cancelledBy: e.target.value,
                    }))
                  }
                  required
                />
              </label>

              {activeAppointment.status === "Confirmed" &&
                (activeAppointment.paymentStatus === "Paid" ||
                  activeAppointment.paymentStatus === "COD Collected") && (
                  <label>
                    Refund transaction ID
                    <input
                      type="text"
                      value={cancelForm.refundTransactionId}
                      onChange={(e) =>
                        setCancelForm((f) => ({
                          ...f,
                          refundTransactionId: e.target.value,
                        }))
                      }
                      placeholder="e.g. rf_xxxx from Razorpay"
                    />
                  </label>
                )}

              {cancelError && (
                <div className="appointment-modal-subtitle" style={{ color: "#b91c1c" }}>
                  {cancelError}
                </div>
              )}

              <div className="appointment-modal-actions">
                <button
                  type="button"
                  className="modal-btn secondary"
                  onClick={() => setShowCancelModal(false)}
                >
                  Close
                </button>
                <button type="submit" className="modal-btn primary">
                  Confirm Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View is now inline under each row (like product orders) */}

      {showPaymentWarning && (
        <div
          className="appointment-modal-overlay"
          onClick={() => setShowPaymentWarning(false)}
        >
          <div
            className="appointment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Payment Pending</h3>
            <p className="appointment-modal-subtitle">
              {paymentWarningMessage}
            </p>
            <div className="appointment-modal-actions">
              <button
                type="button"
                className="modal-btn primary"
                onClick={() => setShowPaymentWarning(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointment;
