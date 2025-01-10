import React, { useState, useEffect } from "react";
import api from "../utils/api";
import BasicInfo from "../components/BasicInfo";
import AddressList from "../components/AddressList";
import AddressForm from "../components/AddressForm";
import PaymentForm from "../components/PaymentForm";
import OrderList from "../components/OrderList";
import "../styles/Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basicInfo");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [addressToEdit, setAddressToEdit] = useState(null);

  // 로그인된 사용자의 정보를 가져오기 위한 함수
  const fetchProfileData = async () => {
    const token = localStorage.getItem("token"); // 토큰이 localStorage에 있다고 가정
    if (!token) {
      setError("로그인 정보가 없습니다.");
      return;
    }

    try {
      // Authorization 헤더에 토큰을 포함시켜 요청
      const { data } = await api.get("/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(data.user);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "프로필 로드 실패");
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
    setEditData(profile);
  };

  const handleSave = async () => {
    try {
      await api.put("/profile/update", editData);
      setProfile(editData);
      setIsEditing(false);
    } catch (err) {
      setError("프로필 업데이트 중 오류 발생");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAddressSave = async (address) => {
    try {
      await api.post("/profile/addresses", address);
      fetchProfileData();
    } catch (err) {
      setError("배송지 저장 중 오류 발생");
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="profile-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="profile-content">
        <BasicInfo
          user={profile}
          isEditing={isEditing}
          handleEditToggle={handleEditToggle}
          handleInputChange={handleInputChange}
          handleSave={handleSave}
          editData={editData}
        />
      </div>
    </div>
  );
};

export default Profile;
