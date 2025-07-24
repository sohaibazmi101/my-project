// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-dark text-light text-center py-3 mt-5">
      <div className="container">
        <p className="mb-0">© {new Date().getFullYear()} Local Shop. All rights reserved.</p>
        <small>Designed by Soaid Azmi</small>
      </div>
    </footer>
  );
}
