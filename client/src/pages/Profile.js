import React, { useState, useEffect } from "react";
import {
  getProfile,
  getAddresses,
  getOrders,
  getQnaData,
  getReviews,
  submitReview,
} from "../utils/api"; // 경로 확인
import Sidebar from "../components/SideBar";
import BasicInfo from "../components/BasicInfo";
import AddressList from "../components/AddressList";
import QnaList from "../components/QnAList";
import OrderList from "../components/OrderList";
import MyReviewsList from "../components/MyReviewsList";
import "../styles/Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basicInfo");
  const [qnaData, setQnaData] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const profileData = await getProfile(token);
        setProfile(profileData.user);

        const addressesData = await getAddresses(token);
        setProfile((prev) => ({ ...prev, addresses: addressesData.addresses }));

        const qnaResponse = await getQnaData(token);
        setQnaData(Array.isArray(qnaResponse.data) ? qnaResponse.data : []);

        const ordersResponse = await getOrders(token);
        setOrders(ordersResponse.orders);

        // 리뷰 응답 처리 (빈 배열을 처리)
        const reviewsResponse = await getReviews(token);
        console.log(reviewsResponse); // 추가된 로그로 응답을 확인
        if (reviewsResponse.reviews && reviewsResponse.reviews.length > 0) {
          setReviews(reviewsResponse.reviews);
        } else {
          setReviews([]); // 빈 배열 처리
        }
      } catch (err) {
        setError(
          err.message || "프로필 데이터를 로드하는 중 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleReviewSubmit = async (reviewData) => {
    const token = localStorage.getItem("authToken");
    try {
      const newReview = await submitReview(token, reviewData);
      setReviews((prevReviews) => [...prevReviews, newReview]);
      alert("리뷰가 성공적으로 저장되었습니다!");
    } catch (err) {
      console.error(err);
      alert("리뷰 저장 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="profile-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="profile-content">
        {activeTab === "basicInfo" && <BasicInfo user={profile} />}
        {activeTab === "shipping" && (
          <AddressList addresses={profile.addresses} />
        )}
        {activeTab === "qna" && <QnaList qnaData={qnaData} />}
        {activeTab === "orders" && (
          <OrderList orders={orders} onSubmitReview={handleReviewSubmit} />
        )}
        {activeTab === "reviews" && (
          <div className="reviews-section">
            {reviews.length === 0 ? (
              <div className="no-reviews-container">
                <p>작성한 리뷰가 없습니다.</p>
              </div>
            ) : (
              <MyReviewsList reviews={reviews} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
