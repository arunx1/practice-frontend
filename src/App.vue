<script setup lang="ts">
import { onMounted, ref } from "vue";
import { listUsers, type User } from "./api";
import CreateUserForm from "./components/CreateUserForm.vue";
import UserTable from "./components/UserTable.vue";

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const loadUsers = async () => {
  loading.value = true;
  error.value = null;
  try {
    users.value = await listUsers();
  } catch (e: any) {
    error.value = e.message || "Failed to load users";
  } finally {
    loading.value = false;
  }
};

onMounted(loadUsers);
</script>

<template>
  <div class="min-h-screen flex justify-center items-start pt-10">
    <div class="w-full max-w-5xl mx-4">
      <header class="mb-4">
        <h1 class="text-2xl font-bold">
          User Management Portal
          <span class="text-sm font-normal text-slate-500">
            &nbsp;| Vue 3 + Tailwind
          </span>
        </h1>
        <p class="text-sm text-slate-600">
          Backed by FastAPI + Spring Boot + Postgres + Redis on MicroK8s.
        </p>
      </header>

      <CreateUserForm @created="loadUsers" />
      <UserTable
        :users="users"
        :loading="loading"
        :error="error"
        @reload="loadUsers"
      />
    </div>
  </div>
</template>
