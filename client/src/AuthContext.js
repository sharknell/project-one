import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 로컬 스토리지에서 인증 상태 확인
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token); // 토큰 저장
    setIsAuthenticated(true); // 인증 상태 설정
  };

  const logout = () => {
    localStorage.removeItem("token"); // 토큰 삭제
    setIsAuthenticated(false); // 인증 상태 해제
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
