import React, { useState, useEffect } from "react";
import "../../styles/ProductList.css";

const ProductList = ({ products, API_BASE_URL, onDelete, onEdit }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const openModal = (product) => {
    setSelectedProduct({ ...product, newSubImages: [] });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!isModalOpen) {
      setSelectedProduct(null);
      setIsEditing(false);
    }
  }, [isModalOpen]);

  const handleSubImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files
      .filter(
        (file) =>
          !selectedProduct.newSubImages.some(
            (img) => img.file.name === file.name
          )
      )
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

    setSelectedProduct((prev) => ({
      ...prev,
      newSubImages: [...(prev.newSubImages || []), ...newImages],
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = () => {
    if (!selectedProduct) return;

    const formData = new FormData();
    formData.append("id", selectedProduct.id);
    formData.append("name", selectedProduct.name || ""); // 빈 문자열로 기본값 설정
    formData.append("price", selectedProduct.price || 0);
    formData.append("category", selectedProduct.category || "");
    formData.append("description", selectedProduct.description || "");

    // 기존 보조 이미지 유지
    if (selectedProduct.subImages) {
      selectedProduct.subImages.forEach((image) => {
        formData.append("existingImages", image);
      });
    }

    // 새로운 보조 이미지 추가
    selectedProduct.newSubImages.forEach((image) => {
      formData.append("newImages", image.file);
    });

    console.log("보낼 데이터:", Object.fromEntries(formData.entries())); // 디버깅 로그 추가

    fetch(`${API_BASE_URL}/shop/product/${selectedProduct.id}`, {
      method: "PUT",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "상품이 성공적으로 업데이트되었습니다.") {
          onEdit(selectedProduct);
          closeModal();
        } else {
          alert("상품 업데이트에 실패했습니다.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("상품 업데이트 중 오류가 발생했습니다.");
      });
  };

  return (
    <div className="dashboard-section">
      {products.length > 0 ? (
        <table className="product-list-table">
          <thead>
            <tr>
              <th>상품명</th>
              <th>가격</th>
              <th>카테고리</th>
              <th>대표 이미지</th>
              <th>조치</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.price.toLocaleString()} 원</td>
                <td>{product.category}</td>
                <td>
                  {product.image_url ? (
                    <img
                      src={`${API_BASE_URL}/uploads/productImages/${product.image_url}`}
                      alt={product.name}
                      className="product-image"
                    />
                  ) : (
                    "이미지 없음"
                  )}
                </td>
                <td>
                  <button
                    className="view-button"
                    onClick={() => openModal(product)}
                  >
                    자세히 보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="product-list-empty">등록된 제품이 없습니다.</p>
      )}

      {/* 모달 */}
      {selectedProduct && (
        <div
          className={`modal-overlay ${isModalOpen ? "open" : "close"}`}
          onClick={closeModal}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProduct.name}</h2>
            </div>
            <div className="modal-body">
              <p>상품 아이디: {selectedProduct.id}</p>

              {isEditing ? (
                <div>
                  <label>
                    상품명:
                    <input
                      type="text"
                      name="name"
                      value={selectedProduct.name}
                      onChange={handleEditChange}
                    />
                  </label>
                  <label>
                    가격:
                    <input
                      type="number"
                      name="price"
                      value={selectedProduct.price}
                      onChange={handleEditChange}
                    />
                  </label>
                  <label>
                    카테고리:
                    <input
                      type="text"
                      name="category"
                      value={selectedProduct.category}
                      onChange={handleEditChange}
                    />
                  </label>
                  <label>
                    설명:
                    <textarea
                      name="description"
                      value={selectedProduct.description}
                      onChange={handleEditChange}
                    />
                  </label>
                </div>
              ) : (
                <div>
                  <p>상품 명: {selectedProduct.name}</p>
                  <p>가격: {selectedProduct.price.toLocaleString()} 원</p>
                  <p>카테고리: {selectedProduct.category}</p>
                  <p>설명: {selectedProduct.description}</p>
                </div>
              )}

              <div>
                <h3>대표 이미지</h3>
                {selectedProduct.image_url ? (
                  <img
                    src={`${API_BASE_URL}/uploads/productImages/${selectedProduct.image_url}`}
                    alt={selectedProduct.name}
                    className="modal-main-image"
                  />
                ) : (
                  "이미지 없음"
                )}
              </div>

              {/* 보조 이미지 */}
              <div>
                <h3>보조 이미지</h3>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSubImageChange}
                />
                <div className="sub-images-container">
                  {selectedProduct.subImages &&
                    selectedProduct.subImages.length > 0 && (
                      <div>
                        <h4>기존 보조 이미지</h4>
                        {selectedProduct.subImages.map((subImage, index) => (
                          <div key={index} className="sub-image-wrapper">
                            <img
                              src={`${API_BASE_URL}/uploads/productImages/${subImage}`}
                              alt={`보조 이미지 ${index + 1}`}
                              className="modal-sub-image"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  {selectedProduct.newSubImages &&
                    selectedProduct.newSubImages.map((image, index) => (
                      <div key={index} className="sub-image-wrapper">
                        <img
                          src={image.preview}
                          alt={`보조 이미지 ${index + 1}`}
                          className="modal-sub-image"
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              {isEditing ? (
                <button className="save-button" onClick={handleSaveEdit}>
                  저장
                </button>
              ) : (
                <button
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  편집
                </button>
              )}
              <button
                className="delete-button"
                onClick={() => onDelete(selectedProduct.id)}
              >
                삭제
              </button>
              <button className="close-button" onClick={closeModal}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
