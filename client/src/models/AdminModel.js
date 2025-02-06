import { useState, useCallback } from "react";

const useAdminModel = (API_BASE_URL) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [members, setMembers] = useState([]);
  const [qna, setQna] = useState([]);
  const [filteredQna, setFilteredQna] = useState([]);
  const [products, setProducts] = useState([]);

  const fetchData = useCallback(
    async (url, method = "GET", body = null) => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: body ? JSON.stringify(body) : null,
        });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return await response.json();
      } catch (error) {
        setError("API 호출 중 오류가 발생했습니다.");
        console.error(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [API_BASE_URL]
  );

  const fetchProducts = useCallback(async () => {
    const data = await fetchData("/shop");
    setProducts(data?.data || []);
  }, [fetchData]);

  const fetchQnaAndMembers = useCallback(async () => {
    const [qnaData, memberData] = await Promise.all([
      fetchData("/qna/qna"),
      fetchData("/auth/users"),
    ]);
    setQna(qnaData?.data || []);
    setFilteredQna(qnaData?.data || []);
    setMembers(memberData?.users || []);
  }, [fetchData]);

  return {
    loading,
    error,
    members,
    qna,
    filteredQna,
    products,
    fetchProducts,
    fetchQnaAndMembers,
  };
};

export default useAdminModel;
