import React, { useState } from "react";
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
    <div className="tab-content">
      <h2>기본 정보</h2>
      {isEditing ? (
        <>
          <div className="form-group">
            <label>닉네임:</label>
            <input
              type="text"
              name="username"
              value={editData.username}
              onChange={handleInputChange}
              className="edit-input"
            />
          </div>
          <div className="form-group">
            <label>이메일 주소:</label>
            <input
              type="email"
              name="email"
              value={editData.email}
              onChange={handleInputChange}
              className="edit-input"
            />
          </div>
          <div className="form-group">
            <label>연락처:</label>
            <input
              type="text"
              name="phone"
              value={editData.phone || ""}
              onChange={handleInputChange}
              className="edit-input"
            />
          </div>
          <div className="button-group">
            <button onClick={handleSave} className="save-btn">
              저장
            </button>
            <button onClick={handleEditToggle} className="cancel-btn">
              취소
            </button>
          </div>
        </>
      ) : (
        <>
          <p>
            <strong>닉네임 :</strong> {user.username}
          </p>
          <p>
            <strong>이메일 주소 :</strong> {user.email}
          </p>
          <p>
            <strong>연락처 :</strong> {user.phone || "정보 없음"}
          </p>
          <button onClick={handleEditToggle} className="edit-btn">
            편집하기
          </button>
        </>
      )}
    </div>
  );
};

export default BasicInfo;
