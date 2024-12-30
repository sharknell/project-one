import React from "react";
import { useParams } from "react-router-dom";
import { useProductController } from "../controllers/ProductController";
import "../styles/ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const {
    product,
    isLoading,
    error,
    mainImage,
    openDropdown,
    handleThumbnailClick,
    handleButtonClick,
    toggleDropdown,
  } = useProductController(id);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!product) {
    return <div>해당 제품을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail-header">
        <h1>{product.name}</h1>
        <p>{product.tagline}</p>
      </div>
      <div className="product-detail-content">
        <div className="product-detail-main">
          <div className="product-detail-main-image">
            {mainImage ? (
              <img src={mainImage} alt={product.name} />
            ) : (
              <p>메인 이미지가 없습니다.</p>
            )}
          </div>
          <div className="product-detail-thumbnails">
            {product.images && product.images.length > 0 ? (
              product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`썸네일 ${index + 1}`}
                  onClick={() => handleThumbnailClick(image)}
                  className="thumbnail-image"
                />
              ))
            ) : (
              <p>썸네일 이미지가 없습니다.</p>
            )}
          </div>
        </div>
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <hr />
          <p className="product-detail-price">
            ₩{product.price.toLocaleString()}
          </p>
          <p className="product-detail-category">
            <strong>카테고리:</strong> {product.category}
          </p>
          <p className="product-detail-size">
            <strong>사이즈:</strong> {product.size || "없음"}
          </p>
          <p className="product-detail-stock">
            <strong>재고:</strong>{" "}
            {product.stock > 0 ? `${product.stock}개 남음` : "품절"}
          </p>
          <div className="product-detail-buttons">
            <button onClick={() => handleButtonClick("buy")}>구매하기</button>
            <button
              onClick={() => handleButtonClick("wishlist")}
              className="secondary-button"
            >
              찜하기
            </button>
          </div>
        </div>
      </div>
      <div className="product-detail-extra-info">
        <h2>제품 디테일 정보</h2>
        <div className="dropdown">
          <button className="dropdown-toggle" onClick={() => toggleDropdown(0)}>
            설명
          </button>
          {openDropdown === 0 && (
            <div className="dropdown-content">
              <div>
                <h5>{product.name}</h5>
                <p>{product.description}</p>
              </div>
            </div>
          )}
        </div>
        <div className="dropdown">
          <button className="dropdown-toggle" onClick={() => toggleDropdown(1)}>
            리뷰
          </button>
          {openDropdown === 1 && (
            <div className="dropdown-content">
              <p>이 제품에 대한 리뷰가 아직 없습니다.</p>
            </div>
          )}
        </div>
        <div className="dropdown">
          <button className="dropdown-toggle" onClick={() => toggleDropdown(2)}>
            상품 필수 정보
          </button>
          {openDropdown === 2 && (
            <div className="dropdown-content">
              <p>상품의 주요 정보가 여기에 나옵니다.</p>
            </div>
          )}
        </div>
        <div className="dropdown">
          <button className="dropdown-toggle" onClick={() => toggleDropdown(3)}>
            배송과 반품
          </button>
          {openDropdown === 3 && (
            <div className="dropdown-content">
              <p>배송 및 반품 정책에 대한 정보입니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
