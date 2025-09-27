<template>
  <div class="min-h-screen bg-gradient-to-br from-board-gradientFrom via-board-gradientVia to-board-gradientTo py-8 px-4">
    <h1 class="text-4xl font-bold text-center text-white mb-8 tracking-wide uppercase drop-shadow">Vos tableaux</h1>

  <main class="flex overflow-x-auto gap-6 px-4 pb-16" style="scrollbar-width:thin; --board-col-width:320px;">
      <div
        class="rounded-xl shadow-column p-4 w-80 min-w-[320px] flex flex-col gap-4 bg-column-bg/95 border border-column-border backdrop-blur-sm"
        v-for="(board, index) in boards"
        :key="index"
      >
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-lg font-semibold text-white">{{ board.title }}</h3>
          <div class="flex gap-2">
            <button @click="addTask(board.name)" class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition shadow">
              <i class="fas fa-plus"></i>
            </button>
            <button @click="deleteCategory(board.id)" class="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition shadow">
              <i class="fas fa-trash"></i>
            </button>
            <button @click="editCategory(board.id)" class="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-2 transition shadow">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>

        <draggable
          class="drag-container min-h-[120px]"
          :list="board.tasks"
          group="trello"
          itemKey="id"
          @start="handleDragStart(board.name)"
          @end="handleDrop(board.name, $event)"
        >
          <template #item="{ element: task, index }">
            <div
              class="task rounded-lg shadow-card p-3 mb-3 flex flex-col gap-2 cursor-pointer bg-card-bg hover:bg-card-hover transition border border-card-border"
              @click="openTaskDetails(task, board)"
            >
              <h3 class="text-base font-medium text-white">{{ task.title && task.title.rendered ? task.title.rendered : (task.title || task.text) }}</h3>
              <div class="flex gap-2 mt-2">
                <button @click.stop="deleteTask(board.name, index)" class="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition shadow">
                  <i class="fas fa-trash"></i>
                </button>
                <button @click.stop="editTask(board.name, index)" class="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 transition shadow">
                  <i class="fas fa-edit"></i>
                </button>
              </div>
            </div>
          </template>
        </draggable>
      </div>

    <!-- Colonne spéciale ultra-compacte (une seule ligne) -->
  <div class="self-start bg-column-bg/60 backdrop-blur-sm rounded-lg shadow-column px-2 py-2 w-[var(--add-col-width)] min-w-[var(--add-col-width)] border border-column-border flex items-center" style="--add-col-width:200px;">
        <form @submit.prevent="handleInlineAddCategory" class="flex items-center w-full gap-1">
          <input v-model="newCategoryName" type="text" placeholder="Nouvelle catégorie" class="flex-1 px-2 py-1 rounded-md border border-column-border focus:outline-none focus:ring-2 focus:ring-accent-blue/70 text-[11px] bg-card-bg text-white placeholder:text-accent-blue/70" maxlength="32" />
          <button type="submit" class="bg-accent-blue hover:bg-accent-blue/80 text-white rounded-md h-7 w-7 flex items-center justify-center text-[11px] transition" :disabled="!newCategoryName.trim()" :class="{'opacity-50 cursor-not-allowed': !newCategoryName.trim()}">
            <i class="fas fa-plus"></i>
          </button>
        </form>
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
  setup() {
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
        console.log(`🎯 Board: Mise à jour catégorie ID: ${category.id} avec nouveau nom: "${newTitle}"`);
        
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
      // Correction: extraire le titre et le contenu correctement
      const titleValue = task.title?.rendered || task.title || '';
      // Nettoyer le contenu HTML pour l'édition
      let contentValue = '';
      if (task.content?.rendered) {
        // Supprime les balises HTML
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
        
        // 2. Sauvegarde sur WordPress en arrière-plan
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
            // Annuler la mise à jour optimiste en rechargeant depuis WordPress
            await categoryStore.loadCategories();
          }
        } catch (error) {
          console.error('Erreur de sauvegarde:', error);
          // Annuler la mise à jour optimiste en rechargeant depuis WordPress
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
  // Inline add category form
  newCategoryName,
  addCategoryError,
  handleInlineAddCategory,
    };
   
  },
};
</script>

<style>
.btn-create-category {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #3498db;
  color: white;
  border: none;
  padding: 15px 20px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.btn-create-category:hover {
  background-color: #2980b9;
  transform: scale(1.1);
}

.board-view .btn-delete {
  color: white;
  margin-left: 10px;
  background-color: red;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.board-view .btn-delete:hover {
  background-color: darkred;
}

.btn-edit-category {
  margin-left: 10px;
  background-color: #f39c12;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-edit-category:hover {
  background-color: #e67e22;
}

.btn-edit-task {
  margin-left: 10px;
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-edit-task:hover {
  background-color: #27ae60;
}
</style>
