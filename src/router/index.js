import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/CmsPageView.vue'),
      props: {slug: 'home' },
    },
    {
      path: '/introduction',
      name: 'introduction',
      component: () => import('../views/CmsPageView.vue'),
      props: {slug: 'introduction' },
    },
    {
      path: '/explore',
      name: 'explore',
      component: () => import('../views/ExploreView.vue'),
    },
    {
      path: '/project',
      name: 'project',
      component: () => import('../views/CmsPageView.vue'),
      props: {slug: 'project' },
    },
    {
      path: '/bibliography',
      name: 'bibliography',
      component: () => import('../views/BiblioView.vue'),
    },
  ],
})

export default router
