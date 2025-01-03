import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "../styles/Header.css";

function Header() {
  const { isAuthenticated, logout, logoutMessage, setLogoutMessage } =
    useAuth();

  // 로그아웃 메시지 상태가 있으면 알림을 띄운 후 메시지를 초기화
  useEffect(() => {
    if (logoutMessage) {
      alert(logoutMessage); // 로그아웃 메시지 알림
      setLogoutMessage(""); // 메시지 초기화
    }
  }, [logoutMessage, setLogoutMessage]);

  return (
    <header className="header">
      {/* 헤더 상단 바 */}
      <div className="header-top">
        <div className="header-container">
          {/* 로고 */}
          <Link to="/" className="header-logo">
            PerfumeShop
          </Link>

          {/* 네비게이션 메뉴 */}
          <nav className="header-nav">
            <Link to="/shop" className="header-nav-item">
              Shop
            </Link>
            <Link to="/cart" className="header-nav-item">
              Cart
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="header-nav-item">
                  Profile
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

      {/* 헤더 하단 바 (서비스와 연락처 항목) */}
      <div className="header-bottom">
        <div className="header-container">
          <nav className="header-bottom-nav">
            <Link to="/service" className="header-bottom-nav-item">
              Service
            </Link>
            <Link to="/contact" className="header-bottom-nav-item">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
