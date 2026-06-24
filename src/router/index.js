import { createRouter, createWebHistory } from 'vue-router'
import { routes as exploreRoutes } from '@/assets/query'

export const exploreChildRoutes = [
  {
    path: '',
    component: () => import('../views/ExploreView.vue'),
  },
  ...exploreRoutes(),
]

console.log(exploreRoutes())

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
  children: [
    {
      path: '',
      redirect: { name: 'places' },
    },
    ...exploreRoutes(),
  ],
  meta: {
    hideFooter: true,
  },
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