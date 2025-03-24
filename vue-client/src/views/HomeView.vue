<<<<<<< HEAD
<template>
  <div class="home-container">
    <h1>🚗 CANomaly - 차량 보안 이벤트 모니터링 시스템</h1>
    <p>
      CANomaly는 차량 내부 네트워크(CAN)에서 발생하는 보안 이벤트를 실시간으로 감지하고 
      대시보드에서 시각화하여 보여주는 시스템입니다.
    </p>

    <div class="feature-grid">
      <div class="feature-card">
        <h3>🔍 실시간 공격 탐지</h3>
        <p>차량의 CAN 데이터를 분석하여 Flooding, Spoofing, Fuzzing과 같은 공격을 감지합니다.</p>
      </div>

      <div class="feature-card">
        <h3>📊 데이터 시각화</h3>
        <p>도넛 차트와 그래프를 이용하여 공격 빈도와 정상 데이터를 비교 분석할 수 있습니다.</p>
      </div>

      <div class="feature-card">
        <h3>⚙️ 설정 가능</h3>
        <p>WebSocket 서버 주소, 이상 탐지 민감도 등을 자유롭게 설정할 수 있습니다.</p>
      </div>
    </div>

    <div class="button-group">
      <router-link to="/dashboard" class="btn">📊 대시보드 보기</router-link>
      <router-link to="/logs" class="btn">📜 로그 확인</router-link>
      <router-link to="/settings" class="btn">⚙️ 설정</router-link>
=======
<script setup>
import { ref, onMounted, watch } from "vue";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  DoughnutController,
  ArcElement,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  DoughnutController,
  ArcElement
);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const socket = new WebSocket(SOCKET_URL);

const logs = ref([]); // 수신된 데이터 로그
const chartRef = ref(null); // 실시간 센서 데이터 차트
const attackChartRef = ref(null); // 공격 유형 도넛 차트
let chartInstance = null; // 센서 데이터 차트 인스턴스
let attackChartInstance = null; // 공격 유형 차트 인스턴스

const attackLogs = ref([]); // 🔥 검색된 공격 로그
const selectedAttackType = ref(""); // 🔍 선택된 공격 유형

// 공격 유형별 카운트 저장 (초기값 0)
const attackCounts = ref({
  Normal: 0,
  Flooding: 0,
  Spoofing: 0,
  Fuzzing: 0,
  Replay: 0,
});

// 실시간 센서 데이터 차트 초기화
function initializeChart() {
  if (chartRef.value) {
    chartInstance = new Chart(chartRef.value, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "센서 데이터",
            data: [],
            borderColor: "blue",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }
}

// 공격 유형 도넛 차트 초기화
function initializeAttackChart() {
  if (attackChartRef.value) {
    attackChartInstance = new Chart(attackChartRef.value, {
      type: "doughnut",
      data: {
        labels: ["Normal", "Flooding", "Spoofing", "Fuzzing", "Replay"],
        datasets: [
          {
            label: "공격 유형 발생 횟수",
            data: Object.values(attackCounts.value).map((v) => v), // 🔥 map() 적용
            backgroundColor: [
              "rgba(0, 255, 0, 0.6)", // Normal - 초록색
              "rgba(255, 0, 0, 0.6)", // Flooding - 빨간색
              "rgba(117, 219, 250, 0.6)", // Spoofing - 파란색
              "rgba(255, 255, 0, 0.6)", // Fuzzing - 노란색
              "rgba(153, 102, 255, 0.6)", // Replay - 보라색
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  } else {
    console.error("❌ attackChartRef가 null입니다. 차트 생성 실패!");
  }
}

// 센서 데이터 차트 업데이트
function updateChart(label, value) {
  if (chartInstance) {
    chartInstance.data.labels.push(label);
    chartInstance.data.datasets[0].data.push(value);

    if (chartInstance.data.labels.length > 10) {
      chartInstance.data.labels.shift();
      chartInstance.data.datasets[0].data.shift();
    }

    chartInstance.update();
  } else {
    console.error("❌ Chart.js 인스턴스가 존재하지 않음");
  }
}

// 공격 유형 도넛 차트 업데이트
function updateAttackChart() {
  if (attackChartInstance) {
    attackChartInstance.data.datasets[0].data = Object.values(attackCounts.value).map((v) => v);
    attackChartInstance.update();
  } else {
    console.error("❌ attackChartInstance가 존재하지 않음. 차트 업데이트 실패!");
  }
}

// WebSocket 연결
socket.onopen = () => {
  console.log("✅ WebSocket 연결됨");
};

// WebSocket 데이터 수신
socket.onmessage = async (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log("📡 수신된 데이터:", data);

    // ✅ 공격 유형 카운트 증가 (반응형 데이터 강제 적용)
    attackCounts.value[data.attack_type] = (attackCounts.value[data.attack_type] || 0) + 1;
    attackCounts.value = Object.assign({}, attackCounts.value); // Vue가 감지하도록 강제 적용

    // 도넛 차트 업데이트
    updateAttackChart();

    // 데이터 테이블 업데이트
    logs.value.unshift({
      timestamp: data.timestamp,
      arbitration_id: data.arbitration_id,
      control_field: data.control_field,
      data: data.data,
      attack_type: data.attack_type,
      attack_detected: data.attack_type !== "Normal",
    });

    if (logs.value.length > 10) logs.value.pop();

    // 첫 번째 데이터 값을 정수로 변환
    const sensorValue = parseInt(data.data.split(" ")[0], 16) || 0;

    updateChart(new Date(data.timestamp).toLocaleTimeString(), sensorValue);
  } catch (error) {
    console.error("🚨 WebSocket 데이터 처리 중 오류 발생:", error);
  }
};

//  공격 유형에 따라 CSS 클래스 반환하는 함수
function getAttackClass(attackType) {
  const type = attackType?.trim().toLowerCase(); // 🔥 공백 제거 및 소문자 변환
  return (
    {
      normal: "normal",
      flooding: "flooding",
      spoofing: "spoofing",
      fuzzing: "fuzzing",
      replay: "replay",
    }[type] || "normal"
  ); // 기본값 설정 (오류 방지)
}

// WebSocket 오류 핸들링
socket.onerror = (event) => {
  console.error("🚨 WebSocket 에러 발생:", event);
};

// WebSocket 종료
socket.onclose = () => {
  console.log("❌ WebSocket 연결 종료");
};

// Chart.js 초기화 (컴포넌트 로드 시 실행)
onMounted(() => {
  initializeChart();
  initializeAttackChart();
});

// 도넛 차트 자동 업데이트
watch(
  attackCounts,
  () => {
    if (attackChartInstance) {
      attackChartInstance.data.datasets[0].data = Object.values(attackCounts.value).map((v) => v);
      attackChartInstance.update();
    } else {
      console.error("❌ attackChartInstance가 존재하지 않음. 차트 업데이트 실패!");
    }
  },
  { deep: true }
);

async function searchAttackLogs() {
  try {
    let url = "http://localhost:8000/api/attack_logs";
    if (selectedAttackType.value) {
      url += `?attack_type=${selectedAttackType.value}`;
    }
    const response = await fetch(url);
    attackLogs.value = await response.json();
    console.log("✅ 검색된 공격 로그:", attackLogs.value);
  } catch (error) {
    console.error("🚨 공격 로그 검색 오류:", error);
  }
}
</script>

<template>
  <div>
    <h2>🚗 차량 보안 이벤트 모니터링</h2>

    <!-- 실시간 센서 데이터 차트 -->
    <div style="width: 100%; height: 300px">
      <canvas ref="chartRef"></canvas>
    </div>

    <!-- 공격 유형 도넛 차트 -->
    <div style="width: 50%; height: 300px; margin-top: 20px; margin-bottom: 100px">
      <h3>공격 유형 발생 비율</h3>
      <canvas ref="attackChartRef"></canvas>
    </div>

    <!-- 🔥 실시간 WebSocket 데이터 테이블 -->
    <h3>🟢 실시간 데이터 로그</h3>
    <table>
      <thead>
        <tr>
          <th>타임스탬프</th>
          <th>Arbitration ID</th>
          <th>Control</th>
          <th>Data</th>
          <th>공격 유형</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.timestamp" :class="getAttackClass(log.attack_type)">
          <td>{{ log.timestamp }}</td>
          <td>{{ log.arbitration_id }}</td>
          <td>{{ log.control_field }}</td>
          <td>{{ log.data }}</td>
          <td>{{ log.attack_type }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 🔍 검색 기능 추가 -->
    <div class="wrapper">
      <div>
        <label for="attackType">공격 유형 검색:</label>
        <select v-model="selectedAttackType">
          <option value="">전체</option>
          <option value="Flooding">Flooding</option>
          <option value="Spoofing">Spoofing</option>
          <option value="Fuzzing">Fuzzing</option>
          <option value="Normal">Normal</option>
        </select>
        <button @click="searchAttackLogs">검색</button>
      </div>

      <!-- 🔥 검색된 공격 로그 테이블 -->
      <h3>🔍 검색된 공격 로그</h3>
      <table>
        <thead>
          <tr>
            <th>타임스탬프</th>
            <th>공격 유형</th>
            <th>Arbitration ID</th>
            <th>Control</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in attackLogs" :key="log.id" :class="getAttackClass(log.attack_type)">
            <td>{{ log.timestamp }}</td>
            <td>{{ log.attack_type }}</td>
            <td>{{ log.arbitration_id }}</td>
            <td>{{ log.control_field }}</td>
            <td>{{ log.data }}</td>
          </tr>
        </tbody>
      </table>
>>>>>>> fa169f129417fdbd1784573ea6bb7f7d6b1f2bb6
    </div>
  </div>
</template>

<style scoped>
<<<<<<< HEAD
.home-container {
  text-align: center;
  padding: 40px;
  max-width: 800px;
  margin: auto;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 30px;
}

.feature-card {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.button-group {
  margin-top: 40px;
}

.btn {
  display: inline-block;
  padding: 12px 20px;
  margin: 5px;
  background: #007bff;
  color: white;
  border-radius: 5px;
  text-decoration: none;
  transition: 0.3s;
}

.btn:hover {
  background: #0056b3;
}
=======
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f4f4f4;
}

/* 🚨 공격 유형별 배경색 */
.flooding {
  background-color: rgba(255, 0, 0, 0.6); /* 붉은색 */
  color: white;
}

.spoofing {
  background-color: rgba(117, 219, 250, 0.6); /* 파란색 */
  color: black;
}

.fuzzing {
  background-color: rgba(255, 255, 123, 0.6); /* 노란색 */
  color: black;
}

/* 기본 정상 데이터 */
.normal {
  background-color: rgba(0, 255, 0, 0.3); /* 연한 녹색 */
  color: black;
}

.wrapper {
  margin-top: 30px;
}
>>>>>>> fa169f129417fdbd1784573ea6bb7f7d6b1f2bb6
</style>
