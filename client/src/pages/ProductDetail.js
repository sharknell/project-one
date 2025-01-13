import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import axios from "axios";
import { useProductController } from "../controllers/ProductController";
import QnAForm from "../components/QnAForm";
import "../styles/ProductDetail.css";

function ProductDetail() {
  const { id } = useParams(); // URL에서 제품 ID 추출
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 훅 사용
  const { isAuthenticated, userId, userName } = useAuth(); // 로그인 상태와 사용자 ID 가져오기
  const [isQnAModalOpen, setIsQnAModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState(""); // 새로운 질문 상태
  const [product, setProduct] = useState(null); // 제품 상태 추가
  const [error, setError] = useState(null); // 오류 상태 추가
  const {
    mainImage,
    openDropdown,
    handleThumbnailClick,
    handleButtonClick,
    toggleDropdown,
  } = useProductController(id);

  // 제품 정보 가져오기
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/shop/product/${id}`
        );
        setProduct(response.data); // 제품 정보 업데이트
      } catch (err) {
        console.error("제품 정보를 가져오는 데 실패했습니다.", err);
        setError("제품 정보를 가져오는 데 실패했습니다."); // 오류 메시지 설정
      }
    };
    fetchProduct();
  }, [id]);

  // QnA 버튼 클릭 핸들러
  const handleQnAClick = () => {
    if (!isAuthenticated) {
      // 로그인하지 않은 경우 로그인 페이지로 이동
      const confirmLogin = window.confirm(
        "로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
      );
      if (confirmLogin) {
        navigate("/login", { state: { from: window.location.pathname } });
      }
    } else {
      setIsQnAModalOpen(true); // QnA 모달 열기
    }
  };

  // QnA 제출 핸들러
  const handleQnASubmit = async (question) => {
    if (question.trim() === "") {
      alert("질문을 입력해주세요.");
      return;
    }

    try {
      // QnA 등록 요청에 userName을 올바르게 전송
      await axios.post(`http://localhost:5001/shop/product/${id}/qna`, {
        question,
        userName: userName || "익명", // 인증된 사용자 이름 또는 익명
        productId: id, // 상품 ID
      });

      alert(
        `QnA가 등록되었습니다: ${question} (작성자: ${userName || "익명"})`
      );
      setNewQuestion(""); // 질문 제출 후 초기화
      setIsQnAModalOpen(false); // 모달 닫기
    } catch (err) {
      console.error("QnA 등록 실패:", err);
      alert("질문 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 모달 닫기
  const closeModal = () => {
    setIsQnAModalOpen(false);
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

        // 이미 장바구니에 해당 상품이 있는지 확인
        const response = await axios.get(
          `http://localhost:5001/cart?userId=${userId}`
        );
        const cartItems = response.data;
        const existingItem = cartItems.find((item) => item.product_id === id);

        if (existingItem) {
          // 이미 있으면 수량을 1 증가시킴
          const updatedQuantity = existingItem.quantity + 1;

          await axios.put(`http://localhost:5001/cart/${existingItem.id}`, {
            quantity: updatedQuantity,
          });

          alert("장바구니에 품목의 수량이 추가되었습니다.");
        } else {
          // 없으면 새로 추가
          const quantity = 1;

          await axios.post("http://localhost:5001/cart/add", {
            productId: id,
            quantity,
            userId: userId,
          });

          alert("장바구니에 추가되었습니다.");
        }
      } catch (err) {
        console.error("장바구니 추가 실패:", err);
        alert("장바구니에 추가하는 데 실패했습니다.");
      }
    }
  };

  // 로딩, 오류, 제품 없는 상태 처리
  if (!product) {
    if (error) {
      return <div>{error}</div>; // 오류 메시지 출력
    }
    return <div>로딩 중...</div>;
  }

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
            <button onClick={handleAddToCart}>장바구니 담기</button>
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

      {/* QnA 등록 버튼 */}
      <div className="product-detail-qna">
        <button onClick={handleQnAClick} className="qna-register-button">
          QnA 등록하기
        </button>
      </div>

      {/* QnA 입력 폼 모달 */}
      {isQnAModalOpen && (
        <div className="qna-modal-overlay">
          <div className="qna-modal">
            <button className="close-modal-button" onClick={closeModal}>
              X
            </button>
            <QnAForm
              onSubmit={handleQnASubmit} // QnA 제출 함수
              onCancel={closeModal}
              question={newQuestion} // 새로운 질문 상태 전달
              setQuestion={setNewQuestion} // 질문 업데이트 함수 전달
              productId={id} // 현재 상품 ID 전달
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
