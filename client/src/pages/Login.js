import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import KakaoLogin from "react-kakao-login";
import { useAuth } from "../AuthContext";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // useAuth에서 login 함수 가져오기

  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5001/auth/login", { email, password })
      .then((response) => {
        alert("Login successful!");
        login(response.data.token); // 전역 상태 업데이트
        navigate("/");
      })
      .catch((error) => {
        console.error("Login Error:", error);
        alert("Invalid credentials");
      });
  };

  const handleKakaoSuccess = async (response) => {
    try {
      const kakaoAccessToken = response.response.access_token;

      // 카카오 액세스 토큰을 서버로 전송하여 인증 처리
      const res = await axios.post("http://localhost:5001/auth/kakao-login", {
        accessToken: kakaoAccessToken,
      });

      alert("Kakao Login successful!");
      login(res.data.token); // 전역 상태 업데이트
      navigate("/"); // 로그인 후 홈 페이지로 이동
    } catch (err) {
      console.error("Kakao Login Error:", err);
      alert("Kakao Login failed");
    }
  };

  const handleKakaoFailure = (error) => {
    console.error("Kakao Login Failure:", error);
    alert("Kakao Login failed");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
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
            onSuccess={handleKakaoSuccess}
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
