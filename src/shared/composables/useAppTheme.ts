import { computed } from 'vue'
import { useTheme } from 'vuetify'

const THEME_STORAGE_KEY = 'datagrapho-theme'

type AppThemeName = 'light' | 'dark'

export function useAppTheme () {
  const theme = useTheme()

  const currentThemeName = computed(() => theme.global.name.value as AppThemeName)
  const isDarkTheme = computed(() => theme.global.current.value.dark)

  function setTheme (nextTheme: AppThemeName) {
    theme.global.name.value = nextTheme

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    }
  }

  function toggleTheme () {
    setTheme(isDarkTheme.value ? 'light' : 'dark')
  }

  function initTheme () {
    if (typeof window === 'undefined') return

    const saved = window.localStorage.getItem(THEME_STORAGE_KEY)

    if (saved === 'light' || saved === 'dark') {
      theme.global.name.value = saved
      return
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.global.name.value = prefersDark ? 'dark' : 'light'
  }

  return {
    currentThemeName,
    initTheme,
    isDarkTheme,
    setTheme,
    toggleTheme,
  }
}
