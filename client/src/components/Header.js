import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "../styles/Header.css";

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault(); // 기본 Link 동작을 막고
      setShowToast(true); // 알림을 표시
      setTimeout(() => setShowToast(false), 3000); // 3초 후 알림 숨김
      navigate("/login"); // 로그인 페이지로 이동
    }
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-container">
          <Link to="/" className="header-logo">
            PerfumeShop
          </Link>
          <nav className="header-nav">
            <Link to="/shop" className="header-nav-item">
              Shop
            </Link>
            <Link
              to="/cart"
              onClick={handleCartClick}
              className="header-nav-item"
            >
              Cart
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/mypage" className="header-nav-item">
                  Mypage
                </Link>
                <button
                  onClick={logout}
                  className="header-nav-item header-logout-button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="header-nav-item">
                  Login
                </Link>
                <Link to="/signup" className="header-nav-item">
                  Signup
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
      <div className="header-bottom">
        <div className="header-container">
          <nav className="header-secondary-nav">
            <Link to="/about" className="header-secondary-item">
              About Us
            </Link>
            <Link to="/services" className="header-secondary-item">
              Services
            </Link>
            <Link to="/contact" className="header-secondary-item">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
