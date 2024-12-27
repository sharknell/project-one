import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { CircularProgress, Typography } from "@mui/material";
import "./Shop.css";

function Shop() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!category) {
      setError("카테고리 정보가 없습니다.");
      setIsLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `http://localhost:5001/shop/category/${category}`
        );
        console.log("서버 응답:", response.data);

        if (
          response.data.message === "상품 목록 조회 성공" &&
          Array.isArray(response.data.data)
        ) {
          setProducts(response.data.data);
        } else {
          setError("서버에서 잘못된 데이터 형식을 반환했습니다.");
        }
      } catch (error) {
        console.error("상품 목록 조회 오류:", error);
        setError("상품 목록을 불러오는 데 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
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
