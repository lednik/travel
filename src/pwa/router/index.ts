import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pwa/views/HomeView.vue')
    },
    {
      path: '/route/:id',
      name: 'route',
      component: () => import('@/pwa/views/RouteView.vue')
    }
  ]
})