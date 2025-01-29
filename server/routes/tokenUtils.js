const jwt = require("jsonwebtoken");
const { dbPromise } = require("../config/db"); // DB 연결 추가
const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;

// 액세스 토큰 검증 미들웨어
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token is missing." });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err && err.name === "TokenExpiredError") {
      // 액세스 토큰 만료 시 리프레시 토큰 검사
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token is missing." });
      }

      try {
        const [storedToken] = await dbPromise.query(
          "SELECT * FROM refresh_tokens WHERE token = ?",
          [refreshToken]
        );

        if (!storedToken?.[0]) {
          return res.status(401).json({ message: "Invalid refresh token." });
        }

        const refreshDecoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const newAccessToken = generateToken(refreshDecoded);
        req.user = refreshDecoded;

        res.setHeader("Authorization", `Bearer ${newAccessToken}`);
        return next();
      } catch (refreshErr) {
        console.error("Refresh token error:", refreshErr.message);
        return res
          .status(401)
          .json({ message: "Invalid or expired refresh token." });
      }
    } else if (err) {
      return res.status(403).json({ message: "Authentication failed." });
    } else {
      req.user = decoded;
      next();
    }
  });
};

// 액세스 토큰 생성
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, iat: Date.now() },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// 리프레시 토큰 생성 (DB 저장 추가)
const generateRefreshToken = async (user) => {
  const refreshToken = jwt.sign(
    { id: user.id, username: user.username, role: user.role, iat: Date.now() },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await dbPromise.query(
    "INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)",
    [user.id, refreshToken]
  );

  return refreshToken;
};

module.exports = { verifyToken, generateToken, generateRefreshToken };
