<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getUser, updateUser, type User } from "../api";

const route = useRoute();
const router = useRouter();

const id = Number(route.params.id);

const user = ref<User | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

type FieldKey = "name" | "email"; // add more later as API grows

const editing = ref<Record<FieldKey, boolean>>({
  name: false,
  email: false,
});

const pendingValues = ref<Partial<Record<FieldKey, string>>>({});
const pendingFlags = ref<Record<FieldKey, boolean>>({
  name: false,
  email: false,
});

const tempEditValue = ref<string>(""); // holds current input while editing
const currentField = ref<FieldKey | null>(null);

const hasPendingChanges = computed(() =>
  Object.values(pendingFlags.value).some((v) => v)
);

const loadUser = async () => {
  loading.value = true;
  error.value = null;
  try {
    user.value = await getUser(id);
  } catch (e: any) {
    error.value = e.message || "Failed to load user";
  } finally {
    loading.value = false;
  }
};

onMounted(loadUser);

// Helpers to show current value (prefer pending value if any)
const fieldValue = (field: FieldKey): string => {
  if (!user.value) return "";
  return pendingValues.value[field] ?? (user.value[field] as string);
};

const startEdit = (field: FieldKey) => {
  if (!user.value) return;
  currentField.value = field;
  editing.value[field] = true;
  tempEditValue.value = fieldValue(field);
};

const cancelEdit = () => {
  if (!currentField.value) return;
  editing.value[currentField.value] = false;
  tempEditValue.value = "";
  currentField.value = null;
};

const saveLocalEdit = () => {
  if (!currentField.value) return;
  const field = currentField.value;
  pendingValues.value[field] = tempEditValue.value;
  pendingFlags.value[field] = true;
  editing.value[field] = false;
  tempEditValue.value = "";
  currentField.value = null;
};

// Submit all pending changes to backend
const submitting = ref(false);
const submitChanges = async () => {
  if (!user.value) return;
  const payload: Partial<User> = {};

  (["name", "email"] as FieldKey[]).forEach((field) => {
    if (pendingFlags.value[field] && pendingValues.value[field] != null) {
      payload[field] = pendingValues.value[field] as any;
    }
  });

  if (Object.keys(payload).length === 0) {
    alert("No pending changes to submit.");
    return;
  }

  submitting.value = true;
  try {
    const updated = await updateUser(user.value.id, {
      name: payload.name,
      email: payload.email,
    });
    user.value = updated;
    // Clear pending state
    pendingValues.value = {};
    pendingFlags.value = { name: false, email: false };
    alert("Changes saved successfully.");
  } catch (e: any) {
    alert(`Failed to save changes: ${e.message || e}`);
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  router.push({ name: "users" });
};
</script>

<template>
  <section class="bg-white rounded-xl shadow p-4 space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">User Details</h2>
      <button
        class="text-sm px-3 py-1 rounded border bg-slate-100 hover:bg-slate-200"
        @click="goBack"
      >
        ← Back to list
      </button>
    </div>

    <p v-if="loading" class="text-sm text-slate-600">Loading user...</p>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div v-if="user" class="space-y-3">
      <!-- ID (not editable) -->
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs text-slate-500 uppercase">ID</div>
          <div class="font-mono">{{ user.id }}</div>
        </div>
      </div>

      <!-- Name -->
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs text-slate-500 uppercase">Name</div>

          <!-- Display mode -->
          <div v-if="!editing.name" class="flex items-center gap-2">
            <span>{{ fieldValue("name") }}</span>

            <button
              class="text-xs text-blue-600 hover:text-blue-800"
              @click="startEdit('name')"
              title="Edit name"
            >
              ✏️
            </button>

            <span
              v-if="pendingFlags.name"
              class="inline-flex items-center gap-1 text-xs text-amber-600"
              title="Pending save. Click submit once all edits are done."
            >
              ⚠️ Pending
            </span>
          </div>

          <!-- Edit mode -->
          <div v-else class="flex items-center gap-2">
            <input
              v-model="tempEditValue"
              type="text"
              class="border rounded px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-blue-300"
            />
            <button
              class="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              @click="saveLocalEdit"
              title="Save locally (pending)"
            >
              💾 Save
            </button>
            <button
              class="text-xs px-2 py-1 rounded bg-slate-200 hover:bg-slate-300"
              @click="cancelEdit"
              title="Cancel"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Email -->
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs text-slate-500 uppercase">Email</div>

          <!-- Display mode -->
          <div v-if="!editing.email" class="flex items-center gap-2">
            <span>{{ fieldValue("email") }}</span>

            <button
              class="text-xs text-blue-600 hover:text-blue-800"
              @click="startEdit('email')"
              title="Edit email"
            >
              ✏️
            </button>

            <span
              v-if="pendingFlags.email"
              class="inline-flex items-center gap-1 text-xs text-amber-600"
              title="Pending save. Click submit once all edits are done."
            >
              ⚠️ Pending
            </span>
          </div>

          <!-- Edit mode -->
          <div v-else class="flex items-center gap-2">
            <input
              v-model="tempEditValue"
              type="email"
              class="border rounded px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-blue-300"
            />
            <button
              class="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              @click="saveLocalEdit"
              title="Save locally (pending)"
            >
              💾 Save
            </button>
            <button
              class="text-xs px-2 py-1 rounded bg-slate-200 hover:bg-slate-300"
              @click="cancelEdit"
              title="Cancel"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Meta: source / hostname -->
      <div class="flex gap-6 text-xs text-slate-500">
        <div v-if="user.source">
          <span class="font-semibold">Source:</span> {{ user.source }}
        </div>
        <div v-if="user.hostname">
          <span class="font-semibold">Hostname:</span> {{ user.hostname }}
        </div>
      </div>

      <!-- Submit all changes -->
      <div class="pt-3 border-t mt-3 flex items-center justify-between">
        <div class="text-xs text-slate-500">
          <span v-if="hasPendingChanges">
            ⚠️ You have pending changes. Click "Submit changes" to save to
            server.
          </span>
          <span v-else>
            No pending changes.
          </span>
        </div>
        <button
          class="text-sm px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          :disabled="!hasPendingChanges || submitting"
          @click="submitChanges"
        >
          {{ submitting ? "Submitting..." : "Submit changes" }}
        </button>
      </div>
    </div>
  </section>
</template>
