<script setup lang="ts">
import { ref } from "vue";
import { createUser } from "../api";

const emit = defineEmits<{
  (e: "created"): void;
}>();

const name = ref("");
const email = ref("");
const error = ref<string | null>(null);
const loading = ref(false);

const onSubmit = async (e: Event) => {
  e.preventDefault();
  error.value = null;

  if (!name.value.trim() || !email.value.trim()) {
    error.value = "Name and email are required.";
    return;
  }

  loading.value = true;
  try {
    await createUser(name.value.trim(), email.value.trim());
    name.value = "";
    email.value = "";
    emit("created");
  } catch (err: any) {
    error.value = err.message || "Failed to create user";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <section class="bg-white rounded-xl shadow p-4 mb-4">
    <h2 class="text-lg font-semibold mb-3">Create User</h2>
    <form @submit="onSubmit" class="flex flex-wrap gap-3 items-end">
      <label class="flex flex-col text-sm">
        <span class="mb-1 font-medium">Name</span>
        <input
          v-model="name"
          type="text"
          class="border rounded px-2 py-1 min-w-[180px] focus:outline-none focus:ring focus:ring-blue-300"
        />
      </label>

      <label class="flex flex-col text-sm">
        <span class="mb-1 font-medium">Email</span>
        <input
          v-model="email"
          type="email"
          class="border rounded px-2 py-1 min-w-[220px] focus:outline-none focus:ring focus:ring-blue-300"
        />
      </label>

      <button
        type="submit"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        :disabled="loading"
      >
        {{ loading ? "Creating..." : "Create" }}
      </button>
    </form>
    <p v-if="error" class="text-sm text-red-600 mt-2">
      {{ error }}
    </p>
  </section>
</template>
