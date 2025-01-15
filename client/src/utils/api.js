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

// 프로필 가져오기
export const getProfile = async (token) => {
  try {
    const response = await api.get("profile/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "프로필을 가져오는 중 오류가 발생했습니다."
    );
  }
};

// 배송지 목록 가져오기
export const getAddresses = async (token) => {
  try {
    const response = await api.get("profile/addresses", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "배송지를 가져오는 중 오류가 발생했습니다."
    );
  }
};

// 배송지 추가하기
export const addAddress = async (token, address) => {
  try {
    const response = await api.post("profile/addresses", address, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "배송지 추가 중 오류가 발생했습니다."
    );
  }
};

// 배송지 업데이트하기
export const updateAddress = async (token, addressId, updatedAddress) => {
  try {
    const response = await api.put(
      `profile/addresses/${addressId}`,
      updatedAddress,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "배송지 업데이트 중 오류가 발생했습니다."
    );
  }
};

// 배송지 삭제하기
export const deleteAddress = async (token, addressId) => {
  try {
    const response = await api.delete(`profile/addresses/${addressId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "배송지 삭제 중 오류가 발생했습니다."
    );
  }
};

// QnA 데이터를 가져오는 함수
export const getQnaData = async (token) => {
  try {
    const response = await api.get("/qna/user/qna", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "QnA 데이터를 가져오는 데 실패했습니다."
    );
  }
};

// getOrders 함수 수정
export const getOrders = async (token) => {
  try {
    const response = await api.get("profile/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "주문 내역을 가져오는 데 실패했습니다."
    );
  }
};

export default api;
