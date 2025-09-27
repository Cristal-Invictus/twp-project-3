import axios from 'axios';

const BASE_URL = 'http://localhost:10003/wp-json/wp/v2';
const USERNAME = 'Cristal';
const PASSWORD = '54l4UuuGhBnG6GY3tIVqhUdU'; 
const AUTH = btoa(`${USERNAME}:${PASSWORD}`);

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Basic ${AUTH}`,
  },
});

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
      const response = await client.get('/categories?per_page=100');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur getAll:', error);
      return { success: false, error: handleError(error) };
    }
  },
  async create({ name, slug, description }) {
    try {
      const response = await client.post('/categories', { name, slug, description });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur create:', error);
      return { success: false, error: handleError(error) };
    }
  },
  async update(id, { name, slug, description }) {
    try {
      
      
      const response = await client.put(`/categories/${id}`, { name, slug, description });
      
      
      
      return { success: true, data: response.data };
    } catch (error) {
      
      return { success: false, error: handleError(error) };
    }
  },
  async delete(id) {
    try {
      
      
      const response = await client.delete(`/categories/${id}?force=true`);
      
      
      
      return { success: true, data: response.data };
    } catch (error) {
      
      return { success: false, error: handleError(error) };
    }
  },
};
