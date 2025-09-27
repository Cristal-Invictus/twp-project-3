import { defineStore } from 'pinia';
import postService from '../services/postService.js';

export const useTaskStore = defineStore('taskStore', {
  state: () => ({
    tasks: [],
  }),
  actions: {
    async loadTasks(categoryId) {
      const response = await postService.getAll();
      if (response.success) {
        // Filtrer par catégorie si besoin
        this.tasks = categoryId ? response.data.filter(t => t.categories && t.categories.includes(categoryId)) : response.data;
      }
    },
    async addTask(task) {
      // Ajoute le statut 'publish' par défaut
      const postData = { ...task, status: 'publish' };
      const response = await postService.create(postData);
      if (response.success) {
        this.tasks.push(response.data);
      }
    },
    async updateTask(task) {
      const response = await postService.update(task.id, task);
      if (response.success) {
        const idx = this.tasks.findIndex(t => t.id === task.id);
        if (idx !== -1) this.tasks[idx] = response.data;
      }
    },
    async deleteTask(id) {
      const response = await postService.delete(id);
      if (response.success) {
        this.tasks = this.tasks.filter(t => t.id !== id);
      }
    },
  },
  persist: true,
});
