<template>
  <div class="space-y-6 p-5">
    <!-- Header -->
    <div class="flex flex-wrap gap-4 items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-800">Gestion des Cartes (Articles WordPress)</h2>
      <div class="flex flex-wrap items-center gap-3">
        <select
          v-model="selectedCategoryFilter"
            @change="loadPosts"
            :disabled="loading"
            class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        >
          <option value="">Toutes les colonnes</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.title }}</option>
        </select>
        <button
          class="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          @click="showCreateModal = true"
          :disabled="loading"
        >
          <i class="fas fa-plus"></i> Nouveau Post
        </button>
        <button
          class="inline-flex items-center gap-2 px-4 py-2 rounded bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-60"
          @click="refreshData"
          :disabled="loading"
        >
          <i class="fas fa-sync"></i> Actualiser
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="!loading && posts.length > 0" class="flex flex-wrap gap-6 text-sm bg-gray-50 rounded p-3">
      <div class="flex items-center gap-2 text-gray-600">
        <i class="fas fa-sticky-note"></i>
        <span>{{ filteredPosts.length }} posts affichés</span>
      </div>
      <div class="flex items-center gap-2 text-gray-600">
        <i class="fas fa-folder"></i>
        <span>{{ categories.length }} colonnes</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center p-10 text-gray-600">
      <i class="fas fa-spinner animate-spin"></i> Chargement des posts...
    </div>

    <!-- Error -->
    <div v-if="error" class="flex items-center justify-between gap-4 bg-red-100 text-red-700 p-3 rounded">
      <div class="flex items-center gap-2">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{{ error }}</span>
      </div>
      <button
        class="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
        @click="error = null"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Columns View -->
    <div v-if="!loading && viewMode === 'columns'" class="relative -mx-5 px-5 py-6 bg-[#2366a0] overflow-x-auto">
      <div class="flex gap-5 w-max pb-4">
        <div
          v-for="category in categoriesWithPosts"
          :key="category.id"
          class="min-w-[300px] bg-[#2366a0] rounded-lg p-4 border border-white/10"
        >
          <div class="flex items-center justify-between mb-4 pb-2 border-b border-blue-200/40">
            <h3 class="font-semibold text-white text-base">{{ category.title }}</h3>
            <span class="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{{ category.posts.length }}</span>
          </div>
          <div class="flex flex-col gap-3">
            <div
              v-for="post in category.posts"
              :key="post.id"
              class="group bg-white border border-gray-200 rounded p-4 cursor-pointer transition shadow-sm hover:-translate-y-0.5 hover:shadow"
              @click="viewPost(post)"
            >
              <div>
                <h4 class="text-sm font-semibold text-gray-800 mb-2">{{ post.title }}</h4>
                <p
                  v-if="post.excerpt"
                  class="text-xs text-gray-600 leading-relaxed mb-2"
                  v-html="post.excerpt"
                ></p>
                <div class="text-[11px] text-gray-500">
                  <span>{{ formatDate(post.date) }}</span>
                </div>
              </div>
              <div class="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  class="p-1.5 rounded hover:bg-gray-200 text-green-600"
                  @click.stop="editPost(post)"
                  :disabled="loading"
                  title="Modifier"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="p-1.5 rounded hover:bg-gray-200 text-red-600"
                  @click.stop="confirmDeletePost(post)"
                  :disabled="loading"
                  title="Supprimer"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <button
              class="border-2 border-dashed border-gray-300 rounded p-4 text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition disabled:opacity-60"
              @click="openCreateModal(category.id)"
              :disabled="loading"
            >
              <i class="fas fa-plus"></i> Ajouter une carte
            </button>
          </div>
        </div>

        <div v-if="categoriesWithPosts.length === 0" class="flex flex-col items-center justify-center text-white/80 p-10 gap-3">
          <i class="fas fa-columns text-5xl opacity-40"></i>
          <p>Aucune colonne disponible</p>
          <p>Créez d'abord des catégories dans WordPress</p>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-if="!loading && viewMode === 'list'" class="bg-white rounded shadow overflow-hidden">
      <div class="grid grid-cols-[1fr_150px_150px_100px] gap-4 px-4 py-3 bg-gray-100 text-sm font-semibold text-gray-700">
        <div>Titre</div>
        <div>Colonne</div>
        <div>Date</div>
        <div class="text-center">Actions</div>
      </div>
      <div>
        <div
          v-for="post in filteredPosts"
          :key="post.id"
          class="grid grid-cols-[1fr_150px_150px_100px] gap-4 p-4 border-b border-gray-100 items-center cursor-pointer hover:bg-gray-50 transition"
          @click="viewPost(post)"
        >
          <div>
            <strong class="block mb-1">{{ post.title }}</strong>
            <p
              v-if="post.excerpt"
              class="text-xs text-gray-600"
              v-html="post.excerpt.substring(0, 100) + '...'"
            ></p>
          </div>
          <div>
            <span class="inline-block bg-blue-500 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">{{ getCategoryName(post.categoryId) }}</span>
          </div>
          <div class="text-sm text-gray-600">{{ formatDate(post.date) }}</div>
          <div class="flex gap-2 justify-center" @click.stop>
            <button class="p-1.5 rounded hover:bg-gray-200 text-green-600" @click="editPost(post)" title="Modifier">
              <i class="fas fa-edit"></i>
            </button>
            <button class="p-1.5 rounded hover:bg-gray-200 text-red-600" @click="confirmDeletePost(post)" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating view toggles -->
    <div
      v-if="!loading && posts.length > 0"
      class="fixed bottom-5 right-5 flex gap-2 bg-white shadow-lg rounded-full p-2"
    >
      <button
        class="px-3 py-1.5 text-xs rounded-full font-medium transition"
        :class="viewMode === 'columns' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
        @click="viewMode = 'columns'"
      >
        <i class="fas fa-columns"></i> Colonnes
      </button>
      <button
        class="px-3 py-1.5 text-xs rounded-full font-medium transition"
        :class="viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
        @click="viewMode = 'list'"
      >
        <i class="fas fa-list"></i> Liste
      </button>
    </div>

    <!-- Create / Edit Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="closeModals"
    >
      <div
        class="bg-white rounded-lg w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto shadow-xl"
        @click.stop
      >
        <div class="flex items-center justify-between gap-4 p-5 border-b border-gray-200 bg-blue-700 text-white rounded-t-lg">
          <h3 class="flex items-center gap-2 font-semibold">
            <i class="fas fa-sticky-note"></i>
            {{ showEditModal ? 'Modifier le post' : 'Nouveau post' }}
          </h3>
          <button class="text-white/70 hover:text-white" @click="closeModals">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitPost" class="p-5 space-y-5">
          <div class="space-y-1">
            <label for="postTitle" class="block font-medium text-gray-700">Titre du post *</label>
            <input
              id="postTitle"
              type="text"
              v-model="postForm.title"
              placeholder="Titre de votre carte"
              required
              maxlength="100"
              class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div class="space-y-1">
            <label for="postCategory" class="block font-medium text-gray-700">Colonne *</label>
            <select
              id="postCategory"
              v-model="postForm.categoryId"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choisir une colonne</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.title }}
              </option>
            </select>
          </div>

            <div class="space-y-1">
              <label for="postExcerpt" class="block font-medium text-gray-700">Description courte</label>
              <textarea
                id="postExcerpt"
                v-model="postForm.excerpt"
                placeholder="Description rapide de la carte"
                rows="3"
                maxlength="300"
                class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            <div class="space-y-1">
              <label for="postContent" class="block font-medium text-gray-700">Contenu détaillé</label>
              <textarea
                id="postContent"
                v-model="postForm.content"
                placeholder="Contenu complet de la carte"
                rows="6"
                class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-5 border-t border-gray-200">
              <button
                type="button"
                class="inline-flex items-center gap-2 px-4 py-2 rounded bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                @click="closeModals"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                :disabled="!postForm.title || !postForm.categoryId || submitting"
              >
                <i class="fas fa-spinner animate-spin" v-if="submitting"></i>
                <i class="fas fa-save" v-else></i>
                {{ submitting ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
        </form>
      </div>
    </div>

    <!-- View Modal -->
    <div
      v-if="showViewModal && selectedPost"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="showViewModal = false"
    >
      <div
        class="bg-white rounded-lg w-[90%] max-w-[800px] max-h-[90vh] overflow-y-auto shadow-xl"
        @click.stop
      >
        <div class="flex items-center justify-between gap-4 p-5 border-b border-gray-200 bg-blue-700 text-white rounded-t-lg">
          <h3 class="flex items-center gap-2 font-semibold">
            <i class="fas fa-eye"></i>
            {{ selectedPost.title }}
          </h3>
          <div class="flex items-center gap-2">
            <button
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-green-600 text-white text-xs font-medium hover:bg-green-700"
              @click="editPost(selectedPost)"
            >
              <i class="fas fa-edit"></i> Modifier
            </button>
            <button class="text-white/70 hover:text-white" @click="showViewModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="p-5 space-y-5">
          <div class="flex items-center justify-between mb-2 pb-4 border-b border-gray-200">
            <span class="inline-block bg-blue-500 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">{{ getCategoryName(selectedPost.categoryId) }}</span>
            <span class="text-sm text-gray-600">{{ formatDate(selectedPost.date) }}</span>
          </div>

          <div
            v-if="selectedPost.excerpt"
            class="p-4 bg-gray-50 border-l-4 border-blue-500 rounded"
            v-html="selectedPost.excerpt"
          ></div>
          <div
            v-if="selectedPost.content"
            class="leading-relaxed space-y-4"
            v-html="selectedPost.content"
          ></div>

          <div v-if="!selectedPost.excerpt && !selectedPost.content" class="text-center p-10 text-gray-600 flex flex-col items-center gap-5">
            <i class="fas fa-file-alt text-5xl text-gray-300"></i>
            <p>Aucun contenu pour ce post</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useTaskStore } from '../store/postStore.js';
import Swal from 'sweetalert2';

export default {
  name: 'PostManager',

  props: {
    categories: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      loading: false,
      submitting: false,
      error: null,
      viewMode: 'columns',
      selectedCategoryFilter: '',
      showCreateModal: false,
      showEditModal: false,
      showViewModal: false,
      selectedPost: null,
      postForm: {
        id: null,
        title: '',
        content: '',
        excerpt: '',
        categoryId: null,
      },
      editingPost: null,
    };
  },

  computed: {
    taskStore() {
      return useTaskStore();
    },
    filteredPosts() {
      if (!this.selectedCategoryFilter) {
        return this.taskStore.tasks;
      }
      return this.taskStore.tasks.filter(post => post.categoryId === parseInt(this.selectedCategoryFilter));
    },
    categoriesWithPosts() {
      return this.categories.map(category => ({
        ...category,
        posts: this.taskStore.tasks.filter(post => post.categoryId === category.id),
      }));
    },
  },

  watch: {
    // Rechargement quand les catégories changent
    categories: {
      handler() {
        this.loadPosts();
      },
      immediate: true,
    },
  },

  async mounted() {
    await this.taskStore.loadTasks();
  },

  methods: {
    /**
     * Charge tous les articles depuis WordPress
     */
    async loadPosts() {
      this.loading = true;
      this.error = null;
      try {
        await this.taskStore.loadTasks();
        this.$emit('posts-loaded', this.taskStore.tasks);
      } catch (err) {
        this.error = 'Impossible de charger les articles';
        console.error('Erreur chargement articles:', err);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualise les données (catégories et articles)
     */
    async refreshData() {
      this.$emit('refresh-categories');
      await this.loadPosts();
    },

    /**
     * Ouvre le modal de création avec une catégorie pré-sélectionnée
     */
    openCreateModal(categoryId = null) {
      this.postForm.categoryId = categoryId;
      this.showCreateModal = true;
    },

    /**
     * Ouvre le modal d'édition pour un article
     */
    editPost(post) {
      this.editingPost = post;
      this.postForm = {
        id: post.id,
        title: post.title,
        content: post.content || '',
        excerpt: post.excerpt || '',
        categoryId: post.categoryId,
      };
      this.showEditModal = true;
      this.showViewModal = false; // Fermer la vue si ouverte
    },

    /**
     * Affiche les détails d'un article
     */
    viewPost(post) {
      this.selectedPost = post;
      this.showViewModal = true;
    },

    /**
     * Confirme la suppression d'un article
     */
    async confirmDeletePost(post) {
      const confirmed = await Swal.fire({
        title: 'Supprimer la carte ?',
        text: `La carte "${post.title}" sera supprimée définitivement.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        reverseButtons: true,
      });

      if (confirmed.isConfirmed) {
        await this.deletePost(post);
      }
    },

    /**
     * Supprime un article
     */
    async deletePost(post) {
      this.loading = true;
      try {
        await this.taskStore.deleteTask(post.id);
        this.$emit('post-deleted', post);
  Swal.fire({
          title: 'Supprimé !',
          text: `La carte "${post.title}" a été supprimée.`,
          icon: 'success',
          timer: 3000,
        });
      } catch (err) {
        this.error = err?.message || 'Erreur lors de la suppression';
        console.error('Erreur suppression article:', err);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Soumet le formulaire d'article (création ou édition)
     */
    async submitPost() {
      if (!this.postForm.title.trim() || !this.postForm.categoryId) {
        return;
      }
      this.submitting = true;
      try {
        if (this.showEditModal) {
          await this.taskStore.updateTask(this.postForm);
          this.$emit('post-updated', this.postForm);
        } else {
          await this.taskStore.addTask(this.postForm);
          this.$emit('post-created', this.postForm);
          // Demande au parent de rafraîchir les catégories
          this.$emit('refresh-categories');
        }
        this.closeModals();
  Swal.fire({
          title: 'Succès !',
          text: `Carte "${this.postForm.title}" ${this.showEditModal ? 'modifiée' : 'créée'} avec succès.`,
          icon: 'success',
          timer: 3000,
        });
      } catch (err) {
        this.error = err?.message || "Erreur lors de l'enregistrement";
        console.error('Erreur soumission article:', err);
      } finally {
        this.submitting = false;
      }
    },

    /**
     * Ferme tous les modals
     */
    closeModals() {
      this.showCreateModal = false;
      this.showEditModal = false;
      this.showViewModal = false;
      this.editingPost = null;
      this.selectedPost = null;
      this.resetForm();
    },

    /**
     * Remet à zéro le formulaire
     */
    resetForm() {
      this.postForm = {
        id: null,
        title: '',
        content: '',
        excerpt: '',
        categoryId: null,
      };
    },

    /**
     * Retourne le nom d'une catégorie par son ID
     */
    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId);
      return category ? category.title : 'Sans colonne';
    },

    /**
     * Formate une date
     */
    formatDate(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    },
  },
};
</script>

