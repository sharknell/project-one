import React, { useState, useEffect } from "react";
import {
  getProfile,
  getAddresses,
  getOrders,
  getQnaData,
  getReviews,
  submitReview,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../utils/api";
import Sidebar from "../components/SideBar";
import BasicInfo from "../components/BasicInfo";
import AddressList from "../components/AddressList";
import QnaList from "../components/QnAList";
import OrderList from "../components/OrderList";
import MyReviewsList from "../components/MyReviewsList";
import AddressForm from "../components/AddressForm";
import "../styles/Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basicInfo");
  const [qnaData, setQnaData] = useState([]);
  const [isFormVisible, setFormVisible] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);

  // 액세스 토큰 재발급 함수
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new Error("리프레시 토큰이 없습니다.");
    }

    try {
      const response = await fetch("/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(
          "리프레시 토큰으로 새로운 액세스 토큰을 발급할 수 없습니다."
        );
      }

      const data = await response.json();
      const { accessToken } = data;
      localStorage.setItem("authToken", accessToken); // 새 액세스 토큰 저장
      return accessToken;
    } catch (error) {
      console.error("리프레시 토큰 오류:", error);
      throw error;
    }
  };

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("토큰이 존재하지 않습니다.");
      }

      // 인증 헤더에 토큰 추가
      const headers = new Headers({
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      });

      const profileData = await getProfile(headers);
      const addressesData = await getAddresses(headers);
      const qnaResponse = await getQnaData(headers);
      const ordersResponse = await getOrders(headers);
      const reviewsResponse = await getReviews(headers);

      // 모든 데이터를 한 번에 상태에 반영
      setProfile((prev) => ({
        ...prev,
        user: profileData.user,
        addresses: addressesData.addresses,
      }));
      setOrders(ordersResponse.orders);
      setReviews(reviewsResponse.reviews || []);
      setQnaData(Array.isArray(qnaResponse.data) ? qnaResponse.data : []);
    } catch (err) {
      if (err.message === "jwt expired") {
        // 토큰 만료 처리: 리프레시 토큰을 통해 새 액세스 토큰을 발급
        const newToken = await refreshAccessToken();
        await fetchProfileData(newToken); // 새로운 토큰으로 다시 시도
      } else if (err.message === "토큰이 존재하지 않습니다.") {
        setError("로그인이 필요합니다. 다시 로그인해주세요.");
      } else {
        setError("프로필 데이터를 로드하는 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleAddAddress = () => {
    setFormVisible(true);
    setAddressToEdit(null); // 새 주소 추가
  };

  const handleSaveAddress = async (newAddress) => {
    const token = localStorage.getItem("authToken");
    try {
      if (addressToEdit) {
        // 주소 수정
        await updateAddress(token, addressToEdit.id, newAddress);
        setProfile((prev) => ({
          ...prev,
          addresses: prev.addresses.map((address) =>
            address.id === addressToEdit.id
              ? { ...address, ...newAddress }
              : address
          ),
        }));
      } else {
        // 새 주소 추가
        await addAddress(token, newAddress);
        setProfile((prev) => ({
          ...prev,
          addresses: [...prev.addresses, newAddress],
        }));
      }
      setFormVisible(false);
    } catch (error) {
      console.error(error);
      alert("주소 저장 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    const token = localStorage.getItem("authToken");
    try {
      await deleteAddress(token, addressId);
      setProfile((prev) => ({
        ...prev,
        addresses: prev.addresses.filter((address) => address.id !== addressId),
      }));
    } catch (error) {
      console.error(error);
      alert("주소 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleCancelAddress = () => {
    setFormVisible(false);
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="profile-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="profile-content">
        {activeTab === "basicInfo" && <BasicInfo user={profile?.user} />}
        {activeTab === "shipping" && (
          <div>
            <button className="add-address-button" onClick={handleAddAddress}>
              배송지 추가하기
            </button>
            <AddressList
              addresses={profile?.addresses || []}
              setAddressToEdit={setAddressToEdit}
              onDeleteAddress={handleDeleteAddress}
            />
          </div>
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

        {isFormVisible && (
          <AddressForm
            address={addressToEdit}
            onSave={handleSaveAddress}
            onCancel={handleCancelAddress}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
