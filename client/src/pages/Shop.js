import React, { useEffect, useState, useCallback } from "react";
import { CircularProgress, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { loadProducts } from "../controllers/ProductController";
import "../styles/Shop.css";

function Shop() {
  const [products, setProducts] = useState([]); // 상품 상태
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [selectedCategory, setSelectedCategory] = useState("all"); // 카테고리 선택 상태
  const [searchQuery, setSearchQuery] = useState(""); // 검색 쿼리 상태
  const [sortOrder, setSortOrder] = useState("newest"); // 정렬 기준 상태
  const [page, setPage] = useState(1); // 페이지 상태
  const itemsPerPage = 20; // 페이지당 아이템 수

  const location = useLocation();

  // URL의 쿼리 파라미터에서 category 값을 읽음
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromURL = params.get("category") || "all"; // 쿼리 파라미터에서 category 값을 읽어옴, 없으면 'all'로 기본값 설정
    setSelectedCategory(categoryFromURL);
  }, [location.search]);

  // 상품을 로드하는 useEffect (카테고리별 상품 로드)
  const loadProductsList = useCallback(() => {
    loadProducts(
      selectedCategory,
      setProducts,
      setError,
      setIsLoading,
      page,
      itemsPerPage
    );
  }, [selectedCategory, page]);

  useEffect(() => {
    loadProductsList();
  }, [loadProductsList]);

  // 검색 쿼리 및 정렬 기준에 따라 필터링과 정렬 수행
  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) // 검색 기능
    .filter(
      (product) =>
        selectedCategory === "all" || product.category === selectedCategory
    ) // 카테고리 필터링
    .sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return new Date(b.upload_date) - new Date(a.upload_date); // 최신순
        case "oldest":
          return new Date(a.upload_date) - new Date(b.upload_date); // 오래된 순
        case "priceHigh":
          return b.price - a.price; // 가격 높은 순
        case "priceLow":
          return a.price - b.price; // 가격 낮은 순
        default:
          return 0;
      }
    });

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setPage(1); // 카테고리 변경 시 페이지 1로 리셋
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  const loadMore = () => {
    setPage((prevPage) => prevPage + 1); // 페이지 증가
  };

  return (
    <div className="shop-container">
      <Typography variant="h4" className="category-title">
        Product Collection
      </Typography>

      <div className="select-wrapper">
        {/* 카테고리 선택 메뉴 */}
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="select"
        >
          <option value="all">모든 상품</option>
          <option value="skincare">스킨 케어</option>
          <option value="makeup">메이크업</option>
          <option value="perfume">향수</option>
        </select>
      </div>

      <div className="input-field">
        {/* 검색 입력 필드 */}
        <label htmlFor="search">검색</label>
        <input
          id="search"
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="검색어를 입력하세요"
        />
      </div>

      <div className="select-wrapper">
        {/* 정렬 선택 메뉴 */}
        <select
          value={sortOrder}
          onChange={handleSortOrderChange}
          className="select"
        >
          <option value="newest">최신순</option>
          <option value="oldest">오래된 순</option>
          <option value="priceHigh">가격 높은 순</option>
          <option value="priceLow">가격 낮은 순</option>
        </select>
      </div>

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

      {/* 더 보기 버튼 */}
      <button onClick={loadMore} className="load-more">
        더 보기
      </button>
    </div>
  );
}

export default Shop;
