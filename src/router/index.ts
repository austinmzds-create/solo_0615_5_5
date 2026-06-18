import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../components/Layout.vue'),
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue'),
        },
        {
          path: 'buildings',
          name: 'Buildings',
          component: () => import('../views/Buildings.vue'),
        },
        {
          path: 'tenants',
          name: 'Tenants',
          component: () => import('../views/Tenants.vue'),
        },
        {
          path: 'visitors',
          name: 'Visitors',
          component: () => import('../views/Visitors.vue'),
        },
      ],
    },
  ],
})

export default router
