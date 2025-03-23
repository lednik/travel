import { defineStore } from 'pinia'
import type {Route, RouteStoreState } from '@/common/types.ts'
// import type { Route } from '../../common/types'

export const useRoutesStore = defineStore('routes', {
  state: (): RouteStoreState => ({
    currentRoute: null,
    savedRoutes: []
  }),
  actions: {
    setCurrentRoute(route: Route) {
      this.currentRoute = route
    }
  }
})