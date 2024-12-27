const mysql = require("mysql2/promise");

// 데이터베이스 연결 설정
const dbConfig = {
  host: "localhost",       // DB 호스트
  user: "root",            // MySQL 사용자
  password: "th1213mmom",  // MySQL 비밀번호
  database: "perfume_shop" // 사용할 데이터베이스
};

// 데이터베이스 풀 생성
const dbPromise = mysql.createPool(dbConfig);

// 내보내기
module.exports = { dbPromise };
