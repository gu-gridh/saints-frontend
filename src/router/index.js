import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/assets/query.js'

const exploreChildRoutes = [
  {
    path: '',
    component: () => import('../views/ExploreView.vue'),
  },
  ...routes(),
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/CmsPageView.vue'),
      props: { slug: 'home' },
    },
    {
      path: '/introduction',
      name: 'introduction',
      component: () => import('../views/CmsPageView.vue'),
      props: { slug: 'introduction' },
    },
    {
      path: '/explore',
      component: () => import('../views/ExploreView.vue'),
      meta: {
        hideFooter: true,
      },
      children: exploreChildRoutes,
    },
    {
      path: '/project',
      name: 'project',
      component: () => import('../views/CmsPageView.vue'),
      props: { slug: 'project' },
    },
    {
      path: '/bibliography',
      name: 'bibliography',
      component: () => import('../views/BiblioView.vue'),
    },
  ],
})

export default router