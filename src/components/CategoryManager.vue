<template>
  <div class="p-6 md:p-8 space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <h2 class="text-2xl font-semibold text-slate-800 flex items-center gap-2"><i class="fas fa-columns text-indigo-500"></i>Gestion des Colonnes</h2>
      <div class="flex gap-3 flex-wrap">
        <button @click="showCreateModal = true" :disabled="loading" class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 text-sm shadow-sm transition">
          <i class="fas fa-plus"></i> Nouvelle Colonne
        </button>
        <button @click="loadCategories" :disabled="loading" class="inline-flex items-center gap-2 rounded-lg bg-slate-600 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 text-sm shadow-sm transition">
          <i class="fas fa-sync"></i> Actualiser
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center gap-3 text-slate-500 py-16 text-sm">
      <i class="fas fa-spinner fa-spin text-lg"></i>
      Chargement des catégories...
    </div>

    <!-- Error -->
    <div v-if="error" class="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
      <i class="fas fa-exclamation-triangle mt-0.5"></i>
      <div class="flex-1">{{ error }}</div>
      <button @click="error = null" class="text-red-400 hover:text-red-600">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Grid -->
    <div v-if="!loading" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="category in categories" :key="category.id" class="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition overflow-hidden">
        <div class="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-indigo-500 to-sky-400 pointer-events-none transition"></div>
        <div class="flex flex-col h-full">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <i class="fas fa-folder text-indigo-500 text-sm"></i>{{ category.title }}
            </h3>
            <p class="text-sm text-slate-600 line-clamp-3 mb-3" v-text="category.description || 'Aucune description'"></p>
            <span class="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
              <i class="fas fa-file-alt"></i>{{ category.count }} article(s)
            </span>
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <button @click="editCategory(category)" :disabled="loading" class="inline-flex items-center justify-center w-9 h-9 rounded-md border border-slate-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="confirmDelete(category)" :disabled="loading" class="inline-flex items-center justify-center w-9 h-9 rounded-md border border-slate-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-if="categories.length === 0" class="col-span-full flex flex-col items-center justify-center text-center py-24 border-2 border-dashed rounded-xl border-slate-300 text-slate-400">
        <i class="fas fa-folder-open text-5xl mb-4 text-slate-300"></i>
        <p class="font-medium text-slate-600">Aucune catégorie trouvée</p>
        <p class="text-sm">Créez votre première colonne pour commencer</p>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 px-4" @click="closeModals">
      <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden" @click.stop>
        <div class="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-slate-50">
          <h3 class="text-lg font-semibold text-slate-800 flex items-center gap-2"><i class="fas fa-folder text-indigo-500"></i>{{ showEditModal ? 'Modifier la Colonne' : 'Nouvelle Colonne' }}</h3>
          <button @click="closeModals" class="text-slate-400 hover:text-red-500 transition text-xl"><i class="fas fa-times"></i></button>
        </div>
        <form @submit.prevent="submitCategory" class="px-6 py-6 space-y-5">
          <div>
            <label for="categoryTitle" class="block text-sm font-medium text-slate-700 mb-1">Nom de la colonne *</label>
            <input id="categoryTitle" type="text" v-model="categoryForm.title" required maxlength="50" placeholder="Ex: À faire, En cours, Terminé" class="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm" />
          </div>
          <div>
            <label for="categoryName" class="block text-sm font-medium text-slate-700 mb-1">Slug (généré automatiquement)</label>
            <input id="categoryName" type="text" v-model="categoryForm.name" readonly placeholder="Généré automatiquement" class="w-full rounded-lg bg-slate-50 border-slate-200 text-slate-500 text-sm" />
          </div>
          <div>
            <label for="categoryDescription" class="block text-sm font-medium text-slate-700 mb-1">Description (optionnel)</label>
            <textarea id="categoryDescription" v-model="categoryForm.description" rows="3" maxlength="200" placeholder="Description de cette colonne" class="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm resize-y"></textarea>
          </div>
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" @click="closeModals" class="inline-flex items-center gap-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 text-sm font-medium">Annuler</button>
            <button type="button" @click="submitCategory" :disabled="!categoryForm.title || submitting" class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 text-sm font-medium shadow-sm">
              <i class="fas fa-spinner fa-spin" v-if="submitting"></i>
              <i class="fas fa-save" v-else></i>
              {{ submitting ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import categoryService from '../services/categoryService.js';
import Swal from 'sweetalert2';

export default {
  name: 'CategoryManager',

  data() {
    return {
      loading: false,
      submitting: false,
      error: null,

      categories: [],

      showCreateModal: false,
      showEditModal: false,

      categoryForm: {
        id: null,
        title: '',
        name: '',
        description: '',
      },

      editingCategory: null,
    };
  },

  watch: {
    'categoryForm.title'(newTitle) {
      if (!this.showEditModal) {
        this.categoryForm.name = this.generateSlug(newTitle);
      }
    },
  },

  async mounted() {
    await this.loadCategories();
  },

  methods: {
    async loadCategories() {
  this.loading = true;
  this.error = null;
  const result = await categoryService.getAll();
  if (result.success) {
    this.categories = result.data;
    this.$emit('categories-loaded', result.data);
  } else {
    this.error = result.error?.message || 'Erreur lors du chargement des catégories';
    console.error('Erreur chargement catégories:', result.error);
  }
  this.loading = false;
},

    generateSlug(title) {
      return title
        .toLowerCase()
        .trim()
        .replace(/[àáäâ]/g, 'a')
        .replace(/[èéëê]/g, 'e')
        .replace(/[ìíïî]/g, 'i')
        .replace(/[òóöô]/g, 'o')
        .replace(/[ùúüû]/g, 'u')
        .replace(/[ýÿ]/g, 'y')
        .replace(/[ç]/g, 'c')
        .replace(/[ñ]/g, 'n')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    },

    editCategory(category) {
      this.editingCategory = category;
      this.categoryForm = {
        id: category.id,
        title: category.title,
        name: category.name,
        description: category.description || '',
      };
      this.showEditModal = true;
    },

    async confirmDelete(category) {
      const confirmed = await Swal.fire({
        title: 'Supprimer la colonne ?',
        text: `La colonne "${category.title}" et tous ses articles seront supprimés définitivement.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        reverseButtons: true,
      });

      if (confirmed.isConfirmed) {
        await this.deleteCategory(category);
      }
    },

    /**
     * Supprime une catégorie
     */
  async deleteCategory(category) {
  
  this.loading = true;
  
  const result = await categoryService.delete(category.id);
  
  
  if (result.success) {
    const oldCount = this.categories.length;
    this.categories = this.categories.filter(cat => cat.id !== category.id);
   
    
    this.$emit('category-deleted', category);
    
    
    Swal.fire({
      title: 'Supprimé !',
      text: `La colonne "${category.name}" a été supprimée.`,
      icon: 'success',
      timer: 3000,
    });
  } else {
    this.error = result.error?.message || 'Erreur lors de la suppression';
    console.error('📋 CategoryManager: Erreur suppression catégorie:', result.error);
    Swal.fire('Erreur', this.error, 'error');
  }
  this.loading = false;
},

    async submitCategory() {
  if (!this.categoryForm.title.trim()) return;
  this.submitting = true;
  const payload = {
    name: this.categoryForm.title,
    slug: this.categoryForm.name,
    description: this.categoryForm.description || '',
  };
  let result;
  if (this.showEditModal) {
    result = await categoryService.update(this.categoryForm.id, payload);
  } else {
    result = await categoryService.create(payload);
  }
  if (result.success && result.data && result.data.id) {
    await this.loadCategories();
    this.$emit(this.showEditModal ? 'category-updated' : 'category-created', result.data);
    this.closeModals();
  Swal.fire({
      title: 'Succès !',
      text: `Colonne "${result.data.name}" ${this.showEditModal ? 'modifiée' : 'créée'} avec succès.`,
      icon: 'success',
      timer: 3000,
    });
  } else {
    console.error('Erreur API catégorie:', result.error);
  Swal.fire({
      title: 'Erreur',
      text: result.error?.message || "La catégorie n'a pas pu être créée.",
      icon: 'error',
      timer: 4000,
    });
  }
  this.submitting = false;
},
    closeModals() {
      this.showCreateModal = false;
      this.showEditModal = false;
      this.editingCategory = null;
      this.resetForm();
    },
    resetForm() {
      this.categoryForm = {
        id: null,
        title: '',
        name: '',
        description: '',
      };
    },
  },
};
</script>

<style scoped>
/* Minimal keyframe (FontAwesome already supplies spinner but keep as fallback) */
@keyframes fa-spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
</style>
