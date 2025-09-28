import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

const BASE_URL = 'http://localhost:10003/wp-json/wp/v2';

function authHeaders(){
  try { const authStore = useAuthStore(); if(authStore?.token) return { Authorization:`Bearer ${authStore.token}` }; } catch(e){}
  return {}; // no fallback basic
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
  // Ajouter context=edit pour tenter de récupérer la meta si l'utilisateur est authentifié
  // _fields pour limiter la payload et inclure meta
  const response = await client().get('/categories?per_page=100&orderby=id&order=asc&context=edit&_fields=id,name,slug,description,meta');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur getAll:', error);
      return { success: false, error: handleError(error) };
    }
  },
  async create({ name, slug, description, meta }) {
    try {
      const payload = { name };
      if (slug) payload.slug = slug; else payload.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g,'');
      if (description) payload.description = description;
    if (meta) payload.meta = meta;
    const response = await client().post('/categories', payload);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur create:', error);
      return { success: false, error: handleError(error) };
    }
  },
  async update(id, { name, slug, description, meta }) {
    try {
      
      
  const response = await client().put(`/categories/${id}`, { name, slug, description, meta });
      
      
      
      return { success: true, data: response.data };
    } catch (error) {
      
      return { success: false, error: handleError(error) };
    }
  },
  async delete(id) {
    try {
      
      
      const response = await client().delete(`/categories/${id}?force=true`);
      
      
      
      return { success: true, data: response.data };
    } catch (error) {
      
      return { success: false, error: handleError(error) };
    }
  },
};
