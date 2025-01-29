import React, { createContext, useState, useEffect, useContext } from "react";

// JWT 토큰 디코딩 함수
const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("JWT Parsing Error:", e);
    return null;
  }
};

// JWT 토큰 만료 여부 확인
const isTokenExpired = (token) => {
  const user = parseJwt(token);
  return !user || !user.exp || Date.now() >= user.exp * 1000;
};

// 로컬스토리지에서 사용자 데이터 가져오기
const getStoredAuthData = () => {
  const token = localStorage.getItem("authToken");
  return token && !isTokenExpired(token)
    ? { user: parseJwt(token), token }
    : null;
};

// 인증 컨텍스트 생성
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");

  // 초기 인증 상태 확인
  useEffect(() => {
    const storedData = getStoredAuthData();
    if (storedData) {
      setIsAuthenticated(true);
      setUserName(storedData.user.username);
      setUserId(storedData.user.id);
      setIsAdmin(storedData.user.role === "admin");
    }
    setIsLoading(false);
  }, []);

  // 로그인 함수
  const login = (token) => {
    const user = parseJwt(token);
    if (user) {
      setUserName(user.username);
      setUserId(user.id);
      setIsAdmin(user.role === "admin");
      localStorage.setItem("authToken", token);
      setIsAuthenticated(true);
    }
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUserName("");
    setUserId(null);
    setIsAdmin(false);
    setLogoutMessage("로그아웃되었습니다.");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userName,
        userId,
        isAdmin,
        isLoading,
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
