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
  const { products, isLoading, error } = useProducts(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const bannerImages = [c1, c2, c3];

  // 캐러셀 자동 이동
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 5000); // 5초마다 변경

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log(products);
  }, [products]);

  return (
    <div className="home-container">
      {/* 캐러셀 */}
      <div className="carousel">
        <div
          className="carousel-images"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
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

      {/* 메인 배너 */}
      <div className="main-banner">
        <img
          src={bpicture1}
          alt="Perfume Collection"
          className="banner-image"
        />
        <div className="banner-overlay">
          <h2 className="banner-title">향수의 향기를 느껴보세요</h2>
          <Link to="/shop?category=perfume" className="banner-button">
            향수 라인업 보기
          </Link>
        </div>
      </div>

      {/* 서브 배너 */}
      <div className="sub-banners">
        <div className="sub-banner">
          <img
            src={bpicture2}
            alt="Sub Banner Left"
            className="sub-banner-image"
          />
          <div className="sub-banner-overlay">
            <h3 className="sub-banner-title">매력적인 당신을 위한</h3>
            <p className="sub-banner-text">메이크업으로 변화를 주다</p>
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
            <h3 className="sub-banner-title">피부에 자연을 담다</h3>
            <p className="sub-banner-text">스킨케어로 더욱 건강한 피부</p>
            <Link to="/shop?category=skincare" className="sub-banner-link">
              스킨케어 라인업 보기
            </Link>
          </div>
        </div>
      </div>

      {/* 베스트셀러 상품 */}
      <section className="products-section">
        <h2 className="section-title">Best Sellers</h2>
        {isLoading && <div className="loading">로딩 중...</div>}
        {error && <div className="error">{error}</div>}
        <div className="products">
          <div className="products-wrapper">
            {products &&
              products.map((product) => (
                <div key={product.id} className="product">
                  <img
                    src={`http://localhost:5001/uploads/productImages/${product.image_url}`}
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
