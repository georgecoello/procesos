import { createRouter, createWebHistory } from 'vue-router'

// Importar vistas
const HomeView = () => import('../views/HomeView.vue')
const DocumentView = () => import('../views/DocumentView.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/document',
    name: 'Document',
    component: DocumentView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router