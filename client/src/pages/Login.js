import React, { useState } from "react";
import KakaoLogin from "react-kakao-login";
import { useLoginController } from "../controllers/AuthController";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { handleLogin, handleKakaoLogin, handleKakaoFailure } =
    useLoginController();

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <div className="kakao-login">
          <KakaoLogin
            token="7626e58296e58b69c6e7c27170cf415f" // 카카오 REST API 키
            onSuccess={handleKakaoLogin}
            onFail={handleKakaoFailure}
            scope="profile_nickname,account_email"
            redirectUri="http://localhost:3000/oauth" // Redirect URI 등록
            style={{
              padding: "10px 20px",
              backgroundColor: "#FEE500",
              color: "#000",
              border: "none",
              borderRadius: "5px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            카카오톡 간편 로그인
          </KakaoLogin>
        </div>
      </div>
    </div>
  );
}

export default Login;
