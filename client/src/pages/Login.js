import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { loginWithCredentials } from "../models/AuthModel";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/"; // 로그인 후 돌아갈 경로, 없으면 홈으로

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token, userName } = await loginWithCredentials(email, password); // 사용자 이름을 포함한 응답 받음
      alert("환영합니다!");
      login(token, userName); // 로그인 후 사용자 이름도 전달
      navigate(from, { replace: true }); // 로그인 후 이전 페이지로 리디렉션
    } catch (error) {
      console.error("Login Error:", error);
      alert("계정 오류");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">로그인</h1>
        <p className="login-description">계정 정보를 입력해 주세요.</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            로그인
          </button>
        </form>
        <p className="signup-prompt">
          계정이 없으신가요? <a href="/signup">회원가입</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
