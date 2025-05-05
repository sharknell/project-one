import React from "react";
import "../../styles/MemberList.css"; // CSS 파일을 import합니다.

const MemberList = ({ members }) => {
  return (
    <div className="member-list-container">
      <h2 className="member-list-title">회원 목록</h2>
      {Array.isArray(members) && members.length > 0 ? (
        <ul className="member-list">
          {members.map((member) => (
            <li key={member.id} className="member-item">
              <strong>{member.username}</strong> ({member.email})
            </li>
          ))}
        </ul>
      ) : (
        <p className="member-empty">회원이 없습니다.</p>
      )}
    </div>
  );
};

export default MemberList;
