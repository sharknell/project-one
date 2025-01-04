import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/SideBar";
import BasicInfo from "../components/BasicInfo";
import AddressList from "../components/AddressList";
import AddressForm from "../components/AddressForm";
import PaymentForm from "../components/PaymentForm"; // PaymentForm 추가
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
  const [cards, setCards] = useState([]); // 카드 목록 상태 추가

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

        const cardResponse = await axios.get(
          "http://localhost:5001/profile/cards", // 카드 데이터 가져오기
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCards(cardResponse.data.cards); // 카드 목록 상태 업데이트
      } catch (err) {
        setError("프로필 데이터를 가져오는 중 오류가 발생했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
    setEditData(user);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://localhost:5001/profile/update", editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(editData);
      setIsEditing(false);
    } catch (err) {
      setError("프로필 정보를 업데이트하는 중 오류가 발생했습니다.");
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddressSave = async (address) => {
    const token = localStorage.getItem("token");
    try {
      if (addressToEdit && addressToEdit.id) {
        await axios.put(
          `http://localhost:5001/profile/addresses/${addressToEdit.id}`,
          address,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post("http://localhost:5001/profile/addresses", address, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const response = await axios.get(
        "http://localhost:5001/profile/addresses",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAddresses(response.data.addresses);
      setAddressToEdit(null); // 폼 제출 후 주소 편집 모드 해제
    } catch (err) {
      setError("배송지를 저장하는 중 오류가 발생했습니다.");
    }
  };

  const handleAddressDelete = async (address) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `http://localhost:5001/profile/addresses/${address.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const response = await axios.get(
        "http://localhost:5001/profile/addresses",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAddresses(response.data.addresses);
    } catch (err) {
      setError("배송지를 삭제하는 중 오류가 발생했습니다.");
    }
  };

  const handleAddNewAddress = () => {
    // 새 배송지 추가를 위한 빈 객체 할당
    setAddressToEdit({
      street: "",
      city: "",
      state: "",
      zip: "",
      is_default: false,
    });
  };

  const handleCardSave = async (cardData) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:5001/profile/cards", cardData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cardResponse = await axios.get(
        "http://localhost:5001/profile/cards",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCards(cardResponse.data.cards);
    } catch (err) {
      setError("카드를 추가하는 중 오류가 발생했습니다.");
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
              {/* 배송지 추가 버튼은 한 번만 렌더링 */}
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
              {/* 배송지 추가 폼은 addressToEdit가 있을 때만 표시 */}
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
            <>
              <PaymentForm onSave={handleCardSave} cards={cards} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
