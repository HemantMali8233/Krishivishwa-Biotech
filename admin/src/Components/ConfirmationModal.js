import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Yes",
  cancelText = "No",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="confirm-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmModalTitle"
      onClick={onCancel}
      tabIndex={-1}
    >
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <h2 id="confirmModalTitle" className="confirm-modal-title">{title}</h2>
        <p className="confirm-modal-message">{message}</p>

        <div className="confirm-modal-buttons">
          <button
            className="confirm-modal-btn cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          
          <button
            className="confirm-modal-btn confirm-btn"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
