import React from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../controllers/ProductController";
import "../styles/Home.css";
import bpicture1 from "../banner/shoppingmallbanner.jpg";
import bpicture2 from "../banner/shoppingmallbannerSub.jpg";
import bpicture3 from "../banner/shoppingmallbannerSub2.jpg";

function Home() {
  const { products, isLoading, error } = useProducts();

  return (
    <div className="home-container">
      {/* 헤더 섹션 */}
      <header className="home-header">
        <h1 className="home-title">Welcome to Perfume Shop</h1>
        <p className="home-subtitle">
          Discover luxurious fragrances to elevate your senses
        </p>
      </header>

      {/* 메인 배너 섹션 */}
      <div className="main-banner">
        <img
          src={bpicture1}
          alt="Perfume Collection"
          className="banner-image"
        />
        <div className="banner-overlay">
          <h2 className="banner-text">신비로움으로 가득한</h2>
          <h2 className="banner-text">향수를 선물하세요.</h2>
          <Link to="/shop/perfume" className="banner-button">
            향수 라인업 보기
          </Link>
        </div>
      </div>

      {/* 하단 배너 섹션 */}
      <div className="sub-banners">
        <div className="sub-banner">
          <img
            src={bpicture2}
            alt="Sub Banner Left"
            className="sub-banner-image"
          />
          <div className="sub-banner-overlay">
            <h3 className="sub-banner-title">당신의 매력을 한층 더</h3>
            <p className="sub-banner-text">메이크업으로 완성하세요.</p>
            <Link to="/shop/makeup" className="sub-banner-link">
              메이크업 라인업 보기
            </Link>
          </div>
        </div>
        <div className="sub-banner">
          <img
            src={bpicture3}
            alt="Sub Banner Right"
            className="sub-banner-image"
          />
          <div className="sub-banner-overlay">
            <h3 className="sub-banner-title">맑고 깨끗한 피부의 시작</h3>
            <p className="sub-banner-text">스킨 케어로 빛나세요.</p>
            <Link to="/shop/skincare" className="sub-banner-link">
              스킨케어 라인업 보기
            </Link>
          </div>
        </div>
      </div>

      {/* 상품 섹션 */}
      <section className="products-section">
        <h2 className="section-title">Our Bestsellers</h2>
        {isLoading && <div className="loading">로딩 중...</div>}
        {error && <div className="error">{error}</div>}
        <div className="products">
          {!isLoading && !error && products.length === 0 && (
            <p className="no-products">현재 판매 중인 상품이 없습니다.</p>
          )}
          {products.map((product) => (
            <div key={product.id} className="product">
              <img
                src={product.image_url || "/default-image.jpg"} // 기본 이미지 사용
                alt={product.name || "상품명 없음"} // 기본 텍스트 사용
                className="product-image"
              />
              <h3 className="product-name">{product.name || "상품명 없음"}</h3>
              <p className="product-price">
                {product.price
                  ? `₩${product.price.toLocaleString()}`
                  : "가격 정보 없음"}
              </p>
              <Link
                to={`/shop/product/${product.id}`}
                className="product-details"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
