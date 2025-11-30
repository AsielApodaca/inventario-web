import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

// --- BUSCADOR RECURSIVO (EL SABUESO) ---
function findArrayRecursive(obj, depth = 0) {
  if (depth > 3 || !obj || typeof obj !== 'object') return null;

  // 1. ¿Es el objeto mismo un array?
  if (Array.isArray(obj)) return obj;

  // 2. Prioridad a nombres comunes
  if (Array.isArray(obj.data)) return obj.data;
  if (Array.isArray(obj.users)) return obj.users;
  if (Array.isArray(obj.usuarios)) return obj.usuarios;
  if (Array.isArray(obj.rows)) return obj.rows; // Sequelize pagination

  // 3. Búsqueda profunda en propiedades
  const keys = Object.keys(obj);
  for (const key of keys) {
    // Ignoramos propiedades de configuración de Axios para no perder tiempo
    if (['config', 'headers', 'request', 'statusText'].includes(key)) continue;

    const val = obj[key];
    if (val && typeof val === 'object') {
       const found = findArrayRecursive(val, depth + 1);
       if (found) return found;
    }
  }
  return null;
}

export const UserService = {
  // GET /usuarios (Admin)
  async getAll() {
    try {
      const response = await apiClient.get(ENDPOINTS.USERS.BASE);
      
      console.log("👥 [UserService] Respuesta cruda:", response.data); // Debug

      const foundArray = findArrayRecursive(response.data);
      
      if (foundArray) {
          console.log(`✅ [UserService] Encontrados ${foundArray.length} usuarios.`);
          return foundArray;
      } else {
          console.warn("⚠️ [UserService] No se encontró array de usuarios.");
          return [];
      }

    } catch (error) {
      console.error("❌ UserService error:", error);
      // Si el error es 403, es porque tu usuario no es Admin
      if (error.response && error.response.status === 403) {
          alert("Acceso Denegado: Se requieren permisos de Administrador para ver usuarios.");
      }
      return [];
    }
  },

  // GET /usuarios/:id
  async getById(id) {
    const response = await apiClient.get(`${ENDPOINTS.USERS.BASE}/${id}`)
    return response.data;
  },

  // POST /usuarios
  async create(userData) {
    return await apiClient.post(ENDPOINTS.USERS.BASE, userData)
  },

  // PUT /usuarios/:id (Admin)
  async update(id, userData) {
    return await apiClient.put(`${ENDPOINTS.USERS.BASE}/${id}`, userData)
  },

  // PATCH /usuarios/:id/password
  async changePassword(id, passwordData) {
    return await apiClient.patch(`${ENDPOINTS.USERS.BASE}/${id}/password`, passwordData)
  },

  // DELETE /usuarios/:id (Admin)
  async delete(id) {
    return await apiClient.delete(`${ENDPOINTS.USERS.BASE}/${id}`)
  },
}