import { createRouter, createWebHistory } from 'vue-router'
import { routes as exploreRoutes } from '@/assets/query'

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
      redirect: '/explore/places',
      children: exploreRoutes(),
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
    // Last fallback for nested pages
    {
      path: '/:pathMatch(.*)*',
      component: () => import('../views/CmsPageView.vue'),
      props: route => ({
      slug: route.path.split('/').filter(Boolean).at(-1),
      }),
    },
  ],
})

export default router