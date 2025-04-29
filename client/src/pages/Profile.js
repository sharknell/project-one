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
import axios from "axios";
import Sidebar from "../components/profile/SideBar";
import BasicInfo from "../components/profile/BasicInfo";
import AddressList from "../components/profile/AddressList";
import QnaList from "../components/QnAList";
import OrderList from "../components/profile/OrderList";
import MyReviewsList from "../components/profile/MyReviewsList";
import AddressForm from "../components/profile/AddressForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [qnaData, setQnaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basicInfo");
  const [isFormVisible, setFormVisible] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    phone: "",
  });

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
      toast.error(err.message || "데이터 로드 중 오류가 발생했습니다.");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("토큰이 없습니다. 로그인해주세요.");
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      // 서버에 프로필 정보 업데이트 요청
      const response = await axios.put(
        "http://localhost:5001/profile/update",
        editData,
        { headers }
      );

      // 서버에서 응답 받은 새로운 프로필 데이터를 상태에 반영
      setUser(editData); // user 상태 업데이트
      setProfile((prev) => ({
        ...prev,
        user: editData,
      })); // profile의 user 정보를 업데이트

      setIsEditing(false);
      toast.success("프로필 정보가 성공적으로 수정되었습니다.");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "프로필 정보를 수정하는 중 오류가 발생했습니다."
      );
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && profile) {
      setEditData({
        username: profile.user.username,
        email: profile.user.email,
        phone: profile.user.phone || "",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const token = localStorage.getItem("authToken");
      const newReview = await submitReview(token, reviewData);
      setReviews([...reviews, newReview]);
      toast.success("리뷰가 성공적으로 저장되었습니다!");
    } catch {
      toast.error("리뷰 저장 중 오류가 발생했습니다.");
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
        toast.success("주소가 성공적으로 수정되었습니다.");
      } else {
        await addAddress(token, newAddress);
        setProfile((prev) => ({
          ...prev,
          addresses: [...prev.addresses, newAddress],
        }));
        toast.success("주소가 성공적으로 추가되었습니다.");
      }
      setFormVisible(false);
    } catch {
      toast.error("주소 저장 중 오류가 발생했습니다.");
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
      toast.success("주소가 성공적으로 삭제되었습니다.");
    } catch {
      toast.error("주소 삭제 중 오류가 발생했습니다.");
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
        {activeTab === "basicInfo" && (
          <BasicInfo
            user={profile?.user}
            isEditing={isEditing}
            handleEditToggle={handleEditToggle}
            handleSave={handleSave}
            handleInputChange={handleInputChange}
            editData={editData}
          />
        )}
        {activeTab === "shipping" && (
          <div>
            <button className="add-address-button" onClick={handleAddAddress}>
              배송지 추가하기
            </button>
            <AddressList
              addresses={profile?.addresses || []}
              onEditAddress={(address) => {
                setAddressToEdit(address);
                setFormVisible(true);
              }}
              onDeleteAdress={(addressId) => {
                handleDeleteAddress(addressId);
              }}
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Profile;
