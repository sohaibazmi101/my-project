export default function Footer() {
  return (
    <footer className="bg-dark text-light text-center py-3 mt-5">
      <div className="container">
        <p className="mb-1">© {new Date().getFullYear()} HarCheezNow. All rights reserved.</p>
        <small className="d-block">
          <i className="bi bi-ui-checks-grid me-1"></i>
          Designed by Soaid Shams
        </small>
        <small className="d-block mt-1">
          <i className="bi bi-code-slash me-1"></i>
          Developed by Sohaib Azmi
        </small>
        <small className="d-block mt-1">
          <i className="bi bi-code-slash me-1"></i>
          Developed by Sadique Azmi
        </small>
      </div>
    </footer>
  );
}