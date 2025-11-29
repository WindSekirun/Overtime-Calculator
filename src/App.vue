<template>
  <v-app id="app">
    <v-app-bar app color="#434c5e" theme="dark">
      <v-app-bar-title class="ms-6" style="color: white"><b>OverTime Calculator</b></v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid class="fill-height align-start justify-center">
        <router-view> </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
#app {
  background-color: #2e3440;
}
</style>
