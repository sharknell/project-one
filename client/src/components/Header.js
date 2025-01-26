import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "../styles/Header.css";

function Header() {
  const { isAuthenticated, logout, logoutMessage, setLogoutMessage } =
    useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 로그아웃 메시지 상태가 있으면 알림을 띄운 후 메시지를 초기화
  useEffect(() => {
    if (logoutMessage) {
      alert(logoutMessage); // 로그아웃 메시지 알림
      setLogoutMessage(""); // 메시지 초기화
    }
  }, [logoutMessage, setLogoutMessage]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="header">
      {/* 상단바 */}
      <div className="header-top">
        <div className="header-container">
          {/* 로고 */}
          <Link to="/" className="header-logo">
            PerfumeShop
          </Link>

          {/* 모바일 메뉴 버튼 */}
          <button className="menu-toggle" onClick={toggleMenu}>
            ☰
          </button>

          {/* 네비게이션 메뉴 */}
          <nav className={`header-nav ${isMenuOpen ? "active" : ""}`}>
            <Link to="/cart" className="header-nav-item">
              장바구니
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="header-nav-item">
                  마이 페이지
                </Link>
                <button onClick={logout} className="header-logout-button">
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="header-nav-item">
                  로그인
                </Link>
                <Link to="/signup" className="header-nav-item signup">
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* 하단 바 (서비스와 연락처 항목) */}
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
