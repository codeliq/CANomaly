import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import DashboardView from "@/views/DashboardView.vue";
import LogsView from "@/views/LogsView.vue";
import SettingsView from "@/views/SettingsView.vue";
import NotificationView from '../views/NotificationView.vue';

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView },
  { path: '/logs', name: 'Logs', component: LogsView },
  { path: '/settings', name: 'Settings', component: SettingsView },
  { path: '/notifications', name: 'Notifications', component: NotificationView },  // ✅ 추가
]


const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
