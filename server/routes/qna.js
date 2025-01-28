const express = require("express");
const { dbPromise } = require("../config/db");
const { authenticateUser } = require("../middleware/authenticateToken");

const router = express.Router();

// QnA 목록을 사용자별로 가져오는 엔드포인트
router.get("/user/qna", authenticateUser, async (req, res) => {
  const userName = req.user.username; // userName 대신 username 사용 (혹은 반대로 확인)
  console.log("Authenticated userName:", userName); // 인증된 사용자 이름 로그 출력

  try {
    const query = `
      SELECT qna.id, qna.question, qna.userName, qna.productId, qna.createdAt, qna.updatedAt,
             p.image_url AS productImage
      FROM qna
      JOIN products p ON qna.productId = p.id
      WHERE qna.userName = ?
    `;
    console.log("Executing query for user QnA with username:", userName); // 쿼리 실행 전 로그
    const [qnaList] = await dbPromise.query(query, [userName]);

    if (!qnaList || qnaList.length === 0) {
      console.log("No QnA found for the user."); // 결과가 없을 때
    } else {
      console.log("QnA List:", qnaList); // 조회된 QnA 리스트 로그 출력
    }

    res.status(200).json({ data: qnaList });
  } catch (error) {
    console.error("QnA 조회 실패:", error);
    res.status(500).json({ message: "QnA 조회 실패" });
  }
});

// QnA 전체 조회 엔드포인트
router.get("/qna", async (req, res) => {
  console.log("Fetching all QnA..."); // 전체 조회 시작 로그 추가

  try {
    const query = `
      SELECT qna.id, qna.question, qna.userName, qna.productId, qna.createdAt, qna.updatedAt,
             p.image_url AS productImage
      FROM qna
      JOIN products p ON qna.productId = p.id
    `;
    console.log("Executing query for all QnA..."); // 쿼리 실행 전 로그
    const [qnaList] = await dbPromise.query(query);

    if (!qnaList || qnaList.length === 0) {
      console.log("No QnA found."); // 결과가 없을 때
    } else {
      console.log("QnA List:", qnaList); // 조회된 QnA 리스트 로그 출력
    }

    res.status(200).json({ data: qnaList });
  } catch (error) {
    console.error("QnA 조회 실패:", error);
    res.status(500).json({ message: "QnA 조회 실패" });
  }
});

module.exports = router;
