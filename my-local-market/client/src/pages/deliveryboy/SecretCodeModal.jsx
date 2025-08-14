export default function SecretCodeModal({ show, secretCode, onClose }) {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog">
        <div className="modal-content p-3">
          <h5>Secret Code</h5>
          <p>Provide this code when delivering the order: <strong>{secretCode}</strong></p>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
