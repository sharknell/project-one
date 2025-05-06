import React, { useEffect, useState, useCallback } from "react";
import { CircularProgress, Typography, Grid, Button } from "@mui/material";
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromURL = params.get("category") || "all"; // 쿼리 파라미터에서 category 값을 읽어옴, 없으면 'all'로 기본값 설정
    setSelectedCategory(categoryFromURL);
  }, [location.search]);

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

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(
      (product) =>
        selectedCategory === "all" || product.category === selectedCategory
    )
    .sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return new Date(b.upload_date) - new Date(a.upload_date);
        case "oldest":
          return new Date(a.upload_date) - new Date(b.upload_date);
        case "priceHigh":
          return b.price - a.price;
        case "priceLow":
          return a.price - b.price;
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
    setPage((prevPage) => prevPage + 1);
  };

  const hasMoreProducts = filteredProducts.length >= itemsPerPage * page;

  return (
    <div className="shop-container">
      <Typography variant="h4" className="category-title" align="center">
        Product Collection
      </Typography>

      <div className="filters">
        <div className="select-wrapper">
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
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="검색어를 입력하세요"
          />
        </div>

        <div className="select-wrapper">
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
      </div>

      {isLoading && <CircularProgress className="loading" />}
      {error && <Typography color="error">{error}</Typography>}

      <Grid container spacing={3} className="product-grid">
        {filteredProducts.length === 0 && !isLoading && !error && (
          <Typography variant="h6" align="center" fullWidth>
            현재 판매 중인 상품이 없습니다.
          </Typography>
        )}

        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <div className="product-card">
              <img
                src={`http://localhost:5001/uploads/productImages/${
                  product.image_url || "default-image.jpg"
                }`}
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
                <Link
                  to={`/shop/product/${product.id}`}
                  className="product-link"
                >
                  <Button
                    variant="contained"
                    color="primary"
                    className="view-button"
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </Grid>
        ))}
      </Grid>
      <div className="load-more-container">
        {hasMoreProducts && (
          <Button onClick={loadMore} variant="outlined" color="primary">
            더 보기
          </Button>
        )}
      </div>
    </div>
  );
}

export default Shop;
