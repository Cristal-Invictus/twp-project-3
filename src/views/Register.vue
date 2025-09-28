<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 p-6">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6 border border-slate-200">
      <h1 class="text-2xl font-semibold text-slate-800 flex items-center gap-2"><i class="fas fa-user-plus text-indigo-500"></i> Inscription</h1>
  <form @submit.prevent="submitRegister" class="space-y-4" novalidate>
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">Nom d'utilisateur</label>
          <input v-model="form.username" type="text" class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">Email</label>
          <input v-model="form.email" type="email" class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">Mot de passe</label>
          <input v-model="form.password" type="password" @input="evaluatePassword" class="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required autocomplete="new-password" />
          <div class="mt-1 h-2 w-full bg-slate-200 rounded overflow-hidden" aria-hidden="true">
            <div :class="strengthBarClass" class="h-full transition-all"></div>
          </div>
          <p class="text-[11px] mt-1" :class="strengthTextClass">{{ strengthLabel }}</p>
        </div>
        <!-- Honeypot (doit rester vide) -->
        <div class="hidden">
          <label>Site web</label>
          <input v-model="form.website" type="text" autocomplete="off" tabindex="-1" />
        </div>
  <button :disabled="auth.loading || !canSubmit" class="w-full inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-md text-sm font-medium">
          <i v-if="auth.loading" class="fas fa-spinner fa-spin"></i>
          <span>Créer mon compte</span>
        </button>
  <p v-if="passwordError" class="text-sm text-red-600">{{ passwordError }}</p>
  <p v-if="auth.error" class="text-sm text-red-600">{{ auth.error }}</p>
        <p v-if="success" class="text-sm text-green-600">Compte créé. Redirection...</p>
      </form>
      <div class="text-center text-sm">
        <router-link to="/login" class="text-indigo-600 hover:underline">Déjà un compte ? Se connecter</router-link>
      </div>
    </div>
  </div>
</template>
<script>
import { reactive, ref, computed } from 'vue';
import { useAuthStore } from '../store/authStore.js';
import { useRouter } from 'vue-router';
export default {
  setup(){
    const auth = useAuthStore();
    const router = useRouter();
    const form = reactive({ username:'', email:'', password:'', website:'' });
  const passwordError = ref(null);
  const strength = ref(0);
  const strengthLabel = ref('');

    function evaluatePassword(){
      passwordError.value = null;
      const pwd = form.password || '';
      let s=0;
      if(pwd.length>=10) s++;
      if(/[a-z]/.test(pwd)) s++;
      if(/[A-Z]/.test(pwd)) s++;
  if(/\d/.test(pwd)) s++;
      if(/[^A-Za-z0-9]/.test(pwd)) s++;
      strength.value = s;
      const labels=['Très faible','Faible','Moyen','Bon','Fort','Excellent'];
      strengthLabel.value = labels[s] || 'Très faible';
    }

    const passwordValid = computed(()=>{
      const pwd = form.password || '';
      const ok = pwd.length>=10 && /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /\d/.test(pwd);
      passwordError.value = ok || !pwd ? null : 'Mot de passe insuffisant (min 10 caractères avec a-z, A-Z et un chiffre).';
      return ok;
    });

    const canSubmit = computed(()=>{
      return form.username.trim().length>0 && form.email.trim().length>0 && passwordValid.value;
    });

    function strengthBarClass(){
      const colors=['bg-red-500','bg-orange-500','bg-yellow-500','bg-lime-500','bg-green-600','bg-emerald-700'];
      const width = (strength.value/5)*100;
      return `${colors[strength.value]||'bg-red-500'} ` + `w-[${width}%]`;
    }
    function strengthTextClass(){
      const map=['text-red-600','text-orange-600','text-yellow-600','text-lime-600','text-green-600','text-emerald-600'];
      return map[strength.value]||'text-red-600';
    }

    const submitRegister = async ()=>{
  evaluatePassword(); // passwordValid / canSubmit recalculated automatiquement
      if(!canSubmit.value) return;
      success.value=false;
      const ok = await auth.register(form);
      if(ok){ success.value=true; setTimeout(()=> router.push({ name:'Login', query:{ justRegistered:1 }}), 1200); }
    };
    const success = ref(false);
  return { auth, form, submitRegister, success, evaluatePassword, canSubmit, passwordError, strengthLabel, strengthBarClass, strengthTextClass };
  }
};
</script>
