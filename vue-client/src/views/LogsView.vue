<script setup>
import { ref, onMounted } from "vue";

const logs = ref([]);
const isLoading = ref(false); // 🚀 로딩 상태 추가

// 🚀 모든 공격 로그 불러오기
async function fetchAllLogs() {
  try {
    isLoading.value = true; // 로딩 시작
    const response = await fetch("http://localhost:8000/api/all_attack_logs");
    logs.value = await response.json();
  } catch (error) {
    console.error("🚨 공격 로그 불러오기 오류:", error);
  } finally {
    isLoading.value = false; // 로딩 종료
  }
}

onMounted(() => {
  fetchAllLogs();
});
</script>

<template>
  <div class="log-container">
    <h2>📜 전체 공격 로그</h2>

    <!-- 🔄 새로고침 버튼 -->
    <button class="refresh-button" @click="fetchAllLogs">
      🔄 새로고침
    </button>

    <!-- 🕛 로딩 표시 -->
    <p v-if="isLoading">⏳ 로그를 불러오는 중...</p>

    <!-- 📝 공격 로그 테이블 -->
    <table class="log-table">
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
        <tr v-for="log in logs" :key="log.id">
          <td>{{ log.timestamp }}</td>
          <td :class="log.attack_type">{{ log.attack_type }}</td>
          <td>{{ log.arbitration_id }}</td>
          <td>{{ log.control_field }}</td>
          <td>{{ log.data }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* ✅ 전체 컨테이너 */
.log-container {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

/* ✅ 테이블 스타일 */
.log-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.log-table th,
.log-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.log-table th {
  background-color: #007bff;
  color: white;
  font-weight: bold;
}

/* ✅ 공격 유형별 배경색 */
.flooding {
  background-color: rgba(255, 0, 0, 0.6);
  color: white;
}

.spoofing {
  background-color: rgba(117, 219, 250, 0.6);
  color: black;
}

.fuzzing {
  background-color: rgba(255, 255, 123, 0.6);
  color: black;
}

.normal {
  background-color: rgba(0, 255, 0, 0.3);
  color: black;
}

/* ✅ 새로고침 버튼 스타일 */
.refresh-button {
  padding: 8px 16px;
  font-size: 16px;
  background-color: #202020;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 10px;
  transition: 0.3s;
}

.refresh-button:hover {
  background-color: #007bff;
}
</style>
