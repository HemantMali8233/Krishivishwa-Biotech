"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend, Tooltip
} from "recharts";
import './Admin.css';
import {
  FiShoppingCart, FiTrendingUp, FiTrendingDown, FiPackage, FiDollarSign, FiClock, FiEye, FiCalendar, FiFilter,
  FiPhone, FiChevronLeft, FiChevronRight, FiMapPin, FiMail, FiUser, FiBarChart2, FiPieChart, FiImage, FiCreditCard,
  FiX, FiCheck, FiGlobe, FiUserCheck, FiTruck, FiDownload
} from "react-icons/fi";
import { BsWhatsapp, BsCheckCircle, BsBoxSeam, BsGraphUp, BsCurrencyRupee } from "react-icons/bs";
import { MdDashboard, MdAgriculture, MdAnalytics, MdInventory } from "react-icons/md";

// === WhatsApp Message Language Selection Modal ===
const WhatsAppLanguageModal = ({ isOpen, onClose, onSelectLanguage, orderDetails }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="whatsapp-language-modal">
        <div className="modal-header">
          <h3>
            <BsWhatsapp className="whatsapp-icon" />
            Select Message Language
          </h3>
          <button onClick={onClose} className="modal-close-btn">
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          <div className="order-preview">
            <p><strong>Order:</strong> {orderDetails?.orderId}</p>
            <p><strong>Customer:</strong> {orderDetails?.customerInfo?.firstName} {orderDetails?.customerInfo?.lastName}</p>
          </div>

          <div className="language-buttons">
            <button
              onClick={() => onSelectLanguage('english')}
              className="language-btn english-btn"
            >
              <FiGlobe />
              English Message
            </button>
            <button
              onClick={() => onSelectLanguage('marathi')}
              className="language-btn marathi-btn"
            >
              🇮🇳
              मराठी संदेश (Marathi)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Assign Modal (pending → assigned) ===
const AssignModal = ({ isOpen, onClose, onConfirm, orderDetails, loading }) => {
  const [assignedTo, setAssignedTo] = useState('');
  const [assignedFrom, setAssignedFrom] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!assignedTo.trim()) { setError('Assigned to is required'); return; }
    if (!assignedFrom.trim()) { setError('Assigned from is required'); return; }
    if (assignedTo.trim().length < 2 || assignedFrom.trim().length < 2) {
      setError('Names must be at least 2 characters'); return;
    }
    onConfirm({ assignedTo: assignedTo.trim(), assignedFrom: assignedFrom.trim() });
  };

  const handleClose = () => {
    setAssignedTo('');
    setAssignedFrom('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="confirmation-modal">
        <div className="modal-header">
          <h3>Assign Order</h3>
          <button onClick={handleClose} className="modal-close-btn"><FiX /></button>
        </div>
        <div className="modal-body">
          <div className="order-info">
            <p><strong>Order ID:</strong> {orderDetails?.orderId}</p>
            <p><strong>Customer:</strong> {orderDetails?.customerInfo?.firstName} {orderDetails?.customerInfo?.lastName}</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Assigned To (Person who will deliver) *</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => { setAssignedTo(e.target.value); setError(''); }}
                placeholder="Name of person assigned to deliver"
                className={error ? 'error' : ''}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Assigned From (Your name / Admin) *</label>
              <input
                type="text"
                value={assignedFrom}
                onChange={(e) => { setAssignedFrom(e.target.value); setError(''); }}
                placeholder="Name of person assigning"
                className={error ? 'error' : ''}
                disabled={loading}
              />
            </div>
            {error && <span className="error-text">{error}</span>}
          </form>
        </div>
        <div className="modal-footer">
          <button onClick={handleClose} className="btn-cancel" disabled={loading}>Cancel</button>
          <button onClick={handleSubmit} className="btn-confirm" disabled={loading || !assignedTo.trim() || !assignedFrom.trim()}>
            {loading ? <><div className="spinner"></div> Updating...</> : <><FiCheck /> Mark as Assigned</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// === Deliver Modal (assigned → delivered) ===
const DeliverModal = ({ isOpen, onClose, onConfirm, orderDetails, loading }) => {
  const [deliveredBy, setDeliveredBy] = useState(orderDetails?.assignedTo || '');
  const [confirmedBy, setConfirmedBy] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (orderDetails?.assignedTo) setDeliveredBy(orderDetails.assignedTo);
  }, [orderDetails?.assignedTo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!deliveredBy.trim()) { setError('Delivered by is required'); return; }
    if (!confirmedBy.trim()) { setError('Confirmed by is required'); return; }
    onConfirm({ deliveredBy: deliveredBy.trim(), confirmedBy: confirmedBy.trim() });
  };

  const handleClose = () => {
    setConfirmedBy('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="confirmation-modal">
        <div className="modal-header">
          <h3>Mark as Delivered</h3>
          <button onClick={handleClose} className="modal-close-btn"><FiX /></button>
        </div>
        <div className="modal-body">
          <div className="order-info">
            <p><strong>Order ID:</strong> {orderDetails?.orderId}</p>
            <p><strong>Assigned to:</strong> {orderDetails?.assignedTo}</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Delivered By (Person who delivered) *</label>
              <input
                type="text"
                value={deliveredBy}
                onChange={(e) => { setDeliveredBy(e.target.value); setError(''); }}
                placeholder="Name of person who delivered"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Confirmed By (Your name / Admin) *</label>
              <input
                type="text"
                value={confirmedBy}
                onChange={(e) => { setConfirmedBy(e.target.value); setError(''); }}
                placeholder="Name of person confirming"
                className={error ? 'error' : ''}
                disabled={loading}
              />
            </div>
            {error && <span className="error-text">{error}</span>}
          </form>
        </div>
        <div className="modal-footer">
          <button onClick={handleClose} className="btn-cancel" disabled={loading}>Cancel</button>
          <button onClick={handleSubmit} className="btn-confirm" disabled={loading || !deliveredBy.trim() || !confirmedBy.trim()}>
            {loading ? <><div className="spinner"></div> Updating...</> : <><FiCheck /> Mark as Delivered</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// === Reject Modal (any → rejected, online requires refund ID) ===
const RejectModal = ({ isOpen, onClose, onConfirm, orderDetails, loading }) => {
  const [refundTransactionId, setRefundTransactionId] = useState('');
  const [error, setError] = useState('');
  const isOnline = orderDetails?.paymentMethod === 'online';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isOnline && !refundTransactionId.trim()) {
      setError('Refund Transaction ID is required for online payment orders');
      return;
    }
    onConfirm({ refundTransactionId: refundTransactionId.trim() || null });
  };

  const handleClose = () => {
    setRefundTransactionId('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="confirmation-modal">
        <div className="modal-header">
          <h3>Reject Order</h3>
          <button onClick={handleClose} className="modal-close-btn"><FiX /></button>
        </div>
        <div className="modal-body">
          <div className="order-info">
            <p><strong>Order ID:</strong> {orderDetails?.orderId}</p>
            <p><strong>Payment:</strong> {isOnline ? 'Online (Razorpay)' : 'Cash on Delivery'}</p>
          </div>
          {isOnline && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Refund Transaction ID *</label>
                <input
                  type="text"
                  value={refundTransactionId}
                  onChange={(e) => { setRefundTransactionId(e.target.value); setError(''); }}
                  placeholder="Razorpay refund transaction ID"
                  className={error ? 'error' : ''}
                  disabled={loading}
                />
                <small className="form-help">Refund must be processed before rejecting. Enter the refund transaction ID.</small>
              </div>
              {error && <span className="error-text">{error}</span>}
            </form>
          )}
          {!isOnline && <p className="form-help">COD order – no refund required. Proceeding will mark the order as rejected.</p>}
        </div>
        <div className="modal-footer">
          <button onClick={handleClose} className="btn-cancel" disabled={loading}>Cancel</button>
          <button
            onClick={handleSubmit}
            className="btn-confirm btn-reject"
            disabled={loading || (isOnline && !refundTransactionId.trim())}
          >
            {loading ? <><div className="spinner"></div> Rejecting...</> : <><FiX /> Reject Order</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// === Chart Tooltip ===
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-orders">
          <span className="tooltip-color orders-color"></span>
          {`Orders: ${payload[0]?.value || 0}`}
        </p>
        <p className="tooltip-earnings">
          <span className="tooltip-color earnings-color"></span>
          {`Earnings: ₹${payload[1]?.value?.toLocaleString() || 0}`}
        </p>
      </div>
    );
  }
  return null;
};

const apiBase = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api";

export default function AdminDashboard() {
  // === CONSTANTS ===
  const currentYear = new Date().getFullYear();
  const ordersPerPage = 5;

  // === SEPARATE STATES FOR DIFFERENT SECTIONS ===

  // Overall dashboard filters (affects stats and charts only)
  const [overallYear, setOverallYear] = useState(currentYear.toString()); // Auto-select current year
  const [chartView, setChartView] = useState("weekly");

  // Orders table specific filters (affects only the table)
  const [tableStatusFilter, setTableStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Data states
  const [allOrders, setAllOrders] = useState([]);
  const [tableOrders, setTableOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewingOrderId, setViewingOrderId] = useState(null);

  // Loading states
  const [statsLoading, setStatsLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);

  // Orders table filters
  const [tableSearch, setTableSearch] = useState("");
  const [tableFromDate, setTableFromDate] = useState("");
  const [tableToDate, setTableToDate] = useState("");
  const [isFilterPanelCollapsed, setIsFilterPanelCollapsed] = useState(false);

  // Modal states

  const [whatsappModal, setWhatsappModal] = useState({
    isOpen: false,
    orderDetails: null
  });
  const [assignModal, setAssignModal] = useState({ isOpen: false, orderDetails: null, loading: false });
  const [deliverModal, setDeliverModal] = useState({ isOpen: false, orderDetails: null, loading: false });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, orderDetails: null, loading: false });
  const [refundState, setRefundState] = useState({ orderId: null, value: '', loading: false, error: null });

  const handleRecordRefund = async (order) => {
    const val = refundState.value?.trim();
    if (!val) return;
    setRefundState(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await axios.patch(`${apiBase}/orders/refund/${order._id}`, { refundTransactionId: val });
      if (res.data.success) {
        const updatedOrder = res.data.order;
        setAllOrders(prev => prev.map(o => o._id === order._id ? updatedOrder : o));
        setTableOrders(prev => prev.map(o => o._id === order._id ? updatedOrder : o));
        if (selectedOrder?._id === order._id) setSelectedOrder(updatedOrder);
        setRefundState({ orderId: null, value: '', loading: false, error: null });
        
        // Show success message with verification details
        if (res.data.verification?.verified) {
          alert(`✅ Refund verified!\n\nRefund ID: ${res.data.verification.refundId}\nAmount: ₹${res.data.verification.refundAmount}\nStatus: ${res.data.verification.refundStatus}\n\nRefund has been recorded successfully.`);
        } else {
          alert('Refund recorded successfully.');
        }
      } else throw new Error(res.data.message);
    } catch (err) {
      setRefundState(s => ({ ...s, loading: false, error: err.response?.data?.message || err.message }));
    }
  };

  // === GENERATE WHATSAPP MESSAGE (status-based) ===
  const generateWhatsAppMessage = (order, language = 'english') => {
    const customerName = `${order.customerInfo?.firstName} ${order.customerInfo?.lastName}`;
    const orderDate = new Date(order.orderDate).toLocaleDateString('en-IN');
    const paymentMethod = order.paymentMethod === 'online' ? 'Online Payment (Razorpay)' : 'Cash on Delivery';

    const productsList = order.items?.map((item, index) => {
      if (language === 'marathi') {
        return `${index + 1}. ${item.name || item.title}\n   मात्रा: ${item.quantity}\n   किंमत: ₹${item.price}\n   एकूण: ₹${item.quantity * item.price}`;
      } else {
        return `${index + 1}. ${item.name || item.title}\n   Qty: ${item.quantity}\n   Price: ₹${item.price}\n   Total: ₹${item.quantity * item.price}`;
      }
    }).join('\n\n') || '';

    const addressLine = `${order.customerInfo?.address}, ${order.customerInfo?.city}, ${order.customerInfo?.state} - ${order.customerInfo?.zipCode}`;
    const totalAmount = `₹${order.pricing?.total?.toLocaleString() || '0'}`;

    const statusMessages = {
      pending: {
        en: `🙏 Hello ${customerName},\n\n🏪 *Krishivishwa Biotech* - Order Received!\n\n📋 Order ID: ${order.orderId}\n📅 Order Date: ${orderDate}\n📦 Status: *Pending*\n\n🛍️ *Products:*\n${productsList}\n\n💰 Total: ${totalAmount}\n📍 Address: ${addressLine}\n\nWe will assign your order soon. Thank you! 🙏`,
        mr: `🙏 नमस्कार ${customerName},\n\n🏪 *कृषिविश्व बायोटेक* - ऑर्डर प्राप्त!\n\n📋 ऑर्डर आयडी: ${order.orderId}\n📅 दिनांक: ${orderDate}\n📦 स्थिती: *लंबित*\n\n🛍️ *उत्पादने:*\n${productsList}\n\n💰 एकूण: ${totalAmount}\n📍 पत्ता: ${addressLine}\n\nलवकरच असाइन केले जाईल. धन्यवाद! 🙏`
      },
      assigned: {
        en: `🙏 Hello ${customerName},\n\n🏪 *Krishivishwa Biotech*\n\n📋 Order ID: ${order.orderId}\n📦 Status: *Assigned*\n\n👤 Assigned to: *${order.assignedTo || 'Our team'}*\n\nYour order is on the way. Thank you! 🙏`,
        mr: `🙏 नमस्कार ${customerName},\n\n🏪 *कृषिविश्व बायोटेक*\n\n📋 ऑर्डर आयडी: ${order.orderId}\n📦 स्थिती: *असाइन केले*\n\n👤 असाइन केले: *${order.assignedTo || 'आमची टीम'}*\n\nऑर्डर मार्गावर आहे. धन्यवाद! 🙏`
      },
      delivered: {
        en: `🙏 Hello ${customerName},\n\n🏪 *Krishivishwa Biotech*\n\n📦 Your order *${order.orderId}* has been *Delivered*!\n\nThank you for choosing us. 🙏`,
        mr: `🙏 नमस्कार ${customerName},\n\n🏪 *कृषिविश्व बायोटेक*\n\n📦 तुमचा ऑर्डर *${order.orderId}* *डिलिव्हर* झाला!\n\nआम्हाला निवडल्याबद्दल धन्यवाद. 🙏`
      },
      rejected: {
        en: order.paymentMethod === 'online'
          ? `🙏 Hello ${customerName},\n\n🏪 *Krishivishwa Biotech*\n\n❌ Order *${order.orderId}* has been cancelled.\n\n${order.refundTransactionId ? `💰 Refund Transaction ID: ${order.refundTransactionId}\n\nThe amount has been refunded.` : '💰 Your money will be refunded in 2-3 business days.'}\n\nWe apologize for any inconvenience. 🙏`
          : `🙏 Hello ${customerName},\n\n🏪 *Krishivishwa Biotech*\n\n❌ Order *${order.orderId}* has been cancelled.\n\nWe apologize for any inconvenience. 🙏`,
        mr: order.paymentMethod === 'online'
          ? `🙏 नमस्कार ${customerName},\n\n🏪 *कृषिविश्व बायोटेक*\n\n❌ ऑर्डर *${order.orderId}* रद्द झाला.\n\n${order.refundTransactionId ? `💰 रिफंड ट्रान्झॅक्शन ID: ${order.refundTransactionId}\n\nरक्कम परत केली गेली.` : '💰 तुमची रक्कम 2-3 कार्यदिवसांत परत केली जाईल.'}\n\nअडचणीसाठी क्षमा करा. 🙏`
          : `🙏 नमस्कार ${customerName},\n\n🏪 *कृषिविश्व बायोटेक*\n\n❌ ऑर्डर *${order.orderId}* रद्द झाला.\n\nअडचणीसाठी क्षमा करा. 🙏`
      },
      cancelled: {
        en: order.cancelledByUser
          ? (order.paymentMethod === 'online'
            ? `🙏 Hello ${customerName},\n\n🏪 *Krishivishwa Biotech*\n\n❌ Your order *${order.orderId}* has been cancelled.\n\n${order.refundTransactionId ? `💰 Refund ID: ${order.refundTransactionId}` : '💰 Refund will be processed in 2-3 days.'}\n\n🙏`
            : `🙏 Hello ${customerName},\n\n🏪 *Krishivishwa Biotech*\n\n❌ Your order *${order.orderId}* has been cancelled.\n\n🙏`)
          : `🙏 Hello ${customerName},\n\n🏪 *Krishivishwa Biotech*\n\n❌ Order *${order.orderId}* has been cancelled.\n\n🙏`,
        mr: `🙏 नमस्कार ${customerName},\n\n🏪 *कृषिविश्व बायोटेक*\n\n❌ ऑर्डर *${order.orderId}* रद्द झाला.\n\n🙏`
      }
    };

    const msgMap = statusMessages[order.status] || statusMessages.pending;
    const text = language === 'marathi' ? msgMap.mr : msgMap.en;
    return text;
  };

  // === FETCH ALL ORDERS FOR STATS AND CHARTS ===
  const fetchAllOrders = async () => {
    setStatsLoading(true);
    try {
      const params = {
        limit: 1000,
        sortBy: 'orderDate',
        sortOrder: 'desc'
      };

      if (overallYear !== "all") params.year = overallYear;

      const response = await axios.get(`${apiBase}/orders`, { params });

      if (response.data.success) {
        setAllOrders(response.data.orders || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching all orders:', err);
      setAllOrders([]);
    } finally {
      // Add small delay to show spinner
      setTimeout(() => {
        setStatsLoading(false);
      }, 300);
    }
  };

  // === FETCH PAGINATED ORDERS FOR TABLE ===
  const fetchTableOrders = async () => {
    setTableLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: ordersPerPage,
        sortBy: 'orderDate',
        sortOrder: 'desc'
      };

      if (tableSearch?.trim()) params.search = tableSearch.trim();
      if (tableFromDate) params.fromDate = tableFromDate;
      if (tableToDate) params.toDate = tableToDate;

      if (tableStatusFilter === "cancelled_cod") {
        params.status = "cancelled";
        params.paymentMethod = "cod";
      } else if (tableStatusFilter === "cancelled_online_pending") {
        params.status = "cancelled";
        params.paymentMethod = "online";
        params.pendingRefund = "1";
      } else if (tableStatusFilter === "cancelled_online_refunded") {
        params.status = "cancelled";
        params.paymentMethod = "online";
        params.hasRefund = "1";
      } else if (tableStatusFilter === "cancelled_all") {
        params.status = "cancelled";
      } else if (tableStatusFilter !== "all") {
        params.status = tableStatusFilter;
      }

      const response = await axios.get(`${apiBase}/orders`, { params });

      if (response.data.success) {
        setTableOrders(response.data.orders || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalOrders(response.data.pagination?.totalOrders || 0);
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching table orders:', err);
      setError(err.message || 'Failed to fetch orders');
      setTableOrders([]);
      setTotalPages(1);
      setTotalOrders(0);
    } finally {
      setTableLoading(false);
    }
  };

  // === EFFECTS ===
  useEffect(() => {
    fetchAllOrders();
  }, [overallYear]);

  useEffect(() => {
    fetchTableOrders();
  }, [tableStatusFilter, currentPage, tableSearch, tableFromDate, tableToDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [tableStatusFilter, tableSearch, tableFromDate, tableToDate]);

  // === CALCULATE STATS FROM ALL ORDERS ===
  const stats = useMemo(() => {
    if (!allOrders.length) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        pendingCount: 0,
        assignedCount: 0,
        deliveredOrders: 0,
        deliveredCount: 0,
        rejectedCount: 0,
        pendingRefunds: 0,
        cancelledOrders: 0,
        codCancelled: 0,
        onlineCancelledPending: 0,
        onlineCancelledRefunded: 0,
        totalRevenue: 0,
        revenueChange: 0,
        mostSoldProduct: "No data"
      };
    }

    const totalOrdersCount = allOrders.length;
    const pendingOrders = allOrders.filter(o => ['pending', 'assigned'].includes(o.status)).length;
    const pendingCount = allOrders.filter(o => o.status === 'pending').length;
    const assignedCount = allOrders.filter(o => o.status === 'assigned').length;
    const deliveredOrders = allOrders.filter(o => o.status === "delivered").length;
    const deliveredCount = deliveredOrders;
    const rejectedCount = allOrders.filter(o => o.status === 'rejected').length;
    const totalRevenue = allOrders
      .filter(o => !['cancelled', 'rejected'].includes(o.status))
      .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

    const previousRevenue = totalRevenue * 0.85;
    const revenueChange = previousRevenue === 0 ? 0 : (((totalRevenue - previousRevenue) / previousRevenue) * 100);

    const productCounts = {};
    allOrders.filter(o => !['cancelled', 'rejected'].includes(o.status)).forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const productName = item.name || item.title || 'Unknown Product';
          productCounts[productName] = (productCounts[productName] || 0) + (item.quantity || 0);
        });
      }
    });

    const mostSoldProduct = Object.keys(productCounts).length > 0
      ? Object.keys(productCounts).reduce((a, b) => (productCounts[a] > productCounts[b] ? a : b))
      : "No data";

    const cancelledOrders = allOrders.filter(o => o.status === 'cancelled');
    const codCancelled = cancelledOrders.filter(o => o.paymentMethod === 'cod').length;
    const onlineCancelledPending = cancelledOrders.filter(
      o => o.paymentMethod === 'online' && !(o.refundTransactionId && o.refundTransactionId.trim())
    ).length;
    const onlineCancelledRefunded = cancelledOrders.filter(
      o => o.paymentMethod === 'online' && o.refundTransactionId && o.refundTransactionId.trim()
    ).length;
    
    const pendingRefunds = allOrders.filter(
      o => ['cancelled', 'rejected'].includes(o.status) && o.paymentMethod === 'online' && !(o.refundTransactionId && o.refundTransactionId.trim())
    ).length;

    return {
      totalOrders: totalOrdersCount,
      pendingOrders,
      pendingCount,
      assignedCount,
      deliveredOrders,
      deliveredCount,
      rejectedCount,
      pendingRefunds,
      cancelledOrders: cancelledOrders.length,
      codCancelled,
      onlineCancelledPending,
      onlineCancelledRefunded,
      totalRevenue,
      revenueChange: Number.parseFloat(revenueChange.toFixed(1)),
      mostSoldProduct
    };
  }, [allOrders]);

  // === WEEKLY CHART DATA - CURRENT WEEK (Mon-Sun) ===
  const weeklyData = useMemo(() => {
    const weekAgg = [
      { name: "Mon", orders: 0, earnings: 0 },
      { name: "Tue", orders: 0, earnings: 0 },
      { name: "Wed", orders: 0, earnings: 0 },
      { name: "Thu", orders: 0, earnings: 0 },
      { name: "Fri", orders: 0, earnings: 0 },
      { name: "Sat", orders: 0, earnings: 0 },
      { name: "Sun", orders: 0, earnings: 0 },
    ];

    // Map JS getDay() (0=Sun,1=Mon,...6=Sat) to weekAgg index (0=Mon,...6=Sun)
    const dayMapping = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };

    // Compute Monday 00:00:00 and Sunday 23:59:59 of the current week
    // without mutating any Date objects
    const today = new Date();
    const dow = today.getDay(); // 0=Sun … 6=Sat
    const mondayOffset = dow === 0 ? -6 : 1 - dow; // days to subtract to reach Monday

    const weekStart = new Date(
      today.getFullYear(), today.getMonth(), today.getDate() + mondayOffset,
      0, 0, 0, 0
    );
    const weekEnd = new Date(
      weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6,
      23, 59, 59, 999
    );

    // Aggregate orders that fall within this week
    allOrders.forEach(order => {
      const orderDate = new Date(order.orderDate);
      if (orderDate >= weekStart && orderDate <= weekEnd) {
        if (overallYear === "all" || orderDate.getFullYear().toString() === overallYear) {
          const mappedIndex = dayMapping[orderDate.getDay()];
          if (mappedIndex !== undefined) {
            weekAgg[mappedIndex].orders += 1;
            weekAgg[mappedIndex].earnings += order.pricing?.total || 0;
          }
        }
      }
    });

    return weekAgg;
  }, [allOrders, overallYear]);

  // === MONTHLY CHART DATA - CURRENT MONTH ONLY ===
  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthAgg = months.map(month => ({ name: month, orders: 0, earnings: 0 }));

    const now = new Date();
    const currentYear = overallYear === "all" ? now.getFullYear() : parseInt(overallYear);
    const currentMonth = overallYear === "all" ? now.getMonth() : now.getMonth();

    // Filter orders for current month only
    allOrders.forEach(order => {
      const orderDate = new Date(order.orderDate);
      const orderYear = orderDate.getFullYear();
      const orderMonth = orderDate.getMonth();

      // Only include orders from current month of selected year
      if ((overallYear === "all" || orderYear.toString() === overallYear) && orderMonth === currentMonth) {
        monthAgg[orderMonth].orders += 1;
        monthAgg[orderMonth].earnings += order.pricing?.total || 0;
      }
    });

    return monthAgg;
  }, [allOrders, overallYear]);

  // === HANDLE STATUS FLOW ===
  const handleAssignClick = (order) => {
    setAssignModal({ isOpen: true, orderDetails: order, loading: false });
  };

  const handleAssignConfirm = async (data) => {
    setAssignModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await axios.patch(`${apiBase}/orders/update-status/${assignModal.orderDetails._id}`, {
        newStatus: 'assigned',
        assignedTo: data.assignedTo,
        assignedFrom: data.assignedFrom
      });
      if (res.data.success) {
        const updatedOrder = res.data.order;
        setAllOrders(prev => prev.map(o => o._id === assignModal.orderDetails._id ? updatedOrder : o));
        setTableOrders(prev => prev.map(o => o._id === assignModal.orderDetails._id ? updatedOrder : o));
        if (selectedOrder?._id === assignModal.orderDetails._id) setSelectedOrder(updatedOrder);
        setAssignModal({ isOpen: false, orderDetails: null, loading: false });
        // Auto-send WhatsApp message
        autoSendWhatsApp(updatedOrder);
      } else {
        alert(res.data.message || 'Failed');
        setAssignModal(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
      setAssignModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeliverClick = (order) => {
    setDeliverModal({ isOpen: true, orderDetails: order, loading: false });
  };

  const handleDeliverConfirm = async (data) => {
    setDeliverModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await axios.patch(`${apiBase}/orders/update-status/${deliverModal.orderDetails._id}`, {
        newStatus: 'delivered',
        deliveredBy: data.deliveredBy,
        confirmedBy: data.confirmedBy
      });
      if (res.data.success) {
        const updatedOrder = res.data.order;
        setAllOrders(prev => prev.map(o => o._id === deliverModal.orderDetails._id ? updatedOrder : o));
        setTableOrders(prev => prev.map(o => o._id === deliverModal.orderDetails._id ? updatedOrder : o));
        if (selectedOrder?._id === deliverModal.orderDetails._id) setSelectedOrder(updatedOrder);
        setDeliverModal({ isOpen: false, orderDetails: null, loading: false });
        // Auto-send WhatsApp message
        autoSendWhatsApp(updatedOrder);
      } else {
        alert(res.data.message || 'Failed');
        setDeliverModal(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
      setDeliverModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleRejectClick = (order) => {
    setRejectModal({ isOpen: true, orderDetails: order, loading: false });
  };

  const handleRejectConfirm = async (data) => {
    setRejectModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await axios.patch(`${apiBase}/orders/update-status/${rejectModal.orderDetails._id}`, {
        newStatus: 'rejected',
        refundTransactionId: data.refundTransactionId || null
      });
      if (res.data.success) {
        const updatedOrder = res.data.order;
        setAllOrders(prev => prev.map(o => o._id === rejectModal.orderDetails._id ? updatedOrder : o));
        setTableOrders(prev => prev.map(o => o._id === rejectModal.orderDetails._id ? updatedOrder : o));
        if (selectedOrder?._id === rejectModal.orderDetails._id) setSelectedOrder(updatedOrder);
        setRejectModal({ isOpen: false, orderDetails: null, loading: false });
        // Auto-send WhatsApp message
        autoSendWhatsApp(updatedOrder);
      } else {
        alert(res.data.message || 'Failed');
        setRejectModal(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
      setRejectModal(prev => ({ ...prev, loading: false }));
    }
  };


  // === HANDLE WHATSAPP CLICK WITH LANGUAGE SELECTION ===
  const handleWhatsAppClick = (order) => {
    setWhatsappModal({
      isOpen: true,
      orderDetails: order
    });
  };

  const handleWhatsAppLanguageSelect = (language) => {
    const order = whatsappModal.orderDetails;
    const message = generateWhatsAppMessage(order, language);
    const cleanPhone = order.customerInfo?.phone.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
    setWhatsappModal({ isOpen: false, orderDetails: null });
  };

  // Auto-send WhatsApp message on status change (defaults to English)
  const autoSendWhatsApp = (order, language = 'english') => {
    try {
      const message = generateWhatsAppMessage(order, language);
      const cleanPhone = order.customerInfo?.phone?.replace(/[^0-9]/g, "");
      if (cleanPhone && cleanPhone.length >= 10) {
        const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
        // Open in new tab silently (user can close if needed)
        window.open(whatsappUrl, "_blank");
      }
    } catch (err) {
      console.error('Error auto-sending WhatsApp:', err);
      // Don't block the status update if WhatsApp fails
    }
  };

  // Generate and download invoice PDF
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

  const handleCloseWhatsApp = () => {
    setWhatsappModal({ isOpen: false, orderDetails: null });
  };

  // === PAGINATION LOGIC ===
  const getPaginationNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const handlePageChange = (page) => {
    if (typeof page === 'number' && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // === VIEW ORDER DETAILS ===
  const handleViewOrder = (order) => {
    if (viewingOrderId === order._id) {
      setViewingOrderId(null);
      setSelectedOrder(null);
    } else {
      setViewingOrderId(order._id);
      setSelectedOrder(order);
    }
  };

  const startIndex = (currentPage - 1) * ordersPerPage;

  return (
    <div className="dashboard-container">

      <AssignModal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal({ isOpen: false, orderDetails: null, loading: false })}
        onConfirm={handleAssignConfirm}
        orderDetails={assignModal.orderDetails}
        loading={assignModal.loading}
      />
      <DeliverModal
        isOpen={deliverModal.isOpen}
        onClose={() => setDeliverModal({ isOpen: false, orderDetails: null, loading: false })}
        onConfirm={handleDeliverConfirm}
        orderDetails={deliverModal.orderDetails}
        loading={deliverModal.loading}
      />
      <RejectModal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, orderDetails: null, loading: false })}
        onConfirm={handleRejectConfirm}
        orderDetails={rejectModal.orderDetails}
        loading={rejectModal.loading}
      />
      {/* WhatsApp Language Selection Modal */}
      <WhatsAppLanguageModal
        isOpen={whatsappModal.isOpen}
        orderDetails={whatsappModal.orderDetails}
        onClose={handleCloseWhatsApp}
        onSelectLanguage={handleWhatsAppLanguageSelect}
      />

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="brand-icon">
            <MdAgriculture className="icon" />
          </div>
          <div>
            <h1 className="main-title">Krishivishwa Dashboard</h1>
            <p className="dashboard-subtitle">Agricultural Business Management System</p>
          </div>
          <div className="header-stats">
            <div className="header-stat">
              <MdAnalytics className="header-stat-icon" />
              <span>Analytics</span>
            </div>
            <div className="header-stat">
              <MdInventory className="header-stat-icon" />
              <span>Inventory</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Dashboard Filter */}
      <div className="filter-section">
        <div className="filter-content">
          <div className="calendar-icon">
            <FiCalendar className="icon" />
          </div>
          <div>
            <label className="filter-label">Dashboard Year Filter</label>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <select
                value={overallYear}
                onChange={e => setOverallYear(e.target.value)}
                className="year-select"
                disabled={statsLoading}
              >
                <option value="all">All Years</option>
                {Array.from({ length: 3000 - 2024 + 1 }, (_, idx) => {
                  const yearOption = (2024 + idx).toString();
                  return (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  );
                })}
              </select>
              {statsLoading && (
                <div className="year-select-spinner">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="year-badge">
          <MdDashboard className="year-badge-icon" />
          Dashboard showing data for {overallYear === "all" ? "all years" : overallYear}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-card-green">
          <div className="stat-header">
            <h3 className="stat-title">Total Orders</h3>
            <div className="stat-icon stat-icon-green">
              <FiShoppingCart className="icon" />
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {statsLoading ? "Loading..." : stats.totalOrders}
            </div>
            <div className="stat-trend">
              <FiTrendingUp className="trend-icon" />
              <span>+12% from last month</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-emerald">
          <div className="stat-header">
            <h3 className="stat-title">Most Sold Product</h3>
            <div className="stat-icon stat-icon-emerald">
              <BsBoxSeam className="icon" />
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-product">
              {statsLoading ? "Loading..." : stats.mostSoldProduct}
            </div>
            <div className="stat-badge">
              <BsGraphUp className="stat-badge-icon" />
              <span>Top performing item</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-teal">
          <div className="stat-header">
            <h3 className="stat-title">Revenue vs Previous</h3>
            <div className="stat-icon stat-icon-teal">
              <BsCurrencyRupee className="icon" />
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {statsLoading ? "Loading..." : `₹${stats.totalRevenue.toLocaleString()}`}
            </div>
            <div className="stat-trend">
              {stats.revenueChange >= 0 ? (
                <>
                  <FiTrendingUp className="trend-icon" />
                  <span>+{stats.revenueChange}%</span>
                </>
              ) : (
                <>
                  <FiTrendingDown className="trend-icon" />
                  <span>{stats.revenueChange}%</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-amber">
          <div className="stat-header">
            <h3 className="stat-title">Pending Orders</h3>
            <div className="stat-icon stat-icon-amber">
              <FiClock className="icon" />
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {statsLoading ? "Loading..." : stats.pendingOrders}
            </div>
            <div className="stat-badge">
              <FiClock className="stat-badge-icon" />
              <span>Awaiting processing</span>
            </div>
          </div>
        </div>

        <div 
          className={`stat-card stat-card-refund ${stats.pendingRefunds > 0 ? 'stat-card-refund--alert' : ''}`}
          onClick={() => stats.pendingRefunds > 0 && setTableStatusFilter('pending_refunds')}
          role={stats.pendingRefunds > 0 ? 'button' : undefined}
          title={stats.pendingRefunds > 0 ? 'Click to view orders needing refund' : ''}
        >
          <div className="stat-header">
            <h3 className="stat-title">Pending Refunds</h3>
            <div className="stat-icon stat-icon-refund">
              <FiDollarSign className="icon" />
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {statsLoading ? "..." : stats.pendingRefunds}
            </div>
            <div className="stat-badge">
              <span>Online cancelled/rejected – record refund ID</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title-section">
            <div>
              <h3 className="chart-title">
                <FiBarChart2 className="chart-title-icon" />
                Sales Analytics
              </h3>
              <p className="chart-description">
                Orders count and earnings overview {statsLoading && "(Loading...)"}
              </p>
            </div>
            <div className="chart-buttons">
              <button
                onClick={() => setChartView("weekly")}
                className={chartView === "weekly" ? "chart-btn-active" : "chart-btn-outline"}
              >
                <FiCalendar className="chart-btn-icon" />
                Weekly
              </button>
              <button
                onClick={() => setChartView("monthly")}
                className={chartView === "monthly" ? "chart-btn-active" : "chart-btn-outline"}
              >
                <FiPieChart className="chart-btn-icon" />
                Monthly
              </button>
            </div>
          </div>
        </div>
        <div className="chart-content">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartView === "weekly" ? weeklyData : monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#374151" fontSize={12} fontWeight={500} />
                <YAxis yAxisId="left" stroke="#374151" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#374151" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  yAxisId="left"
                  dataKey="orders"
                  fill="#16a34a"
                  name="Orders"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="earnings"
                  fill="#10b981"
                  name="Earnings (₹)"
                  radius={[4, 4, 0, 0]}
                />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="orders-card">
        <div className="orders-header">
          <div className="orders-title-section">
            <div>
              <h3 className="orders-title">
                <FiPackage className="orders-title-icon" />
                Product Orders
              </h3>
              <p className="orders-description">
                Manage and track all customer orders
                {tableLoading && " (Loading...)"}
              </p>
            </div>
            <div className="orders-header-tools">
              <div className="orders-search">
                <FiFilter className="orders-search-icon" />
                <input
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="orders-search-input"
                  placeholder="Search orderId / name / email / phone"
                />
              </div>
              <div className="orders-date-range">
                <div className="orders-date-field">
                  <label>From</label>
                  <input type="date" value={tableFromDate} onChange={(e) => setTableFromDate(e.target.value)} />
                </div>
                <div className="orders-date-field">
                  <label>To</label>
                  <input type="date" value={tableToDate} onChange={(e) => setTableToDate(e.target.value)} />
                </div>
              </div>
              <button
                type="button"
                className="orders-refresh-btn"
                onClick={fetchTableOrders}
                disabled={tableLoading}
                title="Refresh orders"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="orders-content orders-content--with-panel">
          {/* Filter panel (collapsible) */}
          <aside className={`orders-filter-panel ${isFilterPanelCollapsed ? 'collapsed' : ''}`}>
            <div className="filter-panel-header">
              <h4>Filters</h4>
              <button
                type="button"
                className="filter-panel-collapse-btn"
                onClick={() => setIsFilterPanelCollapsed(v => !v)}
                title={isFilterPanelCollapsed ? 'Expand filters' : 'Collapse filters'}
              >
                {isFilterPanelCollapsed ? '›' : '‹'}
              </button>
            </div>

            {!isFilterPanelCollapsed && (
              <>
                <div className="filter-panel-section">
                  <p className="filter-panel-section-title">Order status</p>
                  <button type="button" className={`filter-row ${tableStatusFilter === 'all' ? 'active' : ''}`} onClick={() => setTableStatusFilter('all')}>
                    <span>All orders</span>
                    <span className="count-badge">{stats.totalOrders}</span>
                  </button>
                  <button type="button" className={`filter-row ${tableStatusFilter === 'pending' ? 'active' : ''}`} onClick={() => setTableStatusFilter('pending')}>
                    <span>Pending</span>
                    <span className="count-badge">{stats.pendingCount}</span>
                  </button>
                  <button type="button" className={`filter-row ${tableStatusFilter === 'assigned' ? 'active' : ''}`} onClick={() => setTableStatusFilter('assigned')}>
                    <span>Assigned</span>
                    <span className="count-badge">{stats.assignedCount}</span>
                  </button>
                  <button type="button" className={`filter-row success ${tableStatusFilter === 'delivered' ? 'active' : ''}`} onClick={() => setTableStatusFilter('delivered')}>
                    <span>Delivered</span>
                    <span className="count-badge">{stats.deliveredCount}</span>
                  </button>
                  <button type="button" className={`filter-row warn ${tableStatusFilter === 'rejected' ? 'active' : ''}`} onClick={() => setTableStatusFilter('rejected')}>
                    <span>Rejected</span>
                    <span className="count-badge">{stats.rejectedCount}</span>
                  </button>
                  <button type="button" className={`filter-row ${tableStatusFilter === 'cancelled_all' ? 'active' : ''}`} onClick={() => setTableStatusFilter('cancelled_all')}>
                    <span>Cancelled</span>
                    <span className="count-badge">{stats.cancelledOrders}</span>
                  </button>
                </div>

                <div className="filter-panel-section">
                  <p className="filter-panel-section-title">Cancelled orders</p>
                  <button type="button" className={`filter-row ${tableStatusFilter === 'cancelled_cod' ? 'active' : ''}`} onClick={() => setTableStatusFilter('cancelled_cod')}>
                    <span>COD cancelled</span>
                    <span className="count-badge">{stats.codCancelled}</span>
                  </button>
                  <button type="button" className={`filter-row warn ${tableStatusFilter === 'cancelled_online_pending' ? 'active' : ''}`} onClick={() => setTableStatusFilter('cancelled_online_pending')}>
                    <span>Online pending refund</span>
                    <span className="count-badge">{stats.onlineCancelledPending}</span>
                  </button>
                  <button type="button" className={`filter-row success ${tableStatusFilter === 'cancelled_online_refunded' ? 'active' : ''}`} onClick={() => setTableStatusFilter('cancelled_online_refunded')}>
                    <span>Online refunded</span>
                    <span className="count-badge">{stats.onlineCancelledRefunded}</span>
                  </button>
                </div>
              </>
            )}
          </aside>

          <div className="orders-table-wrap">
          {error && (
            <div className="error-message">
              <p>Error: {error}</p>
              <button onClick={fetchTableOrders} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          {!error && (
            <div className="table-container">
              <table className="orders-table">
                <thead className="table-header">
                  <tr className="header-row">
                    <th className="table-th">Order ID</th>
                    <th className="table-th">Customer</th>
                    <th className="table-th">Location</th>
                    <th className="table-th">Product</th>
                    <th className="table-th">Total Price</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tableOrders.map((order, index) => (
                    <React.Fragment key={order._id}>
                      <tr className={`table-row ${index % 2 === 0 ? "row-even" : "row-odd"}`}>
                        <td className="table-td">
                          <div className="order-id">{order.orderId}</div>
                          <div className="order-date">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </div>
                          <div className="order-time">
                            {new Date(order.orderDate).toLocaleTimeString()}
                          </div>
                        </td>

                        <td className="table-td">
                          <div className="customer-name">
                            <FiUser className="customer-icon" />
                            {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                          </div>
                          <div className="customer-email">
                            <FiMail className="customer-icon" />
                            {order.customerInfo?.email}
                          </div>
                          <div className="customer-phone">
                            <FiPhone className="customer-icon" />
                            {order.customerInfo?.phone}
                          </div>
                        </td>
                        <td className="table-td">
                          <div className="location">

                            {order.customerInfo?.city}, {order.customerInfo?.state}
                          </div>
                          <div className="zipcode">{order.customerInfo?.zipCode}</div>
                        </td>
                        <td className="table-td">
                          <div className="product-info">
                            {order.items && order.items.length > 0 ? (
                              <>
                                <div className="product-name">
                                  {order.items[0].name || order.items.title}
                                </div>
                                <div className="product-details">
                                  Qty: {order.items[0].quantity} × ₹{order.items.price}
                                </div>
                                <div className="product-category">{order.items[0].category}</div>
                                {order.items.length > 1 && (
                                  <div className="more-items">
                                    +{order.items.length - 1} more item(s)
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="product-name">No items</div>
                            )}
                          </div>
                        </td>
                        <td className="table-td">
                          <div className="total-price">
                            ₹{order.pricing?.total?.toLocaleString() || '0'}
                          </div>
                          <div className="payment-method">
                            {order.paymentMethod === "online" ? "Online Payment" : "Cash on Delivery"}
                          </div>
                        </td>
                        <td className="table-td">
                          <div className="status-cell">
                            <span className={`status-badge ${
                              order.status === "delivered" ? "status-delivered"
                                : order.status === "assigned" ? "status-assigned"
                                : order.status === "rejected" ? "status-rejected"
                                : order.status === "cancelled" ? "status-cancelled"
                                : "status-pending"
                            }`}>
                              {order.status === "delivered" ? <><BsCheckCircle className="status-icon" /> Delivered</> : null}
                              {order.status === "assigned" ? <><FiPackage className="status-icon" /> Assigned</> : null}
                              {order.status === "rejected" ? <><FiX className="status-icon" /> Rejected</> : null}
                              {order.status === "cancelled" ? <><FiX className="status-icon" /> Cancelled</> : null}
                              {order.status === "pending" ? <><FiClock className="status-icon" /> Pending</> : null}
                            </span>
                            {['cancelled', 'rejected'].includes(order.status) && order.paymentMethod === 'online' && (
                              <span className={`refund-badge ${order.refundTransactionId ? (order.refundVerified ? 'refund-badge--verified' : 'refund-badge--done') : 'refund-badge--pending'}`} title={order.refundTransactionId ? (order.refundVerified ? `Verified – Refund ID: ${order.refundTransactionId}` : `Refund ID: ${order.refundTransactionId}`) : 'Record refund ID in order details'}>
                                {order.refundTransactionId ? (order.refundVerified ? 'Verified ✓' : 'Refund ✓') : 'Refund Pending'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="table-td">
                          <div className="action-buttons">
                            <div className="action-row">
                              {order.status === "pending" && (
                                <button
                                  onClick={() => handleAssignClick(order)}
                                  className="action-btn assign-btn"
                                  title="Mark as Assigned"
                                >
                                  <FiUserCheck />
                                </button>
                              )}
                              {order.status === "assigned" && (
                                <button
                                  onClick={() => handleDeliverClick(order)}
                                  className="action-btn deliver-btn"
                                  title="Mark as Delivered"
                                >
                                  <FiTruck />
                                </button>
                              )}
                              {!['delivered', 'rejected', 'cancelled'].includes(order.status) && (
                                <button
                                  onClick={() => handleRejectClick(order)}
                                  className="action-btn reject-btn"
                                  title="Reject Order"
                                >
                                  <FiX />
                                </button>
                              )}
                            </div>
                            <div className="action-row">
                              <button
                                onClick={() => handleWhatsAppClick(order)}
                                className="action-btn whatsapp-btn"
                                title="Send WhatsApp Message"
                              >
                                <BsWhatsapp />
                              </button>
                              <button
                                onClick={() => handleViewOrder(order)}
                                className="action-btn view-btn"
                                title="View Order Details"
                              >
                                <FiEye />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Order Details Row - keeping existing code for brevity */}
                      {viewingOrderId === order._id && selectedOrder && (
                        <tr key={`${order._id}-details`} className="order-details-row">
                          <td colSpan="7" className="order-details-cell">
                            <div className="inline-order-details">
                              <div className="inline-details-header">
                                <div className="inline-header-content">
                                  <FiPackage className="inline-icon" />
                                  <h4 className="inline-title">Order Details - {selectedOrder.orderId}</h4>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  {selectedOrder.status === 'delivered' && (
                                    <button
                                      className="inline-download-btn"
                                      onClick={() => downloadInvoice(selectedOrder)}
                                      title="Download Invoice"
                                    >
                                      <FiDownload /> Invoice
                                    </button>
                                  )}
                                  <button
                                    className="inline-close-btn"
                                    onClick={() => {
                                      setViewingOrderId(null);
                                      setSelectedOrder(null);
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>

                              <div className="inline-details-content">
                                {/* Cancellation & Refund traceability (when cancelled/rejected) */}
                                {(selectedOrder.status === 'cancelled' || selectedOrder.status === 'rejected') && (
                                  <div className="inline-section cancellation-refund-section">
                                    <div className="inline-section-header">
                                      <FiPackage className="inline-section-icon" />
                                      <h5>Cancellation & Refund</h5>
                                    </div>
                                    <div className="cancellation-refund-grid">
                                      <div className="cancellation-refund-info">
                                        <div className="inline-detail-item">
                                          <span className="inline-label">Cancelled / Rejected by</span>
                                          <span className="inline-value">
                                            {selectedOrder.status === 'cancelled'
                                              ? (selectedOrder.cancelledByUser ? 'Customer (from My Details)' : selectedOrder.cancelledBy || 'Admin')
                                              : 'Admin (Rejected)'}
                                          </span>
                                        </div>
                                        <div className="inline-detail-item">
                                          <span className="inline-label">Date</span>
                                          <span className="inline-value">
                                            {selectedOrder.cancelledAt
                                              ? new Date(selectedOrder.cancelledAt).toLocaleString()
                                              : selectedOrder.refundedAt
                                              ? new Date(selectedOrder.refundedAt).toLocaleString()
                                              : '—'}
                                          </span>
                                        </div>
                                        {selectedOrder.cancellationReason && (
                                          <div className="inline-detail-item">
                                            <span className="inline-label">Reason</span>
                                            <span className="inline-value">{selectedOrder.cancellationReason}</span>
                                          </div>
                                        )}
                                        {selectedOrder.paymentMethod === 'online' && (
                                          <div className="inline-detail-item">
                                            <span className="inline-label">Refund status</span>
                                            <span className="inline-value">
                                              {selectedOrder.refundTransactionId ? (
                                                <span className={selectedOrder.refundVerified ? 'refund-recorded refund-verified' : 'refund-recorded'}>
                                                  {selectedOrder.refundVerified ? '✓ Verified – ' : ''}ID: {selectedOrder.refundTransactionId}
                                                  {selectedOrder.refundAmount && ` (₹${selectedOrder.refundAmount?.toLocaleString()})`}
                                                </span>
                                              ) : (
                                                <span className="refund-pending">Pending – verify & record below</span>
                                              )}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      {selectedOrder.paymentMethod === 'online' && (
                                        <div className="refund-workflow-help">
                                          <p className="refund-workflow-title">How refunds work</p>
                                          <ol className="refund-workflow-steps">
                                            <li>Process the refund in <strong>Razorpay Dashboard</strong> (Payments → select payment → Refund).</li>
                                            <li>Copy the <strong>Refund ID</strong> (e.g. <code>rf_xxxx</code>).</li>
                                            <li>Paste it below and click <strong>Record Refund</strong>. We verify it matches this payment and amount before saving.</li>
                                          </ol>
                                          {!selectedOrder.refundTransactionId && (
                                            <div className="refund-add-form">
                                              <input
                                                type="text"
                                                placeholder="Paste Razorpay Refund ID (e.g. rf_xxxx)"
                                                value={refundState.orderId === selectedOrder._id ? refundState.value : ''}
                                                onChange={(e) => setRefundState(s => ({ ...s, orderId: selectedOrder._id, value: e.target.value, error: null }))}
                                                onFocus={() => setRefundState(s => ({ ...s, orderId: selectedOrder._id }))}
                                                className="refund-input"
                                              />
                                              <button
                                                type="button"
                                                onClick={() => handleRecordRefund(selectedOrder)}
                                                disabled={!refundState.value?.trim() || refundState.loading}
                                                className="refund-record-btn"
                                              >
                                                {refundState.loading && refundState.orderId === selectedOrder._id ? 'Saving...' : 'Record Refund'}
                                              </button>
                                              {refundState.error && refundState.orderId === selectedOrder._id && (
                                                <span className="refund-error">{refundState.error}</span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Customer Information */}
                                <div className="inline-section">
                                  <div className="inline-section-header">
                                    <FiUser className="inline-section-icon" />
                                    <h5>Customer Information</h5>
                                  </div>
                                  <div className="inline-details-grid">
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Name:</span>
                                      <span className="inline-value">
                                        {selectedOrder.customerInfo?.firstName} {selectedOrder.customerInfo?.lastName}
                                      </span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Email:</span>
                                      <span className="inline-value">{selectedOrder.customerInfo?.email}</span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Phone:</span>
                                      <span className="inline-value">{selectedOrder.customerInfo?.phone}</span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Address:</span>
                                      <span className="inline-value">
                                        {selectedOrder.customerInfo?.address}, {selectedOrder.customerInfo?.city},{" "}
                                        {selectedOrder.customerInfo?.state} {selectedOrder.customerInfo?.zipCode}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Products */}
                                <div className="inline-section">
                                  <div className="inline-section-header">
                                    <BsBoxSeam className="inline-section-icon" />
                                    <h5>Products</h5>
                                  </div>
                                  <div className="inline-products-list">
                                    {selectedOrder.items?.map((item, index) => (
                                      <div key={index} className="inline-product-card">
                                        <img
                                          src={item.image ? `${apiBase.replace('/api', '')}${item.image}` : "/placeholder.svg"}
                                          alt={item.name || item.title}
                                          className="inline-product-image"
                                        />
                                        <div className="inline-product-info">
                                          <h6 className="inline-product-name">{item.name || item.title}</h6>
                                          <p className="inline-product-category">{item.category}</p>
                                          <div className="inline-product-pricing">
                                            <span>Qty: {item.quantity}</span>
                                            <span>₹{item.price} each</span>
                                            <span className="inline-product-total">
                                              Total: ₹{(item.quantity * item.price).toLocaleString()}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )) || <p>No items found</p>}
                                  </div>
                                </div>

                                {/* Razorpay / Payment Info (online only) */}
                                {selectedOrder.paymentMethod === "online" && (
                                  <div className="inline-section payment-proof-section">
                                    <div className="inline-section-header">
                                      <FiCreditCard className="inline-section-icon" />
                                      <h5>Razorpay Payment</h5>
                                    </div>
                                    <div className="payment-proof-container">
                                      <div className="inline-details-grid">
                                        <div className="inline-detail-item">
                                          <span className="inline-label">Payment ID:</span>
                                          <span className="inline-value">
                                            {selectedOrder.paymentData?.razorpayPaymentId ? (
                                              <>
                                                <code>{selectedOrder.paymentData.razorpayPaymentId}</code>
                                                <a
                                                  href={`https://dashboard.razorpay.com/app/payments/${selectedOrder.paymentData.razorpayPaymentId}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="razorpay-link"
                                                >
                                                  View in Razorpay
                                                </a>
                                              </>
                                            ) : '—'}
                                          </span>
                                        </div>
                                        <div className="inline-detail-item">
                                          <span className="inline-label">Razorpay Order ID:</span>
                                          <span className="inline-value">
                                            {selectedOrder.paymentData?.razorpayOrderId || '—'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Pricing Breakdown */}
                                <div className="inline-section">
                                  <div className="inline-section-header">
                                    <FiDollarSign className="inline-section-icon" />
                                    <h5>Pricing Breakdown</h5>
                                  </div>
                                  <div className="inline-pricing-breakdown">
                                    <div className="inline-pricing-row">
                                      <span>Subtotal:</span>
                                      <span>₹{selectedOrder.pricing?.subtotal?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="inline-pricing-row">
                                      <span>Shipping:</span>
                                      <span>
                                        {selectedOrder.pricing?.shippingFee === 0
                                          ? "FREE"
                                          : `₹${selectedOrder.pricing?.shippingFee?.toLocaleString() || '0'}`}
                                      </span>
                                    </div>
                                    <div className="inline-pricing-row">
                                      <span>Tax (GST):</span>
                                      <span>₹{selectedOrder.pricing?.tax?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="inline-pricing-total">
                                      <span>Total Amount:</span>
                                      <span>₹{selectedOrder.pricing?.total?.toLocaleString() || '0'}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Order Information & Status Timeline */}
                                <div className="inline-section">
                                  <div className="inline-section-header">
                                    <FiPackage className="inline-section-icon" />
                                    <h5>Order Information</h5>
                                  </div>
                                  {/* Dotted progress path: Pending → Assigned → Delivered */}
                                  {!['rejected', 'cancelled'].includes(selectedOrder.status) && (
                                    <div className="order-progress-path">
                                      <div className={`progress-step ${['pending', 'assigned', 'delivered'].includes(selectedOrder.status) ? 'done' : ''}`}>
                                        <span className="progress-dot" />
                                        <span className="progress-label">Pending</span>
                                        <span className="progress-date">
                                          {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString() : '—'}
                                        </span>
                                      </div>
                                      <div className="progress-connector progress-connector--dotted" />
                                      <div className={`progress-step ${['assigned', 'delivered'].includes(selectedOrder.status) ? 'done' : ''}`}>
                                        <span className="progress-dot" />
                                        <span className="progress-label">Assigned</span>
                                        <span className="progress-date">
                                          {selectedOrder.assignedAt ? new Date(selectedOrder.assignedAt).toLocaleDateString() : '—'}
                                        </span>
                                      </div>
                                      <div className="progress-connector progress-connector--dotted" />
                                      <div className={`progress-step ${selectedOrder.status === 'delivered' ? 'done' : ''}`}>
                                        <span className="progress-dot" />
                                        <span className="progress-label">Delivered</span>
                                        <span className="progress-date">
                                          {selectedOrder.deliveredAt ? new Date(selectedOrder.deliveredAt).toLocaleDateString() : '—'}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  {['rejected', 'cancelled'].includes(selectedOrder.status) && (
                                    <div className="order-progress-path order-progress-path--ended">
                                      <div className="progress-step done">
                                        <span className="progress-dot" />
                                        <span className="progress-label">Pending</span>
                                        <span className="progress-date">
                                          {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString() : '—'}
                                        </span>
                                      </div>
                                      <div className="progress-connector progress-connector--dotted" />
                                      <div className={`progress-step ${selectedOrder.assignedAt ? 'done' : ''}`}>
                                        <span className="progress-dot" />
                                        <span className="progress-label">Assigned</span>
                                        <span className="progress-date">
                                          {selectedOrder.assignedAt ? new Date(selectedOrder.assignedAt).toLocaleDateString() : '—'}
                                        </span>
                                      </div>
                                      <div className="progress-connector progress-connector--dotted" />
                                      <div className="progress-step ended">
                                        <span className="progress-dot" />
                                        <span className="progress-label">{selectedOrder.status === 'rejected' ? 'Rejected' : 'Cancelled'}</span>
                                        <span className="progress-date">
                                          {selectedOrder.cancelledAt
                                            ? new Date(selectedOrder.cancelledAt).toLocaleDateString()
                                            : selectedOrder.refundedAt
                                            ? new Date(selectedOrder.refundedAt).toLocaleDateString()
                                            : '—'}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  <div className="inline-details-grid">
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Order Date:</span>
                                      <span className="inline-value">
                                        {new Date(selectedOrder.orderDate).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Payment Method:</span>
                                      <span className="inline-value">
                                        {selectedOrder.paymentMethod === "online"
                                          ? "Online Payment (Razorpay)"
                                          : "Cash on Delivery"}
                                      </span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Payment Status:</span>
                                      <span className={`inline-value ${selectedOrder.paymentMethod === 'online' || selectedOrder.status === 'delivered' ? 'paid' : 'unpaid'}`}>
                                        {selectedOrder.paymentMethod === 'online' ? 'Paid' : selectedOrder.status === 'delivered' ? 'Paid' : 'Unpaid'}
                                      </span>
                                    </div>
                                    <div className="inline-detail-item">
                                      <span className="inline-label">Status:</span>
                                      <span className={`inline-value inline-status-badge ${selectedOrder.status}`}>
                                        {selectedOrder.status}
                                      </span>
                                    </div>
                                    {selectedOrder.assignedTo && (
                                      <>
                                        <div className="inline-detail-item">
                                          <span className="inline-label">Assigned To:</span>
                                          <span className="inline-value">{selectedOrder.assignedTo}</span>
                                        </div>
                                        <div className="inline-detail-item">
                                          <span className="inline-label">Assigned From:</span>
                                          <span className="inline-value">{selectedOrder.assignedFrom}</span>
                                        </div>
                                        <div className="inline-detail-item">
                                          <span className="inline-label">Assigned At:</span>
                                          <span className="inline-value">
                                            {selectedOrder.assignedAt ? new Date(selectedOrder.assignedAt).toLocaleString() : '—'}
                                          </span>
                                        </div>
                                      </>
                                    )}
                                    {selectedOrder.deliveredBy && (
                                      <>
                                        <div className="inline-detail-item">
                                          <span className="inline-label">Delivered By:</span>
                                          <span className="inline-value">{selectedOrder.deliveredBy}</span>
                                        </div>
                                        <div className="inline-detail-item">
                                          <span className="inline-label">Confirmed By:</span>
                                          <span className="inline-value">{selectedOrder.confirmedBy}</span>
                                        </div>
                                        <div className="inline-detail-item">
                                          <span className="inline-label">Delivered At:</span>
                                          <span className="inline-value">
                                            {selectedOrder.deliveredAt ? new Date(selectedOrder.deliveredAt).toLocaleString() : '—'}
                                          </span>
                                        </div>
                                      </>
                                    )}

                                    {selectedOrder.specialInstructions && (
                                      <div className="inline-detail-item inline-full-width">
                                        <span className="inline-label">Special Instructions:</span>
                                        <span className="inline-value">{selectedOrder.specialInstructions}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}

                  {!tableLoading && tableOrders.length === 0 && (
                    <tr>
                      <td colSpan="7" className="no-orders">
                        <div className="no-orders-content">
                          <FiPackage className="no-orders-icon" />
                          <p>No orders found</p>
                          <small>Try adjusting your filters</small>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!error && totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {startIndex + 1} to {Math.min(startIndex + ordersPerPage, totalOrders)} of {totalOrders} orders
              </div>
              <div className="pagination-controls">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <FiChevronLeft className="icon" />
                  Previous
                </button>
                <div className="pagination-numbers">
                  {getPaginationNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(page)}
                      disabled={page === "..."}
                      className={
                        page === currentPage ? "pagination-active"
                          : page === "..." ? "pagination-dots"
                            : "pagination-number"
                      }
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                  <FiChevronRight className="icon" />
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
