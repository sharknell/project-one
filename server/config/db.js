const mysql = require("mysql2/promise");

// 데이터베이스 연결 풀 생성
const dbPromise = mysql.createPool({
  host: process.env.DB_HOST, // 데이터베이스 호스트
  user: process.env.DB_USER, // 데이터베이스 사용자명
  password: process.env.DB_PASSWORD, // 데이터베이스 비밀번호
  database: process.env.DB_NAME, // 데이터베이스 이름
  waitForConnections: true, // 연결이 필요할 때까지 대기
});

module.exports = { dbPromise };
