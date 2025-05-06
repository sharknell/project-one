import React from "react";
import "../../styles/MemberList.css";

const MemberList = ({
  members,
  onDelete,
  onEdit,
  editingMember,
  editedMemberInfo,
  setEditedMemberInfo,
  onUpdate,
  setEditingMember, // This should be in the props
}) => {
  return (
    <div className="member-list-container">
      <h2 className="member-list-title">회원 목록</h2>
      {editingMember ? (
        <div className="edit-member-form">
          <h3>회원 정보 수정</h3>
          <label>
            사용자명:
            <input
              type="text"
              value={editedMemberInfo.username}
              onChange={(e) =>
                setEditedMemberInfo({
                  ...editedMemberInfo,
                  username: e.target.value,
                })
              }
            />
          </label>
          <label>
            이메일:
            <input
              type="email"
              value={editedMemberInfo.email}
              onChange={(e) =>
                setEditedMemberInfo({
                  ...editedMemberInfo,
                  email: e.target.value,
                })
              }
            />
          </label>
          <button onClick={onUpdate}>수정 완료</button>
          <button onClick={() => setEditingMember(null)}>취소</button>
        </div>
      ) : (
        <ul className="member-list">
          {members.length > 0 ? (
            members.map((member) => (
              <li key={member.id} className="member-item">
                <strong>{member.username}</strong> ({member.email})
                <button onClick={() => onEdit(member.id)} className="edit-btn">
                  수정
                </button>
                <button
                  onClick={() => onDelete(member.id)}
                  className="delete-btn"
                >
                  삭제
                </button>
              </li>
            ))
          ) : (
            <p className="member-empty">회원이 없습니다.</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default MemberList;
