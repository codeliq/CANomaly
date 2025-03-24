import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import net from "net";
import pool from "./db/db.js"; // MySQL 연결
import cors from "cors";
<<<<<<< HEAD
import mysql from "mysql2/promise"; // ✅ MySQL 연결을 위한 promise 지원 모듈
=======
>>>>>>> fa169f129417fdbd1784573ea6bb7f7d6b1f2bb6

const app = express();
const WEB_PORT = 8000;
const TCP_PORT = 9000;

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let tcpClients = [];
let wsClients = [];

<<<<<<< HEAD
// ✅ CORS 및 JSON 파싱 미들웨어 설정
app.use(cors());
app.use(express.json());

=======
>>>>>>> fa169f129417fdbd1784573ea6bb7f7d6b1f2bb6
// 🚀 서버 시작 시 테이블 초기화
async function resetDatabase() {
  try {
    console.log("🔄 데이터베이스 초기화 중...");
    await pool.execute("DELETE FROM vehicle_data");
    await pool.execute("DELETE FROM attack_logs");
    console.log("✅ 데이터베이스 초기화 완료 (기존 데이터 삭제됨)");
  } catch (error) {
    console.error("🚨 데이터베이스 초기화 오류:", error);
  }
}

// 🚗 TCP 서버 (차량 연결)
const tcpServer = net.createServer((socket) => {
  console.log("🚗 차량(TCP) 연결됨");
  tcpClients.push(socket);

  socket.on("data", async (data) => {
    const packet = JSON.parse(data.toString());
    console.log("📡 수신된 CAN 패킷:", packet);

    // 데이터 MySQL에 저장
    try {
      await pool.execute(
        "INSERT INTO vehicle_data (arbitration_id, control_field, data) VALUES (?, ?, ?)",
        [packet.arbitration_id, packet.control_field, packet.data]
      );

      if (packet.attack_type !== "Normal") {
        await pool.execute(
          "INSERT INTO attack_logs (attack_type, arbitration_id, control_field, data) VALUES (?, ?, ?, ?)",
          [packet.attack_type, packet.arbitration_id, packet.control_field, packet.data]
        );
      }
    } catch (error) {
      console.error("🚨 MySQL 데이터 저장 오류:", error);
    }

    // WebSocket으로 대시보드에 전송
    wsClients.forEach((client) => client.send(JSON.stringify(packet)));
  });

  socket.on("end", () => {
    console.log("🚗 차량 연결 종료");
    tcpClients = tcpClients.filter(client => client !== socket);
  });
});

// 🖥 WebSocket 서버 (대시보드 연결)
wss.on("connection", (ws) => {
  console.log("🖥 대시보드 연결됨");
  wsClients.push(ws);

  ws.on("close", () => {
    console.log("🖥 대시보드 연결 종료");
    wsClients = wsClients.filter(client => client !== ws);
  });
});

<<<<<<< HEAD
// 🔍 모든 공격 로그 조회 API (페이징 추가 가능)
app.get("/api/all_attack_logs", async (req, res) => {
  try {
    let sql = "SELECT * FROM attack_logs ORDER BY timestamp DESC";
    const [rows] = await pool.execute(sql);
    res.json(rows);
  } catch (error) {
    console.error("🚨 공격 로그 전체 조회 오류:", error);
    res.status(500).send("서버 오류 발생");
  }
});

app.post("/api/notify", async (req, res) => {
  try {
    const { attack_type } = req.body;
    if (!attack_type) return res.status(400).send("공격 유형 필요");

    const piServerUrl = "http://192.168.110.131:5000/notify"; // 라즈베리파이 서버 URL
    await fetch(piServerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attack_type }),
    });

    console.log(`🔔 라즈베리파이에 ${attack_type} 알림 전송됨`);
    res.send("알림 전송 완료");
  } catch (error) {
    console.error("🚨 라즈베리파이 알림 전송 실패:", error);
=======
app.use(cors());

// 공격 로그 조회 API
app.get("/api/attack_logs", async (req, res) => {
  try {
    const attackType = req.query.attack_type;
    let sql = "SELECT * FROM attack_logs ORDER BY timestamp DESC LIMIT 20";
    let params = [];

    if (attackType) {
      sql = "SELECT * FROM attack_logs WHERE attack_type = ? ORDER BY timestamp DESC LIMIT 20";
      params = [attackType];
    }

    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("🚨 공격 로그 검색 오류:", error);
>>>>>>> fa169f129417fdbd1784573ea6bb7f7d6b1f2bb6
    res.status(500).send("서버 오류 발생");
  }
});


// 🚀 서버 실행 (데이터 초기화 후 시작)
resetDatabase().then(() => {
  tcpServer.listen(TCP_PORT, () => console.log(`🚗 TCP 서버 실행 중 (포트: ${TCP_PORT})`));
  server.listen(WEB_PORT, () => console.log(`🖥 WebSocket 서버 실행 중 (포트: ${WEB_PORT})`));
});