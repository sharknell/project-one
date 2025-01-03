import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  logoutMessage: "", // 로그아웃 메시지 상태 추가
  setLogoutMessage: () => {}, // 로그아웃 메시지 상태를 업데이트하는 함수 추가
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState(""); // 상태 추가

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setLogoutMessage("로그아웃 하였습니다!"); // 로그아웃 시 메시지 설정
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        logoutMessage, // 상태 제공
        setLogoutMessage, // 상태 업데이트 함수 제공
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
