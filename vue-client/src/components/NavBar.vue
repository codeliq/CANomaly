<template>
  <nav class="navbar">
    <router-link to="/" class="logo">🚗 CANomaly</router-link>
    <div class="nav-links">
      <router-link to="/dashboard">📊 대시보드</router-link>
      <router-link to="/logs">📜 로그</router-link>
      <router-link to="/notifications">🔔 알림</router-link> <!-- ✅ 알림 메뉴 추가 -->
      <router-link to="/settings">⚙️ 설정</router-link>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  background: #007bff;
  padding: 15px;
  color: white;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.nav-links a {
  margin-left: 15px;
  color: white;
  text-decoration: none;
  font-size: 16px;
}

.nav-links a:hover {
  text-decoration: underline;
}
</style>
