<template>
  <div id="app" class="app-background">
    <Header> </Header>
    <transition name="slide" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script>
import Header from './components/Header';

export default {
  components: {
    Header,
  },
};
</script>
