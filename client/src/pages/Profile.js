import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/SideBar";
import BasicInfo from "../components/BasicInfo";
import "../styles/Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basicInfo");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [addresses, setAddresses] = useState([]); // 배송지 목록 상태 추가
  const [addressToEdit, setAddressToEdit] = useState(null); // 편집할 배송지 상태

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

        // 배송지 목록도 가져오기
        const addressResponse = await axios.get(
          "http://localhost:5001/profile/addresses",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("주소 목록 데이터:", addressResponse.data.addresses); // 주소 목록 데이터 확인
        setAddresses(addressResponse.data.addresses);
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
    setEditData(user); // 기존 데이터를 편집 상태에 복사
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://localhost:5001/profile/update", editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(editData); // 저장 후 사용자 데이터 업데이트
      setIsEditing(false); // 편집 모드 종료
    } catch (err) {
      console.error("Profile Update Error:", err);
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

  // 배송지 추가/편집
  const handleAddressSave = async (address) => {
    const token = localStorage.getItem("token");
    try {
      if (addressToEdit) {
        // 편집 모드
        await axios.put(
          `http://localhost:5001/profile/addresses/${addressToEdit.id}`,
          address,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // 새 배송지 추가
        await axios.post("http://localhost:5001/profile/addresses", address, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // 배송지 목록 갱신
      const response = await axios.get(
        "http://localhost:5001/profile/addresses",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAddresses(response.data.addresses);
      setAddressToEdit(null); // 편집 종료
    } catch (err) {
      console.error("Address Save Error:", err);
      setError("배송지를 저장하는 중 오류가 발생했습니다.");
    }
  };

  // 배송지 삭제
  const handleAddressDelete = async (address) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `http://localhost:5001/profile/addresses/${address.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 삭제 후 배송지 목록 갱신
      const response = await axios.get(
        "http://localhost:5001/profile/addresses",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAddresses(response.data.addresses);
    } catch (err) {
      console.error("Address Delete Error:", err);
      setError("배송지를 삭제하는 중 오류가 발생했습니다.");
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

          {activeTab === "addresses" && (
            <div className="addresses-section">
              <h2>배송지 관리</h2>
              <button onClick={() => setAddressToEdit(null)}>
                새 배송지 추가
              </button>
              <ul>
                {addresses.map((address) => (
                  <li key={address.id}>
                    <div>
                      <p>{`${address.street}, ${address.city}, ${address.state}, ${address.zip}`}</p>
                      {address.is_default && <span>(기본 배송지)</span>}
                    </div>
                    <button onClick={() => setAddressToEdit(address)}>
                      수정
                    </button>
                    <button onClick={() => handleAddressDelete(address)}>
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
              {addressToEdit && (
                <AddressForm
                  address={addressToEdit}
                  onSave={handleAddressSave}
                  onCancel={() => setAddressToEdit(null)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AddressForm = ({ address, onSave, onCancel }) => {
  const [street, setStreet] = useState(address ? address.street : "");
  const [city, setCity] = useState(address ? address.city : "");
  const [state, setState] = useState(address ? address.state : "");
  const [zip, setZip] = useState(address ? address.zip : "");
  const [isDefault, setIsDefault] = useState(
    address ? address.is_default : false
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ street, city, state, zip, is_default: isDefault });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>거리:</label>
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          required
        />
      </div>
      <div>
        <label>도시:</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
      </div>
      <div>
        <label>주/도:</label>
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
        />
      </div>
      <div>
        <label>우편번호:</label>
        <input
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          required
        />
      </div>
      <div>
        <label>
          기본 배송지로 설정
          <input
            type="checkbox"
            checked={isDefault}
            onChange={() => setIsDefault((prev) => !prev)}
          />
        </label>
      </div>
      <button type="submit">저장</button>
      <button type="button" onClick={onCancel}>
        취소
      </button>
    </form>
  );
};

export default Profile;
