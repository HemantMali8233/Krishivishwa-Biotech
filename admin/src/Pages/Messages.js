import { useEffect, useState } from "react";
import axios from "axios";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiMail,
  FiStar,
  FiCheck,
  FiSend,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import "./Messages.css";

const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/messages";
const TESTIMONIALS_API = (process.env.REACT_APP_API_URL || "http://localhost:5000") + "/api/testimonials";

function getCategoryIcon(category) {
  if (category === "write us" || category === "write to us") return <FiMail />;
  if (category === "contact us") return <FiMail />;
  if (category === "testimonial") return <FiCheck />; // Added icon for testimonial category
  return <FiMail />;
}
function getStatusColor(status) {
  if (status === "unread") return "var(--status-unread)";
  if (status === "read") return "var(--status-read)";
  return "var(--text-secondary)";
}
function getInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map((w) => (w ? w[0] : ""))
    .join("")
    .toUpperCase();
}
function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function getWhatsAppLink(phone, text) {
  if (!phone) return "#";
  const cleaned = phone.replace(/[\s()+-]/g, "");
  if (text && text.trim()) {
    return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/${cleaned}`;
}
function buildWhatsAppMessage(msg) {
  const when = msg?.date ? new Date(msg.date).toLocaleDateString() : "";
  const category = msg?.category ? msg.category : "your inquiry";
  const name = msg?.name ? ` ${msg.name}` : "";
  const body = (msg?.message || "").trim();
  return [
    `Hello${name},`,
    `This is Krishivishwa Biotech regarding ${category}.`,
    when ? `🗓️ Received: ${when}` : ``,
    ``,
    body ? `💬 Your message:\n"${body}"\n` : ``,
    `✅ Please reply here—we will assist you.`,
    `- Krishivishwa Biotech`
  ].filter(Boolean).join("\n");
}
function getPageNumbers(total, current) {
  const delta = 2;
  const range = [];
  let last = 0;
  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      if (last + 1 !== i) {
        range.push("...");
      }
      range.push(i);
      last = i;
    }
  }
  return range;
}

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [testimonialMessageIds, setTestimonialMessageIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [starredFilter, setStarredFilter] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);

  // --- Global stats ---
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    contactUs: 0,
    writeUs: 0,
  });

  // Confirmation dialog state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type: "add"|"remove", msg }
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [testimonialFilter, setTestimonialFilter] = useState("all"); // "all" or "testimonials"

  const messagesPerPage = 5;
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;

  function showSuccessAlert(message) {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      // Start slide out animation by removing alert
      setShowAlert(false);
    }, 3000); // visible for 3 seconds
  }

  // Fetch messages and stats from backend
  useEffect(() => {
    async function fetchMessages() {
      setIsLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: messagesPerPage,
          search: searchTerm || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          starred: starredFilter ? true : undefined,
        };
        // Adjust param for category / testimonial filter
        if (categoryFilter === "testimonial") {
          params.testimonial = true;
        } else if (categoryFilter !== "all") {
          params.category = categoryFilter;
        }
        // Also filter by testimonialFilter if "testimonials" is selected (optional)
        // You can skip if you want the above to take precedence
        if (testimonialFilter === "testimonials") {
          params.testimonial = true;
        }

        const { data } = await axios.get(API_URL, { params });

        setMessages(data.messages);
        setTotalMessages(data.total);

        if (data.stats) {
          setStats({
            total: data.total,
            unread: data.stats.unread,
            read: data.stats.read,
            contactUs: data.stats.contactUs,
            writeUs: data.stats.writeUs,
          });
        }
      } catch (err) {
        setMessages([]);
        setTotalMessages(0);
        setStats({
          total: 0,
          unread: 0,
          read: 0,
          contactUs: 0,
          writeUs: 0,
        });
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchTestimonials() {
      try {
        const { data } = await axios.get(TESTIMONIALS_API);
        // Array of messageId for quick lookup
        const ids = data.map((t) => t.messageId);
        setTestimonialMessageIds(ids);
      } catch {
        setTestimonialMessageIds([]);
      }
    }

    fetchMessages();
    fetchTestimonials();
  }, [
    searchTerm,
    statusFilter,
    categoryFilter,
    starredFilter,
    testimonialFilter,
    currentPage,
  ]);

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setStarredFilter(false);
    setTestimonialFilter("all");
    setCurrentPage(1);
  }

  function toggleExpand(id) {
    setExpandedMessage((prev) => (prev === id ? null : id));
    const msg = messages.find((m) => m._id === id);
    if (msg && msg.status === "unread") markAsRead(id);
  }

  async function markAsRead(id) {
    try {
      await axios.put(`${API_URL}/${id}`, { status: "read" });
      setMessages((msgs) =>
        msgs.map((m) =>
          m._id === id ? { ...m, status: "read", unread: false } : m
        )
      );
    } catch {}
  }

  async function toggleStar(id) {
    const msg = messages.find((m) => m._id === id);
    if (!msg) return;
    try {
      await axios.put(`${API_URL}/${id}`, { starred: !msg.starred });
      setMessages((msgs) =>
        msgs.map((m) => (m._id === id ? { ...m, starred: !m.starred } : m))
      );
    } catch {}
  }

  // Confirm dialog handlers
  function handleTestimonialClick(action, msg) {
    setConfirmAction({ type: action, msg });
    setShowConfirm(true);
  }

  async function doAction() {
    setLoading(true);
    const { type, msg } = confirmAction;
    try {
      if (type === "add") {
        await axios.post(TESTIMONIALS_API, {
          messageId: msg._id,
          name: msg.name,
          quote: msg.message,
        });
        setTestimonialMessageIds((ids) => [...ids, msg._id]);
        showSuccessAlert("Added to Testimonials ");
      } else {
        await axios.delete(`${TESTIMONIALS_API}/bymsg/${msg._id}`);
        setTestimonialMessageIds((ids) => ids.filter((id) => id !== msg._id));
        showSuccessAlert("Removed from Testimonials ");
      }
    } catch (err) {
      alert("Failed to update testimonial ");
    }
    setShowConfirm(false);
    setLoading(false);
    setConfirmAction(null);
  }

  function closeConfirm() {
    setShowConfirm(false);
    setConfirmAction(null);
  }

  const totalPages = Math.ceil(totalMessages / messagesPerPage);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  return (
    <div className="messages-page">
      {/* Header */}
      <div className="messages-header">
        <div className="header-content">
          {/* Left side */}
          <div className="header-left">
            <div className="header-icon">
              <FiMail />
            </div>
            <div>
              <h1>Customer Messages</h1>
              <p>Manage and respond to customer inquiries</p>
            </div>
          </div>

          {/* Right side Stats */}
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <section className="messages-page__toolbar">
        <div className="messages-page__search-container">
          <FiSearch className="messages-page__search-icon" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="messages-page__search-input"
            aria-label="Search messages"
          />
          {searchTerm && (
            <button
              className="messages-page__clear-search"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              aria-label="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="messages-page__filter-group">
          <button
            className={`messages-page__starred-toggle ${
              starredFilter ? "active" : ""
            }`}
            onClick={() => {
              setStarredFilter((prev) => !prev);
              setCurrentPage(1);
            }}
            aria-pressed={starredFilter}
            title="Toggle starred messages only"
          >
            <FiStar />
          </button>

          <div className="messages-page__filter-container">
            <FiFilter className="messages-page__filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="messages-page__filter-select"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          <div className="messages-page__filter-container">
            <FiFilter className="messages-page__filter-icon" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="messages-page__filter-select"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="write us">Write to Us</option>
              <option value="contact us">Contact Us</option>
              <option value="testimonial">Testimonials</option>
            </select>
          </div>

          <button
            className="messages-page__clear-filters"
            onClick={clearFilters}
            aria-label="Clear all filters"
          >
            Clear Filters
          </button>
        </div>
      </section>

      {/* Stat Cards with global counts */}
      <section className="messages-page__stats" aria-live="polite">
        {/* Unread */}
        <div className="messages-page__stat-card unread">
          <div className="messages-page__stat-icon">
            <img
              src="https://cdn-icons-png.flaticon.com/512/8476/8476768.png"
              width="40"
              height="40"
              alt=""
              className="img-small"
            />
          </div>
          <div className="messages-page__stat-text">
            <div className="messages-page__stat-label">Unread</div>
            <div className="messages-page__stat-value">{stats.unread}</div>
          </div>
        </div>

        {/* Read */}
        <div className="messages-page__stat-card read">
          <div className="messages-page__stat-icon">
            <img
              src="https://cdn-icons-png.flaticon.com/512/5397/5397335.png"
              width="40"
              height="40"
              alt=""
              className="img-small"
            />
          </div>
          <div className="messages-page__stat-text">
            <div className="messages-page__stat-label">Read</div>
            <div className="messages-page__stat-value">{stats.read}</div>
          </div>
        </div>

        {/* Contact Us */}
        <div className="messages-page__stat-card contact-us">
          <div className="messages-page__stat-icon">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3095/3095583.png"
              width="40"
              height="40"
              alt=""
              className="img-small"
            />
          </div>
          <div className="messages-page__stat-text">
            <div className="messages-page__stat-label">Contact Us</div>
            <div className="messages-page__stat-value">{stats.contactUs}</div>
          </div>
        </div>

        {/* Write to Us */}
        <div className="messages-page__stat-card write-to-us">
          <div className="messages-page__stat-icon">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1968/1968621.png"
              width="40"
              height="40"
              alt=""
              className="img-small"
            />
          </div>
          <div className="messages-page__stat-text">
            <div className="messages-page__stat-label">Write to Us</div>
            <div className="messages-page__stat-value">{stats.writeUs}</div>
          </div>
        </div>
      </section>

      {/* Messages List */}
      <section className="messages-page__list">
        {isLoading ? (
          <div className="messages-page__no-messages">
            <p style={{ fontWeight: 700 }}>Loading...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="messages-page__no-messages">
            <FiMail className="messages-page__no-messages-icon" />
            <h3>No messages found</h3>
            <p>Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="messages-page__no-messages-clear"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          messages.map((msg) => {
            const expanded = expandedMessage === msg._id;
            const isTestimonial = testimonialMessageIds.includes(msg._id);
            return (
              <article
                key={msg._id}
                className={`messages-page__message-card ${
                  msg.status === "unread" ? "unread" : "read"
                }${expanded ? " expanded" : ""}`}
                tabIndex={0}
                role="button"
                aria-expanded={expanded}
                onClick={() => toggleExpand(msg._id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") toggleExpand(msg._id);
                }}
              >
                <div className="messages-page__message-header">
                  <div
                    className="messages-page__user-avatar"
                    style={{ backgroundColor: getStatusColor(msg.status) }}
                  >
                    {getInitials(msg.name)}
                  </div>
                  <div className="messages-page__message-sender">
                    <div className="messages-page__sender-name">{msg.name}</div>
                    <div className="messages-page__sender-contact">
                      {msg.email} | {msg.phone || "N/A"}
                    </div>
                  </div>
                  <div className="messages-page__message-meta">
                    <span className={`messages-page__status ${msg.status}`}>
                      {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                    </span>
                    <span className="messages-page__category">
                      {getCategoryIcon(msg.category)}{" "}
                      {msg.category.charAt(0).toUpperCase() + msg.category.slice(1)}
                    </span>
                    <span className="messages-page__date">{formatDate(msg.date)}</span>
                  </div>
                </div>

                <div
                  className={`messages-page__message-main${
                    expanded ? " expanded" : ""
                  }`}
                >
                  {/* Always show preview (collapsed: truncated, expanded: full) */}
                  <div className="messages-page__message-preview">
                    <p>
                      {/* If expanded, show full message, else trimmed version */}
                      {expanded
                        ? msg.message
                        : msg.message.length > 140
                        ? msg.message.slice(0, 140) + "..."
                        : msg.message}
                    </p>
                  </div>
                  {/* On expand: show actions */}
                  {expanded && (
                    <div className="messages-page__message-details">
                      <div className="messages-page__message-actions">
                        <button
                          className="messages-page__action-btn reply"
                          title={`Reply to ${msg.email}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location = `mailto:${msg.email}`;
                          }}
                        >
                          <FiMail /> Reply
                        </button>
                        <button
                          className="messages-page__action-btn whatsapp"
                          title={`WhatsApp ${msg.phone}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const text = buildWhatsAppMessage(msg);
                            window.open(getWhatsAppLink(msg.phone, text), "_blank");
                          }}
                          disabled={!msg.phone}
                        >
                          <FiSend /> WhatsApp
                        </button>
                        <button
                          className="messages-page__action-btn mark-read"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(msg._id);
                          }}
                          disabled={msg.status === "read"}
                          title="Mark as Read"
                        >
                          <FiCheck /> Mark as Read
                        </button>
                        <button
                          className={`messages-page__action-btn star ${
                            msg.starred ? "starred" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(msg._id);
                          }}
                          title={msg.starred ? "Unstar" : "Star Favorite"}
                        >
                          <FiStar />
                        </button>
                        <button
                          className="messages-page__action-btn testimonial"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestimonialClick(
                              isTestimonial ? "remove" : "add",
                              msg
                            );
                          }}
                          title={
                            isTestimonial
                              ? "Remove from Testimonials"
                              : "Add to Testimonials"
                          }
                        >
                          <FiCheck />
                          {isTestimonial
                            ? " Remove from Testimonials"
                            : " Add to Testimonials"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <footer className="messages-page__pagination">
          <div
            className="messages-page__footer-info"
            aria-live="polite"
            aria-atomic="true"
          >
            Showing {Math.min(indexOfFirstMessage + 1, totalMessages)}-
            {Math.min(indexOfLastMessage, totalMessages)} of {totalMessages} messages
          </div>
          <div
            className="messages-page__pagination-controls"
            role="navigation"
            aria-label="Pagination Navigation"
          >
            <button
              className={`messages-page__page-btn prev ${
                currentPage === 1 ? "disabled" : ""
              }`}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <FiChevronLeft /> Previous
            </button>
            {getPageNumbers(totalPages, currentPage).map((num, idx) =>
              num === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="messages-page__page-btn disabled"
                  aria-hidden="true"
                  style={{ cursor: "default" }}
                >
                  ...
                </span>
              ) : (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`messages-page__page-btn ${
                    currentPage === num ? "active" : ""
                  }`}
                  aria-current={currentPage === num ? "page" : undefined}
                  aria-label={`Go to page ${num}`}
                >
                  {num}
                </button>
              )
            )}
            <button
              className={`messages-page__page-btn next ${
                currentPage === totalPages ? "disabled" : ""
              }`}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next <FiChevronRight />
            </button>
          </div>
        </footer>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="confirm-dialog-overlay" role="dialog" aria-modal="true">
          <div className="confirm-dialog">
            <p>
              {confirmAction.type === "add"
                ? "Do you want to add this message as a testimonial?"
                : "Do you want to remove this testimonial?"}
            </p>
            <div className="dialog-buttons">
              <button onClick={doAction} disabled={loading}>
                {confirmAction.type === "add" ? "Confirm Add" : "Confirm Remove"}
              </button>
              <button onClick={closeConfirm} disabled={loading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert */}
      {showAlert && (
        <div className="custom-alert" role="alert" aria-live="assertive">
          {alertMessage}
        </div>
      )}
    </div>
  );
}
