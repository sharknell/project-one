import axios from "axios";

axios.defaults.baseURL = "http://localhost:5001/shop";

// 대표 이미지 업로드 함수
export const uploadMainImage = async (image) => {
  const imageFormData = new FormData();
  imageFormData.append("image", image);

  const response = await axios.post("/upload", imageFormData);
  return response.data.imageUrl;
};

// 서브 이미지 업로드 함수
export const uploadSubImages = async (subImages) => {
  const subImageFormData = new FormData();
  subImages.forEach((img) => subImageFormData.append("images", img));

  const response = await axios.post("/upload/multiple", subImageFormData);
  return response.data.imageUrls;
};

// 상품 등록 함수
export const createProduct = async (productData) => {
  const response = await axios.post("/products", productData);
  return response;
};
