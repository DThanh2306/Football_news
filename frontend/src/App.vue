<script setup>
import AppHeader from '@/components/AppHeader.vue'
import { useRoute } from 'vue-router'
const $route = useRoute()
</script>
<template>
  <div>
    <AppHeader v-if="!$route.path.startsWith('/admin')" />
    <router-view />
  </div>
</template>
  
<style scoped></style>
