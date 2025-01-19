// Profile.js
import React, { useState, useEffect } from "react";
import api, {
  getProfile,
  getAddresses,
  getOrders,
  getQnaData,
  getReviews,
} from "../utils/api";
import { submitReview } from "../utils/api";
import Sidebar from "../components/SideBar";
import BasicInfo from "../components/BasicInfo";
import AddressList from "../components/AddressList";
import AddressForm from "../components/AddressForm";
import QnaList from "../components/QnAList";
import OrderList from "../components/OrderList";
import MyReviewsList from "../components/MyReviewsList";
import "../styles/Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]); // 추가된 리뷰 상태
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basicInfo");
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [qnaData, setQnaData] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

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

        // 리뷰 데이터를 가져오는 부분 추가
        const reviewsResponse = await getReviews(token);
        setReviews(reviewsResponse.reviews); // reviews 상태에 저장
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
      setReviews((prevReviews) => [...prevReviews, newReview]); // 리뷰를 리스트에 추가
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
          <>
            <AddressList
              addresses={profile.addresses}
              setAddressToEdit={setAddressToEdit}
            />
          </>
        )}
        {activeTab === "qna" && (
          <div className="qna-section">
            <h2>내가 작성한 질문</h2>
            <QnaList qnaData={qnaData} />
          </div>
        )}
        {activeTab === "orders" && (
          <div className="orders-section">
            <h2>내 주문 내역</h2>
            <OrderList orders={orders} onSubmitReview={handleReviewSubmit} />
          </div>
        )}
        {activeTab === "reviews" && (
          <div className="reviews-section">
            <h2>내 리뷰 내역</h2>
            <MyReviewsList reviews={reviews} />{" "}
            {/* MyReviewsList에 리뷰 전달 */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
