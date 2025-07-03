import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-100 py-5 text-center font-sans text-gray-800 border-t border-gray-300">
      <p className="text-sm text-gray-600">
        © 2024 PerfumeShop. All rights reserved.
      </p>
      <div className="mt-2">
        <a
          href="/qna"
          className="text-blue-600 text-sm mx-1 hover:text-blue-800 transition-colors duration-300"
        >
          Customer Support
        </a>
        <span className="text-gray-400 mx-1">|</span>
        <a
          href="/terms"
          className="text-blue-600 text-sm mx-1 hover:text-blue-800 transition-colors duration-300"
        >
          Terms of Service
        </a>
      </div>
    </footer>
  );
}

export default Footer;
