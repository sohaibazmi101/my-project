import React from 'react';

export default function ErrorModal({ show, message, onClose }) {
  if (!show) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1" role="dialog" onClick={onClose}>
      <div
        className="modal-dialog modal-dialog-centered"
        role="document"
        onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside content
      >
        <div className="modal-content p-4">
          <h5 className="mb-3 text-danger">Error</h5>
          <p>{message}</p>
          <button className="btn btn-secondary mt-3" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
