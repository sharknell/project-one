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

        const mainImageRes = await axios.post("/upload", imageFormData);
        mainImageUrl = mainImageRes.data.imageUrl;
      }

      // ✅ 서브 이미지 업로드
      if (formData.subImages.length > 0) {
        const subImageFormData = new FormData();
        formData.subImages.forEach((img) =>
          subImageFormData.append("images", img)
        );

        const subImageRes = await axios.post(
          "/upload/multiple",
          subImageFormData
        );
        subImageUrls = subImageRes.data.imageUrls;
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

      const productRes = await axios.post("/products", productData);
      alert("상품 등록 성공!");
    } catch (error) {
      alert("상품 등록 실패!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h2>상품 등록</h2>

      <div className="form-group">
        <label>상품명</label>
        <input
          type="text"
          name="name"
          placeholder="상품명"
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>가격</label>
        <input
          type="number"
          name="price"
          placeholder="가격"
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>카테고리</label>
        <select name="category" onChange={handleChange} required>
          <option value="">카테고리 선택</option>
          <option value="makeup">Makeup</option>
          <option value="perfume">Perfume</option>
          <option value="skincare">Skincare</option>
        </select>
      </div>

      <div className="form-group">
        <label>효과</label>
        <input
          type="text"
          name="effect"
          placeholder="효과"
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>사이즈</label>
        <input
          type="text"
          name="size"
          placeholder="사이즈"
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>설명</label>
        <textarea
          name="description"
          placeholder="설명"
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>상세 정보</label>
        <textarea
          name="detailedInfo"
          placeholder="상세 정보"
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>퍼퓨밍 아트</label>
        <textarea
          name="artOfPerfuming"
          placeholder="퍼퓨밍 아트"
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>배송 기간</label>
        <input
          type="text"
          name="shippingTime"
          placeholder="배송 기간"
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>반품 정책</label>
        <textarea
          name="returnPolicy"
          placeholder="반품 정책"
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>대표 이미지</label>
        <input type="file" onChange={handleImageChange} required />
      </div>

      <div className="form-group">
        <label>서브 이미지</label>
        <input type="file" multiple onChange={handleSubImagesChange} />
      </div>

      <button type="submit">상품 등록</button>
    </form>
  );
};

export default ProductForm;
