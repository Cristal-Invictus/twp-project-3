import { defineStore } from 'pinia';
import authService from '../services/authService.js';

const STORAGE_KEY = 'app_auth_state_v1';

function loadPersisted(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch(e){ return {}; }
}
function persist(state){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ token:state.token, user:state.user })); } catch(e){}
}
function isExpired(decoded){
  if(!decoded?.exp) return false; // treat as not expired if no exp
  const now = Math.floor(Date.now()/1000);
  return decoded.exp <= now + 30; // consider expired or within 30s window
}

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    token: null,
    user: null,
    loading:false,
    error:null,
    initialized:false,
    validating:false,
  }),
  getters:{
    isAuthenticated: (s)=> !!s.token && !isExpired(s.user?.decoded),
    username:(s)=> s.user?.user_display_name || s.user?.username,
    exp: (s)=> s.user?.decoded?.exp || null,
  },
  actions:{
    init(){
      if(this.initialized) return;
      const { token, user } = loadPersisted();
      this.token = token || null;
      this.user = user || null;
      this.initialized = true;
    },
    async login(credentials){
      this.loading=true; this.error=null;
      const res = await authService.login(credentials);
      if(res.success){ this.token = res.data.token; this.user = res.data; persist(this); }
      else { this.error=res.error?.message; }
      this.loading=false; return res.success;
    },
    async validateIfNeeded(){
      if(!this.token) return false;
      if(isExpired(this.user?.decoded)) { await this.logout(); return false; }
      // optional remote validation once per load
      if(this.validating) return true;
      this.validating = true;
      const res = await authService.validate(this.token);
      this.validating = false;
      if(!res.success){ await this.logout(); return false; }
      return true;
    },
    async logout(){
      this.token=null; this.user=null; this.error=null; persist(this);
    },
    async register(payload){
      this.loading=true; this.error=null;
      const res = await authService.register(payload);
      if(res.success){
        if(res.data?.token){ this.token = res.data.token; this.user = res.data; persist(this); }
      } else {
        this.error = res.error?.message;
      }
      this.loading=false; return res.success;
    }
  }
});
