import { createRouter, createWebHistory } from 'vue-router';
import Board from '../views/Board.vue';

const routes = [
  {
    path: '/',
    name: 'Board',
    component: Board,
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

export default router;
