<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 p-6">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6 border border-slate-200">
      <h1 class="text-2xl font-semibold text-slate-800 flex items-center gap-2"><i class="fas fa-lock text-indigo-500"></i> Connexion</h1>

      <form @submit.prevent="submitLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">Nom d'utilisateur</label>
          <input v-model="loginForm.username" type="text" class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">Mot de passe</label>
          <input v-model="loginForm.password" type="password" class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <button :disabled="auth.loading" class="w-full inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-md text-sm font-medium">
          <i v-if="auth.loading" class="fas fa-spinner fa-spin"></i>
          <span v-else>Se connecter</span>
        </button>
        <p v-if="auth.error" class="text-sm text-red-600">{{ auth.error }}</p>
      </form>

      <div class="pt-2 border-t border-slate-200 text-center text-sm">
        <router-link to="/register" class="text-indigo-600 hover:underline">Première fois ? Créer un compte</router-link>
      </div>
    </div>
  </div>
</template>
<script>
import { reactive, ref } from 'vue';
import { useAuthStore } from '../store/authStore.js';
import { useRouter } from 'vue-router';
export default {
  setup(){
    const auth = useAuthStore();
    const router = useRouter();
    const loginForm = reactive({ username:'', password:'' });
  const submitLogin = async ()=>{ const ok = await auth.login(loginForm); if(ok){ const redirect = router.currentRoute.value.query.redirect || '/'; router.push(redirect); } };
  return { auth, loginForm, submitLogin };
  }
};
</script>
