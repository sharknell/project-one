import "../styles/SideBar.css";

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="sidebar">
      <ul>
        <li
          onClick={() => setActiveTab("basicInfo")}
          className={activeTab === "basicInfo" ? "active" : ""}
        >
          기본 정보
        </li>
        <li
          onClick={() => setActiveTab("shipping")}
          className={activeTab === "shipping" ? "active" : ""}
        >
          배송지 관리
        </li>
        <li
          onClick={() => setActiveTab("orders")}
          className={activeTab === "orders" ? "active" : ""}
        >
          주문 내역
        </li>
        <li
          onClick={() => setActiveTab("qna")}
          className={activeTab === "qna" ? "active" : ""}
        >
          문의 내역
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
