import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

// --- FUNCIÓN HELPER INTELIGENTE ---
// Busca un array dentro de la respuesta, sin importar qué tan anidado esté
function extractArray(response) {
  const data = response.data;
  
  // Caso 1: El backend devuelve directamente el array [ ... ]
  if (Array.isArray(data)) return data;
  
  // Caso 2: Estándar común { data: [ ... ] }
  if (data && Array.isArray(data.data)) return data.data;
  
  // Caso 3: Paginación Sequelize { data: { count: 10, rows: [ ... ] } }
  if (data && data.data && Array.isArray(data.data.rows)) return data.data.rows;
  
  // Caso 4: Doble anidación rara { data: { data: [ ... ] } }
  if (data && data.data && Array.isArray(data.data.data)) return data.data.data;
  
  // Caso 5: Nombre específico { status: 'ok', productos: [ ... ] }
  // Intentamos buscar cualquier propiedad que sea un array
  if (data && typeof data === 'object') {
     const keys = Object.keys(data);
     for (const key of keys) {
       if (Array.isArray(data[key])) return data[key];
     }
  }

  // Si llegamos aquí, imprimimos para depurar qué rayos llegó
  console.warn("⚠️ No se encontró ningún array en la respuesta:", JSON.stringify(data, null, 2));
  return [];
}

export const ProductService = {
  // GET /productos
  async getAll(params = {}) {
    try {
      const response = await apiClient.get(ENDPOINTS.PRODUCTS.BASE, { params })
      return extractArray(response);
    } catch (error) {
      console.error("ProductService.getAll error:", error);
      return [];
    }
  },

  // GET /productos/:id
  async getById(id) {
    const response = await apiClient.get(`${ENDPOINTS.PRODUCTS.BASE}/${id}`)
    // El backend devuelve { status: 'success', data: producto }
    return response.data?.data || response.data?.producto || null;
  },

  // GET /productos/buscar
  async search(criteria) {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS.SEARCH, { params: criteria })
    return extractArray(response);
  },

  // GET /productos/codigo/:codigo
  async getByCode(code) {
    const response = await apiClient.get(`${ENDPOINTS.PRODUCTS.BY_CODE}/${code}`)
    return response.data;
  },

  // GET /productos/categoria/:id_categoria
  async getByCategory(categoryId) {
    const response = await apiClient.get(`${ENDPOINTS.PRODUCTS.BY_CATEGORY}/${categoryId}`)
    return extractArray(response);
  },

  // GET /productos/bajo-stock
  async getLowStock() {
    try {
      const response = await apiClient.get(ENDPOINTS.PRODUCTS.LOW_STOCK)
      return extractArray(response);
    } catch (error) {
      return [];
    }
  },

  // GET /productos/:id/inventario
  async getInventory(id) {
    const response = await apiClient.get(`${ENDPOINTS.PRODUCTS.BASE}/${id}/inventario`)
    return response.data || 0;
  },

  // GET /productos/:id/movimientos
  async getMovements(id) {
    const response = await apiClient.get(`${ENDPOINTS.PRODUCTS.BASE}/${id}/movimientos`)
    return extractArray(response);
  },

  // --- MÉTODOS DE ESCRITURA ---
  async create(product) { return await apiClient.post(ENDPOINTS.PRODUCTS.BASE, product) },
  async update(id, product) { return await apiClient.put(`${ENDPOINTS.PRODUCTS.BASE}/${id}`, product) },
  async changeStatus(id, statusData) { return await apiClient.patch(`${ENDPOINTS.PRODUCTS.BASE}/${id}/estado`, statusData) },
  async delete(id) { return await apiClient.delete(`${ENDPOINTS.PRODUCTS.BASE}/${id}`) },
}