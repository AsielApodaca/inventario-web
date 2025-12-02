import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

// --- EXTRACTOR DEPURADO ---
function extractArray(response, sourceName) {
  const data = response.data;
  
  console.log(`[${sourceName}] Analizando respuesta cruda:`, response);

  // 1. ¿Es un array directo? [ ... ]
  if (Array.isArray(data)) {
      console.log(`[${sourceName}] Encontrado array en raíz`);
      return data;
  }

  // 2. ¿Está en data.data? { data: [ ... ] } (Estándar común)
  if (data && Array.isArray(data.data)) {
      console.log(`[${sourceName}] Encontrado array en .data`);
      return data.data;
  }

  // 3. ¿Está en data.data.rows? (Paginación Sequelize)
  // { data: { count: 5, rows: [ ... ] } }
  if (data && data.data && Array.isArray(data.data.rows)) {
      console.log(`[${sourceName}] Encontrado array en .data.rows`);
      return data.data.rows;
  }

  // 4. ¿Está en data.rows?
  if (data && Array.isArray(data.rows)) {
      console.log(`[${sourceName}] Encontrado array en .rows`);
      return data.rows;
  }

  // 5. Búsqueda desesperada: Busca cualquier propiedad que sea un array
  if (data && typeof data === 'object') {
     const keys = Object.keys(data);
     for (const key of keys) {
       if (Array.isArray(data[key])) {
           console.log(`[${sourceName}] Encontrado array en propiedad oculta: .${key}`);
           return data[key];
       }
       // Nivel 2 de profundidad
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

export const SupplierService = {
  // GET /proveedores
  async getAll(params = {}) {
    try {
      console.log("📡 Solicitando proveedores...");
      const response = await apiClient.get(ENDPOINTS.SUPPLIERS.BASE, { params })
      return extractArray(response, "SupplierService");
    } catch (error) {
      console.error("❌ SupplierService error:", error);
      return [];
    }
  },

  // GET /proveedores/:id
  async getById(id) {
    const response = await apiClient.get(`${ENDPOINTS.SUPPLIERS.BASE}/${id}`)
    return response.data;
  },

  // --- MÉTODOS DE ESCRITURA ---

  async create(supplier) {
    return await apiClient.post(ENDPOINTS.SUPPLIERS.BASE, supplier)
  },

  async update(id, supplier) {
    return await apiClient.put(`${ENDPOINTS.SUPPLIERS.BASE}/${id}`, supplier)
  },

  async delete(id) {
    return await apiClient.delete(`${ENDPOINTS.SUPPLIERS.BASE}/${id}`)
  },
}