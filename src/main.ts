import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Dashboard from './Dashboard.vue';
import { connectRegistry } from './nexus';

// No catch-all here — connectRegistry() adds remote routes via
// router.addRoute() after the registry payload arrives. A catch-all
// registered up front would shadow every dynamic /:routePath because
// Vue Router 4 matches in registration order.
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: Dashboard },
  ],
});

connectRegistry(router);

createApp(App).use(router).mount('#app');
