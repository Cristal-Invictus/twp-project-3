<template>
  <div class="p-6 bg-white rounded-xl shadow-md border border-slate-200 space-y-8">
    <!-- Header -->
    <div v-if="post" class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-200">
      <div>
        <h3 class="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-1">
          <i class="fas fa-comments text-indigo-500"></i>Commentaires : {{ post.title }}
        </h3>
        <span class="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
          <i class="fas fa-comment"></i>{{ commentStore.comments.length }} commentaire(s)
        </span>
      </div>
      <button @click="$emit('close')" class="inline-flex items-center gap-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 text-sm font-medium self-start md:self-auto">
        <i class="fas fa-times"></i> Fermer
      </button>
    </div>

    <!-- Form -->
    <div class="rounded-lg border border-slate-200 bg-slate-50 p-5">
      <form @submit.prevent="submitComment" class="space-y-5 max-w-xl">
        <div>
          <label for="commentAuthor" class="block text-sm font-medium text-slate-700 mb-1">Nom de l'auteur</label>
          <input id="commentAuthor" type="text" v-model="commentForm.author" maxlength="50" placeholder="Votre nom" class="w-full rounded-md border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 text-sm px-3 py-2" />
        </div>
        <div>
          <label for="commentContent" class="block text-sm font-medium text-slate-700 mb-1">Votre commentaire *</label>
            <textarea id="commentContent" v-model="commentForm.content" required maxlength="1000" rows="3" placeholder="Écrivez votre commentaire..." class="w-full rounded-md border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 text-sm resize-y min-h-[90px] px-3 py-2"></textarea>
        </div>
        <div class="flex justify-end">
          <transition name="fade-btn">
            <button v-if="post && post.id" type="submit" :disabled="!commentForm.content.trim() || submitting" class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 text-sm font-medium shadow-sm">
              <i class="fas fa-spinner fa-spin" v-if="submitting"></i>
              <i class="fas fa-comment" v-else></i>
              {{ submitting ? 'Ajout...' : 'Ajouter le commentaire' }}
            </button>
          </transition>
        </div>
      </form>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center gap-3 text-slate-500 py-10 text-sm">
      <i class="fas fa-spinner fa-spin text-lg"></i>
      Chargement des commentaires...
    </div>

    <!-- Error -->
    <div v-if="error" class="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
      <i class="fas fa-exclamation-triangle mt-0.5"></i>
      <div class="flex-1">{{ error }}</div>
      <button @click="error = null" class="text-red-400 hover:text-red-600"><i class="fas fa-times"></i></button>
    </div>

    <!-- Comments list -->
    <div v-if="!loading" class="space-y-5 max-h-[520px] overflow-y-auto pr-1">
      <div v-for="comment in sortedComments" :key="comment.id" class="group border border-slate-200 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition relative">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
          <div class="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <i class="fas fa-user-circle text-indigo-500 text-lg"></i>{{ comment.author || 'Utilisateur anonyme' }}
          </div>
          <div class="flex items-center gap-3 text-xs text-slate-500">
            <span>{{ formatDate(comment.date) }}</span>
            <button @click="confirmDeleteComment(comment)" :disabled="deleting" title="Supprimer le commentaire" class="inline-flex items-center justify-center w-8 h-8 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="prose prose-sm max-w-none text-slate-700 leading-relaxed" v-html="comment.content"></div>
      </div>

      <div v-if="commentStore.comments.length === 0" class="flex flex-col items-center justify-center text-center py-20 text-slate-400">
        <i class="fas fa-comment-slash text-5xl mb-4"></i>
        <p class="font-medium text-slate-600">Aucun commentaire pour cette carte</p>
        <p class="text-sm">Soyez le premier à commenter !</p>
      </div>
    </div>
  </div>
</template>

<script>
import categoryService from '../services/categoryService.js';
import { useCommentStore } from '../store/commentStore.js';
import Swal from 'sweetalert2';

export default {
  name: 'CommentManager',
  props: {
    post: { type: Object, required: true }
  },

  setup() {
    const commentStore = useCommentStore();
    return { commentStore };
  },

  data() {
    return { loading:false, submitting:false, deleting:false, error:null, commentForm:{ content:'', author:'Utilisateur', email:'user@example.com' } };
  },

  computed: {
    sortedComments(){ return [...this.commentStore.comments].sort((a,b)=> new Date(b.date)-new Date(a.date)); }
  },

  async mounted(){ if(this.post && this.post.id) await this.loadComments(); },

  watch: {
    // Recharger les commentaires si l'article change
    'post.id': {
      handler(newId) {
        if (newId) {
          this.loadComments();
        }
      },
      immediate: true,
    },
  },

  methods: {
    /**
     * Charge les commentaires de l'article
     */
    async loadComments() {
      if (!this.post || !this.post.id) {
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        await this.commentStore.loadComments(this.post.id);
        this.$emit('comments-loaded', {
          postId: this.post.id,
          comments: this.commentStore.comments,
        });
      } catch (err) {
        this.error = 'Impossible de charger les commentaires';
        console.error('Erreur chargement commentaires:', err);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Soumet un nouveau commentaire
     */
    async submitComment() {
      if (!this.commentForm.content.trim()) return;
      this.submitting = true; this.error = null;
      try {
        const commentData = { content:this.commentForm.content, author:this.commentForm.author||'Utilisateur', email:this.commentForm.email, post_id:this.post.id };
        await this.commentStore.addComment(commentData);
        this.commentForm.content='';
        this.$emit('comment-created',{ postId:this.post.id, comment:this.commentStore.comments[this.commentStore.comments.length-1] });
        Swal.fire({ title:'Commentaire ajouté !', text:'Votre commentaire a été publié avec succès.', icon:'success', timer:3000, toast:true, position:'top-end', showConfirmButton:false });
      } catch (err) { this.error='Erreur lors de l\'ajout du commentaire'; console.error('Erreur ajout commentaire:',err); } finally { this.submitting=false; }
    },

    async confirmDeleteComment(comment){
      const confirmed = await Swal.fire({ title:'Supprimer le commentaire ?', text:'Cette action est irréversible.', icon:'warning', showCancelButton:true, confirmButtonColor:'#d33', cancelButtonColor:'#3085d6', confirmButtonText:'Oui, supprimer', cancelButtonText:'Annuler', reverseButtons:true });
      if(confirmed.isConfirmed) await this.deleteComment(comment);
    },

    async deleteComment(comment){
      this.deleting=true; this.error=null;
      try { await this.commentStore.deleteComment(comment.id); this.$emit('comment-deleted',{ postId:this.post.id, commentId:comment.id }); Swal.fire({ title:'Supprimé !', text:'Le commentaire a été supprimé.', icon:'success', timer:3000, toast:true, position:'top-end', showConfirmButton:false }); }
      catch(err){ this.error=err.message; console.error('Erreur suppression commentaire:',err); }
      finally { this.deleting=false; }
    },

    formatDate(dateString){
      const date=new Date(dateString); const now=new Date(); const diff=now-date;
      if(diff<3600000){ const m=Math.floor(diff/60000); return `Il y a ${m} minute${m>1?'s':''}`; }
      if(diff<86400000){ const h=Math.floor(diff/3600000); return `Il y a ${h} heure${h>1?'s':''}`; }
      if(diff<604800000){ const d=Math.floor(diff/86400000); return `Il y a ${d} jour${d>1?'s':''}`; }
      return new Intl.DateTimeFormat('fr-FR',{ day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'}).format(date);
    },

    async refreshComments(){ await this.loadComments(); }
  }
};
</script>


<style scoped>
@keyframes fa-spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
.fade-btn-enter-active, .fade-btn-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.fade-btn-enter-from, .fade-btn-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.fade-btn-enter-to, .fade-btn-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>

.comment-form-section {
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.comment-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.comments-list {
  max-height: 500px;
  overflow-y: auto;
}

.comment-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background: white;
  transition: all 0.2s;
}

.comment-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.comment-header-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.comment-author i {
  color: #007bff;
  font-size: 16px;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.comment-date {
  font-size: 12px;
  color: #666;
}

.comment-content {
  line-height: 1.6;
  color: #444;
  font-size: 14px;
}

.comment-content p {
  margin: 0;
}

.btn-icon {
  background: none;
  border: none;
  padding: 4px 6px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  color: #999;
}

.btn-icon:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.1);
}

.btn-delete {
  color: #dc3545;
}

.btn-delete:hover:not(:disabled) {
  background: rgba(220, 53, 69, 0.1);
}

.no-comments {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-comments i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #ddd;
}

.no-comments p {
  margin: 5px 0;
}

.loading-spinner {
  text-align: center;
  padding: 30px;
  color: #666;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

/* Styles des boutons */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

/* Animation spinner */
.fa-spin {
<!-- legacy styles removed -->
