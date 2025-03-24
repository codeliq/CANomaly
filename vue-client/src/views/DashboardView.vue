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

// ✅ 전체 데이터 개수 추적 변수
const totalDataCount = ref(0); // 수신된 전체 데이터 개수

// 공격 유형별 카운트 저장 (초기값 0)
const attackCounts = ref({
  normal: 0,
  flooding: 0,
  spoofing: 0,
  fuzzing: 0,
});

// 실시간 공격 빈도 비율 차트 초기화
function initializeChart() {
  if (chartRef.value) {
    chartInstance = new Chart(chartRef.value, {
      type: "line",
      data: {
        labels: [], // 시간 (timestamp) 라벨
        datasets: [
          {
            label: "공격 빈도 비율 (%)", // ✅ Y축 값: 공격 빈도 비율
            data: [],
            borderColor: "blue",
            borderWidth: 2,
            pointRadius: 5, // 데이터 포인트 크기
            pointBackgroundColor: "red", // 포인트 색상
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "시간 (Timestamp)", // ✅ X축 라벨 추가
            },
          },
          y: {
            title: {
              display: true,
              text: "공격 빈도 비율 (%)", // ✅ Y축 설명 변경
            },
            beginAtZero: true,
            max: 100, // 퍼센트 값이므로 최대 100%
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top", // ✅ 범례 추가
          },
        },
      },
    });
  }
}


// ✅ 도넛 차트 초기화 (Normal 데이터 포함)
function initializeAttackChart() {
  if (attackChartRef.value) {
    attackChartInstance = new Chart(attackChartRef.value, {
      type: "doughnut",
      data: {
        labels: ["Flooding", "Spoofing", "Fuzzing", "Normal"], // ✅ Normal 추가
        datasets: [
          {
            label: "공격 유형 발생 횟수",
            data: [0, 0, 0, 0], // ✅ 초기값 설정 (Normal 포함)
            backgroundColor: [
              "rgba(255, 0, 0, 0.6)",  // Flooding - 빨간색
              "rgba(117, 219, 250, 0.6)",  // Spoofing - 파란색
              "rgba(255, 255, 0, 0.6)",  // Fuzzing - 노란색
              "rgba(0, 255, 0, 0.6)",  // Normal - 초록색
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


function updateChart(label) {
  if (chartInstance) {
    if (totalDataCount.value === 0) {
      console.warn("🚨 totalDataCount가 0이므로 차트 업데이트 중지");
      return;
    }

    // ✅ 공격 데이터 개수 계산 (소문자로 변환 후 처리)
    const attackCount =
      (attackCounts.value.flooding || 0) +
      (attackCounts.value.spoofing || 0) +
      (attackCounts.value.fuzzing || 0);

    // ✅ 전체 데이터 대비 공격 비율 (%) 계산
    const attackRatio = totalDataCount.value > 0 ? (attackCount / totalDataCount.value) * 100 : 0;

    console.log(`📊 총 데이터 개수: ${totalDataCount.value}`);
    console.log(`📊 공격 데이터 개수: ${JSON.stringify(attackCounts.value)}`);
    console.log(`📊 공격 비율 업데이트: ${attackRatio.toFixed(2)}%`);

    chartInstance.data.labels.push(label);
    chartInstance.data.datasets[0].data.push(attackRatio.toFixed(2)); // 소수점 2자리까지 표시

    if (chartInstance.data.labels.length > 10) {
      chartInstance.data.labels.shift();
      chartInstance.data.datasets[0].data.shift();
    }

    chartInstance.update();
  } else {
    console.error("❌ Chart.js 인스턴스가 존재하지 않음");
  }
}



// ✅ 도넛 차트 업데이트 (Normal 포함)
function updateAttackChart() {
  if (attackChartInstance) {
    attackChartInstance.data.datasets[0].data = [
      attackCounts.value.flooding || 0, // Flooding
      attackCounts.value.spoofing || 0, // Spoofing
      attackCounts.value.fuzzing || 0,  // Fuzzing
      attackCounts.value.normal || 0,   // Normal ✅ 포함!
    ];
    attackChartInstance.update();
  } else {
    console.error("❌ attackChartInstance가 존재하지 않음. 차트 업데이트 실패!");
  }
}
// ✅ WebSocket 데이터 수신
socket.onmessage = async (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log("📡 수신된 데이터:", data);

    // ✅ `attack_type`을 소문자로 변환
    const normalizedAttackType = data.attack_type ? data.attack_type.toLowerCase() : "normal";

    if (normalizedAttackType === "replay") {
      console.warn("❌ Replay 공격 감지됨, 무시함.");
      return;
    }

    // ✅ 전체 데이터 개수 증가
    totalDataCount.value++;

    // ✅ Vue 반응형 감지를 강제 적용하여 정상 데이터도 증가하도록 처리
    attackCounts.value = Object.assign({}, attackCounts.value, {
      flooding: attackCounts.value.flooding || 0,
      spoofing: attackCounts.value.spoofing || 0,
      fuzzing: attackCounts.value.fuzzing || 0,
      normal: attackCounts.value.normal || 0, // ✅ Normal 포함
    });

    // ✅ 해당 유형 카운트 증가
    attackCounts.value[normalizedAttackType]++;

    // ✅ 공격 비율 업데이트
    updateChart(new Date(data.timestamp).toLocaleTimeString());

    // ✅ 도넛 차트 업데이트
    updateAttackChart();

    // ✅ 데이터 테이블 업데이트
    logs.value.unshift({
      timestamp: data.timestamp,
      arbitration_id: data.arbitration_id,
      control_field: data.control_field,
      data: data.data,
      attack_type: normalizedAttackType,
      attack_detected: normalizedAttackType !== "normal",
    });

    if (logs.value.length > 10) logs.value.pop();
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

// ✅ 도넛 차트 & 공격 빈도 비율 차트 자동 업데이트
watch(
  attackCounts,
  () => {
    if (attackChartInstance) {
      // ✅ 도넛 차트 업데이트 (Normal 포함)
      attackChartInstance.data.datasets[0].data = [
        attackCounts.value.flooding || 0,
        attackCounts.value.spoofing || 0,
        attackCounts.value.fuzzing || 0,
        attackCounts.value.normal || 0, // ✅ Normal 추가
      ];
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
      <h2>📊 차량 보안 이벤트 모니터링 대시보드</h2>
  
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
    </div>

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
    </div>
</template>
  

<style scoped>
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
</style>
