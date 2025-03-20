import mysql from "mysql2/promise";

// MySQL 연결 설정
const pool = mysql.createPool({
  host: "52.78.234.62",
  user: "ssafy", // MySQL 계정
  password: "ssafy_1234", // MySQL 비밀번호
  database: "vehicle_security",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
