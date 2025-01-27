import React from "react";
import PropTypes from "prop-types";
import "../styles/MyReviewsList.css";

// 다국어 메시지 상수
const MESSAGES = {
  NO_REVIEWS: "작성한 리뷰가 없습니다.",
  NO_CONTENT: "리뷰 내용이 없습니다.",
  LOADING: "로딩 중...",
};

// 리뷰 카드 컴포넌트
const ReviewCard = ({ thumbnail, product_name, review_text, rating }) => (
  <div className="my-reviews__card">
    <img
      src={thumbnail || "/default-product-image.jpg"}
      alt={product_name || "상품 이미지"}
      className="my-reviews__image"
    />
    <h3 className="my-reviews__product-name">{product_name || "상품명"}</h3>
    <p className="my-reviews__text">{review_text || MESSAGES.NO_CONTENT}</p>
    <div className="my-reviews__footer">
      <span className="my-reviews__rating">{rating || "0"}점</span>
    </div>
  </div>
);

// PropTypes 설정 (ReviewCard)
ReviewCard.propTypes = {
  thumbnail: PropTypes.string,
  product_name: PropTypes.string.isRequired,
  review_text: PropTypes.string,
  rating: PropTypes.number,
};

// 메인 컴포넌트
const MyReviewsList = ({ reviews = [], isLoading = false }) => {
  // 로딩 상태 처리
  if (isLoading) {
    return <div className="my-reviews__loading">{MESSAGES.LOADING}</div>;
  }

  // 리뷰가 없는 경우
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return <div className="my-reviews__no-reviews">{MESSAGES.NO_REVIEWS}</div>;
  }

  return (
    <div className="my-reviews__container">
      <h2 className="my-reviews__title">내 리뷰 목록</h2>
      <div className="my-reviews__list">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            thumbnail={review.thumbnail}
            product_name={review.product_name}
            review_text={review.review_text}
            rating={review.rating}
          />
        ))}
      </div>
    </div>
  );
};

// PropTypes 설정 (MyReviewsList)
MyReviewsList.propTypes = {
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      thumbnail: PropTypes.string,
      product_name: PropTypes.string.isRequired,
      review_text: PropTypes.string,
      rating: PropTypes.number,
    })
  ),
  isLoading: PropTypes.bool,
};

// 기본 Props 설정
MyReviewsList.defaultProps = {
  reviews: [],
  isLoading: false,
};

export default MyReviewsList;
