<template>
    <div class="settings-container">
      <h2>⚙️ 시스템 설정</h2>
  
      <div class="setting-group">
        <label for="server-url">🔗 WebSocket 서버 주소</label>
        <input v-model="serverUrl" type="text" id="server-url" placeholder="ws://localhost:9000" />
      </div>
  
      <div class="setting-group">
        <label for="update-interval">⏳ 차트 업데이트 주기 (초)</label>
        <input v-model="updateInterval" type="number" id="update-interval" min="1" max="10" />
      </div>
  
      <div class="setting-group">
        <label for="detection-sensitivity">🔍 이상 탐지 민감도</label>
        <select v-model="detectionSensitivity" id="detection-sensitivity">
          <option value="low">낮음</option>
          <option value="medium">보통</option>
          <option value="high">높음</option>
        </select>
      </div>
  
      <div class="button-group">
        <button @click="saveSettings">💾 설정 저장</button>
        <button class="reset-btn" @click="resetSettings">🔄 초기화</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  
  // ✅ 설정 변수
  const serverUrl = ref(localStorage.getItem("serverUrl") || "ws://localhost:9000");
  const updateInterval = ref(localStorage.getItem("updateInterval") || 5);
  const detectionSensitivity = ref(localStorage.getItem("detectionSensitivity") || "medium");
  
  // ✅ 설정 저장 함수
  function saveSettings() {
    localStorage.setItem("serverUrl", serverUrl.value);
    localStorage.setItem("updateInterval", updateInterval.value);
    localStorage.setItem("detectionSensitivity", detectionSensitivity.value);
    alert("✅ 설정이 저장되었습니다!");
  }
  
  // ✅ 설정 초기화 함수
  function resetSettings() {
    serverUrl.value = "ws://localhost:9000";
    updateInterval.value = 5;
    detectionSensitivity.value = "medium";
    localStorage.removeItem("serverUrl");
    localStorage.removeItem("updateInterval");
    localStorage.removeItem("detectionSensitivity");
    alert("🔄 설정이 초기화되었습니다!");
  }
  </script>
  
  <style scoped>
  .settings-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .setting-group {
    margin-bottom: 20px;
  }
  
  label {
    font-weight: bold;
    display: block;
    margin-bottom: 5px;
  }
  
  input, select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .button-group {
    display: flex;
    gap: 10px;
  }
  
  button {
    flex: 1;
    padding: 10px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .reset-btn {
    background: #dc3545;
  }
  </style>
  