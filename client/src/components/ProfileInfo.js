import React from "react";

const ProfileInfo = ({
  user,
  isEditing,
  formData,
  handleInputChange,
  successMessage,
  setIsEditing,
  updateProfile,
}) => {
  return (
    <div className="profile-section">
      <h2 className="profile-title">프로필</h2>
      <div className="profile-info">
        <strong>이름:</strong>{" "}
        {isEditing ? (
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
          />
        ) : (
          user.username
        )}
      </div>
      <div className="profile-info">
        <strong>이메일:</strong>{" "}
        {isEditing ? (
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        ) : (
          user.email
        )}
      </div>
      <div className="profile-info">
        <strong>전화번호:</strong>{" "}
        {isEditing ? (
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
        ) : (
          user.phone
        )}
      </div>
      <div className="profile-info">
        <strong>비밀번호:</strong>{" "}
        {isEditing ? (
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="새 비밀번호"
          />
        ) : (
          "**********"
        )}
      </div>

      {successMessage && <p className="success-message">{successMessage}</p>}

      {isEditing ? (
        <button className="save-btn" onClick={updateProfile}>
          변경 사항 저장
        </button>
      ) : (
        <button className="edit-btn" onClick={() => setIsEditing(true)}>
          프로필 수정
        </button>
      )}
    </div>
  );
};

export default ProfileInfo;
