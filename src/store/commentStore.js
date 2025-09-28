import { defineStore } from 'pinia';
import commentService from '../services/commentService.js';
import { useAuthStore } from './authStore.js';

export const useCommentStore = defineStore('commentStore', {
  state: () => ({
    comments: [],
    tree: [],
  }),
  getters:{
    threaded: (s)=> s.tree,
  },
  actions: {
    async loadComments(postId) {
      const response = await commentService.getAll(postId);
      if (response.success) {
        this.comments = response.data;
        this.buildTree();
      }
    },
    async addComment(commentData) {
      const response = await commentService.create({
        post: commentData.post_id,
        content: commentData.content,
        author_name: commentData.author,
        author_email: commentData.email,
        parent: commentData.parent || 0,
      });
      if (response.success) {
        this.comments.push(response.data);
        this.buildTree();
      }
    },
    async updateComment(comment) {
      // Only allow if current user is owner
      const auth = useAuthStore();
      const existing = this.comments.find(c=>c.id===comment.id);
      if(existing && auth.user && existing.author !== auth.user?.id && existing.author_name !== auth.user?.user_display_name) {
        return { success:false, error:{ message:'Accès refusé'} };
      }
      const response = await commentService.update(comment.id, { content: comment.content });
      if (response.success) {
        const idx = this.comments.findIndex(c => c.id === comment.id);
        if (idx !== -1) this.comments[idx] = response.data;
        this.buildTree();
      }
    },
    async deleteComment(id) {
      const auth = useAuthStore();
      const existing = this.comments.find(c=>c.id===id);
      if(existing && auth.user && existing.author !== auth.user?.id && existing.author_name !== auth.user?.user_display_name) {
        return { success:false, error:{ message:'Accès refusé'} };
      }
      const response = await commentService.delete(id);
      if (response.success) {
        this.comments = this.comments.filter(c => c.id !== id);
        this.buildTree();
      }
    },
    buildTree(){
      const byId = new Map();
      this.comments.forEach(c=>{ byId.set(c.id,{ ...c, replies:[] }); });
      const roots = [];
      byId.forEach(c=>{ if(c.parent && byId.has(c.parent)) byId.get(c.parent).replies.push(c); else roots.push(c); });
      // Sort replies chronologically
      const sortRec = list=>{ list.sort((a,b)=> new Date(a.date)-new Date(b.date)); list.forEach(i=> sortRec(i.replies)); };
      sortRec(roots);
      this.tree = roots;
    }
  },
  persist: true,
});
