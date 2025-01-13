const express = require("express");
const { dbPromise } = require("../config/db");
const { authenticateUser } = require("../middleware/authenticateToken");

const router = express.Router();

router.get("/cart", authenticateUser, async (req, res) => {
  const userId = req.user.id; // 인증된 사용자의 ID를 가져옵니다.

  try {
    const query = `
      SELECT c.id, p.name, p.price, c.quantity, p.image_url
      FROM carts c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `;
    const [cartItems] = await dbPromise.query(query, [userId]);

    if (cartItems.length === 0) {
      return res.status(200).json({ message: "장바구니가 비어 있습니다." });
    }

    res.status(200).json({ data: cartItems });
  } catch (error) {
    console.error("장바구니 조회 실패:", error);
    res.status(500).json({ message: "장바구니 조회 실패" });
  }
});

router.post("/cart", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ message: "상품 ID와 수량을 입력해주세요." });
  }

  try {
    const query = `
        INSERT INTO carts (user_id, product_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + ?;
      `;
    await dbPromise.query(query, [userId, productId, quantity, quantity]);

    res.status(201).json({ message: "장바구니에 상품이 추가되었습니다." });
  } catch (error) {
    console.error("장바구니 추가 실패:", error);
    res.status(500).json({ message: "장바구니 추가 실패" });
  }
});

router.put("/cart/:itemId", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0) {
    return res.status(400).json({ message: "수량은 1개 이상이어야 합니다." });
  }

  try {
    const query = `
        UPDATE carts
        SET quantity = ?
        WHERE id = ? AND user_id = ?
      `;
    const [result] = await dbPromise.query(query, [quantity, itemId, userId]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "해당 장바구니 아이템을 찾을 수 없습니다." });
    }

    res.status(200).json({ message: "장바구니 수량이 업데이트되었습니다." });
  } catch (error) {
    console.error("장바구니 수량 변경 실패:", error);
    res.status(500).json({ message: "장바구니 수량 변경 실패" });
  }
});

router.delete("/cart/:itemId", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.params;

  try {
    const query = `
        DELETE FROM carts
        WHERE id = ? AND user_id = ?
      `;
    const [result] = await dbPromise.query(query, [itemId, userId]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "해당 장바구니 아이템을 찾을 수 없습니다." });
    }

    res.status(200).json({ message: "장바구니 아이템이 삭제되었습니다." });
  } catch (error) {
    console.error("장바구니 삭제 실패:", error);
    res.status(500).json({ message: "장바구니 삭제 실패" });
  }
});

module.exports = router;
