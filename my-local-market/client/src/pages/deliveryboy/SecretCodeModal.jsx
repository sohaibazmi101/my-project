import { useState } from 'react';

export default function SecretCodeModal({ show, secretCode, onClose, onSubmit, actionType }) {
  const [inputCode, setInputCode] = useState('');

  if (!show) return null;

  const handleSubmit = () => {
    if (!inputCode) return alert('Enter the secret code');
    onSubmit(inputCode);
    setInputCode('');
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{actionType} Confirmation</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>Enter secret code to confirm the order as {actionType}.</p>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="form-control"
              placeholder="Secret Code"
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
