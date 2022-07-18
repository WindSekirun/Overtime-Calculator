import Vue from 'vue';
import { createPinia, PiniaVuePlugin } from 'pinia'
import App from './App.vue';
import vuetify from './plugins/vuetify';
import router from './router';

Vue.use(PiniaVuePlugin);
const pinia = createPinia()

Vue.config.productionTip = false;

new Vue({
  vuetify,
  router,
  render: (h) => h(App),
  pinia
}).$mount('#app');
