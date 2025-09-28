<template>
  <div id="app" class="app-background">
    <Header @search="onSearch" />
    <transition name="slide" mode="out-in">
      <router-view :searchQuery="searchQuery" @search="onSearch" />
    </transition>
  </div>
</template>

<script>
import Header from './components/Header';

export default {
  components: {
    Header,
  },
  data() {
    return {
      searchQuery: '',
    };
  },
  methods: {
    onSearch(query) {
      this.searchQuery = query;
    },
  },
};
</script>
