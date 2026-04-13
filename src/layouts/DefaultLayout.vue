<template>
  <v-app>
    <v-app-bar elevation="1">
      <v-app-bar-nav-icon
        class="d-lg-none"
        @click="drawer = !drawer"
      />

      <v-app-bar-title>
        <span class="font-weight-bold">Data</span>Fit
      </v-app-bar-title>

      <template #append>
        <v-btn
          :icon="themeIcon"
          @click="toggleTheme"
        />
      </template>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      :rail="!mobile"
      expand-on-hover
      :permanent="!mobile"
    >
      <v-list nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { useDisplay, useTheme } from 'vuetify'

  const theme = useTheme()
  const { mobile } = useDisplay()
  const drawer = ref(true)

  const themeIcon = computed(() =>
    theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night',
  )

  function toggleTheme () {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  }

  const navItems = [
    { title: 'Home', icon: 'mdi-home-outline', to: '/' },
  ]
</script>
