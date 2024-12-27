import React from "react";

function Footer() {
  return (
    <footer style={styles.footer}>
      <p>&copy; 2024 PerfumeShop. All rights reserved.</p>
      <p>
        <a href="/qna" style={styles.link}>Customer Support</a> | 
        <a href="/terms" style={styles.link}> Terms of Service</a>
      </p>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#f9f9f9",
    textAlign: "center",
    padding: "20px",
    borderTop: "1px solid #ddd",
  },
  link: {
    marginLeft: "10px",
    textDecoration: "none",
    color: "#333",
  },
};

export default Footer;
