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
  const [qnaData, setQnaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basicInfo");
  const [isFormVisible, setFormVisible] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("토큰이 존재하지 않습니다.");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [
        profileData,
        addressesData,
        qnaResponse,
        ordersResponse,
        reviewsResponse,
      ] = await Promise.all([
        getProfile(headers),
        getAddresses(headers),
        getQnaData(headers),
        getOrders(headers),
        getReviews(headers),
      ]);

      setProfile({
        user: profileData.user,
        addresses: addressesData.addresses,
      });
      setOrders(ordersResponse.orders);
      setReviews(reviewsResponse.reviews || []);
      setQnaData(Array.isArray(qnaResponse.data) ? qnaResponse.data : []);
    } catch (err) {
      setError(err.message || "데이터 로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleReviewSubmit = async (reviewData) => {
    try {
      const token = localStorage.getItem("authToken");
      const newReview = await submitReview(token, reviewData);
      setReviews([...reviews, newReview]);
      alert("리뷰가 성공적으로 저장되었습니다!");
    } catch {
      alert("리뷰 저장 중 오류가 발생했습니다.");
    }
  };

  const handleAddAddress = () => {
    setFormVisible(true);
    setAddressToEdit(null);
  };

  const handleSaveAddress = async (newAddress) => {
    try {
      const token = localStorage.getItem("authToken");
      if (addressToEdit) {
        await updateAddress(token, addressToEdit.id, newAddress);
        setProfile((prev) => ({
          ...prev,
          addresses: prev.addresses.map((addr) =>
            addr.id === addressToEdit.id ? { ...addr, ...newAddress } : addr
          ),
        }));
      } else {
        await addAddress(token, newAddress);
        setProfile((prev) => ({
          ...prev,
          addresses: [...prev.addresses, newAddress],
        }));
      }
      setFormVisible(false);
    } catch {
      alert("주소 저장 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const token = localStorage.getItem("authToken");
      await deleteAddress(token, addressId);
      setProfile((prev) => ({
        ...prev,
        addresses: prev.addresses.filter((addr) => addr.id !== addressId),
      }));
    } catch {
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
              <p className="no-data">작성한 리뷰가 없습니다.</p>
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
