import React, { useState } from "react";
import "./ReviewModal.css";

const ReviewModal = ({ isOpen, onClose, onSubmit, product }) => {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = () => {
    if (!rating || reviewText.trim() === "") {
      alert("평점과 리뷰 내용을 모두 입력해주세요!");
      return;
    }
    const reviewData = {
      productId: product.productId,
      rating,
      reviewText,
    };
    onSubmit(reviewData); // 부모 컴포넌트로 데이터 전달
  };

  if (!isOpen) return null;

  return (
    <div className="review-modal">
      <div className="modal-content">
        <h2>리뷰 작성하기</h2>
        <p>제품명: {product.productName}</p>
        <label>
          평점:
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <option key={star} value={star}>
                {star}점
              </option>
            ))}
          </select>
        </label>
        <textarea
          placeholder="리뷰 내용을 입력하세요..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
        <div>
          <button onClick={handleSubmit}>제출</button>
          <button onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
