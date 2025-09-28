import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

const BASE_URL = 'http://localhost:10003/wp-json/wp/v2';

function authHeaders(){
  try { const authStore = useAuthStore(); if(authStore?.token) return { Authorization:`Bearer ${authStore.token}` }; } catch(e){}
  return {}; // no fallback basic anymore
}

function client(){
  return axios.create({ baseURL: BASE_URL, headers:{ 'Content-Type':'application/json', Accept:'application/json', ...authHeaders() }});
}

function handleError(error) {
  let message = 'Erreur inconnue';
  let status = null;
  let details = null;
  if (error.response) {
    status = error.response.status;
    details = error.response.data;
    switch (status) {
      case 400:
        message = 'Requête invalide'; break;
      case 401:
        message = 'Non autorisé'; break;
      case 403:
        message = 'Accès interdit'; break;
      case 404:
        message = 'Ressource non trouvée'; break;
      case 500:
        message = 'Erreur serveur WordPress'; break;
      default:
        message = `Erreur HTTP ${status}`;
    }
  } else if (error.request) {
    message = "WordPress inaccessible. Vérifiez votre connexion et l'URL WordPress.";
  } else {
    message = error.message;
  }
  return { message, status, details };
}

export default {
  async getAll() {
    try {
  // context=edit nécessite authentification et expose meta.
  // _fields pour limiter la taille de réponse tout en gardant l'essentiel.
  const response = await client().get('/posts?per_page=100&context=edit&_fields=id,title,content,excerpt,categories,meta,author');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur getAll:', error);
      return { success: false, error: handleError(error) };
    }
  },
  async create({ title, content, excerpt, categories, status, meta }) {
    try {
  const response = await client().post('/posts', { title, content, excerpt, categories, status, meta });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur create:', error);
      return { success: false, error: handleError(error) };
    }
  },
  async update(id, { title, content, excerpt, categories, status, meta }) {
    try {
  const response = await client().put(`/posts/${id}`, { title, content, excerpt, categories, status, meta });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur update:', error);
      return { success: false, error: handleError(error) };
    }
  },
  async delete(id) {
    try {
  const response = await client().delete(`/posts/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur delete:', error);
      return { success: false, error: handleError(error) };
    }
  },
};
