import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithCredentials } from "../models/AuthModel";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginWithCredentials(email, password);
      alert("Login successful!");
      localStorage.setItem("token", data.token); // 토큰 저장
      navigate("/"); // 마이페이지로 이동
    } catch (error) {
      console.error("Login Error:", error);
      alert("Invalid credentials");
    }
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
      </div>
    </div>
  );
}

export default Login;
