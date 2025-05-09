import "../../styles/AdminSidebar.css";
const AdminSidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="admin-sidebar">
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
          onClick={() => setActiveTab("productList")}
          className={activeTab === "productList" ? "active" : ""}
        >
          상품 조회
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
