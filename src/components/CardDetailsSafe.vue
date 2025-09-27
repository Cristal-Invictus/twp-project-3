<template>
  <div v-if="isVisible" @click.self="closeModal" class="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 p-4">
    <div class="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
      <!-- Header -->
      <div class="flex flex-col md:flex-row gap-6 p-8 border-b border-gray-200">
        <div class="flex flex-1 gap-5">
          <div :class="['w-14 h-14 rounded-full flex items-center justify-center text-xl text-white shrink-0', currentStatus==='todo' ? 'bg-blue-500' : currentStatus==='in-progress' ? 'bg-amber-500' : 'bg-green-600']">
            <i :class="statusIcon"></i>
          </div>
          <div class="flex-1">
            <h2 v-if="!editingTitle && task" @click="startEditingTitle" class="text-2xl font-semibold text-slate-800 mb-2 cursor-text hover:bg-slate-100 px-1 rounded transition">{{ task && task.title ? task.title.rendered : '' }}</h2>
            <input
              v-else
              v-model="editedTitle"
              @blur="saveTitle"
              @keyup.enter="saveTitle"
              @keyup.esc="cancelTitleEdit"
              ref="titleInput"
              class="w-full text-2xl font-semibold text-slate-800 border-2 border-indigo-400 rounded px-3 py-1 mb-2 focus:outline-none focus:border-indigo-500"
            />
            <div class="flex flex-wrap gap-6 text-sm text-slate-500">
              <span class="flex items-center gap-1"><i class="fas fa-folder text-indigo-500 text-xs"></i>{{ categoryName }}</span>
              <span class="flex items-center gap-1"><i class="fas fa-calendar text-indigo-500 text-xs"></i>Créé le {{ task ? formatDate(task.date) : '' }}</span>
              <span v-if="task && task.modified !== task.date" class="flex items-center gap-1"><i class="fas fa-edit text-indigo-500 text-xs"></i>Modifié le {{ formatDate(task.modified) }}</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4 items-end">
          <label class="text-sm font-medium text-slate-600 flex items-center gap-2">Statut:
            <select v-model="currentStatus" @change="updateStatus" class="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="todo">À faire</option>
              <option value="in-progress">En cours</option>
              <option value="completed">Terminé</option>
            </select>
          </label>
          <button @click="closeModal" class="text-slate-400 hover:text-red-500 transition text-2xl leading-none"><i class="fas fa-times"></i></button>
        </div>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-8 py-6 space-y-10">
        <!-- Description -->
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-800 flex items-center gap-2"><i class="fas fa-align-left text-indigo-500"></i>Description</h3>
            <button
              v-if="!editingDescription"
              @click="startEditingDescription"
              class="border border-slate-300 rounded-lg px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-600 hover:text-white transition"
            ><i class="fas fa-edit mr-1"></i>Modifier</button>
          </div>
          <div v-if="!editingDescription">
            <div
              v-if="task && task.content && task.content.rendered"
              v-html="task.content.rendered"
              class="bg-slate-50 border border-indigo-100 border-l-4 border-l-indigo-400 rounded-lg p-5 leading-relaxed text-sm text-slate-700 shadow-sm"
            ></div>
            <p
              v-else
              @click="startEditingDescription"
              class="text-center text-slate-400 italic p-5 border-2 border-dashed rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-slate-50 transition text-sm"
            ><i class="fas fa-plus mr-1"></i>Ajouter une description...</p>
          </div>
          <div v-else class="space-y-3">
            <textarea
              v-model="editedDescription"
              rows="4"
              ref="descriptionTextarea"
              placeholder="Décrivez cette tâche..."
              class="w-full border-2 rounded-lg p-4 text-sm leading-relaxed focus:outline-none focus:border-indigo-500 resize-y min-h-[120px]"
            ></textarea>
            <div class="flex gap-3">
              <button @click="saveDescription" class="inline-flex items-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 text-sm font-medium shadow-sm"><i class="fas fa-save"></i>Sauvegarder</button>
              <button @click="cancelDescriptionEdit" class="inline-flex items-center gap-2 rounded-lg bg-slate-300 hover:bg-slate-400 text-slate-800 px-5 py-2 text-sm font-medium"><i class="fas fa-times"></i>Annuler</button>
            </div>
          </div>
        </section>

        <!-- Comments -->
        <section class="space-y-6">
          <h3 class="text-lg font-semibold text-slate-800 flex items-center gap-2"><i class="fas fa-comments text-indigo-500"></i>Commentaires <span v-if="comments.length>0" class="ml-1 inline-block bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">{{ comments.length }}</span></h3>
          <div class="space-y-3">
            <div class="space-y-2">
              <textarea
                v-model="newComment"
                rows="3"
                @keydown.ctrl.enter="addComment"
                placeholder="Écrire un commentaire..."
                class="w-full border-2 border-slate-300 rounded-lg p-4 text-sm leading-relaxed focus:outline-none focus:border-indigo-500 resize-y bg-white text-slate-800 placeholder-slate-400"
              ></textarea>
              <div class="flex items-center justify-between">
                <button
                  @click="addComment"
                  :disabled="!newComment.trim() || !task"
                  class="inline-flex items-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 text-sm font-medium shadow-sm"
                ><i class="fas fa-paper-plane"></i>Envoyer</button>
                <small class="text-slate-400 text-xs">Ctrl + Entrée pour envoyer</small>
              </div>
            </div>
            <div>
              <div v-if="loadingComments" class="text-center text-slate-400 py-10"><i class="fas fa-spinner fa-spin text-xl mb-2 block"></i>Chargement des commentaires...</div>
              <div v-else-if="comments.length===0" class="text-center text-slate-400 py-10"><i class="fas fa-comment-slash text-xl mb-2 block"></i>Aucun commentaire pour le moment</div>
              <div v-else class="space-y-4">
                <div v-for="comment in comments" :key="comment.id" class="rounded-lg border border-indigo-100 bg-slate-50 p-4">
                  <div class="flex items-start justify-between gap-4 mb-2">
                    <div class="flex items-center gap-2 text-slate-700 font-medium"><i class="fas fa-user-circle text-indigo-500 text-lg"></i>{{ comment.author_name || 'Utilisateur' }}</div>
                    <div class="text-xs text-slate-400">{{ formatDate(comment.date) }}</div>
                    <div class="flex gap-1">
                      <button v-if="!comment.isEditing" @click="startEditingComment(comment)" title="Modifier" class="p-2 text-indigo-500 hover:bg-indigo-50 rounded transition"><i class="fas fa-edit"></i></button>
                      <button @click="deleteComment(comment.id)" title="Supprimer" class="p-2 text-red-500 hover:bg-red-50 rounded transition"><i class="fas fa-trash"></i></button>
                    </div>
                  </div>
                  <div
                    v-if="!comment.isEditing"
                    v-html="comment.content.rendered"
                    class="comment-html bg-white border border-slate-200 rounded-md p-3 text-sm leading-relaxed text-slate-700"
                    style="color:#334155"
                  ></div>
                  <div v-else class="space-y-2">
                    <textarea
                      v-model="comment.editedContent"
                      rows="3"
                      placeholder="Modifier votre commentaire..."
                      @keydown.ctrl.enter="saveCommentEdit(comment)"
                      @keydown.esc="cancelCommentEdit(comment)"
                      class="w-full border rounded-md p-3 text-sm focus:outline-none focus:border-indigo-500 bg-white text-slate-800 placeholder-slate-400"
                    ></textarea>
                    <div class="flex justify-end gap-2">
                      <button @click="saveCommentEdit(comment)" class="inline-flex items-center gap-2 rounded bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 text-xs font-medium"><i class="fas fa-save"></i>Sauvegarder</button>
                      <button @click="cancelCommentEdit(comment)" class="inline-flex items-center gap-2 rounded bg-slate-300 hover:bg-slate-400 text-slate-800 px-3 py-1.5 text-xs font-medium"><i class="fas fa-times"></i>Annuler</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Footer -->
      <div class="px-8 py-5 border-t border-gray-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button @click="deleteTask" class="inline-flex items-center gap-2 rounded-lg bg-red-500 hover:bg-red-600 text-white px-5 py-2 text-sm font-medium shadow-sm"><i class="fas fa-trash"></i>Supprimer la tâche</button>
        <div class="flex flex-col gap-1 text-xs text-slate-400">
          <span>ID de la carte: {{ task ? task.id : '' }}</span>
          <span class="text-indigo-500 font-medium">Colonne: {{ categoryName }}</span>
        </div>
      </div>
    </div>
  </div>
  <!-- duplicate template removed -->
  </template>
<script>
import postService from '../services/postService.js';
import commentService from '../services/commentService.js';
import Swal from 'sweetalert2';

export default {
  name:'CardDetailsSafe',
  props:{
    isVisible:{type:Boolean,default:false},
    task:{type:Object,default:null},
    categoryName:{type:String,default:'Catégorie inconnue'}
  },
  data(){
    return {
      editingTitle:false,
      editingDescription:false,
      editedTitle:'',
      editedDescription:'',
      currentStatus:'todo',
      comments:[],
      newComment:'',
      loadingComments:false
    };
  },
  computed:{
    statusIcon(){
      const icons={ todo:'fas fa-inbox','in-progress':'fas fa-clock', completed:'fas fa-check-circle'};
      return icons[this.currentStatus]||'fas fa-inbox';
    }
  },
  watch:{
    isVisible:{ immediate:true, handler(v){ if(v && this.task) this.initializeCard(); }},
    task:{ immediate:true, handler(n){ if(n && this.isVisible) this.initializeCard(); }}
  },
  methods:{
    initializeCard(){
      if(!this.task) return;
      this.editedTitle=this.task.title?.rendered||'';
      this.editedDescription=(this.task.content?.rendered||'').replace(/<[^>]*>/g,'');
      this.currentStatus=this.getTaskStatus(this.task);
      this.loadComments();
    },
    getTaskStatus(p){
      if(p.meta && p.meta.task_status) return p.meta.task_status;
      if(p.status==='draft') return 'todo';
      if(p.status==='pending') return 'in-progress';
      if(p.status==='publish') return 'completed';
      return 'todo';
    },
    startEditingTitle(){
      this.editingTitle=true;
      this.$nextTick(()=>{ this.$refs.titleInput.focus(); this.$refs.titleInput.select(); });
    },
    async saveTitle(){
      if(!this.task) return;
      if(this.editedTitle.trim() && this.editedTitle!==this.task.title.rendered){
        try{ await postService.update(this.task.id,{ title:this.editedTitle.trim() }); this.$emit('task-updated',{ ...this.task, title:{ rendered:this.editedTitle.trim() }});}catch(e){ console.error('Erreur titre:',e); Swal.fire('Erreur','Impossible de mettre à jour le titre','error'); }
      }
      this.editingTitle=false;
    },
    cancelTitleEdit(){ this.editedTitle=this.task?.title?.rendered||''; this.editingTitle=false; },
    startEditingDescription(){ this.editingDescription=true; this.$nextTick(()=>{ this.$refs.descriptionTextarea.focus(); }); },
    async saveDescription(){
      if(!this.task) return;
      try{ const updated = await postService.update(this.task.id,{ content:this.editedDescription.trim() }); this.$emit('task-updated', updated.data);}catch(e){ console.error('Erreur description:',e); Swal.fire('Erreur','Impossible de mettre à jour la description','error'); }
      this.editingDescription=false;
    },
    cancelDescriptionEdit(){ this.editedDescription=this.task?.content?.rendered?this.task.content.rendered.replace(/<[^>]*>/g,''):''; this.editingDescription=false; },
    async updateStatus(){
      if(!this.task) return;
      try{ await postService.update(this.task.id,{ meta:{ task_status:this.currentStatus }}); this.$emit('status-changed', this.currentStatus);}catch(e){ console.error('Erreur statut:',e); Swal.fire('Erreur','Impossible de mettre à jour le statut','error'); }
    },
    async loadComments(){
      if(!this.task) return;
      this.loadingComments=true;
      try {
        const r = await commentService.getAll(this.task.id);
        if(r.success){
          this.comments = r.data.map(c=>({
            ...c,
            content: c.content && c.content.rendered ? c.content : { rendered: (typeof c.content === 'string' ? c.content : '') }
          }));
        } else this.comments = [];
      } catch(e){ console.error('Erreur chargement commentaires:',e);} finally { this.loadingComments=false; }
    },
    async addComment(){
      if(!this.newComment.trim() || !this.task) return;
      try {
        const raw = this.newComment.trim();
        const r = await commentService.create({ post:this.task.id, content: raw });
        if(r.success){
          const created = r.data;
          const normalized = { ...created, content: created.content && created.content.rendered ? created.content : { rendered: raw } };
          this.comments.push(normalized);
          this.newComment='';
        } else throw new Error(r.error?.message||'Ajout impossible');
      } catch(e){ console.error('Erreur ajout commentaire:',e); Swal.fire('Erreur',"Impossible d'ajouter le commentaire",'error'); }
    },
    async deleteComment(id){
      const res= await Swal.fire({ title:'Supprimer ce commentaire?', text:'Cette action ne peut pas être annulée', icon:'warning', showCancelButton:true, confirmButtonColor:'#d33', cancelButtonColor:'#3085d6', confirmButtonText:'Supprimer', cancelButtonText:'Annuler' });
      if(res.isConfirmed){
        try{ const r= await commentService.delete(id); if(r.success) this.comments=this.comments.filter(c=>c.id!==id); else throw new Error(r.error?.message||'Suppression impossible'); }
        catch(e){ console.error('Erreur suppression commentaire:',e); Swal.fire('Erreur','Impossible de supprimer le commentaire','error'); }
      }
    },
    startEditingComment(c){ c.editedContent=(c.content?.rendered||'').replace(/<[^>]*>/g,''); c.isEditing=true; this.$forceUpdate(); },
    async saveCommentEdit(c){
      if(!c.editedContent.trim()){ Swal.fire('Erreur','Le commentaire ne peut pas être vide','warning'); return; }
      try { const r= await commentService.update(c.id,{ content:c.editedContent }); if(r.success){ c.content.rendered = r.data.content?.rendered || c.editedContent; c.isEditing=false; delete c.editedContent; this.$forceUpdate(); Swal.fire({ title:'Modifié !', text:'Commentaire mis à jour', icon:'success', timer:2000, showConfirmButton:false }); } else throw new Error(r.error?.message||'Modification impossible'); }
      catch(e){ console.error('Erreur modif commentaire:',e); Swal.fire('Erreur','Impossible de modifier le commentaire','error'); }
    },
    cancelCommentEdit(c){ c.isEditing=false; delete c.editedContent; this.$forceUpdate(); },
    async deleteTask(){
      const res= await Swal.fire({ title:'Supprimer cette tâche?', text:'Cette action supprimera la tâche et tous ses commentaires', icon:'warning', showCancelButton:true, confirmButtonColor:'#d33', cancelButtonColor:'#3085d6', confirmButtonText:'Supprimer définitivement', cancelButtonText:'Annuler' });
      if(res.isConfirmed){
        try{ const r= await postService.delete(this.task.id); if(r.success){ this.$emit('task-deleted', this.task.id); this.closeModal(); } else throw new Error(r.error?.message||'Suppression impossible'); }
        catch(e){ console.error('Erreur suppression tâche:',e); Swal.fire('Erreur','Impossible de supprimer la tâche','error'); }
      }
    },
    closeModal(){ this.$emit('close'); },
    formatDate(d){ const date=new Date(d); return date.toLocaleDateString('fr-FR',{ day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit'}); }
  }
};
</script>
<style scoped>
@keyframes scaleIn { 0% { transform: scale(.9); opacity:0 } 100% { transform: scale(1); opacity:1 } }
.animate-scaleIn { animation: scaleIn .25s ease-out }
/* Ensure rendered comment HTML is readable even with global body color white */
:deep(.comment-html) { color:#334155 !important; }
:deep(.comment-html *) { color:inherit !important; }
:deep(.comment-html p) { margin:0 0 .5rem 0; }
</style>
