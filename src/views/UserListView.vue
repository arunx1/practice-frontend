<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { listUsers, deleteUser, type User } from "../api";
import CreateUserForm from "../components/CreateUserForm.vue";

const router = useRouter();

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const searchTerm = ref("");
const pageSize = ref(10);
const currentPage = ref(1);

const pageSizeOptions = [5, 10, 25, 50];

// Load users from API
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

// Derived data: search + pagination

const filteredUsers = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  if (!term) return users.value;
  return users.value.filter((u) => {
    const name = u.name?.toLowerCase() ?? "";
    const email = (u.email as string | undefined)?.toLowerCase() ?? "";
    return name.includes(term) || email.includes(term);
  });
});

const totalPages = computed(() => {
  if (filteredUsers.value.length === 0) return 1;
  return Math.ceil(filteredUsers.value.length / pageSize.value);
});

const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredUsers.value.slice(start, end);
});

// Reset to page 1 when search or page size changes
watch([searchTerm, pageSize], () => {
  currentPage.value = 1;
});

// Actions

const goToDetail = (id: number) => {
  router.push({ name: "user-detail", params: { id } });
};

const onDelete = async (u: User) => {
  if (!confirm(`Delete user ${u.id}?`)) return;
  try {
    await deleteUser(u.id);
    await loadUsers();
  } catch (e: any) {
    alert(`Delete failed: ${e.message || e}`);
  }
};

const goPrev = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const goNext = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
</script>

<template>
  <div class="space-y-4">
    <!-- Create section -->
    <CreateUserForm @created="loadUsers" />

    <!-- List section -->
    <section class="bg-white rounded-xl shadow p-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-slate-700">Search:</label>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Filter by name or email..."
            class="border rounded px-2 py-1 text-sm min-w-[200px] focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div class="flex items-center gap-2 text-sm">
          <span class="text-slate-600">Rows per page:</span>
          <select
            v-model.number="pageSize"
            class="border rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600 mb-2">
        Failed to load users: {{ error }}
      </p>

      <p v-if="!loading && !error && filteredUsers.length === 0" class="text-sm">
        No users found.
      </p>

      <div v-if="filteredUsers.length > 0" class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="border-b bg-slate-50">
              <th class="px-2 py-1 text-left w-20">ID</th>
              <th class="px-2 py-1 text-left">Name</th>
              <th class="px-2 py-1 text-left w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="u in pagedUsers"
              :key="u.id"
              class="border-b last:border-0 hover:bg-slate-50"
            >
              <td class="px-2 py-1">
                {{ u.id }}
              </td>
              <td class="px-2 py-1">
                {{ u.name }}
              </td>
              <td class="px-2 py-1 space-x-2">
                <button
                  class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  @click="goToDetail(u.id)"
                >
                  View
                </button>
                <button
                  class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  @click="onDelete(u)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination controls -->
      <div class="flex items-center justify-between mt-3 text-sm">
        <div class="text-slate-600">
          Page {{ currentPage }} of {{ totalPages }}
          <span v-if="filteredUsers.length">
            &nbsp;•&nbsp; Total {{ filteredUsers.length }} record(s)
          </span>
        </div>
        <div class="space-x-2">
          <button
            class="px-3 py-1 rounded border bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
            :disabled="currentPage <= 1"
            @click="goPrev"
          >
            Prev
          </button>
          <button
            class="px-3 py-1 rounded border bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
            :disabled="currentPage >= totalPages"
            @click="goNext"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
