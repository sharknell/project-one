import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";

function Header() {
  const { isAuthenticated, logout, logoutMessage, setLogoutMessage } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (logoutMessage) {
      alert(logoutMessage);
      setLogoutMessage("");
    }
  }, [logoutMessage, setLogoutMessage]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white shadow-md relative z-10">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-2">
        {/* 로고 */}
        <Link to="/" className="text-xl font-bold text-gray-800">
          PerfumeShop
        </Link>

        {/* 메뉴 토글 버튼 */}
        <button
          onClick={toggleMenu}
          className="text-2xl text-gray-800 md:hidden focus:outline-none z-20"
        >
          ☰
        </button>

        {/* 네비게이션 메뉴 */}
        <nav
          className={`${
            isMenuOpen
              ? "flex flex-col gap-2 bg-gray-50 p-4 absolute top-full left-0 w-full shadow-md"
              : "hidden"
          } md:flex md:flex-row md:gap-5 md:static md:bg-transparent md:p-0`}
        >
          <Link
            to="/cart"
            onClick={closeMenu}
            className="text-gray-700 hover:text-blue-600 text-base"
          >
            장바구니
          </Link>
          <Link
            to="/shop"
            onClick={closeMenu}
            className="text-gray-700 hover:text-blue-600 text-base"
          >
            쇼핑
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                onClick={closeMenu}
                className="text-gray-700 hover:text-blue-600 text-base"
              >
                마이 페이지
              </Link>
              <button
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="text-red-600 hover:underline text-base text-left w-full md:w-auto"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMenu}
                className="text-gray-700 hover:text-blue-600 text-base"
              >
                로그인
              </Link>
              <Link
                to="/signup"
                onClick={closeMenu}
                className="font-bold text-blue-600 hover:text-blue-700 text-base"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
