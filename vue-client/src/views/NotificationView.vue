<script setup>
import { ref } from "vue";

const notificationsEnabled = ref(false);
const attackAlerts = ref([]);

// 라즈베리파이 Flask 서버 주소 (IP 확인 후 설정)
const RPI_SERVER_URL = "http://192.168.110.131:5000/notify";

const toggleNotifications = () => {
  notificationsEnabled.value = !notificationsEnabled.value;
};

const socket = new WebSocket(import.meta.env.VITE_SOCKET_URL);

socket.onmessage = (event) => {
  if (notificationsEnabled.value) {
    const data = JSON.parse(event.data);

    if (data.attack_type !== "normal") {
      attackAlerts.value.unshift({
        type: data.attack_type,
        timestamp: data.timestamp,
      });

      // 🔥 공격 유형에 따라 Flask 서버로 LED 점등 요청 보내기
      fetch(RPI_SERVER_URL, {
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
        <li v-for="alert in attackAlerts" :key="alert.timestamp">
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
</style>
