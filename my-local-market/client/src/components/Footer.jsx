export default function Footer() {
  return (
    <footer className="bg-dark text-light text-center py-3 mt-5">
      <div className="container">
        <p className="mb-1">© {new Date().getFullYear()} Hurry Cart. All rights reserved.</p>
        <small className="d-block">
          <i className="bi bi-ui-checks-grid me-1"></i>
          Designed by Soaid Shams
        </small>
        <small className="d-block mt-1">
          <i className="bi bi-code-slash me-1"></i>
          Developed by Sadique Azmi & Sohaib Azmi
        </small>
        <small className="d-block mt-1">
          <a
            href="https://www.instagram.com/soaidshams_d_z/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none"
          >
            <i className="bi bi-instagram me-1"></i>
            Soaid Shams
          </a>
          <a
            href="https://www.instagram.com/sadique__azmi/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none ms-3"
          >
            <i className="bi bi-instagram me-1"></i>
            Sadique Azmi
          </a>
          <a
            href="https://www.instagram.com/sohaib.azmi/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none ms-3"
          >
            <i className="bi bi-instagram me-1"></i>
            Sohaib Azmi
          </a>
        </small>
      </div>
    </footer>
  );
}