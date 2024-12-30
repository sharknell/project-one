import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext"; // 인증 상태를 가져옵니다.
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/UserController"; // 사용자 정보 조회 및 업데이트 함수
import "../styles/Mypage.css";

function Mypage() {
  const { user, isAuthenticated } = useAuth(); // 인증 상태 및 사용자 정보 가져오기
  const [profile, setProfile] = useState({ name: "", email: "", username: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      alert("로그인 후 Mypage에 접근할 수 있습니다.");
      window.location.href = "/login"; // 로그인하지 않으면 로그인 페이지로 이동
    } else if (user) {
      // 사용자 프로필 정보 가져오기 (user 객체가 존재할 때만)
      getUserProfile(user.id).then((data) => {
        setProfile({
          name: data.name,
          email: data.email,
          username: data.username,
        });
        setNewUsername(data.username);
        setNewEmail(data.email);
      });
    }
  }, [isAuthenticated, user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSubmit = () => {
    // 사용자 정보 업데이트
    updateUserProfile(user.id, newEmail, newUsername)
      .then((response) => {
        alert("정보가 업데이트되었습니다.");
        setIsEditing(false); // 수정 모드 종료
        setProfile({
          ...profile,
          email: newEmail,
          username: newUsername,
        });
      })
      .catch((error) => {
        alert("정보 업데이트에 실패했습니다.");
      });
  };

  return (
    <div className="mypage-container">
      <h1>Mypage</h1>
      <div className="mypage-profile">
        <h2>사용자 정보</h2>
        <p>
          <strong>이름:</strong> {profile.name}
        </p>
        {isEditing ? (
          <>
            <div className="mypage-input-group">
              <label htmlFor="username">사용자 이름:</label>
              <input
                id="username"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div className="mypage-input-group">
              <label htmlFor="email">이메일:</label>
              <input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <button onClick={handleSubmit}>저장</button>
            <button onClick={handleEditToggle}>취소</button>
          </>
        ) : (
          <>
            <p>
              <strong>이메일:</strong> {profile.email}
            </p>
            <p>
              <strong>사용자 이름:</strong> {profile.username}
            </p>
            <button onClick={handleEditToggle}>정보 수정</button>
          </>
        )}
      </div>
      <div className="mypage-orders">
        <h2>주문 내역</h2>
        {/* 주문 내역은 별도의 API를 통해 조회 후 렌더링 */}
        <p>주문 내역은 이곳에 표시됩니다.</p>
      </div>
    </div>
  );
}

export default Mypage;
