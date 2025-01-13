import React, { useState, useEffect } from "react";
import api, { getProfile, getAddresses } from "../utils/api";
import Sidebar from "../components/SideBar";
import BasicInfo from "../components/BasicInfo";
import AddressList from "../components/AddressList";
import AddressForm from "../components/AddressForm";
import OrderList from "../components/OrderList";
import QnaList from "../components/QnAList"; // QnA 목록을 표시하는 컴포넌트
import "../styles/Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basicInfo");
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [qnaData, setQnaData] = useState([]); // QnA 데이터를 상태로 관리

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const profileData = await getProfile(token);
        setProfile(profileData.user);
        const addressesData = await getAddresses(token);
        setProfile((prev) => ({ ...prev, addresses: addressesData.addresses }));

        // QnA 데이터 가져오기
        const qnaResponse = await api.get("/qna/user/qna", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 받은 QnA 데이터 확인 (배열인지 체크)
        console.log("QnA 데이터:", qnaResponse.data);

        // qnaResponse.data.data 배열이므로 해당 데이터로 설정
        if (Array.isArray(qnaResponse.data.data)) {
          setQnaData(qnaResponse.data.data);
        } else {
          setQnaData([]); // 배열이 아니면 빈 배열로 처리
        }
      } catch (err) {
        setError("프로필 로드 실패");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [selectedProductId]); // `selectedProductId`에 의존하여 QnA 데이터를 다시 가져옵니다.

  const handleAddressSave = async (address) => {
    const token = localStorage.getItem("authToken");

    if (addressToEdit) {
      try {
        await updateAddress(token, addressToEdit.id, address);
        setProfile((prev) => ({
          ...prev,
          addresses: prev.addresses.map((a) =>
            a.id === addressToEdit.id ? address : a
          ),
        }));
        setAddressToEdit(null);
      } catch (err) {
        setError("배송지 수정 실패");
      }
    } else {
      try {
        await addAddress(token, address);
        setProfile((prev) => ({
          ...prev,
          addresses: [...prev.addresses, { ...address, id: Date.now() }],
        }));
      } catch (err) {
        setError("배송지 추가 실패");
      }
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
      setError("배송지 삭제 실패");
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
        {activeTab === "orders" && <OrderList />}
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
