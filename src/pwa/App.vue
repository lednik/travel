<template>
    <router-view />
  </template>
  
  <script setup>
  import { useRoutesStore } from '@/pwa/stores'
  const store = useRoutesStore()
  </script>