import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { loginWithCredentials } from "../models/AuthModel";
import { signupUser } from "../models/AuthModel";

export const handleSignup = async (
  email,
  password,
  username,
  navigate,
  setError
) => {
  try {
    const response = await signupUser(email, password, username);
    alert("Signup successful!");
    navigate("/login");
  } catch (error) {
    setError("회원가입 실패");
    alert("Signup failed");
  }
};

export const useLoginController = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // useAuth에서 login 함수 가져오기

  const handleLogin = async (email, password) => {
    try {
      const data = await loginWithCredentials(email, password);
      alert("Login successful!");
      login(data.token); // 전역 상태 업데이트
      navigate("/"); // 홈 페이지로 이동
    } catch (error) {
      console.error("Login Error:", error);
      alert("Invalid credentials");
    }
  };

  const handleKakaoFailure = (error) => {
    console.error("Kakao Login Failure:", error);
    alert("Kakao Login failed");
  };

  return {
    handleLogin,
    handleKakaoLogin,
    handleKakaoFailure,
  };
};
