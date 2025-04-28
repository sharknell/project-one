import React from "react";

const MemberList = ({ members }) => {
  return (
    <div>
      <h2>회원 목록</h2>
      <ul>
        {Array.isArray(members) && members.length > 0 ? (
          members.map((member) => (
            <li key={member.id}>
              {member.username} ({member.email})
            </li>
          ))
        ) : (
          <p>회원이 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

export default MemberList;
