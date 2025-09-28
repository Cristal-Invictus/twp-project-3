<template>
  <div class="page-container" :style="backgroundStyle">
    <h1 class="page-title">Vos tableaux</h1>

    <main class="main-container">
      <div class="boards-wrapper">
        <div
          class="board-column"
          v-for="(board, index) in filteredBoards"
          :key="board.id || index"
        >
          <div class="board-header">
            <h3 class="board-title">{{ board.title }}</h3>
            <div class="board-actions">
              <button @click="addTask(board.name)" class="btn btn-add">
                <i class="fas fa-plus"></i>
              </button>
              <button @click="deleteCategory(board.id)" class="btn btn-delete">
                <i class="fas fa-trash"></i>
              </button>
              <button @click="editCategory(board.id)" class="btn btn-edit">
                <i class="fas fa-edit"></i>
              </button>
            </div>
          </div>

          <div class="tasks-container">
            <div
              class="task-card"
              v-for="(task, taskIndex) in board.tasks"
              :key="task.id || taskIndex"
              @click="openTaskDetails(task, board)"
            >
              <h4 class="task-title">{{ task.title && task.title.rendered ? task.title.rendered : (task.title || task.text) }}</h4>
              <div class="task-actions">
                <button @click.stop="deleteTask(board.name, taskIndex)" class="btn btn-small btn-delete">
                  <i class="fas fa-trash"></i>
                </button>
                <button @click.stop="editTask(board.name, taskIndex)" class="btn btn-small btn-success">
                  <i class="fas fa-edit"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="add-category-column">
          <form @submit.prevent="handleInlineAddCategory" class="add-category-form">
            <input 
              v-model="newCategoryName" 
              type="text" 
              placeholder="Nouvelle catégorie" 
              class="category-input" 
              maxlength="32" 
            />
            <button 
              type="submit" 
              class="btn btn-add btn-small"
              :disabled="!newCategoryName.trim()"
            >
              <i class="fas fa-plus"></i>
            </button>
          </form>
        </div>
      </div>
    </main>

    <CardDetails
      v-if="showTaskModal"
      :task="selectedTask"
      :categoryName="selectedCategory ? selectedCategory.title : 'Catégorie inconnue'"
      :isVisible="showTaskModal"
      @closeModal="closeTaskDetails"
    />
  </div>
</template>

<script>
import CardDetails from '../components/CardDetails.vue';
import draggable from 'vuedraggable';
import { useCategoryStore } from '../store/categoryStore';
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import Swal from 'sweetalert2';
import postService from '../services/postService.js';

export default {
  components: {
    draggable,
    CardDetails,
  },
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  setup(props, { emit }) {
      const backgrounds = [
      new URL('@/assets/images/bg1.jpg', import.meta.url).href,
      new URL('@/assets/images/bg2.jpg', import.meta.url).href,
      new URL('@/assets/images/bg3.jpg', import.meta.url).href,
      new URL('@/assets/images/bg7.jpg', import.meta.url).href,
      new URL('@/assets/images/bg5.jpg', import.meta.url).href,
      new URL('@/assets/images/bg6.jpg', import.meta.url).href,
      new URL('@/assets/images/bg7.jpg', import.meta.url).href,
      new URL('@/assets/images/bg8.jpg', import.meta.url).href
    ];
    const backgroundUrl = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const backgroundStyle = computed(() => ({
      backgroundImage: `url('${backgroundUrl}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }));
    const showTaskModal = ref(false);
    const selectedTask = ref(null);
    const selectedCategory = ref(null);

    function openTaskDetails(task, board) {
      selectedTask.value = task;
      selectedCategory.value = board;
      showTaskModal.value = true;
    }
    function closeTaskDetails() {
      showTaskModal.value = false;
      selectedTask.value = null;
      selectedCategory.value = null;
    }
    const categoryStore = useCategoryStore();
    categoryStore.loadCategories().then(() => {
      console.log('Catégories chargées:', categories.value);
    });
    const { categories } = storeToRefs(categoryStore);
    const boards = computed(() =>
      categories.value.map(cat => ({
        ...cat,
        title: cat.title || cat.name,
        tasks: cat.tasks || []
      }))
    );

    const filteredBoards = computed(() => {
      if (!props.searchQuery || !props.searchQuery.trim()) return boards.value;
      const query = props.searchQuery.trim().toLowerCase();
      return boards.value.filter(b => (b.title || "").toLowerCase().includes(query));
    });

    // Remove local search state and handler

    const newCategoryName = ref("");
    const addCategoryError = ref("");
    const handleInlineAddCategory = async () => {
      addCategoryError.value = "";
      const name = newCategoryName.value.trim();
      if (!name) {
        addCategoryError.value = "Le nom est obligatoire.";
        return;
      }
      if (name.length > 32) {
        addCategoryError.value = "32 caractères max.";
        return;
      }
      await categoryStore.addCategory({ name });
      await categoryStore.loadCategories();
      newCategoryName.value = "";
    };

    const editCategory = async categoryId => {
      const category = categories.value.find(cat => cat.id === categoryId);
      if (!category) return;
      const { value: newTitle } = await Swal.fire({
        title: 'Modifier le nom de la catégorie',
        input: 'text',
        inputValue: category.title,
        showCancelButton: true,
        confirmButtonText: 'Modifier',
        cancelButtonText: 'Annuler',
        inputValidator: value => {
          if (!value) return 'Le nom de la catégorie est obligatoire';
        },
      });
      if (newTitle) {
        console.log(` Board: Mise à jour catégorie ID: ${category.id} avec nouveau nom: "${newTitle}"`);
        
        const updatePayload = {
          id: category.id,
          name: newTitle,
          slug: category.slug || newTitle.toLowerCase().replace(/\s+/g, '-'),
          description: category.description || ''
        };
  console.log(`🎯 Board: Payload d'update:`, updatePayload);
        
        const updateResult = await categoryStore.updateCategory(updatePayload);
        console.log(`🎯 Board: Résultat update:`, updateResult);
        
        await categoryStore.loadCategories();
        console.log(`🎯 Board: Catégories rechargées après update`);
        
        if (updateResult.success) {
          Swal.fire('Succès', 'Nom de la catégorie modifié avec succès', 'success');
        } else {
          Swal.fire('Erreur', updateResult.error?.message || 'Erreur lors de la mise à jour', 'error');
        }
      }
    };

    const deleteCategory = async categoryId => {
      const category = categories.value.find(cat => cat.id === categoryId);
      if (!category) return;
      const confirmation = await Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: `Voulez-vous vraiment supprimer la catégorie "${category.title}" ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
      });
      if (confirmation.isConfirmed) {
        console.log(`🎯 Board: Début de suppression catégorie ID: ${categoryId}`);
        
        const deleteResult = await categoryStore.deleteCategory(categoryId);
        console.log(`🎯 Board: Résultat suppression:`, deleteResult);
        
        await categoryStore.loadCategories();
        console.log(`🎯 Board: Catégories rechargées`);
        
        if (deleteResult.success) {
          Swal.fire('Succès', 'Catégorie supprimée avec succès', 'success');
        } else {
          Swal.fire('Erreur', deleteResult.error?.message || 'Erreur lors de la suppression', 'error');
        }
      }
    };

    const addTask = async boardName => {
      const category = boards.value.find(board => board.name === boardName);
      if (!category) {
        Swal.fire('Erreur', 'Catégorie introuvable', 'error');
        return;
      }
      const { value: formValues } = await Swal.fire({
        title: 'Créer un post',
        html:
          `<input id="task-title" class="swal2-input" placeholder="Titre">` +
          `<textarea id="task-content" class="swal2-textarea" placeholder="Description"></textarea>`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Créer',
        cancelButtonText: 'Annuler',
        preConfirm: () => {
          const title = document.getElementById('task-title').value;
          const content = document.getElementById('task-content').value;
          if (!title) {
            Swal.showValidationMessage('Le titre est obligatoire');
          }
          return { title, content };
        },
      });
      if (formValues) {
          const response = await postService.create({
            title: formValues.title,
            content: formValues.content,
            categories: [category.id],
            status: 'publish',
          });
        if (response.success) {
          await categoryStore.loadCategories();
          Swal.fire(
            'Succès',
            'Post créé avec succès',
            'success'
          );
        } else {
          Swal.fire(
            'Erreur',
            response.error?.message || 'Erreur lors de la création de la tâche',
            'error'
          );
        }
      }
    };

    const editTask = async (boardName, taskIndex) => {
      const category = boards.value.find(board => board.name === boardName);
      if (!category) {
        Swal.fire('Erreur', 'Catégorie introuvable', 'error');
        return;
      }
      const task = category.tasks[taskIndex];
      const titleValue = task.title?.rendered || task.title || '';
      let contentValue = '';
      if (task.content?.rendered) {
        const tmp = document.createElement('div');
        tmp.innerHTML = task.content.rendered;
        contentValue = tmp.textContent || tmp.innerText || '';
      } else {
        contentValue = task.content || '';
      }
      const { value: formValues } = await Swal.fire({
        title: 'Modifier le post',
        html:
          `<input id="task-title" class="swal2-input" placeholder="Titre" value="${titleValue}">` +
          `<textarea id="task-content" class="swal2-textarea" placeholder="Description">${contentValue}</textarea>`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Modifier',
        cancelButtonText: 'Annuler',
        preConfirm: () => {
          const title = document.getElementById('task-title').value;
          const content = document.getElementById('task-content').value;
          if (!title) {
            Swal.showValidationMessage('Le titre est obligatoire');
          }
          return { title, content };
        },
      });
      if (formValues) {
        const response = await postService.update(task.id, {
          title: formValues.title,
          content: formValues.content,
          categories: [category.id],
        });
        if (response.success) {
          await categoryStore.loadCategories();
          Swal.fire(
            'Succès',
            'Tâche modifiée avec succès',
            'success'
          );
        } else {
          Swal.fire(
            'Erreur',
            response.error?.message || 'Erreur lors de la modification de la tâche',
            'error'
          );
        }
      }
    };

    const deleteTask = async (boardName, taskIndex) => {
      const category = boards.value.find(board => board.name === boardName);
      if (!category) {
        Swal.fire('Erreur', 'Catégorie introuvable', 'error');
        return;
      }
      const task = category.tasks[taskIndex];
      const confirmation = await Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: `Voulez-vous vraiment supprimer la tâche "${task.text}" ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
      });
      if (confirmation.isConfirmed) {
        const response = await postService.delete(task.id);
        if (response.success) {
          await categoryStore.loadCategories();
          Swal.fire(
            'Succès',
            'Tâche supprimée avec succès',
            'success'
          );
        } else {
          Swal.fire(
            'Erreur',
            response.error?.message || 'Erreur lors de la suppression de la tâche',
            'error'
          );
        }
      }
    };

    const dragSourceLane = ref(null);

    const handleDragStart = lane => {
      dragSourceLane.value = lane;
    };

    const handleDrop = async (lane, dropResult) => {
      if (!dropResult || (dropResult.removedIndex == null && dropResult.addedIndex == null)) return;
      const sourceCategory = boards.value.find(board => board.name === dragSourceLane.value);
      const targetCategory = boards.value.find(board => board.name === lane);
      if (!sourceCategory || !targetCategory) return;
      
      let movedTask = null;
      if (dropResult.removedIndex != null) {
        movedTask = sourceCategory.tasks.splice(dropResult.removedIndex, 1)[0];
      }
      
      if (dropResult.addedIndex != null && movedTask) {

        
        targetCategory.tasks.splice(dropResult.addedIndex, 0, movedTask);
        
        try {
          console.log('[DEBUG] Drag & Drop:', {
  postId: movedTask.id,
  newCategoryId: targetCategory.id,
  payload: { categories: [targetCategory.id] },
  movedTask,
  targetCategory
});
const updateResult = await postService.update(movedTask.id, {
  categories: [targetCategory.id]
});
console.log('[DEBUG] Réponse API WordPress:', updateResult);
          
          if (updateResult.success) {
            console.log('Sauvegarde WordPress reussie, deplacement persiste!');
          } else {
            console.error('Erreur WordPress, rechargement des categories');
            await categoryStore.loadCategories();
          }
        } catch (error) {
          console.error('Erreur de sauvegarde:', error);
          await categoryStore.loadCategories();
        }
      } else if (movedTask) {
        sourceCategory.tasks.splice(dropResult.removedIndex, 0, movedTask);
      }
      
      dragSourceLane.value = null;
    };

    const getChildPayload = index => {
      return { index };
    };

    return {
      boards,
      filteredBoards,
      editCategory,
      deleteCategory,
      addTask,
      editTask,
      deleteTask,
      getChildPayload,
      handleDragStart,
      handleDrop,
      showTaskModal,
      selectedTask,
      selectedCategory,
      openTaskDetails,
      closeTaskDetails,
      newCategoryName,
      addCategoryError,
      handleInlineAddCategory,
      backgroundStyle,
    };
   
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
}

.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
  padding: 32px 16px;
}

.page-title {
  font-size: 2.25rem;
  font-weight: bold;
  text-align: center;
  color: white;
  margin-bottom: 32px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}
  
@media (max-width: 1024px) {
  .page-container {
    padding: 12px 4px;
  }
  .main-container {
    padding: 0 4px 40px;
  }
  .boards-wrapper {
    gap: 16px;
  }
  .board-column {
    min-width: 60vw;
    max-width: 90vw;
    padding: 12px;
  }
  .add-category-column {
    min-width: 60vw;
    max-width: 90vw;
    padding: 6px;
  }
}

/* Container principal des boards */
.main-container {
  overflow-x: auto;
  padding: 0 16px 64px;
}

.boards-wrapper {
  display: flex;
  gap: 24px;
  min-width: 0;
  flex-wrap: wrap;
  align-items: flex-start;
}

.board-column {
  min-width: 280px;
  width: 100%;
  max-width: 400px;
  background: rgba(30, 58, 138, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  flex-shrink: 0;
}

.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.board-title {
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  margin-right: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.board-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100px;
}

.task-card {
  background: rgba(30, 58, 138, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-card:hover {
  background: rgba(37, 99, 235, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.task-title {
  color: white;
  font-size: 1rem;
  font-weight: 500;
  word-break: break-words;
  line-height: 1.4;
}

.task-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.add-category-column {
  min-width: 250px;
  width: max-content;
  max-width: 350px;
  background: rgba(30, 58, 138, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 8px;
  padding: 8px;
  backdrop-filter: blur(8px);
  flex-shrink: 0;
  align-self: flex-start;
}

.add-category-form {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.category-input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 6px;
  background: rgba(30, 58, 138, 1);
  color: white;
  font-size: 0.75rem;
  outline: none;
  transition: all 0.2s ease;
}

.category-input:focus {
  border-color: rgba(59, 130, 246, 0.8);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.category-input::placeholder {
  color: rgba(147, 197, 253, 0.7);
}

.btn {
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  font-size: 0.875rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: scale(1.05);
}

.btn:active {
  transform: scale(0.95);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.btn-add {
  background-color: #2563eb;
}

.btn-add:hover {
  background-color: #1d4ed8;
}

.btn-delete {
  background-color: #dc2626;
}

.btn-delete:hover {
  background-color: #b91c1c;
}

.btn-edit {
  background-color: #eab308;
}

.btn-edit:hover {
  background-color: #ca8a04;
}

.btn-success {
  background-color: #16a34a;
}

.btn-success:hover {
  background-color: #15803d;
}

.fade-board-enter-active, .fade-board-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-board-enter-from, .fade-board-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.fade-task-enter-active, .fade-task-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-task-enter-from, .fade-task-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.97);
}

.main-container::-webkit-scrollbar {
  height: 8px;
}

.main-container::-webkit-scrollbar-track {
  background: rgba(30, 58, 138, 0.3);
  border-radius: 4px;
}

.main-container::-webkit-scrollbar-thumb {
  background: rgba(30, 58, 138, 0.8);
  border-radius: 4px;
}

.main-container::-webkit-scrollbar-thumb:hover {
  background: rgba(30, 58, 138, 1);
}

@media (max-width: 768px) {
  .page-container {
    padding: 8px 2px;
  }

  .page-title {
    font-size: 1.25rem;
    margin-bottom: 12px;
    text-align: center;
  }

  .main-container {
    padding: 0 2px 32px;
    overflow-x: auto;
  }

  .boards-wrapper {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .board-column {
    min-width: 90vw;
    max-width: 98vw;
    width: 100%;
    margin: 0 auto;
    padding: 8px;
  }

  .board-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .board-title {
    font-size: 1rem;
    margin-right: 0;
    margin-bottom: 4px;
    text-align: left;
  }

  .board-actions {
    gap: 4px;
  }

  .tasks-container {
    gap: 8px;
    min-height: 60px;
  }

  .task-card {
    padding: 8px;
    font-size: 0.95rem;
  }

  .task-title {
    font-size: 0.95rem;
  }

  .add-category-column {
    min-width: 80vw;
    max-width: 95vw;
    padding: 4px;
    margin: 0 auto;
  }

  .add-category-form {
    flex-direction: column;
    gap: 4px;
    align-items: stretch;
  }

  .category-input {
    font-size: 0.85rem;
    padding: 4px 6px;
  }

  .btn, .btn-small {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
}
@media (max-width: 480px) {
  .page-title {
    font-size: 1rem;
    margin-bottom: 8px;
  }
  .board-column {
    min-width: 98vw;
    max-width: 100vw;
    padding: 4px;
  }
  .add-category-column {
    min-width: 98vw;
    max-width: 100vw;
    padding: 2px;
  }
  .task-title {
    font-size: 0.85rem;
  }
}
</style>