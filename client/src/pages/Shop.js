import React, { useEffect, useState, useCallback } from "react";
import { CircularProgress, Typography, Grid, Button } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { loadProducts } from "../controllers/ProductController";

function Shop() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromURL = params.get("category") || "all";
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
    setPage(1);
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-center mb-6">Product Collection</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-3 md:space-y-0 mb-6">
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">모든 상품</option>
          <option value="skincare">스킨 케어</option>
          <option value="makeup">메이크업</option>
          <option value="perfume">향수</option>
        </select>

        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="검색어를 입력하세요"
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
        />

        <select
          value={sortOrder}
          onChange={handleSortOrderChange}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">최신순</option>
          <option value="oldest">오래된 순</option>
          <option value="priceHigh">가격 높은 순</option>
          <option value="priceLow">가격 낮은 순</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center my-10">
          <CircularProgress />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-500 text-center mb-4">{error}</p>
      )}

      {/* Empty */}
      {filteredProducts.length === 0 && !isLoading && !error && (
        <p className="text-center text-gray-600">현재 판매 중인 상품이 없습니다.</p>
      )}

      {/* Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="border rounded shadow-sm hover:shadow-md transition-shadow duration-300 bg-white flex flex-col"
          >
            <img
              src={`http://localhost:5001/uploads/productImages/${product.image_url || "default-image.jpg"}`}
              alt={product.name || "상품명 없음"}
              className="h-56 w-full object-cover rounded-t"
            />
            <div className="p-4 flex flex-col flex-1">
              <h2 className="text-lg font-semibold mb-1">{product.name || "상품명 없음"}</h2>
              <p className="text-sm text-gray-600 mb-3">
                {product.price
                  ? `₩${product.price.toLocaleString()}`
                  : "가격 정보 없음"}
              </p>
              <Link to={`/shop/product/${product.id}`} className="mt-auto">
                <Button
                  variant="contained"
                  color="primary"
                  className="w-full"
                >
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMoreProducts && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={loadMore}
            variant="outlined"
            color="primary"
          >
            더 보기
          </Button>
        </div>
      )}
    </div>
  );
}

export default Shop;
