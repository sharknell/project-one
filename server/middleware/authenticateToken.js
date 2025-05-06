const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(403).json({ message: "토큰이 없습니다." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // 비밀 키로 토큰 디코딩
    console.log("Authenticated User:", decoded); // 디코딩된 토큰 정보 로그 출력
    req.user = decoded; // 디코딩한 값을 req.user에 저장
    next(); // 다음 미들웨어로 진행
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = { authenticateUser };
