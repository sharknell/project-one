import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useProductController } from "../controllers/ProductController";
import axios from "axios";
import QnAForm from "../components/QnAForm";
import "../styles/ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, userId, userName } = useAuth();
  const [isQnAModalOpen, setIsQnAModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const {
    product,
    isLoading,
    error,
    mainImage,
    openDropdown,
    handleThumbnailClick,
    toggleDropdown,
  } = useProductController(id);

  const handleQnAClick = () => {
    if (!isAuthenticated) {
      const confirmLogin = window.confirm(
        "로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
      );
      if (confirmLogin) {
        navigate("/login", { state: { from: window.location.pathname } });
      }
    } else {
      setIsQnAModalOpen(true);
    }
  };

  const handleQnASubmit = async (question) => {
    if (question.trim() === "") {
      alert("질문을 입력해주세요.");
      return;
    }

    try {
      await axios.post(`http://localhost:5001/shop/product/${id}/qna`, {
        question,
        userName: userName || "익명",
        productId: id,
      });
      alert(
        `QnA가 등록되었습니다: ${question} (작성자: ${userName || "익명"})`
      );
      setNewQuestion("");
      setIsQnAModalOpen(false);
    } catch (err) {
      console.error("QnA 등록 실패:", err);
      alert("질문 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      const confirmLogin = window.confirm(
        "로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
      );
      if (confirmLogin) {
        navigate("/login", { state: { from: window.location.pathname } });
      }
    } else {
      try {
        if (!userId) {
          alert("사용자 정보가 유효하지 않습니다.");
          return;
        }

        const response = await axios.get(
          `http://localhost:5001/cart?userId=${userId}`
        );
        const cartItems = response.data;
        const existingItem = cartItems.find((item) => item.product_id === id);

        if (existingItem) {
          const updatedQuantity = existingItem.quantity + 1;
          await axios.put(`http://localhost:5001/cart/${existingItem.id}`, {
            quantity: updatedQuantity,
          });
          alert("장바구니에 품목의 수량이 추가되었습니다.");
        } else {
          const quantity = 1;
          const productName = product.name;
          const productSize = product.size || "없음";

          await axios.post("http://localhost:5001/cart/add", {
            productId: id,
            quantity,
            userId: userId,
            thumbnail: product.images[0],
            productName,
            productSize,
          });

          alert("장바구니에 추가되었습니다.");
        }
      } catch (err) {
        console.error("장바구니 추가 실패:", err);
        alert("장바구니에 추가하는 데 실패했습니다.");
      }
    }
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!product) return <div>제품 정보가 없습니다.</div>;

  return (
    <div className="product-detail-container">
      <div className="product-detail-header">
        <h1>{product.name}</h1>
        <p>{product.tagline}</p>
      </div>
      <div className="product-detail-content">
        <div className="product-detail-main-image">
          {mainImage ? (
            <img
              src={`http://localhost:5001/uploads/productImages/${mainImage}`}
              alt={product.name}
            />
          ) : (
            <p>메인 이미지가 없습니다.</p>
          )}
        </div>

        <div className="product-detail-thumbnails">
          {product.images && product.images.length > 0 ? (
            product.images.map((image, index) => (
              <img
                key={index}
                src={`http://localhost:5001/uploads/productImages/${image}`}
                alt={`${product.name} 서브 이미지 ${index + 1}`}
                className="product-thumbnail"
                onClick={() => handleThumbnailClick(image)}
              />
            ))
          ) : (
            <p>서브 이미지가 없습니다.</p>
          )}
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
            <button onClick={handleAddToCart}>장바구니 담기</button>
          </div>
        </div>
      </div>

      <div className="product-detail-extra-info">
        <h2>제품 디테일 정보</h2>
        {["설명", "리뷰", "상품 필수 정보", "배송과 반품"].map(
          (title, index) => (
            <div className="dropdown" key={index}>
              <button
                className="dropdown-toggle"
                onClick={() => toggleDropdown(index)}
              >
                {title}
              </button>
              {openDropdown === index && (
                <div className="dropdown-content">
                  {index === 0 ? (
                    <div>
                      <h5>{product.name}</h5>
                      <p>{product.description}</p>
                    </div>
                  ) : (
                    <p>내용이 준비 중입니다.</p>
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div>

      <div className="product-detail-qna">
        <button onClick={handleQnAClick} className="qna-register-button">
          QnA 등록하기
        </button>
      </div>

      {isQnAModalOpen && (
        <div className="qna-modal-overlay">
          <div className="qna-modal">
            <button
              className="close-modal-button"
              onClick={() => setIsQnAModalOpen(false)}
            >
              X
            </button>
            <QnAForm
              onSubmit={handleQnASubmit}
              onCancel={() => setIsQnAModalOpen(false)}
              question={newQuestion}
              setQuestion={setNewQuestion}
              productId={id}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
