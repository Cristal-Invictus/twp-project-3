import { defineStore } from 'pinia';
import categoryService from '../services/categoryService.js';
import postService from '../services/postService.js';

export const useCategoryStore = defineStore('categoryStore', {
  state: () => ({
    categories: [],
  categoryOrder: [],
  }),
  actions: {
    async loadCategories() {
      
      const response = await categoryService.getAll();
      if (response.success) {
        
        
        // Une seule requête pour tous les posts
        const tasksResponse = await postService.getAll();
        
        
        if (tasksResponse.success) {
          const categoriesWithTasks = response.data.map(cat => {
            let tasks = tasksResponse.data.filter(post => 
              post.categories && post.categories.includes(cat.id)
            );
            // Fallback ordre localStorage si meta absente
            const hasAnyMeta = tasks.some(t=>typeof t.meta?.position !== 'undefined');
            if (hasAnyMeta) {
              tasks = tasks.sort((a,b) => {
                const pa = a.meta?.position ?? 999999;
                const pb = b.meta?.position ?? 999999;
                return pa - pb;
              });
            } else {
              try {
                const key = `postOrder_cat_${cat.id}`;
                const stored = localStorage.getItem(key);
                if (stored) {
                  const order = JSON.parse(stored);
                  const map = new Map(tasks.map(t=>[t.id,t]));
                  const ordered = order.map(id=>map.get(id)).filter(Boolean);
                  const missing = tasks.filter(t=>!order.includes(t.id));
                  tasks = [...ordered, ...missing];
                }
              } catch(e) { /* ignore */ }
            }
            console.log(`🏪 Store: Catégorie "${cat.name}" (ID: ${cat.id}) a ${tasks.length} posts`);
            
            return {
              ...cat,
              title: cat.name || '', // WordPress utilise 'name', on le mappe vers 'title' pour l'app
              tasks: tasks,
            };
          });
          
          // Charger ordre sauvegardé localement si meta absente ou incomplète
          const storedOrderJSON = localStorage.getItem('categoryOrder');
          let storedOrder = [];
          if (storedOrderJSON) {
            try { storedOrder = JSON.parse(storedOrderJSON); } catch(e) { /* ignore */ }
          }

          const hasAnyMeta = categoriesWithTasks.some(c=>c.meta && typeof c.meta.position !== 'undefined');
          let ordered;
          if (hasAnyMeta) {
            ordered = categoriesWithTasks.sort((a,b)=>{
              const pa = a.meta?.position ?? 999999;
              const pb = b.meta?.position ?? 999999;
              if (pa === pb) return a.id - b.id;
              return pa - pb;
            });
          } else if (storedOrder.length) {
            const map = new Map(categoriesWithTasks.map(c=>[c.id,c]));
            ordered = storedOrder.map(id=>map.get(id)).filter(Boolean);
            // Ajouter celles non présentes dans storedOrder (nouvelles)
            categoriesWithTasks.forEach(c=>{ if(!map.has(c.id)) map.set(c.id,c); });
            const missing = categoriesWithTasks.filter(c=>!storedOrder.includes(c.id));
            ordered = [...ordered, ...missing];
          } else {
            ordered = categoriesWithTasks; // fallback natural order
          }
          this.categories = ordered;
          // Mettre à jour ordre local fallback et sauvegarder
          this.categoryOrder = this.categories.map(c=>c.id);
          localStorage.setItem('categoryOrder', JSON.stringify(this.categoryOrder));
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
      return response.success ? response : false;
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
          // Préserver tasks et fusionner meta
          this.categories[idx] = {
            ...oldCategory,
            ...response.data,
            tasks: oldCategory.tasks || [],
            meta: { ...(oldCategory.meta||{}), ...(response.data.meta||{}) }
          };
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
    setCategoryOrder(newOrderIds) {
      this.categoryOrder = [...newOrderIds];
      // Reordonner localement selon la liste fournie
      const map = new Map(this.categories.map(c=>[c.id,c]));
      this.categories = newOrderIds.map(id=>map.get(id)).filter(Boolean);
  localStorage.setItem('categoryOrder', JSON.stringify(this.categoryOrder));
    }
  },
  persist: true,
});
