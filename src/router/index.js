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
  name: 'explore',
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
      path: '/sources',
      name: 'sources',
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