import React, { useState, useEffect } from "react";
import "../../styles/ProductList.css";

const ProductList = ({ products, API_BASE_URL, onDelete, onEdit }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const openModal = (product) => {
    setSelectedProduct({
      ...product,
      newSubImages: [], // 새로 추가된 보조 이미지는 빈 배열로 초기화
      removedSubImages: [], // 삭제된 보조 이미지는 빈 배열로 초기화
    });
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

  // 보조 이미지 선택 처리
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

  // 기존 보조 이미지 삭제
  const handleRemoveExistingSubImage = (index) => {
    const imageToRemove = selectedProduct.subImages[index];
    setSelectedProduct((prev) => ({
      ...prev,
      subImages: prev.subImages.filter((_, i) => i !== index),
      removedSubImages: [...prev.removedSubImages, imageToRemove],
    }));
  };

  // 새로 추가된 보조 이미지 삭제
  const handleRemoveNewSubImage = (index) => {
    setSelectedProduct((prev) => ({
      ...prev,
      newSubImages: prev.newSubImages.filter((_, i) => i !== index),
    }));
  };

  // 입력된 값 수정 처리
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 상품 수정 저장 처리
  const handleSaveEdit = () => {
    if (!selectedProduct) return;

    const formData = new FormData();
    formData.append("id", selectedProduct.id);
    formData.append("name", selectedProduct.name || "");
    formData.append("price", selectedProduct.price || 0);
    formData.append("category", selectedProduct.category || "");
    formData.append("description", selectedProduct.description || "");

    // 유지할 기존 보조 이미지
    if (selectedProduct.subImages) {
      selectedProduct.subImages.forEach((image) => {
        formData.append("existingImages", image);
      });
    }

    // 삭제할 기존 보조 이미지
    if (selectedProduct.removedSubImages) {
      selectedProduct.removedSubImages.forEach((image) => {
        formData.append("removedImages", image);
      });
    }

    // 새로 추가된 보조 이미지
    selectedProduct.newSubImages.forEach((image) => {
      formData.append("addimages", image.file);
      console.log(selectedProduct.newSubImages);
    });

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

              <div>
                <h3>보조 이미지</h3>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSubImageChange}
                />

                <div className="sub-images-container">
                  {/* 기존 보조 이미지 */}
                  {selectedProduct.subImages?.length > 0 && (
                    <div>
                      <h4>기존 보조 이미지</h4>
                      {selectedProduct.subImages.map((subImage, index) => (
                        <div key={index} className="sub-image-wrapper">
                          <img
                            src={`${API_BASE_URL}/uploads/productImages/${subImage}`}
                            alt={`보조 이미지 ${index + 1}`}
                            className="modal-sub-image"
                          />
                          <button
                            onClick={() => handleRemoveExistingSubImage(index)}
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 새로 추가된 이미지 */}
                  {selectedProduct.newSubImages?.length > 0 && (
                    <div>
                      <h4>새로 추가된 보조 이미지</h4>
                      {selectedProduct.newSubImages.map((image, index) => (
                        <div key={index} className="sub-image-wrapper">
                          <img
                            src={image.preview}
                            alt={`새 이미지 ${index + 1}`}
                            className="modal-sub-image"
                          />
                          <button
                            onClick={() => handleRemoveNewSubImage(index)}
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
