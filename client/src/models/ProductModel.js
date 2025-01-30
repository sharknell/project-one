import axios from "axios";

export const fetchProducts = async () => {
  try {
    const response = await axios.get("http://localhost:5001/shop");
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data; // 전체 상품 데이터를 반환
    } else {
      throw new Error("상품 목록이 비어 있습니다.");
    }
  } catch (err) {
    console.error("상품 목록을 가져오는 데 실패했습니다.", err);
    throw new Error("상품 목록을 가져오는 데 실패했습니다.");
  }
};
// 특정 ID로 상품 조회
export const getProductById = async (id) => {
  try {
    const response = await axios.get(
      `http://localhost:5001/shop/product/${id}`
    );
    console.log("응답 데이터:", response.data); // 응답 데이터 로깅
    if (response.data) {
      return response.data; // product가 아니라 response.data를 반환
    } else {
      throw new Error("상품 정보를 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error(
      `제품 ID ${id} 정보를 불러오는 데 오류가 발생했습니다.`,
      error
    );
    throw new Error("제품 정보를 불러오는 데 오류가 발생했습니다.");
  }
};

// 카테고리별 상품 조회 함수
export const fetchProductsByCategory = async (category) => {
  try {
    const response = await axios.get(
      `http://localhost:5001/shop${
        category !== "all" ? `/category/${category}` : ""
      }`
    );
    if (response.data) {
      return response.data; // 카테고리별 상품 데이터 반환
    } else {
      throw new Error("해당 카테고리의 상품이 없습니다.");
    }
  } catch (error) {
    console.error(
      `카테고리 ${category}의 상품을 불러오는 데 오류가 발생했습니다.`,
      error
    );
    throw new Error("상품 목록을 불러오는 데 오류가 발생했습니다.");
  }
};

export const loadProducts = async (
  category,
  setProducts,
  setError,
  setIsLoading
) => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch(
      `/shop${category !== "all" ? `/category/${category}` : ""}`
    );
    const data = await response.json();

    if (response.ok) {
      setProducts(data.data);
    } else {
      setError(data.message || "상품을 불러오는 데 실패했습니다.");
    }
  } catch (error) {
    setError("서버 오류가 발생했습니다.");
  } finally {
    setIsLoading(false);
  }
};
