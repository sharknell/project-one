import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getProfile = async (token) => {
  try {
    const response = await api.get("profile/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "프로필을 가져오는 중 오류가 발생했습니다."
    );
  }
};

export const getAddresses = async (token) => {
  try {
    const response = await api.get("profile/addresses", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "배송지를 가져오는 중 오류가 발생했습니다."
    );
  }
};

export const addAddress = async (token, address) => {
  try {
    const response = await api.post("profile/addresses", address, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "배송지 추가 중 오류가 발생했습니다."
    );
  }
};

export const updateAddress = async (token, addressId, updatedAddress) => {
  try {
    const response = await api.put(
      `profile/addresses/${addressId}`,
      updatedAddress,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "배송지 업데이트 중 오류가 발생했습니다."
    );
  }
};

export const deleteAddress = async (token, addressId) => {
  try {
    const response = await api.delete(`profile/addresses/${addressId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "배송지 삭제 중 오류가 발생했습니다."
    );
  }
};

export const getQnaData = async (token) => {
  try {
    const response = await api.get("/qna/user/qna", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
    console.log(response.data);
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "QnA 데이터를 가져오는 데 실패했습니다."
    );
  }
};

export const getOrders = async (token) => {
  try {
    const response = await api.get("profile/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "주문 내역을 가져오는 데 실패했습니다."
    );
  }
};
export const submitReview = async (token, reviewData) => {
  try {
    const response = await api.post("/profile/reviews", reviewData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "리뷰 저장 실패");
  }
};

// utils/api.js

export const getReviews = async (token) => {
  try {
    const response = await api.get("/profile/reviews", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "리뷰 데이터를 가져오는 데 실패했습니다."
    );
  }
};

export const submitQna = async (qnaData) => {
  const response = await fetch(`${API_BASE_URL}/qna`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(qnaData),
  });
  if (!response.ok) throw new Error("QnA 제출 실패");
  return response.json();
};

// 답변 조회 함수
export const fetchAnswers = async (qnaId) => {
  try {
    const response = await axios.get(`/qna/qna/${qnaId}/answers`);
    return response.data.data.length > 0 ? response.data.data[0] : null;
  } catch (error) {
    console.error(`답변 조회 실패 (QnA ID: ${qnaId}):`, error);
    return null;
  }
};

export default api;
