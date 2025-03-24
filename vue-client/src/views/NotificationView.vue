<script setup>
import { ref } from "vue";

const notificationsEnabled = ref(false);
const attackAlerts = ref([]);

// 라즈베리파이 Flask 서버 주소 (IP 확인 후 설정)
// const RPI_SERVER_URL = "http://192.168.110.131:5000/notify"; ❌ 직접 요청 X
const NODE_SERVER_NOTIFY_API = "http://localhost:8000/api/notify"; // ✅ Node 서버 경유


const toggleNotifications = () => {
  notificationsEnabled.value = !notificationsEnabled.value;
};

const socket = new WebSocket(import.meta.env.VITE_SOCKET_URL);

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("📡 WebSocket 수신 데이터:", data); // 🔍 확인용

  if (notificationsEnabled.value) {
    console.log("🔔 알림 기능 ON 상태");

    if (data.attack_type !== "normal") {
      console.log("🚨 공격 감지됨, LED 전송 시도 중...", data.attack_type);

      attackAlerts.value.unshift({
        type: data.attack_type,
        timestamp: data.timestamp,
      });

      // LED 점등 요청
      fetch(NODE_SERVER_NOTIFY_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attack_type: data.attack_type }),
      })

        .then((res) => res.json())
        .then((result) => console.log("✅ LED 상태:", result))
        .catch((error) => console.error("🚨 LED 알림 전송 실패:", error));
    }
  }
};

</script>


<template>
  <div>
    <h2>🔔 공격 알림 설정</h2>
    <button @click="toggleNotifications" :class="{ active: notificationsEnabled }">
      {{ notificationsEnabled ? "알림 끄기" : "알림 켜기" }}
    </button>

    <div v-if="attackAlerts.length > 0">
      <h3>📡 최근 공격 감지</h3>
      <ul>
        <li v-for="alert in attackAlerts" :key="alert.timestamp" :class="alert.type.toLowerCase()">
          🛑 {{ alert.timestamp }} - {{ alert.type }}
        </li>

      </ul>
    </div>
  </div>
</template>

<style scoped>
button {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

button.active {
  background-color: #dc3545;
}

ul {
  margin-top: 15px;
  list-style: none;
  padding: 0;
}

li {
  background: rgba(255, 0, 0, 0.1);
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 5px;
}

.flooding {
  background-color: rgba(255, 0, 0, 0.6);
  /* 빨강 */
  color: white;
}

.spoofing {
  background-color: rgba(117, 219, 250, 0.6);
  /* 파랑 */
  color: black;
}

.fuzzing {
  background-color: rgba(255, 255, 123, 0.6);
  /* 노랑 */
  color: black;
}
</style>
