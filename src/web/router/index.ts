import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/web/views/Home.vue')
    },
    {
      path: '/route-create',
      name: 'route-create',
      component: () => import('@/web/views/RouteCreate.vue')
    },
  ]
})