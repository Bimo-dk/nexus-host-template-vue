import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Dashboard from './Dashboard.vue';
import { connectRegistry } from './nexus';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: Dashboard },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
});

connectRegistry(router);

createApp(App).use(router).mount('#app');
