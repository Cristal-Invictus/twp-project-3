import { defineStore } from 'pinia';
import commentService from '../services/commentService.js';

export const useCommentStore = defineStore('commentStore', {
  state: () => ({
    comments: [],
  }),
  actions: {
    async loadComments(postId) {
      const response = await commentService.getAll(postId);
      if (response.success) {
        this.comments = response.data;
      }
    },
    async addComment(commentData) {
      const response = await commentService.create({
        post: commentData.post_id,
        content: commentData.content,
        author_name: commentData.author,
        author_email: commentData.email,
      });
      if (response.success) {
        this.comments.push(response.data);
      }
    },
    async updateComment(comment) {
      const response = await commentService.update(comment.id, { content: comment.content });
      if (response.success) {
        const idx = this.comments.findIndex(c => c.id === comment.id);
        if (idx !== -1) this.comments[idx] = response.data;
      }
    },
    async deleteComment(id) {
      const response = await commentService.delete(id);
      if (response.success) {
        this.comments = this.comments.filter(c => c.id !== id);
      }
    },
  },
  persist: true,
});
