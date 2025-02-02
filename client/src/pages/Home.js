import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../controllers/ProductController";
import "../styles/Home.css";
import bpicture1 from "../banner/shoppingmallbanner.jpg";
import bpicture2 from "../banner/shoppingmallbannerSub.jpg";
import bpicture3 from "../banner/shoppingmallbannerSub2.jpg";
import c1 from "../banner/c1.jpg";
import c2 from "../banner/c2.jpg";
import c3 from "../banner/c3.jpg";

function Home() {
  const { products, isLoading, error } = useProducts(null); // 모든 상품 가져오기

  const [currentIndex, setCurrentIndex] = useState(0);
  const bannerImages = [c1, c2, c3];

  // 캐러셀 자동 이동
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 3000); // 3초마다 변경

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-container">
      {/* 캐러셀 추가 부분 */}
      <div className="carousel">
        <div
          className="carousel-images"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`, // 이미지가 좌측으로 이동
          }}
        >
          {bannerImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt="Banner"
              className="carousel-image"
            />
          ))}
        </div>
      </div>

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
          <Link to="/shop?category=perfume" className="banner-button">
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
            <Link to="/shop?category=makeup" className="sub-banner-link">
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
            <Link to="/shop?category=skincare" className="sub-banner-link">
              스킨케어 라인업 보기
            </Link>
          </div>
        </div>
      </div>

      <section className="products-section">
        <h2 className="section-title">Our Bestsellers</h2>
        {isLoading && <div className="loading">로딩 중...</div>}
        {error && <div className="error">{error}</div>}
        <div className="products">
          <div className="products-wrapper">
            {products &&
              [...products, ...products].map((product) => (
                <div key={product.id} className="product">
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
