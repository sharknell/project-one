import React from "react";
import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <p>&copy; 2024 PerfumeShop. All rights reserved.</p>
      <p>
        <a href="/qna" className="link">
          Customer Support
        </a>{" "}
        |
        <a href="/terms" className="link">
          Terms of Service
        </a>
      </p>
    </footer>
  );
}

export default Footer;
