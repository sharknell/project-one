import axios from "axios";

// 사용자 프로필 가져오기
export const getUserProfile = async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error("User profile fetch failed");
  }
  return response.json();
};

// 사용자 프로필 업데이트
export const updateUserProfile = async (userId, email, username) => {
  try {
    const response = await axios.put(`http://localhost:5001/user/${userId}`, {
      email,
      username,
    });
    return response.data;
  } catch (error) {
    throw new Error("사용자 정보를 업데이트하는 데 실패했습니다.");
  }
};
