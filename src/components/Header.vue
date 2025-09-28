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
  </header>
</template>

<script>
export default {
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
