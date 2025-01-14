import React from "react";
import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <p className="footer-text">© 2024 PerfumeShop. All rights reserved.</p>
      <div className="footer-links">
        <a href="/qna" className="link">
          Customer Support
        </a>
        <span className="divider">|</span>
        <a href="/terms" className="link">
          Terms of Service
        </a>
      </div>
    </footer>
  );
}

export default Footer;
