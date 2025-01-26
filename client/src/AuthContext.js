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
    const decoded = JSON.parse(jsonPayload);
    console.log("Decoded JWT Payload:", decoded); // 디코딩된 JWT payload 확인
    return decoded;
  } catch (e) {
    console.error("JWT Parsing Error:", e);
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
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // 어드민 상태 추가

  // 리프레시 토큰을 통한 액세스 토큰 갱신 함수
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new Error("리프레시 토큰이 존재하지 않습니다.");
    }

    try {
      const response = await fetch("/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(
          "리프레시 토큰으로 새로운 액세스 토큰을 발급할 수 없습니다."
        );
      }

      const data = await response.json();
      const { accessToken } = data;
      localStorage.setItem("authToken", accessToken); // 새 액세스 토큰 저장
      return accessToken;
    } catch (error) {
      console.error("리프레시 토큰 오류:", error);
      throw error;
    }
  };

  // 로컬스토리지에서 인증 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUserName = localStorage.getItem("userName");

    if (token && storedUserName) {
      const user = parseJwt(token);
      if (user) {
        // 액세스 토큰이 만료되었을 경우 리프레시 토큰을 통해 새 토큰 발급
        if (new Date(user.exp * 1000) < new Date()) {
          refreshAccessToken()
            .then((newToken) => {
              const newUser = parseJwt(newToken);
              setIsAuthenticated(true);
              setUserName(newUser.username);
              setUserId(newUser.id);
              setIsAdmin(newUser.role === "admin");
            })
            .catch(() => {
              setIsAuthenticated(false);
              setIsLoading(false);
            });
        } else {
          setIsAuthenticated(true); // 토큰이 유효한 경우
          setUserName(user.username);
          setUserId(user.id);
          setIsAdmin(user.role === "admin");
        }
      }
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false); // 로딩 완료
  }, []);

  const login = (token, refreshToken) => {
    const user = parseJwt(token); // 토큰을 디코딩하여 사용자 정보 추출
    if (user) {
      setUserName(user.username); // 추출된 사용자 이름 설정
      setUserId(user.id); // userId 설정
      setIsAdmin(user.role === "admin"); // JWT에서 어드민 여부 설정
      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", refreshToken); // 리프레시 토큰 저장
      localStorage.setItem("userName", user.username); // 사용자 이름 로컬스토리지에 저장
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userName");
    setIsAuthenticated(false);
    setUserName(""); // 로그아웃 시 사용자 이름 초기화
    setUserId(null); // 로그아웃 시 userId 초기화
    setIsAdmin(false); // 로그아웃 시 어드민 상태 초기화
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
