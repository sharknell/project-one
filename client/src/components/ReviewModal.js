import React, { useState, useRef } from "react";
import "../styles/ReviewModal.css";

const ReviewModal = ({ isOpen, onClose, onSubmit, product }) => {
  const [rating, setRating] = useState(5.0); // 평점 초기값
  const [reviewText, setReviewText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const ratingRef = useRef(null); // 평점 컨테이너 참조

  const handleSubmit = () => {
    if (!rating || reviewText.trim() === "") {
      alert("평점과 리뷰 내용을 모두 입력해주세요!");
      return;
    }
    const reviewData = {
      productId: product.productId,
      productName: product.productName,
      thumbnail: product.thumbnail, // 썸네일 포함
      rating,
      reviewText,
    };
    onSubmit(reviewData);
  };

  const handleMouseMove = (e) => {
    if (isDragging && ratingRef.current) {
      const rect = ratingRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      // 0~5 범위에서 0.5 단위로 평점 계산
      const newRating = Math.min(
        5,
        Math.max(0, Math.round((offsetX / rect.width) * 10) / 2) // 0.5 단위로 계산
      );
      setRating(newRating); // 소수 첫째 자리까지 표시
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  if (!isOpen) return null;

  return (
    <div className="review-modal">
      <div className="modal-content">
        <h2>리뷰 작성하기</h2>
        <p>제품명: {product.productName}</p>
        <img
          src={product.thumbnail}
          alt={`Product ${product.productId}`}
          className="product-thumbnail"
        />
        <div
          className="rating-container"
          ref={ratingRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <p>평점:</p>
          <div className="rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${rating >= star ? "filled" : ""}`}
              >
                ★
              </span>
            ))}
          </div>
          <div className="rating-indicator">
            <p>{rating} 점</p>
          </div>
        </div>
        <textarea
          placeholder="리뷰 내용을 입력하세요..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={handleSubmit}>제출</button>
          <button onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
