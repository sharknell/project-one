import axios from "axios";

export const fetchProducts = async () => {
  try {
    const response = await axios.get("http://localhost:5001/shop");
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      return [];
    }
  } catch (err) {
    throw new Error("상품 목록을 가져오는 데 실패했습니다.");
  }
};
export const getProductById = async (id) => {
  try {
    const response = await axios.get(
      `http://localhost:5001/shop/product/${id}`
    );
    return response.data;
  } catch (error) {
    throw new Error("제품 정보를 불러오는 데 오류가 발생했습니다.");
  }
};
export const fetchProductsByCategory = async (category) => {
  try {
    const response = await axios.get(
      `http://localhost:5001/shop/category/${category}`
    );
    return response.data;
  } catch (error) {
    throw new Error("상품 목록을 불러오는 데 오류가 발생했습니다.");
  }
};
