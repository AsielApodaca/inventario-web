import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

// --- BUSCADOR RECURSIVO INTELIGENTE ---
// Busca un array en cualquier nivel del objeto respuesta
function findArrayRecursive(obj, depth = 0) {
  if (depth > 3 || !obj || typeof obj !== 'object') return null;

  // 1. ¿Es el objeto mismo un array?
  if (Array.isArray(obj)) return obj;

  // 2. Prioridad a nombres comunes
  if (Array.isArray(obj.data)) return obj.data;
  if (Array.isArray(obj.rows)) return obj.rows;
  if (Array.isArray(obj.almacenes)) return obj.almacenes;

  // 3. Búsqueda profunda en propiedades
  const keys = Object.keys(obj);
  for (const key of keys) {
    // Ignoramos propiedades de configuración de Axios
    if (['config', 'headers', 'request', 'statusText'].includes(key)) continue;

    const val = obj[key];
    if (val && typeof val === 'object') {
       const found = findArrayRecursive(val, depth + 1);
       if (found) return found;
    }
  }
  return null;
}

export const WarehouseService = {
  // GET /almacenes
  async getAll() {
    try {
      const response = await apiClient.get(ENDPOINTS.WAREHOUSES.BASE);
      
      // Imprimimos la estructura completa para que la veas si vuelve a fallar
      console.log("🏭 [WarehouseService] Respuesta completa:", JSON.stringify(response.data, null, 2));

      const foundArray = findArrayRecursive(response.data);
      
      if (foundArray) {
          console.log(`✅ [WarehouseService] Array encontrado con ${foundArray.length} elementos.`);
          // IMPORTANTE: Tu MFE espera un objeto { data: [...] }
          return { data: foundArray }; 
      } else {
          console.warn("⚠️ [WarehouseService] No se encontró ningún array.");
          return { data: [] };
      }

    } catch (error) {
      console.error("❌ Error cargando almacenes:", error);
      return { data: [] };
    }
  },

  // GET /almacenes/:id
  async getById(id) {
    const response = await apiClient.get(`${ENDPOINTS.WAREHOUSES.BASE}/${id}`)
    return response.data;
  },

  // GET /almacen/:id/ubicaciones (Ruta en singular corregida)
  async getUbicaciones(idAlmacen) {
    if (!idAlmacen) return { data: [] };

    try {
       // Usamos la ruta jerárquica correcta
       const response = await apiClient.get(`${ENDPOINTS.WAREHOUSES.BASE}/${idAlmacen}/ubicaciones`);
       // Usamos el mismo buscador para asegurar encontrar las ubicaciones
       const foundArray = findArrayRecursive(response.data);
       return { data: foundArray || [] };

    } catch (error) {
       return { data: [] };
    }
  },

  async create(warehouseData) {
    return await apiClient.post(ENDPOINTS.WAREHOUSES.BASE, warehouseData)
  },

  async update(id, warehouseData) {
    return await apiClient.put(`${ENDPOINTS.WAREHOUSES.BASE}/${id}`, warehouseData)
  },

  async delete(id) {
    return await apiClient.delete(`${ENDPOINTS.WAREHOUSES.BASE}/${id}`)
  },
}