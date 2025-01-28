const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;

// 액세스 토큰 검증 미들웨어
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access token is missing." });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err && err.name === "TokenExpiredError") {
      // 액세스 토큰이 만료되었을 경우
      const refreshToken = req.cookies?.refreshToken; // 쿠키에서 리프레시 토큰 가져오기
      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token is missing." });
      }

      try {
        const refreshDecoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const newAccessToken = generateToken(refreshDecoded); // 새 액세스 토큰 생성
        req.user = refreshDecoded; // 새 사용자 정보 저장
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
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// 리프레시 토큰 생성
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

module.exports = { verifyToken, generateToken, generateRefreshToken };
