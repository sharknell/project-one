import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  logoutMessage: "",
  setLogoutMessage: () => {},
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
    setLogoutMessage(""); // 로그인 시 로그아웃 메시지 초기화
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setLogoutMessage("로그아웃 하였습니다!");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        logoutMessage,
        setLogoutMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
