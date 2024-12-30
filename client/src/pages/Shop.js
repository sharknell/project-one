// src/components/Shop.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CircularProgress, Typography } from "@mui/material";
import { loadProducts } from "../controllers/ProductController";
import "../styles/Shop.css";
function Shop() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts(category, setProducts, setError, setIsLoading);
  }, [category]);

  return (
    <div className="shop-container">
      <Typography variant="h4" className="category-title">
        {category === "perfume"
          ? "Perfume Collection"
          : category === "makeup"
          ? "Makeup Collection"
          : category === "skincare"
          ? "Skincare Collection"
          : "Product Collection"}
      </Typography>
      {isLoading && <CircularProgress className="loading" />}
      {error && (
        <Typography color="error" className="error-message">
          {error}
        </Typography>
      )}
      <div className="product-grid">
        {products.length === 0 && !isLoading && !error && (
          <Typography variant="h6">현재 판매 중인 상품이 없습니다.</Typography>
        )}
        {products.map((product) => (
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
