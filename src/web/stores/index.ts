import { defineStore } from 'pinia'

export const useEditorStore = defineStore('editor', {
  state: () => ({
    draftRoutes: [],
    activeRoute: null
  })
})