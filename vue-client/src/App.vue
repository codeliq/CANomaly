<script setup>
<<<<<<< HEAD
import { RouterView } from "vue-router";
import NavBar from "@/components/NavBar.vue"; // ✅ 네비게이션 바 컴포넌트 추가
import "@/assets/global.css";
</script>

<template>
  <div class="app-container">
    <NavBar />
    <div class="content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content {
  flex-grow: 1;
  padding: 20px;
  background: #f4f4f4;
}
</style>
=======
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <header>
    <nav>
      <ul>
        <li>
          <RouterLink to="/">Home</RouterLink>
        </li>
      </ul>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
</style>
>>>>>>> fa169f129417fdbd1784573ea6bb7f7d6b1f2bb6
