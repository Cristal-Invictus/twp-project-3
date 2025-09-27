import { defineStore } from 'pinia';
import categoryService from '../services/categoryService.js';
import postService from '../services/postService.js';

export const useCategoryStore = defineStore('categoryStore', {
  state: () => ({
    categories: [],
  }),
  actions: {
    async loadCategories() {
      
      const response = await categoryService.getAll();
      if (response.success) {
        
        
        // Une seule requête pour tous les posts
        const tasksResponse = await postService.getAll();
        
        
        if (tasksResponse.success) {
          const categoriesWithTasks = response.data.map(cat => {
            const tasks = tasksResponse.data.filter(post => 
              post.categories && post.categories.includes(cat.id)
            );
            console.log(`🏪 Store: Catégorie "${cat.name}" (ID: ${cat.id}) a ${tasks.length} posts`);
            
            return {
              ...cat,
              title: cat.name || '', // WordPress utilise 'name', on le mappe vers 'title' pour l'app
              tasks: tasks,
            };
          });
          
          this.categories = categoriesWithTasks;
          console.log('🏪 Store: Catégories chargées avec succès:', this.categories.length);
        } else {
          console.error('🏪 Store: Erreur lors du chargement des posts:', tasksResponse.error);
          // Charger les catégories sans posts en cas d'erreur
          this.categories = response.data.map(cat => ({
            ...cat,
            title: cat.name || '',
            tasks: [],
          }));
        }
      } else {
        console.error('🏪 Store: Erreur lors du chargement des catégories:', response.error);
      }
    },
    async addCategory(category) {
      const response = await categoryService.create(category);
      if (response.success) {
        const cat = response.data;
        this.categories.push({
          ...cat,
          title: cat.title || cat.name || '',
          tasks: [],
        });
      }
    },
    async updateCategory(category) {
      console.log(`🏪 Store: Tentative de mise à jour catégorie:`, category);
      console.log(`🏪 Store: Catégories avant mise à jour:`, this.categories.length);
      
      const response = await categoryService.update(category.id, category);
      
      console.log(`🏪 Store: Réponse du service:`, response);
      
      if (response.success) {
        const idx = this.categories.findIndex(c => c.id === category.id);
        console.log(`🏪 Store: Index trouvé pour la catégorie:`, idx);
        
        if (idx !== -1) {
          const oldCategory = this.categories[idx];
          this.categories[idx] = response.data;
          console.log(`🏪 Store: Catégorie mise à jour - Ancien:`, oldCategory);
          console.log(`🏪 Store: Catégorie mise à jour - Nouveau:`, response.data);
        } else {
          console.warn(`🏪 Store: Catégorie avec ID ${category.id} non trouvée dans le store`);
        }
      } else {
        console.error(`🏪 Store: Échec de la mise à jour:`, response.error);
      }
      
      return response;
    },
    async deleteCategory(id) {
      console.log(`🏪 Store: Tentative de suppression de la catégorie ID: ${id}`);
      console.log(`🏪 Store: Catégories avant suppression:`, this.categories.length);
      
      const response = await categoryService.delete(id);
      
      console.log(`🏪 Store: Réponse du service:`, response);
      
      if (response.success) {
        const oldCount = this.categories.length;
        this.categories = this.categories.filter(c => c.id !== id);
        console.log(`🏪 Store: Catégories après suppression: ${this.categories.length} (était ${oldCount})`);
        console.log(`🏪 Store: Suppression réussie dans le store`);
      } else {
        console.error(`🏪 Store: Échec de la suppression:`, response.error);
      }
      
      return response;
    },
  },
  persist: true,
});
