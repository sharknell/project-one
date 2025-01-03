import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/SideBar";
import BasicInfo from "../components/BasicInfo";
import AddressList from "../components/AddressList";
import AddressForm from "../components/AddressForm";
import PaymentForm from "../components/PaymentForm"; // 결제 카드 등록 폼 추가
import "../styles/Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basicInfo");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [cards, setCards] = useState([
    { cardNumber: "1234 5678 9876 5432", expiryDate: "12/25" },
    { cardNumber: "2345 6789 8765 4321", expiryDate: "11/24" },
  ]); // 하드코딩된 카드 정보

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("토큰이 제공되지 않았습니다.");
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        const userResponse = await axios.get(
          "http://localhost:5001/profile/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(userResponse.data.user);

        const addressResponse = await axios.get(
          "http://localhost:5001/profile/addresses",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAddresses(addressResponse.data.addresses);

        // 카드 정보 가져오기
        const cardResponse = await axios.get(
          "http://localhost:5001/profile/cards", // 카드 정보 API
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCards(cardResponse.data.cards);
      } catch (err) {
        setError("프로필 데이터를 가져오는 중 오류가 발생했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleCardSave = async (card) => {
    const token = localStorage.getItem("token");
    try {
      // 새 카드 저장
      await axios.post("http://localhost:5001/profile/cards", card, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 카드 목록 업데이트
      const response = await axios.get("http://localhost:5001/profile/cards", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCards(response.data.cards);
    } catch (err) {
      setError("카드를 저장하는 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-layout">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="profile-content">
          {activeTab === "basicInfo" && (
            <BasicInfo
              user={user}
              isEditing={isEditing}
              handleEditToggle={handleEditToggle}
              handleInputChange={handleInputChange}
              handleSave={handleSave}
              editData={editData}
            />
          )}

          {activeTab === "shipping" && (
            <>
              <button
                className="add-address-button"
                onClick={handleAddNewAddress}
              >
                새 배송지 추가
              </button>
              <AddressList
                addresses={addresses}
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

          {activeTab === "payment" && (
            <PaymentForm
              onSave={handleCardSave}
              cards={cards} // 카드 목록 전달
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
