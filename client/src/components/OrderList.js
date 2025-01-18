import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import "./OrderList.css";

const OrderList = ({ orders }) => {
  const { userName, isAuthenticated, isLoading, authToken } = useAuth(); // 인증 정보와 토큰 가져오기
  const [currentPage, setCurrentPage] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false); // 모달 상태
  const [review, setReview] = useState(null); // 선택한 제품 정보
  const [rating, setRating] = useState(1); // 별점 상태
  const [reviewText, setReviewText] = useState(""); // 리뷰 내용
  const ordersPerPage = 5;

  useEffect(() => {
    if (!isAuthenticated) {
      alert("로그인 상태가 아닙니다.");
    }
  }, [isAuthenticated]);

  if (!orders || orders.length === 0) {
    return <p className="no-orders">주문 내역이 없습니다.</p>;
  }

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleReviewClick = (item) => {
    if (!isAuthenticated) {
      alert("리뷰 작성 전에 로그인 해주세요.");
      return;
    }
    setReview(item); // 선택한 제품 정보 저장
    setShowReviewModal(true); // 모달 열기
  };

  const handleReviewSubmit = async () => {
    const reviewData = {
      productId: review.productId,
      userName: userName,
      rating,
      reviewText,
    };

    try {
      const response = await fetch("http://localhost:5001/profile/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`, // 토큰을 헤더에 추가
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        alert("리뷰가 성공적으로 제출되었습니다.");
        setReview(null); // 리뷰 데이터 초기화
        setRating(1); // 별점 초기화
        setReviewText(""); // 리뷰 내용 초기화
        setShowReviewModal(false); // 모달 닫기
      } else {
        alert("리뷰 제출에 실패했습니다.");
      }
    } catch (error) {
      console.error("리뷰 제출 중 오류 발생:", error);
      alert("리뷰 제출 중 오류가 발생했습니다.");
    }
  };

  const closeModal = () => {
    setShowReviewModal(false); // 모달 닫기
  };

  return (
    <div className="order-list-container">
      <h2>주문 내역</h2>

      {/* 인증된 사용자의 닉네임이 있으면 표시 */}
      {isAuthenticated && !isLoading && userName && (
        <p className="user-nickname">작성자: {userName}</p>
      )}

      <ul className="order-list">
        {currentOrders.map((order) => {
          const formattedDate = order.created_at
            ? new Date(order.created_at).toLocaleString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "날짜 오류";

          return (
            <li key={order.order_id} className="order-item">
              <div className="order-header">
                <h3 className="order-id">주문 번호: {order.order_id}</h3>
                <span className="order-date">주문 시간: {formattedDate}</span>
                <p className="order-amount">
                  총 금액: ₩
                  {order.amount ? order.amount.toLocaleString() : "가격 오류"}
                </p>
                <p className="delivery-status">
                  배송 상태: {order.delivery_status || "미정"}
                </p>
                <p className={`payment-status ${order.status}`}>
                  결제 상태:{" "}
                  {order.status === "success" ? "결제 완료" : "결제 대기 중"}
                </p>
              </div>

              {order.cart_items && order.cart_items.length > 0 && (
                <div className="order-items">
                  <p>주문 제품 목록:</p>
                  <ul className="product-list">
                    {order.cart_items.map((item) => (
                      <li key={item.productId} className="product-item">
                        <div className="product-info">
                          {item.thumbnail && (
                            <img
                              src={item.thumbnail}
                              alt={`Product ${item.productId}`}
                              className="product-thumbnail"
                            />
                          )}
                          <div className="product-details">
                            <p className="product-name">{item.productName}</p>
                            <p className="product-size">{item.productSize}</p>
                            <p className="product-id">
                              제품 ID: {item.productId}
                            </p>
                            <p className="product-quantity">
                              수량: {item.quantity}
                            </p>
                          </div>
                        </div>
                        {order.delivery_status === "delivered" && (
                          <div className="review-section">
                            <button
                              className="review-submit-button"
                              onClick={() => handleReviewClick(item)} // 버튼 클릭 시
                            >
                              리뷰 작성하기
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="pagination">
        {Array.from(
          { length: Math.ceil(orders.length / ordersPerPage) },
          (_, index) => (
            <button
              key={index + 1}
              className={`page-button ${
                currentPage === index + 1 ? "active" : ""
              }`}
              onClick={() => paginate(index + 1)}
            >
              {index + 1}
            </button>
          )
        )}
      </div>

      {/* 리뷰 팝업창 */}
      {showReviewModal && review && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>리뷰 작성하기</h3>
            <p>제품명: {review.productName}</p>
            <p>사이즈: {review.productSize}</p>
            <p>작성자: {userName}</p> {/* 닉네임 표시 */}
            <label>별점:</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <option key={star} value={star}>
                  {star} 별
                </option>
              ))}
            </select>
            <label>리뷰 내용:</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows="4"
            />
            <button onClick={handleReviewSubmit}>리뷰 제출</button>
            <button onClick={closeModal}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
