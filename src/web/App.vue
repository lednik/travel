<template>
    <div class="app-container">
      <nav v-if="$route.name !== 'home'">
        <router-link to="/">Home</router-link>
      </nav>
      <router-view />
    </div>
  </template>

<script setup lang="ts">
import { useThemeStore } from '@/common/stores/theme'
import { onMounted } from 'vue'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
})
</script>
  
<style scoped lang="scss">
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: use-variable("spacing", "md");
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: use-variable("spacing", "md");
}

nav {
  background: use-variable("bg", "secondary");
  padding: use-variable("spacing", "md");
  border-radius: use-variable("radius", "md");
  box-shadow: use-variable("shadow", "sm");

  a {
    color: use-variable("text", "primary");
    text-decoration: none;
    font-weight: use-variable("font", "weight-medium");
    transition: color use-variable("transition", "normal");

    &:hover {
      color: use-variable("primary", "base");
    }
  }
}
</style>