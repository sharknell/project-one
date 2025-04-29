const express = require("express");
const bcrypt = require("bcrypt");
const { dbPromise } = require("../config/db");
const {
  verifyToken,
  generateToken,
  generateRefreshToken,
} = require("./tokenUtils");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const [user] = await dbPromise.query(
      "SELECT id, username, email, password, role FROM users WHERE email = ?",
      [email]
    );

    if (!user?.[0]) {
      return res.status(404).json({ message: "User not found." });
    }

    const match = await bcrypt.compare(password, user[0].password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const accessToken = generateToken(user[0]);
    const refreshToken = await generateRefreshToken(user[0]); // DB 저장 포함

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({ token: accessToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed." });
  }
});

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "올바른 이메일 형식이 아닙니다." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "비밀번호는 최소 6자 이상이어야 합니다." });
  }

  try {
    const [users] = await dbPromise.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (users.length > 0) {
      return res.status(409).json({ message: "이미 사용 중인 이메일입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await dbPromise.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    res.status(201).json({
      message: "회원가입이 완료되었습니다!",
      userId: result.insertId,
    });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res
      .status(500)
      .json({ message: "서버 오류로 인해 회원가입에 실패했습니다." });
  }
});

router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required." });
  }

  try {
    const [storedToken] = await dbPromise.query(
      "SELECT * FROM refresh_tokens WHERE token = ?",
      [refreshToken]
    );

    if (!storedToken?.[0]) {
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = generateToken(decoded);

    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    console.error("Token refresh error:", err);
    res.status(401).json({ message: "Invalid or expired refresh token." });
  }
});

router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await dbPromise.query("DELETE FROM refresh_tokens WHERE token = ?", [
      refreshToken,
    ]);
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.status(200).json({ message: "Logged out successfully." });
});

router.get("/users", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only." });
  }

  try {
    const [users] = await dbPromise.query(
      "SELECT id, username, email, role FROM users"
    );
    res.status(200).json({ users });
  } catch (err) {
    console.error(`User fetch error: ${err.message}`);
    res.status(500).json({ message: "Error fetching users." });
  }
});

module.exports = router;
