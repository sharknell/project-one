import { useState } from "react";

const useAdminController = (
  API_BASE_URL,
  fetchProducts,
  fetchQnaAndMembers
) => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    effect: "",
    size: "",
    stock: "",
    imageUrl: "",
    shippingTime: "",
    returnPolicy: "",
    artOfPerfuming: "",
    detailedInfo: "",
  });
  const [editingProduct, setEditingProduct] = useState(null);

  // 상품 등록 처리
  const handleSubmit = async (product) => {
    try {
      const response = await fetch(`${API_BASE_URL}/shop/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(product),
      });

      const data = await response.json();

      if (response.ok && data.message === "상품이 성공적으로 추가되었습니다.") {
        alert("상품이 성공적으로 등록되었습니다.");
        setNewProduct({
          name: "",
          price: "",
          description: "",
          category: "",
          effect: "",
          size: "",
          stock: "",
          imageUrl: "",
          shippingTime: "",
          returnPolicy: "",
          artOfPerfuming: "",
          detailedInfo: "",
        });
      } else {
        alert("상품 등록에 실패했습니다.");
      }
    } catch (error) {
      alert("상품 등록 중 오류가 발생했습니다.");
    }
  };

  // 제품 편집
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      ...product,
    });
  };

  // 제품 삭제
  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/shop/product/${productId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        alert("제품이 삭제되었습니다.");
        fetchProducts(); // 삭제 후 제품 목록을 다시 가져옵니다.
      } else {
        alert("제품 삭제에 실패했습니다.");
      }
    } catch (error) {
      alert("제품 삭제 중 오류가 발생했습니다.");
    }
  };

  // Q&A 필터링
  const handleFilterChange = (filterType, qna) => {
    const filters = {
      all: () => setFilteredQna(qna),
      unanswered: () => setFilteredQna(qna.filter((item) => !item.answer)),
      newest: () =>
        setFilteredQna(
          [...qna].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        ),
      oldest: () =>
        setFilteredQna(
          [...qna].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        ),
    };
    filters[filterType]?.();
  };

  // 답변 제출
  const handleAnswerSubmit = async (questionId, answer) => {
    if (!answer) return alert("답변을 입력해주세요.");
    const response = await fetchData("/qna/qna/answer", "POST", {
      questionId,
      answer,
    });
    response?.success
      ? alert("답변이 제출되었습니다.")
      : alert("답변 제출 실패");
    fetchQnaAndMembers();
  };

  return {
    newProduct,
    setNewProduct,
    handleSubmit,
    handleEditProduct,
    handleDeleteProduct,
    handleFilterChange,
    handleAnswerSubmit,
  };
};

export default useAdminController;
