import axios from "axios";

// axios 인스턴스 생성
const api = axios.create({
  baseURL: "http://localhost:5001", // 기본 URL 설정
});

// 로그인 함수
export const loginWithCredentials = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  // 로그인 성공 시 토큰과 사용자 이름을 함께 반환
  return {
    token: response.data.token,
    userName: response.data.userName, // 사용자 이름 추가
  };
};

// 카카오 로그인 함수
export const loginWithKakao = async (kakaoAccessToken) => {
  const response = await api.post("/auth/kakao-login", {
    accessToken: kakaoAccessToken,
  });
  return response.data;
};

// 회원 가입 함수
export const signupUser = async (email, password, username) => {
  try {
    const response = await api.post("/auth/signup", {
      email,
      password,
      username,
    });
    return response.data; // 응답 데이터 리턴
  } catch (error) {
    // 서버 오류 메시지나 기타 정보를 포함시켜 더 구체적인 에러를 던짐
    const errorMessage = error.response?.data?.message || "회원가입 실패";
    throw new Error(errorMessage);
  }
};
