const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;

// 액세스 토큰 검증 미들웨어
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Token is required." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        // 액세스 토큰이 만료되었으면 리프레시 토큰을 사용하여 새 액세스 토큰 발급
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
          return res
            .status(401)
            .json({ message: "Refresh token is required." });
        }

        // 리프레시 토큰 검증
        jwt.verify(
          refreshToken,
          JWT_REFRESH_SECRET,
          (refreshErr, refreshDecoded) => {
            if (refreshErr) {
              return res
                .status(401)
                .json({ message: "Invalid refresh token." });
            }

            const newAccessToken = generateToken({ id: refreshDecoded.id });
            req.user = refreshDecoded;
            res.setHeader("Authorization", `Bearer ${newAccessToken}`);
            return next();
          }
        );
      } else {
        return res.status(403).json({ message: "Authentication failed." });
      }
    } else {
      req.user = decoded;
      next();
    }
  });
};

// 액세스 토큰 생성
const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
};

// 리프레시 토큰 생성
const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return refreshToken;
};

module.exports = {
  verifyToken,
  generateToken,
  generateRefreshToken,
};
