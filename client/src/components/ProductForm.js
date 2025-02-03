import React, { useState } from "react";
import axios from "axios";
import "./ProductForm.css";

axios.defaults.baseURL = "http://localhost:5001/shop";

const ProductForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    effect: "",
    size: "",
    description: "",
    detailedInfo: "",
    artOfPerfuming: "",
    shippingTime: "",
    returnPolicy: "",
    image: null, // 대표 이미지
    subImages: [], // 서브 이미지 리스트
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubImagesChange = (e) => {
    setFormData({ ...formData, subImages: [...e.target.files] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let mainImageUrl = "";
      let subImageUrls = [];

      // ✅ 대표 이미지 업로드
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append("image", formData.image);

        console.log("[대표 이미지 업로드 요청] FormData:", formData.image);

        const mainImageRes = await axios.post("/upload", imageFormData);
        mainImageUrl = mainImageRes.data.imageUrl;

        console.log("[대표 이미지 업로드 성공] 이미지 URL:", mainImageUrl);
      }

      // ✅ 서브 이미지 업로드
      if (formData.subImages.length > 0) {
        const subImageFormData = new FormData();
        formData.subImages.forEach((img) =>
          subImageFormData.append("images", img)
        );

        console.log(
          "[서브 이미지 업로드 요청] FormData:",
          subImageFormData.getAll("images")
        );

        const subImageRes = await axios.post(
          "/upload/multiple",
          subImageFormData
        );
        subImageUrls = subImageRes.data.imageUrls;

        console.log(
          "[서브 이미지 업로드 성공] 서브 이미지 URL 목록:",
          subImageUrls
        );
      }

      // ✅ 상품 정보 전송
      const productData = {
        name: formData.name,
        price: formData.price,
        category: formData.category,
        effect: formData.effect,
        size: formData.size,
        description: formData.description,
        detailed_info: formData.detailedInfo,
        art_of_perfuming: formData.artOfPerfuming,
        shipping_time: formData.shippingTime,
        return_policy: formData.returnPolicy,
        image_url: mainImageUrl, // 대표 이미지 URL
        additionalImages: subImageUrls, // 서브 이미지 URL 목록
      };

      console.log(
        "[상품 등록 요청 데이터]:",
        JSON.stringify(productData, null, 2)
      );

      const productRes = await axios.post("/products", productData);
      console.log("[상품 등록 성공] 응답 데이터:", productRes.data);

      alert("상품 등록 성공!");
    } catch (error) {
      console.error("[상품 등록 오류]:", error.response?.data || error.message);
      alert("상품 등록 실패!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="상품명"
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="price"
        placeholder="가격"
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="category"
        placeholder="카테고리"
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="effect"
        placeholder="효과"
        onChange={handleChange}
      />
      <input
        type="text"
        name="size"
        placeholder="사이즈"
        onChange={handleChange}
      />
      <textarea
        name="description"
        placeholder="설명"
        onChange={handleChange}
        required
      />
      <textarea
        name="detailedInfo"
        placeholder="상세 정보"
        onChange={handleChange}
      />
      <textarea
        name="artOfPerfuming"
        placeholder="퍼퓨밍 아트"
        onChange={handleChange}
      />
      <input
        type="text"
        name="shippingTime"
        placeholder="배송 기간"
        onChange={handleChange}
      />
      <textarea
        name="returnPolicy"
        placeholder="반품 정책"
        onChange={handleChange}
      />

      <label>대표 이미지:</label>
      <input type="file" onChange={handleImageChange} required />

      <label>서브 이미지:</label>
      <input type="file" multiple onChange={handleSubImagesChange} />

      <button type="submit">상품 등록</button>
    </form>
  );
};

export default ProductForm;
