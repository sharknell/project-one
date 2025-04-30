import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import "../../styles/Header.css";

function Header() {
  const { isAuthenticated, logout, logoutMessage, setLogoutMessage } =
    useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 로그아웃 메시지 알림 표시
  useEffect(() => {
    if (logoutMessage) {
      alert(logoutMessage);
      setLogoutMessage("");
    }
  }, [logoutMessage, setLogoutMessage]);

  // 모바일 메뉴 토글
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // 메뉴 닫기
  const closeMenu = () => setIsMenuOpen(false);

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
            <Link to="/cart" className="header-nav-item" onClick={closeMenu}>
              장바구니
            </Link>
            <Link to="/shop" className="header-nav-item" onClick={closeMenu}>
              쇼핑
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="header-nav-item"
                  onClick={closeMenu}
                >
                  마이 페이지
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="header-logout-button"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="header-nav-item"
                  onClick={closeMenu}
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="header-nav-item signup"
                  onClick={closeMenu}
                >
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* 하단 바 (서비스와 연락처) */}
    </header>
  );
}

export default Header;
