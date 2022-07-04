<template>
  <v-app id="app">
    <v-app-bar app color="#8fbcbb" dark>
      <v-avatar size="36">
        <img src="./assets/1024.png" />
      </v-avatar>

      <v-toolbar-title class="ms-2" color="white"><b>OverTime Calculator</b></v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container bg text-xs-center fill-width>
        <calculator />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Calculator from "@/components/Calculator.vue";

@Component({
  components: {
    Calculator,
  },
})
export default class App extends Vue {}
</script>

<style>
#app {
  background-color: #2e3440;
}
</style>