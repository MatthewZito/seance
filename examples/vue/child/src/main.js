import Vue from 'vue';
import App from './App.vue';
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

Vue.config.productionTip = false;

new Vue({
  router: new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
      {
        path: '/',
        name: 'Home',
        component: require('@/views/Home.vue').default
      },
      {
        path: '/about',
        name: 'About',
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
      }
    ]
  }),
  render: h => h(App)
}).$mount('#app');
