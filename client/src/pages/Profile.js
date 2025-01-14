import React, { useState, useEffect } from "react";
import api, {
  getProfile,
  getAddresses,
  getOrders,
  getQnaData,
} from "../utils/api";
import Sidebar from "../components/SideBar";
import BasicInfo from "../components/BasicInfo";
import AddressList from "../components/AddressList";
import AddressForm from "../components/AddressForm";
import OrderList from "../components/OrderList";
import QnaList from "../components/QnAList";
import "../styles/Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basicInfo");
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [qnaData, setQnaData] = useState([]);
  const [orderData, setOrderData] = useState([]);

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
        setOrderData(ordersResponse.orders);
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
            {addressToEdit && (
              <AddressForm
                address={addressToEdit}
                onSave={handleAddressSave}
                onCancel={() => setAddressToEdit(null)}
              />
            )}
          </>
        )}
        {activeTab === "orders" && (
          <div className="order-section">
            {orderData.length === 0 ? (
              <p>주문 내역이 없습니다.</p>
            ) : (
              <OrderList orders={orderData} />
            )}
          </div>
        )}
        {activeTab === "qna" && (
          <div className="qna-section">
            <h2>내가 작성한 질문</h2>
            <QnaList qnaData={qnaData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
