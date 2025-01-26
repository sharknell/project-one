import React, { useState } from "react";
import "./ProductForm.css";

const ProductForm = ({
  newProduct,
  setNewProduct,
  handleAddProduct,
  handleImageUpload,
}) => {
  const [mainImage, setMainImage] = useState(null); // 메인 이미지 파일
  const [subImages, setSubImages] = useState([]); // 서브 이미지 파일 목록
  const categories = ["perfume", "skincare", "makeup"]; // 고정된 카테고리 목록

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    setMainImage(file);
  };

  const handleSubImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setSubImages([...subImages, ...files]);
  };

  const handleCategoryChange = (e) => {
    setNewProduct({ ...newProduct, category: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 이미지 업로드 처리
    const uploadedMainImageUrl = await handleImageUpload(mainImage, "main");
    const uploadedSubImageUrls = await handleImageUpload(subImages, "sub");

    // mainImage와 subImages URL을 newProduct에 반영
    setNewProduct({
      ...newProduct,
      image_url: uploadedMainImageUrl,
      sub_images: uploadedSubImageUrls,
    });

    handleAddProduct(); // 상품 등록
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>상품 등록</h2>
      {Object.keys(newProduct).map((key) => {
        if (key === "category") {
          return (
            <div key={key} className="input-group">
              <label htmlFor={key}>카테고리</label>
              <select
                id={key}
                value={newProduct[key]}
                onChange={handleCategoryChange}
                required
              >
                <option value="">카테고리를 선택하세요</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return (
          <div key={key} className="input-group">
            <label htmlFor={key}>{key}</label>
            {key === "description" ||
            key === "effect" ||
            key === "return_policy" ||
            key === "art_of_perfuming" ||
            key === "detailed_info" ? (
              <textarea
                id={key}
                value={newProduct[key]}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, [key]: e.target.value })
                }
                required={key !== "size"}
              />
            ) : (
              <input
                id={key}
                type={key === "price" || key === "stock" ? "number" : "text"}
                value={newProduct[key]}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, [key]: e.target.value })
                }
                required={key !== "size"}
              />
            )}
          </div>
        );
      })}

      <div className="input-group">
        <label htmlFor="mainImage">메인 이미지</label>
        <input
          type="file"
          id="mainImage"
          accept="image/*"
          onChange={handleMainImageChange}
        />
      </div>

      <div className="input-group">
        <label htmlFor="subImages">서브 이미지</label>
        <input
          type="file"
          id="subImages"
          accept="image/*"
          multiple
          onChange={handleSubImagesChange}
        />
      </div>

      <button type="submit" className="submit-btn">
        상품 등록
      </button>
    </form>
  );
};

export default ProductForm;
