import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { loginWithCredentials } from "../models/AuthModel";
import { signupUser } from "../models/AuthModel";
import axios from "axios";
import { toast } from "react-toastify";

export const handleSignup = async (
  email,
  password,
  username,
  navigate,
  setError
) => {
  try {
    const res = await axios.post("http://localhost:5001/auth/signup", {
      email,
      password,
      username,
    });

    toast.success("회원가입이 완료되었습니다!");
    navigate("/login"); // 또는 자동 로그인 처리
  } catch (err) {
    if (err.response?.status === 409) {
      setError("이미 사용 중인 이메일입니다.");
      toast.error("이미 사용 중인 이메일입니다.");
    } else {
      setError("회원가입 중 오류가 발생했습니다.");
      toast.error("회원가입에 실패했습니다.");
    }
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

  return {
    handleLogin,
  };
};
