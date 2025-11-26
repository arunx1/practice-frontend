<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <div class="min-h-screen flex justify-center items-start pt-10 bg-slate-100">
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

      <RouterView />
    </div>
  </div>
</template>
