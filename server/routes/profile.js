require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const { dbPromise } = require("../config/db");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("JWT_REFRESH_SECRET:", process.env.JWT_REFRESH_SECRET);

const verifyToken = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

router.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "토큰이 제공되지 않았습니다." });
  }

  try {
    const decoded = await verifyToken(token, JWT_SECRET); // JWT_SECRET로 검증
    const userId = decoded.id;

    const [user] = await dbPromise.query(
      "SELECT id, username, email, phone FROM users WHERE id = ?",
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.status(200).json({ user: user[0] });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.error("만료된 토큰 감지:", err);

      return res.status(401).json({
        message: "토큰이 만료되었습니다.",
        refreshTokenRequired: true, // 리프레시 토큰 사용을 유도
      });
    }

    console.error("프로필 오류:", err);
    res
      .status(500)
      .json({ message: "프로필을 가져오는 중 오류가 발생했습니다." });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "리프레시 토큰이 제공되지 않았습니다." });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET); // 리프레시 토큰 검증
    const userId = decoded.id;

    const [user] = await dbPromise.query(
      "SELECT refresh_token FROM users WHERE id = ?",
      [userId]
    );

    if (!user.length || user[0].refresh_token !== refreshToken) {
      return res
        .status(403)
        .json({ message: "리프레시 토큰이 유효하지 않습니다." });
    }

    const accessToken = jwt.sign({ id: userId }, JWT_SECRET, {
      expiresIn: "1h", // 새 액세스 토큰 1시간 유효
    });

    res.status(200).json({ accessToken });
  } catch (err) {
    console.error("리프레시 토큰 오류:", err);
    res.status(500).json({ message: "리프레시 토큰 처리 중 오류 발생." });
  }
});

// 프로필 업데이트
router.put("/update", async (req, res) => {
  const { username, email, phone } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    await dbPromise.query(
      "UPDATE users SET username = ?, email = ?, phone = ? WHERE id = ?",
      [username, email, phone, decoded.id]
    );

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});
module.exports = router;
