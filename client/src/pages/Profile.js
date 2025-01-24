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

        const reviewsResponse = await getReviews(token);
        setReviews(reviewsResponse.reviews || []);
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
        {activeTab === "basicInfo" && <BasicInfo user={profile} />}
        {activeTab === "shipping" && (
          <div>
            <button className="add-address-button" onClick={handleAddAddress}>
              배송지 추가하기
            </button>
            <AddressList
              addresses={profile.addresses}
              setAddressToEdit={setAddressToEdit}
              onDeleteAddress={handleDeleteAddress} // 삭제 함수 전달
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
