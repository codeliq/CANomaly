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
    </div>
  </div>
</template>

<style scoped>
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
</style>
