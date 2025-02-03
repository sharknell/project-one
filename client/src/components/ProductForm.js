import React, { useState } from "react";
import "./ProductForm.css";

const ProductForm = ({ setNewProduct, handleSubmit }) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [newProduct, setProduct] = useState({
    name: "",
    price: "",
    category: "",
    effect: "",
    size: "",
    stock: "",
    description: "",
    detailed_info: "",
    art_of_perfuming: "",
    shipping_time: "",
    return_policy: "",
    images: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; // 첫 번째 파일만 선택
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file); // 단일 이미지만 업로드

    setUploading(true);
    try {
      const response = await fetch("http://localhost:5001/shop/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setImageUrls([data.imageUrl]); // 이미지 URL 하나만 설정
        setProduct((prev) => ({
          ...prev,
          images: [data.imageUrl], // 단일 이미지 URL 저장
        }));
      } else {
        alert("이미지 업로드 실패");
      }
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="product-form">
      <h2>상품 등록</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(newProduct); // 여기서 handleSubmit 호출
        }}
      >
        <label>
          상품명:
          <input
            type="text"
            name="name"
            value={newProduct.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          가격:
          <input
            type="number"
            name="price"
            value={newProduct.price}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          카테고리:
          <input
            type="text"
            name="category"
            value={newProduct.category}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          효과:
          <input
            type="text"
            name="effect"
            value={newProduct.effect}
            onChange={handleChange}
          />
        </label>

        <label>
          사이즈:
          <input
            type="text"
            name="size"
            value={newProduct.size}
            onChange={handleChange}
          />
        </label>

        <label>
          재고:
          <input
            type="number"
            name="stock"
            value={newProduct.stock}
            onChange={handleChange}
          />
        </label>

        <label>
          설명:
          <textarea
            name="description"
            value={newProduct.description}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          상세 정보:
          <textarea
            name="detailed_info"
            value={newProduct.detailed_info}
            onChange={handleChange}
          />
        </label>

        <label>
          향수 사용법:
          <textarea
            name="art_of_perfuming"
            value={newProduct.art_of_perfuming}
            onChange={handleChange}
          />
        </label>

        <label>
          배송 기간:
          <input
            type="text"
            name="shipping_time"
            value={newProduct.shipping_time}
            onChange={handleChange}
          />
        </label>

        <label>
          반품 정책:
          <textarea
            name="return_policy"
            value={newProduct.return_policy}
            onChange={handleChange}
          />
        </label>

        <label>
          이미지 업로드:
          <input
            type="file"
            name="image" // Multer에서 기대하는 필드 이름
            accept="image/*"
            onChange={handleImageUpload} // 파일 한 개만 선택 가능
          />
        </label>

        {uploading && <p>이미지 업로드 중...</p>}
        <div className="image-preview">
          {imageUrls.length > 0 && (
            <img
              src={`http://localhost:5001/product/${imageUrls[0]}`}
              alt="업로드된 이미지"
              width="100"
            />
          )}
        </div>

        <button type="submit">상품 등록</button>
      </form>
    </div>
  );
};

export default ProductForm;
