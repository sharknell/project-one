import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleSignup } from "../controllers/AuthController";
import "../styles/Signup.css";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isAgreed, setIsAgreed] = useState(false); // 개인정보 보호 동의 상태 추가
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAgreed) {
      setError("개인정보 보호 동의가 필요합니다.");
      return;
    }
    handleSignup(email, password, username, navigate, setError);
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1>Signup</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
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
          <div className="agreement-section">
            <label>
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={() => setIsAgreed(!isAgreed)}
              />
              개인정보 보호 정책에 동의합니다.
            </label>
          </div>
          <button type="submit" disabled={!isAgreed}>
            Signup
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
