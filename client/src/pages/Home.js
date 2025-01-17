import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../controllers/ProductController";
import "../styles/Home.css";
import bpicture1 from "../banner/shoppingmallbanner.jpg";
import bpicture2 from "../banner/shoppingmallbannerSub.jpg";
import bpicture3 from "../banner/shoppingmallbannerSub2.jpg";

function Home() {
  const { products, isLoading, error } = useProducts();
  const scrollWrapperRef = useRef(null);

  useEffect(() => {
    const scrollWrapper = scrollWrapperRef.current;
    if (scrollWrapper) {
      let scrollAmount = 0; // 초기 스크롤 양
      const scrollSpeed = 1; // 스크롤 속도
      const scrollInterval = setInterval(() => {
        scrollWrapper.scrollLeft = scrollAmount;
        scrollAmount += scrollSpeed;
        if (scrollAmount >= scrollWrapper.scrollWidth / 2) {
          scrollAmount = 0; // 스크롤을 다시 처음으로
        }
      }, 16); // 60fps에 해당하는 16ms 간격
      return () => clearInterval(scrollInterval);
    }
  }, []);

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">Welcome to Perfume Shop</h1>
        <p className="home-subtitle">
          Discover luxurious fragrances to elevate your senses
        </p>
      </header>

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

      <section className="products-section">
        <h2 className="section-title">Our Bestsellers</h2>
        {isLoading && <div className="loading">로딩 중...</div>}
        {error && <div className="error">{error}</div>}
        <div className="products" ref={scrollWrapperRef}>
          <div className="products-wrapper">
            {products &&
              products.map((product, index) => (
                <div key={`${product.id}-${index}`} className="product">
                  <img
                    src={product.image_url || "/default-image.jpg"}
                    alt={product.name || "상품명 없음"}
                    className="product-image"
                  />
                  <h3 className="product-name">
                    {product.name || "상품명 없음"}
                  </h3>
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
            {/* 동일한 상품 목록을 반복적으로 추가 */}
            {products &&
              products.map((product, index) => (
                <div key={`${product.id}-repeat-${index}`} className="product">
                  <img
                    src={product.image_url || "/default-image.jpg"}
                    alt={product.name || "상품명 없음"}
                    className="product-image"
                  />
                  <h3 className="product-name">
                    {product.name || "상품명 없음"}
                  </h3>
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
        </div>
      </section>
    </div>
  );
}

export default Home;
