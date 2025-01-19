import React, { useState, useEffect } from "react";
import api, {
  getProfile,
  getAddresses,
  getOrders,
  getQnaData,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../utils/api";
import { submitReview } from "../utils/api";
import Sidebar from "../components/SideBar";
import BasicInfo from "../components/BasicInfo";
import AddressList from "../components/AddressList";
import AddressForm from "../components/AddressForm";
import QnaList from "../components/QnAList";
import OrderList from "../components/OrderList";
import "../styles/Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basicInfo");
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [qnaData, setQnaData] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false); // 새로운 추가 상태

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

  const handleAddressSave = async (address) => {
    const token = localStorage.getItem("authToken");
    try {
      if (addressToEdit) {
        await updateAddress(token, addressToEdit.id, address);
        setProfile((prev) => ({
          ...prev,
          addresses: prev.addresses.map((a) =>
            a.id === addressToEdit.id ? address : a
          ),
        }));
        setAddressToEdit(null);
      } else {
        await addAddress(token, address);
        setProfile((prev) => ({
          ...prev,
          addresses: [...prev.addresses, { ...address, id: Date.now() }],
        }));
        setIsAddingAddress(false); // 추가 폼 닫기
      }
    } catch (err) {
      setError(err.message || "배송지 저장 중 오류가 발생했습니다.");
    }
  };

  const handleAddressDelete = async (address) => {
    const token = localStorage.getItem("authToken");
    try {
      await deleteAddress(token, address.id);
      setProfile((prev) => ({
        ...prev,
        addresses: prev.addresses.filter((a) => a.id !== address.id),
      }));
    } catch (err) {
      setError(err.message || "배송지 삭제 중 오류가 발생했습니다.");
    }
  };
  const handleReviewSubmit = async (reviewData) => {
    const token = localStorage.getItem("authToken");
    try {
      await submitReview(token, reviewData);
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
              handleAddressDelete={handleAddressDelete}
            />
            {!isAddingAddress && !addressToEdit && (
              <button
                className="add-new-address-button"
                onClick={() => setIsAddingAddress(true)}
              >
                새 배송지 추가
              </button>
            )}
            {(addressToEdit || isAddingAddress) && (
              <AddressForm
                address={addressToEdit}
                onSave={handleAddressSave}
                onCancel={() => {
                  setAddressToEdit(null);
                  setIsAddingAddress(false);
                }}
              />
            )}
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
      </div>
    </div>
  );
};

export default Profile;
