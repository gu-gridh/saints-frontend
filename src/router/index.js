import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/introduction',
      name: 'introduction',
      component: () => import('../views/IntroView.vue'),
    },
    {
      path: '/explore',
      name: 'explore',
      component: () => import('../views/ExploreView.vue'),
    },
    {
      path: '/project',
      name: 'project',
      component: () => import('../views/ProjectView.vue'),
    },
    {
      path: '/bibliography',
      name: 'bibliography',
      component: () => import('../views/BiblioView.vue'),
    },
  ],
})

export default router
