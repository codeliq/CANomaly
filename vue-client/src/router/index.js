import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import DashboardView from "@/views/DashboardView.vue";
import LogsView from "@/views/LogsView.vue";
import SettingsView from "@/views/SettingsView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/dashboard", component: DashboardView },
  { path: "/logs", component: LogsView },
  { path: "/settings", component: SettingsView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
