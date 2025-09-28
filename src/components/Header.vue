<template>
  <header class="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 shadow-lg px-6 py-2 flex items-center justify-between">
    <div class="flex items-center justify-center w-full gap-4">
      <div class="flex items-center gap-2">
        <i class="fas fa-th-large text-white text-2xl"></i>
        <span class="text-white text-xl font-bold tracking-wide">Task Manager</span>
      </div>
      <div class="flex-1 flex justify-center">
        <input
          type="text"
          v-model="search"
          @input="onSearch"
          placeholder="Rechercher un tableau..."
          class="bg-blue-950/80 text-white placeholder:text-blue-300 rounded-md px-4 py-1 w-80 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-blue-800 text-center"
        />
      </div>
    </div>
    <div class="flex items-center gap-4">
      <router-link to="/" class="hover:underline text-sm">Board</router-link>
  <router-link v-if="!auth.isAuthenticated" to="/login" class="hover:underline text-sm">Login</router-link>
  <router-link v-if="!auth.isAuthenticated" to="/register" class="hover:underline text-sm">Register</router-link>
      <div v-else class="flex items-center gap-3 text-sm">
        <span class="inline-flex items-center gap-1 bg-white/15 px-2 py-1 rounded"> <i class="fas fa-user"></i> {{ auth.username }} </span>
        <button @click="logout" class="bg-white/20 hover:bg-white/30 px-3 py-1 rounded">Logout</button>
      </div>
    </div>
  </header>
</template>

<script>
import { useAuthStore } from '../store/authStore.js';
export default {
  setup(){
    const auth = useAuthStore();
    const logout = ()=> auth.logout();
    return { auth, logout };
  },
  data() {
    return {
      search: '',
    };
  },
  methods: {
    onSearch() {
      this.$emit('search', this.search);
    },
  },
};
</script>

<style scoped>
.header {
  /* plus utilisé, tout est Tailwind */
}
</style>
