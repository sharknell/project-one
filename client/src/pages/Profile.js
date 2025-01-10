import React, { useState, useEffect } from "react";
import api from "../utils/api";
import Sidebar from "../components/SideBar";
import BasicInfo from "../components/BasicInfo";
import AddressList from "../components/AddressList";
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

  const fetchProfileData = async () => {
    try {
      const { data } = await api.get("/profile");
      setProfile(data.user);
      setEditData(data.user); // 처음 로딩 시 editData 상태 설정
    } catch (err) {
      if (
        err.response?.status === 401 &&
        err.response?.data?.refreshTokenRequired
      ) {
        try {
          await refreshAccessToken();
          fetchProfileData(); // 새 토큰으로 다시 시도
        } catch (refreshErr) {
          setError("세션이 만료되었습니다. 다시 로그인해주세요.");
        }
      } else {
        setError(err.response?.data?.message || "프로필 로드 실패");
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("리프레시 토큰이 없습니다.");
    }

    const { data } = await api.post("/profile/refresh", { refreshToken });
    localStorage.setItem("token", data.accessToken);
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
    setEditData(profile); // 편집 시작 시 현재 프로필 데이터로 초기화
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await api.put("/update", editData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProfile(editData);
      setIsEditing(false);
    } catch (err) {
      setError("프로필 업데이트 중 오류 발생");
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="profile-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="profile-content">
        {activeTab === "basicInfo" && (
          <BasicInfo
            user={profile}
            isEditing={isEditing}
            handleEditToggle={handleEditToggle}
            handleInputChange={handleInputChange} // input 변경 처리 함수 전달
            handleSave={handleSave}
            editData={editData}
          />
        )}
        {activeTab === "shipping" && (
          <AddressList addresses={profile?.addresses} />
        )}
        {activeTab === "payment" && <PaymentForm cards={profile?.cards} />}
        {activeTab === "orders" && <OrderList />}
      </div>
    </div>
  );
};

export default Profile;
