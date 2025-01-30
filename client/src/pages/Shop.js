import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CircularProgress, Typography, MenuItem, Select } from "@mui/material";
import { loadProducts } from "../controllers/ProductController";
import "../styles/Shop.css";

function Shop() {
  const { category } = useParams(); // URL 파라미터로 카테고리 값 가져오기
  const [products, setProducts] = useState([]); // 상품 상태
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [selectedCategory, setSelectedCategory] = useState("all"); // 카테고리 선택 상태

  // 상품을 로드하는 useEffect (카테고리별 상품 로드)
  useEffect(() => {
    loadProducts(selectedCategory, setProducts, setError, setIsLoading); // 상품 로드
  }, [selectedCategory]); // selectedCategory가 변경될 때마다 호출

  // 상품이 로드된 후 콘솔 로그 출력
  useEffect(() => {
    console.log("상품 데이터:", products); // 상품 데이터 출력
  }, [products]); // products 상태가 변경될 때마다 실행

  // 카테고리 선택 변경 핸들러
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  // 카테고리별로 상품을 필터링
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <div className="shop-container">
      <Typography variant="h4" className="category-title">
        Product Collection
      </Typography>

      {/* 카테고리 선택 메뉴 */}
      <Select
        value={selectedCategory}
        onChange={handleCategoryChange}
        className="category-select"
      >
        <MenuItem value="all">모든 상품</MenuItem>
        <MenuItem value="skincare">스킨 케어</MenuItem>
        <MenuItem value="makeup">메이크업</MenuItem>
        <MenuItem value="perfume">향수</MenuItem>
      </Select>

      {/* 로딩 상태 표시 */}
      {isLoading && <CircularProgress className="loading" />}

      {/* 에러 메시지 표시 */}
      {error && (
        <Typography color="error" className="error-message">
          {error}
        </Typography>
      )}

      {/* 상품 그리드 표시 */}
      <div className="product-grid">
        {filteredProducts.length === 0 && !isLoading && !error && (
          <Typography variant="h6">현재 판매 중인 상품이 없습니다.</Typography>
        )}
        {filteredProducts.map((product) => (
          <div className="product-card" key={product.id}>
            <img
              src={product.image_url || "/default-image.jpg"}
              alt={product.name || "상품명 없음"}
              className="product-image"
            />
            <div className="product-details">
              <Typography variant="h6" className="product-name">
                {product.name || "상품명 없음"}
              </Typography>
              <Typography variant="body2" className="product-price">
                {product.price
                  ? `₩${product.price.toLocaleString()}`
                  : "가격 정보 없음"}
              </Typography>
              <Link to={`/shop/product/${product.id}`} className="product-link">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shop;
