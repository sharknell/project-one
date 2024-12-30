import axios from "axios";

export const loginWithCredentials = async (email, password) => {
  const response = await axios.post("http://localhost:5001/auth/login", {
    email,
    password,
  });
  return response.data;
};

export const loginWithKakao = async (kakaoAccessToken) => {
  const response = await axios.post("http://localhost:5001/auth/kakao-login", {
    accessToken: kakaoAccessToken,
  });
  return response.data;
};
export const signupUser = async (email, password, username) => {
  try {
    const response = await axios.post("http://localhost:5001/auth/signup", {
      email,
      password,
      username,
    });
    return response;
  } catch (error) {
    throw new Error("회원가입 실패");
  }
};
