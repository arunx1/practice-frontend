<script setup lang="ts">
import { ref, watch } from "vue";
import type { User } from "../api";
import { updateUser, deleteUser, getUser } from "../api";

const props = defineProps<{
  users: User[];
  loading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  (e: "reload"): void;
}>();

// local editable copies keyed by id
const edited = ref<Record<number, { name: string; email: string }>>({});

watch(
  () => props.users,
  (users) => {
    const map: Record<number, { name: string; email: string }> = {};
    for (const u of users) {
      map[u.id] = { name: u.name, email: u.email };
    }
    edited.value = map;
  },
  { immediate: true }
);

const onSave = async (u: User) => {
  const state = edited.value[u.id];
  if (!state) return;
  try {
    await updateUser(u.id, {
      name: state.name,
      email: state.email,
    });
    emit("reload");
  } catch (e: any) {
    alert(`Update failed: ${e.message || e}`);
  }
};

const onDelete = async (u: User) => {
  if (!confirm(`Delete user ${u.id}?`)) return;
  try {
    await deleteUser(u.id);
    emit("reload");
  } catch (e: any) {
    alert(`Delete failed: ${e.message || e}`);
  }
};

const onRefreshRow = async (u: User) => {
  try {
    await getUser(u.id); // warms cache + ensures source/hostname set
    emit("reload");
  } catch (e: any) {
    alert(`Refresh failed: ${e.message || e}`);
  }
};
</script>

<template>
  <section class="bg-white rounded-xl shadow p-4">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-lg font-semibold">Users</h2>
      <button
        class="bg-slate-100 hover:bg-slate-200 border px-3 py-1 rounded text-sm"
        @click="$emit('reload')"
        :disabled="loading"
      >
        {{ loading ? "Loading..." : "Reload" }}
      </button>
    </div>

    <p v-if="error" class="text-sm text-red-600 mb-2">
      Failed to load users: {{ error }}
    </p>

    <p v-if="!loading && !error && users.length === 0" class="text-sm">
      No users yet. Create one above.
    </p>

    <div v-if="users.length > 0" class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="border-b bg-slate-50">
            <th class="px-2 py-1 text-left">ID</th>
            <th class="px-2 py-1 text-left">Name</th>
            <th class="px-2 py-1 text-left">Email</th>
            <th class="px-2 py-1 text-left">Source</th>
            <th class="px-2 py-1 text-left">Hostname</th>
            <th class="px-2 py-1 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="u in users"
            :key="u.id"
            class="border-b last:border-0 hover:bg-slate-50"
          >
            <td class="px-2 py-1 align-top">
              {{ u.id }}
            </td>
            <td class="px-2 py-1 align-top">
              <input
              v-model="edited[u.id]!.name"
              type="text"
              class="border rounded px-2 py-1 w-full focus:outline-none focus:ring focus:ring-blue-300"/>
            </td>
            <td class="px-2 py-1 align-top">
              <input
                v-model="edited[u.id]!.email"
                type="email"
                class="border rounded px-2 py-1 w-full focus:outline-none focus:ring focus:ring-blue-300"
              />
            </td>
            <td class="px-2 py-1 align-top">
              {{ u.source ?? "-" }}
            </td>
            <td class="px-2 py-1 align-top">
              {{ u.hostname ?? "-" }}
            </td>
            <td class="px-2 py-1 align-top space-x-1">
              <button
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                @click="onSave(u)"
              >
                Save
              </button>
              <button
                class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                @click="onDelete(u)"
              >
                Delete
              </button>
              <button
                class="bg-slate-200 hover:bg-slate-300 text-slate-900 px-3 py-1 rounded"
                @click="onRefreshRow(u)"
              >
                Refresh
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
