import { defineStore } from 'pinia'
import { ref } from 'vue'

type Theme = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>('light')

  const getCurrentTheme = () => currentTheme.value

  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    localStorage.setItem('theme', theme)
    applyThemeToDOM()
  }

  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', currentTheme.value)
    applyThemeToDOM()
  }

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') as Theme | null

    currentTheme.value = savedTheme || 'dark'
    
    applyThemeToDOM()
  }

  const applyThemeToDOM = () => {
    const appElement = document.getElementById('app')
    if (appElement) {
      appElement.classList.remove('theme--light', 'theme--dark')
      appElement.classList.add(`theme--${currentTheme.value}`)
    }
  }

  return {
    currentTheme,
    getCurrentTheme,
    setTheme,
    toggleTheme,
    initTheme
  }
})