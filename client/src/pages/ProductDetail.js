import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const { isAuthenticated } = useAuth(); // 로그인 상태 확인
  const navigate = useNavigate(); // 페이지 이동 함수
  const location = useLocation(); // 현재 위치 정보
  const [openDropdown, setOpenDropdown] = useState(null); // 열린 드롭다운을 추적하는 상태

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    axios
      .get(`http://localhost:5001/shop/product/${id}`)
      .then((response) => {
        console.log(response.data);
        setProduct(response.data);
        setMainImage(response.data.images && response.data.images[0]);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("제품 정보 조회 오류:", error);
        setError("제품 정보를 불러오는 데 오류가 발생했습니다.");
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!product) {
    return <div>해당 제품을 찾을 수 없습니다.</div>;
  }

  const handleThumbnailClick = (image) => {
    setMainImage(image);
  };

  const handleButtonClick = (action) => {
    if (!isAuthenticated) {
      alert("로그인 후 이용 가능합니다.");
      navigate("/login", { state: { from: location } }); // 로그인 페이지로 리디렉션하면서 현재 페이지 정보를 전달
      return;
    }
    if (action === "buy") {
      // 장바구니에 제품을 추가하고, Cart.js로 이동
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images ? product.images[0] : "",
        quantity: 1,
        size: product.size || "없음", // size 정보 추가
      };
      // 로컬 스토리지에 장바구니 추가
      const savedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
      savedCart.push(cartItem);
      localStorage.setItem("cartItems", JSON.stringify(savedCart));
      navigate("/cart"); // Cart.js로 이동
    } else if (action === "wishlist") {
      console.log("찜하기 클릭");
    }
  };

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index); // 같은 드롭다운을 다시 클릭하면 닫히도록
  };

  return (
    <div className="product-detail-container">
      <div className="product-detail-header">
        <h1>{product.name}</h1>
        <p>{product.tagline}</p>
      </div>
      <div className="product-detail-content">
        <div className="product-detail-main">
          <div className="product-detail-main-image">
            {mainImage ? (
              <img src={mainImage} alt={product.name} />
            ) : (
              <p>메인 이미지가 없습니다.</p>
            )}
          </div>
          <div className="product-detail-thumbnails">
            {product.images && product.images.length > 0 ? (
              product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`썸네일 ${index + 1}`}
                  onClick={() => handleThumbnailClick(image)}
                  className="thumbnail-image"
                />
              ))
            ) : (
              <p>썸네일 이미지가 없습니다.</p>
            )}
          </div>
        </div>
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <hr />
          <p className="product-detail-price">
            ₩{product.price.toLocaleString()}
          </p>
          <p className="product-detail-category">
            <strong>카테고리:</strong> {product.category}
          </p>
          <p className="product-detail-size">
            <strong>사이즈:</strong> {product.size || "없음"}
          </p>
          <p className="product-detail-stock">
            <strong>재고:</strong>{" "}
            {product.stock > 0 ? `${product.stock}개 남음` : "품절"}
          </p>
          <div className="product-detail-buttons">
            <button onClick={() => handleButtonClick("buy")}>구매하기</button>
            <button
              onClick={() => handleButtonClick("wishlist")}
              className="secondary-button"
            >
              찜하기
            </button>
          </div>
        </div>
      </div>
      <div className="product-detail-extra-info">
        <h2>제품 디테일 정보</h2>
        <div className="dropdown">
          <button className="dropdown-toggle" onClick={() => toggleDropdown(0)}>
            설명
          </button>
          {openDropdown === 0 && (
            <div className="dropdown-content">
              <div>
                <h5>{product.name}</h5>
                <p>{product.description}</p>
              </div>
            </div>
          )}
        </div>
        <div className="dropdown">
          <button className="dropdown-toggle" onClick={() => toggleDropdown(1)}>
            리뷰
          </button>
          {openDropdown === 1 && (
            <div className="dropdown-content">
              <p>이 제품에 대한 리뷰가 아직 없습니다.</p>
            </div>
          )}
        </div>
        <div className="dropdown">
          <button className="dropdown-toggle" onClick={() => toggleDropdown(2)}>
            상품 필수 정보
          </button>
          {openDropdown === 2 && (
            <div className="dropdown-content">
              <p>상품의 주요 정보가 여기에 나옵니다.</p>
            </div>
          )}
        </div>
        <div className="dropdown">
          <button className="dropdown-toggle" onClick={() => toggleDropdown(3)}>
            배송과 반품
          </button>
          {openDropdown === 3 && (
            <div className="dropdown-content">
              <p>배송 및 반품 정책에 대한 정보입니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
