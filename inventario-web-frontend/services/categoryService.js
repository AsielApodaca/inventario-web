import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

// --- BUSCADOR RECURSIVO (EL SABUESO) ---
function findArrayRecursive(obj, depth = 0) {
  // Límite de seguridad
  if (depth > 4 || !obj || typeof obj !== 'object') return null;

  // 1. ¿Es el objeto mismo el array?
  if (Array.isArray(obj)) return obj;

  // 2. Prioridad a nombres comunes en tu backend
  if (Array.isArray(obj.data)) return obj.data;
  if (Array.isArray(obj.rows)) return obj.rows; // Sequelize a veces devuelve rows
  if (Array.isArray(obj.categorias)) return obj.categorias;

  // 3. Búsqueda profunda en propiedades
  const keys = Object.keys(obj);
  for (const key of keys) {
    // Ignoramos basura de axios
    if (['config', 'headers', 'request', 'statusText'].includes(key)) continue;

    const val = obj[key];
    if (val && typeof val === 'object') {
       const found = findArrayRecursive(val, depth + 1);
       if (found && found.length >= 0) return found;
    }
  }
  return null;
}

export const CategoryService = {
  // GET /categorias
  async getAll() {
    try {
      const response = await apiClient.get(ENDPOINTS.CATEGORIES.BASE);
      
      // LOG DE DEPURACIÓN: Verás esto en la consola
      console.log("📂 [API] Respuesta cruda categorías:", response.data);

      const foundArray = findArrayRecursive(response.data);
      
      if (foundArray) {
          console.log(`✅ [Service] Encontradas ${foundArray.length} categorías.`);
          return foundArray;
      } else {
          console.warn("⚠️ [Service] No se encontró array de categorías.");
          return [];
      }

    } catch (error) {
      console.error("❌ Error cargando categorías:", error);
      return [];
    }
  },

  // POST /categorias
  async create(data) {
    return await apiClient.post(ENDPOINTS.CATEGORIES.BASE, data)
  },

  // PUT /categorias/:id
  async update(id, data) {
    return await apiClient.put(`${ENDPOINTS.CATEGORIES.BASE}/${id}`, data)
  },

  // DELETE /categorias/:id
  async delete(id) {
    return await apiClient.delete(`${ENDPOINTS.CATEGORIES.BASE}/${id}`)
  }
}