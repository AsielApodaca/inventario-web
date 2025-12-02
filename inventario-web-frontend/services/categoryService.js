// --- EXTRACTOR DEPURADO ---
function extractArray(response, sourceName) {
  const data = response.data;
  console.log(`[${sourceName}] Analizando respuesta cruda:`, response);
  if (Array.isArray(data)) {
    console.log(`[${sourceName}] Encontrado array en raíz`);
    return data;
  }
  if (data && Array.isArray(data.data)) {
    console.log(`[${sourceName}] Encontrado array en .data`);
    return data.data;
  }
  if (data && data.data && Array.isArray(data.data.rows)) {
    console.log(`[${sourceName}] Encontrado array en .data.rows`);
    return data.data.rows;
  }
  if (data && Array.isArray(data.rows)) {
    console.log(`[${sourceName}] Encontrado array en .rows`);
    return data.rows;
  }
  if (data && typeof data === 'object') {
   const keys = Object.keys(data);
   for (const key of keys) {
     if (Array.isArray(data[key])) {
       console.log(`[${sourceName}] Encontrado array en propiedad oculta: .${key}`);
       return data[key];
     }
     if (data[key] && typeof data[key] === 'object') {
       const subKeys = Object.keys(data[key]);
       for (const subKey of subKeys) {
         if (Array.isArray(data[key][subKey])) {
           console.log(`[${sourceName}] Encontrado array profundo en .${key}.${subKey}`);
           return data[key][subKey];
         }
       }
     }
   }
  }
  console.warn(`[${sourceName}] ⚠️ NO SE ENCONTRÓ NINGÚN ARRAY. Estructura recibida:`, data);
  return [];
}
import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const CategoryService = {
  async getAll() {
    try {
      console.log("📡 Solicitando categorias...");
      const response = await apiClient.get(ENDPOINTS.CATEGORIES.BASE)
      return extractArray(response, "CategoryService");
    } catch (error) {
      console.error("❌ CategoryService error:", error);
      return [];
    }
  },

  async getRootCategories() {
    return await apiClient.get(`${ENDPOINTS.CATEGORIES.BASE}/raiz`)
  },

  async getById(id) {
    return await apiClient.get(`${ENDPOINTS.CATEGORIES.BASE}/${id}`)
  },

  async getSubcategories(id) {
    return await apiClient.get(`${ENDPOINTS.CATEGORIES.BASE}/${id}/subcategorias`)
  },

  // Admin only
  async create(category) {
    return await apiClient.post(ENDPOINTS.CATEGORIES.BASE, category)
  },

  // Admin only
  async update(id, category) {
    return await apiClient.put(`${ENDPOINTS.CATEGORIES.BASE}/${id}`, category)
  },
}
