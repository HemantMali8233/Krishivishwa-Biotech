// ToastNotification.js (new component)
import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import './ToastNotification.css';

const ToastNotification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-notification">
      <div className="toast-content">
        <FaCheckCircle className="toast-icon" />
        <span>{message}</span>
      </div>
      <button className="toast-close-btn" onClick={onClose}>
        <FaTimes />
      </button>
    </div>
  );
};

export default ToastNotification;