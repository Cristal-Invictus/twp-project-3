import axios from 'axios';

const BASE_URL = 'http://localhost:10003/wp-json';

// Axios client (stateless; headers specific per call)
const client = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json', Accept: 'application/json' }});

function handleError(error){
  if (error?.response) return { status:error.response.status, data:error.response.data, message:error.response.data?.message||'Erreur serveur'};
  return { status:null, data:null, message:error?.message||'Erreur inconnue'};
}

function decodeToken(token){
  try {
    const payloadPart = token.split('.')[1];
    const json = atob(payloadPart.replace(/-/g,'+').replace(/_/g,'/'));
    return JSON.parse(json);
  } catch(e){ return null; }
}

export default {
  async login({ username, password }) {
    try {
      const res = await client.post('/jwt-auth/v1/token', { username, password });
      const decoded = decodeToken(res.data.token);
      return { success:true, data:{ ...res.data, decoded } };
    } catch(e){ return { success:false, error:handleError(e) }; }
  },
  async validate(token){
    try { await client.post('/jwt-auth/v1/token/validate', {}, { headers:{ Authorization:`Bearer ${token}` }}); return { success:true }; }
    catch(e){ return { success:false, error:handleError(e) }; }
  },
  decodeToken,
  async register({ username, email, password, website }) {
    // Custom endpoint expected: /custom-auth/v1/register
    try {
  const res = await client.post('/custom-auth/v1/register', { username, email, password, website });
      const decoded = res.data?.token ? decodeToken(res.data.token) : null;
      return { success:true, data:{ ...res.data, decoded } };
    } catch(e){ return { success:false, error:handleError(e) }; }
  }
};
