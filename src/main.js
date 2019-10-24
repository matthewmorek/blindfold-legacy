import Vue from 'vue';
import VueWait from 'vue-wait';
import App from './App.vue';
import './registerServiceWorker';
import bugsnagVue from '@bugsnag/plugin-vue';
import bugsnagClient from './utilities/bugsnag';

bugsnagClient.use(bugsnagVue, Vue);

Vue.use(VueWait);

Vue.config.productionTip = false;

new Vue({
  store,
  wait: new VueWait({
    useVuex: false
  }),
  render: h => h(App)
}).$mount('#app');
