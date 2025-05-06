const express = require("express");
const { dbPromise } = require("../config/db");
const { authenticateUser } = require("../middleware/authenticateToken");

const router = express.Router();

// ✅ [1] 특정 사용자 QnA 목록 가져오기
router.get("/user/qna", authenticateUser, async (req, res) => {
  const username = req.user.username; // 'username'으로 통일
  console.log("Authenticated user:", username);

  try {
    const query = `
      SELECT qna.id, qna.question, qna.username, qna.productId, qna.createdAt, qna.updatedAt, 
             qna.answer, qna.answerCreatedAt, p.image_url AS productImage
      FROM qna
      JOIN products p ON qna.productId = p.id
      WHERE qna.username = ?
    `;
    const [qnaList] = await dbPromise.query(query, [username]);

    res.status(200).json({ data: qnaList });
  } catch (error) {
    console.error("QnA 조회 실패:", error);
    res.status(500).json({ message: "QnA 조회 실패" });
  }
});

// ✅ [5] QnA 삭제 (관리자만 가능)
router.delete("/qna/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const admin = req.user.username; // 관리자만 처리

  try {
    // 해당 질문이 존재하는지 확인
    const checkQuery = `SELECT id FROM qna WHERE id = ?`;
    const [checkResult] = await dbPromise.query(checkQuery, [id]);

    if (checkResult.length === 0) {
      return res.status(404).json({ message: "해당 질문을 찾을 수 없습니다." });
    }

    // 질문 삭제
    const deleteQuery = `DELETE FROM qna WHERE id = ?`;
    const [deleteResult] = await dbPromise.query(deleteQuery, [id]);

    if (deleteResult.affectedRows === 0) {
      return res.status(500).json({ message: "질문 삭제 실패" });
    }

    res.status(200).json({ success: true, message: "질문이 삭제되었습니다." });
  } catch (error) {
    console.error("QnA 삭제 실패:", error);
    res.status(500).json({ message: "QnA 삭제 실패" });
  }
});

// ✅ [6] QnA 수정 (관리자만 가능)
router.put("/qna/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { question } = req.body;
  const admin = req.user.username; // 관리자만 처리

  if (!question) {
    return res
      .status(400)
      .json({ message: "수정할 질문 내용을 입력해주세요." });
  }

  try {
    // 해당 질문이 존재하는지 확인
    const checkQuery = `SELECT id FROM qna WHERE id = ?`;
    const [checkResult] = await dbPromise.query(checkQuery, [id]);

    if (checkResult.length === 0) {
      return res.status(404).json({ message: "해당 질문을 찾을 수 없습니다." });
    }

    // 질문 수정
    const updateQuery = `
      UPDATE qna
      SET question = ?, updatedAt = NOW()
      WHERE id = ?
    `;
    const [updateResult] = await dbPromise.query(updateQuery, [question, id]);

    if (updateResult.affectedRows === 0) {
      return res.status(500).json({ message: "질문 수정 실패" });
    }

    res.status(200).json({ success: true, message: "질문이 수정되었습니다." });
  } catch (error) {
    console.error("QnA 수정 실패:", error);
    res.status(500).json({ message: "QnA 수정 실패" });
  }
});

// QnA 등록 엔드포인트
router.post(
  "/shop/product/:productId/qna",
  authenticateUser,
  async (req, res) => {
    const { productId } = req.params;
    const { question } = req.body;
    const username = req.user.username; // 인증된 사용자에서 username 추출

    // 필드가 하나라도 비어 있으면 400 에러 반환
    if (!question || !username || !productId) {
      return res.status(400).json({ message: "모든 필드를 입력해주세요." });
    }

    try {
      const query = `
        INSERT INTO qna (question, username, productId, createdAt, updatedAt)
        VALUES (?, ?, ?, NOW(), NOW())
      `;
      const [result] = await dbPromise.query(query, [
        question,
        username,
        productId,
      ]);

      res.status(201).json({
        message: "QnA가 등록되었습니다.",
        data: {
          id: result.insertId,
          question,
          username,
          productId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("QnA 등록 실패:", error);
      res.status(500).json({ message: "QnA 등록 실패" });
    }
  }
);

// ✅ [2] 모든 QnA 목록 가져오기
router.get("/qna", async (req, res) => {
  try {
    const query = `
      SELECT qna.id, qna.question, qna.username, qna.productId, qna.createdAt, qna.updatedAt, qna.answer, qna.answerCreatedAt,
             p.image_url AS productImage
      FROM qna
      JOIN products p ON qna.productId = p.id
    `;
    const [qnaList] = await dbPromise.query(query);

    res.status(200).json({ data: qnaList });
  } catch (error) {
    console.error("QnA 조회 실패:", error);
    res.status(500).json({ message: "QnA 조회 실패" });
  }
});

// ✅ [3] 특정 QnA의 답변 가져오기 (수정됨)
router.get("/qna/:id/answers", async (req, res) => {
  const { id } = req.params;

  try {
    const query = `SELECT answer, answerCreatedAt FROM qna WHERE id = ?`;
    const [result] = await dbPromise.query(query, [id]);

    if (result.length === 0) {
      return res.status(404).json({ message: "해당 질문을 찾을 수 없습니다." });
    }

    res.status(200).json({ data: result[0].answer ? [result[0]] : [] });
  } catch (error) {
    console.error("답변 조회 실패:", error);
    res.status(500).json({ message: "답변 조회 실패" });
  }
});

// ✅ [4] 답변 저장 (관리자만 가능)
router.post("/qna/answer", authenticateUser, async (req, res) => {
  const { questionId, answer } = req.body;
  const admin = req.user.username; // 관리자만 처리

  if (!questionId || !answer) {
    return res.status(400).json({ message: "질문 ID와 답변을 입력해주세요." });
  }

  try {
    const query = `
      UPDATE qna SET answer = ?, answerCreatedAt = NOW()
      WHERE id = ?
    `;
    const [result] = await dbPromise.query(query, [answer, questionId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "해당 질문을 찾을 수 없습니다." });
    }

    res.status(200).json({ success: true, message: "답변이 저장되었습니다." });
  } catch (error) {
    console.error("QnA 답변 저장 실패:", error);
    res.status(500).json({ message: "답변 저장 실패" });
  }
});

module.exports = router;
