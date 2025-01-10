import React, { createContext, useState, useEffect, useContext } from "react";

// JWT 토큰을 디코딩하여 사용자 정보를 가져오는 함수
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
    return null;
  }
};

// 인증 상태를 관리하는 컨텍스트 생성
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");

  // 로컬스토리지에서 인증 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUserName = localStorage.getItem("userName");

    if (token && storedUserName) {
      setIsAuthenticated(true); // 토큰이 있으면 인증됨
      setUserName(storedUserName); // 사용자 이름 설정
    }
    setIsLoading(false); // 로딩 완료
  }, []);

  const login = (token) => {
    const user = parseJwt(token); // 토큰을 디코딩하여 사용자 정보 추출
    if (user) {
      setUserName(user.username); // 추출된 사용자 이름 설정
      localStorage.setItem("authToken", token);
      localStorage.setItem("userName", user.username); // 사용자 이름 로컬스토리지에 저장
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    setIsAuthenticated(false);
    setUserName(""); // 로그아웃 시 사용자 이름 초기화
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userName, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
