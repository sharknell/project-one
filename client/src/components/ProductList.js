import React, { useState } from "react";

const ProductList = ({ products, API_BASE_URL, onDelete, onEdit }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
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
                      style={{ maxWidth: "50px", maxHeight: "50px" }}
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

      {/* 팝업 모달 */}
      {isModalOpen && selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedProduct.name}</h2>
            <p>상품 아이디: {selectedProduct.id}</p>
            <p>상품 명: {selectedProduct.name}</p>
            <p>가격: {selectedProduct.price.toLocaleString()} 원</p>
            <p>카테고리: {selectedProduct.category}</p>
            <p>사이즈: {selectedProduct.size}</p>
            <p>설명: {selectedProduct.description}</p>
            <p>상세 설명: {selectedProduct.detailed_info}</p>
            <div>
              <h3>대표 이미지</h3>
              {selectedProduct.image_url ? (
                <img
                  src={`${API_BASE_URL}/uploads/productImages/${selectedProduct.image_url}`}
                  alt={selectedProduct.name}
                  style={{ width: "100%", height: "auto" }}
                />
              ) : (
                "이미지 없음"
              )}
            </div>
            <div>
              <h3>보조 이미지</h3>
              {selectedProduct.subImages && selectedProduct.subImages.length > 0
                ? selectedProduct.subImages.map((subImage, index) => (
                    <img
                      key={index}
                      src={`${API_BASE_URL}/uploads/productImages/${subImage}`}
                      alt={`${selectedProduct.name} 보조 이미지 ${index + 1}`}
                      style={{
                        width: "100px",
                        height: "100px",
                        margin: "10px",
                      }}
                    />
                  ))
                : "보조 이미지 없음"}
            </div>
            <div className="modal-actions">
              <button
                className="edit-button"
                onClick={() => {
                  onEdit(selectedProduct);
                  closeModal();
                }}
              >
                편집
              </button>
              <button
                className="delete-button"
                onClick={() => {
                  onDelete(selectedProduct.id);
                  closeModal();
                }}
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
