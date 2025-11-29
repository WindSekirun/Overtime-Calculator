<template>
  <v-app id="app">
    <v-app-bar app color="#434c5e" theme="dark">
      <template v-slot:prepend>
        <v-avatar size="36">
          <img src="./assets/1024.png" />
        </v-avatar>
      </template>

      <v-app-bar-title class="ms-2" style="color: white"><b>OverTime Calculator</b></v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid class="fill-height align-start justify-center">
        <router-view> </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
// No script logic needed
</script>

<style>
#app {
  background-color: #2e3440;
}
</style>
