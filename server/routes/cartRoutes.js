const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const { dbPromise } = require("../config/db"); // DB 연결

// 장바구니에 상품 추가
router.post("/add", async (req, res) => {
  const { productId, quantity, userId, thumbnail, productName, productSize } =
    req.body;

  try {
    const [product] = await dbPromise.execute(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );
    if (product.length === 0) {
      return res.status(404).json({ message: "제품을 찾을 수 없습니다." });
    }

    const productPrice = product[0].price;

    const [existingCartItem] = await dbPromise.execute(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (existingCartItem.length > 0) {
      const updatedQuantity = existingCartItem[0].quantity + quantity;

      await dbPromise.execute("UPDATE cart SET quantity = ? WHERE id = ?", [
        updatedQuantity,
        existingCartItem[0].id,
      ]);

      return res
        .status(200)
        .json({ message: "장바구니에 품목의 수량이 추가되었습니다." });
    }

    await dbPromise.execute(
      "INSERT INTO cart (product_id, quantity, price, user_id, thumbnail, product_name, product_size) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        productId,
        quantity,
        productPrice,
        userId,
        thumbnail,
        productName,
        productSize,
      ]
    );

    res.status(200).json({ message: "장바구니에 추가되었습니다." });
  } catch (err) {
    console.error("장바구니 추가 실패:", err);
    res.status(500).json({ message: "장바구니에 추가하는 데 실패했습니다." });
  }
});

// 장바구니 항목 조회
router.get("/", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "사용자 ID가 필요합니다." });
  }

  try {
    const [cartItems] = await dbPromise.execute(
      "SELECT * FROM cart WHERE user_id = ?",
      [userId]
    );
    res.status(200).json(cartItems);
  } catch (err) {
    console.error("장바구니 조회 오류:", err);
    res.status(500).json({ error: "장바구니 조회에 실패했습니다." });
  }
});

// 장바구니 항목 삭제
router.delete("/remove/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await dbPromise.execute("DELETE FROM cart WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "장바구니에서 삭제되었습니다." });
    } else {
      res.status(404).json({ message: "장바구니 항목을 찾을 수 없습니다." });
    }
  } catch (err) {
    console.error("장바구니 삭제 오류:", err);
    res.status(500).json({ error: "장바구니에서 삭제하는 데 실패했습니다." });
  }
});

// 장바구니 수량 변경
router.put("/updateQuantity/:id", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) {
    return res.status(400).json({ message: "수량은 1개 이상이어야 합니다." });
  }

  try {
    const [existingCartItem] = await dbPromise.execute(
      "SELECT * FROM cart WHERE id = ?",
      [id]
    );

    if (existingCartItem.length === 0) {
      return res
        .status(404)
        .json({ message: "장바구니 항목을 찾을 수 없습니다." });
    }

    await dbPromise.execute("UPDATE cart SET quantity = ? WHERE id = ?", [
      quantity,
      id,
    ]);

    res.status(200).json({ message: "장바구니 수량이 업데이트되었습니다." });
  } catch (err) {
    console.error("장바구니 수량 변경 오류:", err);
    res.status(500).json({ error: "장바구니 수량 변경에 실패했습니다." });
  }
});

router.post("/clear", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "사용자 ID가 필요합니다." });
  }

  try {
    const [cartItems] = await dbPromise.execute(
      "SELECT product_id AS productId FROM cart WHERE user_id = ?",
      [userId]
    );

    if (cartItems.length === 0) {
      return res
        .status(404)
        .json({ message: "초기화할 장바구니 항목이 없습니다." });
    }

    const success = await clearCart(userId, cartItems);

    if (success) {
      return res.status(200).json({ message: "장바구니가 초기화되었습니다." });
    } else {
      return res
        .status(500)
        .json({ error: "장바구니 초기화 중 오류가 발생했습니다." });
    }
  } catch (err) {
    console.error("장바구니 초기화 API 오류:", err);
    res.status(500).json({ error: "장바구니 초기화에 실패했습니다." });
  }
});

// 서버에서 배송지 조회 API
router.get("/addresses", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "사용자 ID가 필요합니다." });
  }

  try {
    const [addresses] = await dbPromise.execute(
      "SELECT * FROM addresses WHERE user_id = ?",
      [userId]
    );
    if (addresses.length === 0) {
      return res.status(404).json({ message: "배송지를 찾을 수 없습니다." });
    }
    res.status(200).json(addresses);
  } catch (err) {
    console.error("배송지 조회 오류:", err);
    res.status(500).json({ error: "배송지 조회에 실패했습니다." });
  }
});

module.exports = router;
