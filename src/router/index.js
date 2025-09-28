import { createRouter, createWebHistory } from 'vue-router';
import Board from '../views/Board.vue';
import { useAuthStore } from '../store/authStore.js';

const routes = [
  {
    path: '/',
    name: 'Board',
    component: Board,
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { public: true }
  },
  {
    path: '/board/:categoryId?',
    name: 'CategoryBoard',
    component: () => import('../views/Board.vue'),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next)=>{
  const auth = useAuthStore();
  auth.init();
  if(!to.meta.public){
    await auth.validateIfNeeded();
    if(!auth.isAuthenticated) return next({ name:'Login', query:{ redirect: to.fullPath }});
  }
  next();
});

export default router;
