import React from "react";
import "../../styles/BasicInfo.css";

const BasicInfo = ({
  user,
  isEditing,
  handleEditToggle,
  handleInputChange,
  handleSave,
  editData,
}) => {
  return (
    <div className="basic-info-tab-content">
      <h2>기본 정보</h2>
      {isEditing ? (
        <>
          <div className="basic-info-form-group">
            <label className="basic-info-label">닉네임:</label>
            <input
              type="text"
              name="username"
              value={editData.username}
              onChange={handleInputChange}
              className="basic-info-edit-input"
            />
          </div>
          <div className="basic-info-form-group">
            <label className="basic-info-label">이메일 주소:</label>
            <input
              type="email"
              name="email"
              value={editData.email}
              onChange={handleInputChange}
              className="basic-info-edit-input"
            />
          </div>
          <div className="basic-info-form-group">
            <label className="basic-info-label">연락처:</label>
            <input
              type="text"
              name="phone"
              value={editData.phone || ""}
              onChange={handleInputChange}
              className="basic-info-edit-input"
            />
          </div>
          <div className="basic-info-button-group">
            <button onClick={handleSave} className="basic-info-save-btn">
              저장
            </button>
            <button
              onClick={handleEditToggle}
              className="basic-info-cancel-btn"
            >
              취소
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="basic-info-display-info">
            <p className="basic-info-p">
              <strong className="basic-info-strong">닉네임 :</strong>{" "}
              {user.username}
            </p>
            <p className="basic-info-p">
              <strong className="basic-info-strong">이메일 주소 :</strong>{" "}
              {user.email}
            </p>
            <p className="basic-info-p">
              <strong className="basic-info-strong">연락처 :</strong>{" "}
              {user.phone || "정보 없음"}
            </p>
          </div>
          <button onClick={handleEditToggle} className="basic-info-edit-btn">
            편집하기
          </button>
        </>
      )}
    </div>
  );
};

export default BasicInfo;
