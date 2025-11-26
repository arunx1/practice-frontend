// src/router.ts
import { createRouter, createWebHistory } from "vue-router";
import UserListView from "./views/UserListView.vue";
import UserDetailView from "./views/UserDetailView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "users",
      component: UserListView,
    },
    {
      path: "/user/:id",
      name: "user-detail",
      component: UserDetailView,
      props: true,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

export default router;
