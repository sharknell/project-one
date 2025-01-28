const AdminSidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="sidebar">
      <ul>
        <li
          onClick={() => setActiveTab("productForm")}
          className={activeTab === "productForm" ? "active" : ""}
        >
          제품 등록
        </li>
        <li
          onClick={() => setActiveTab("qnaAdmin")}
          className={activeTab === "qnaAdmin" ? "active" : ""}
        >
          QnA 답변 및 조회
        </li>
        <li
          onClick={() => setActiveTab("members")}
          className={activeTab === "members" ? "active" : ""}
        >
          회원 조회
        </li>
        <li
          onClick={() => setActiveTab("shippingAdmin")}
          className={activeTab === "shippingAdmin" ? "active" : ""}
        >
          제품 배송 상태 변경
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
