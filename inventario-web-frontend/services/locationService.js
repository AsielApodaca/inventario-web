import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const LocationService = {
  // POST /ubicaciones (Admin) - Crear ubicación con formato de BD
  async create(locationData) {
    try {
      console.log("📍 [LocationService] Creando ubicación:", locationData);
      
      // Validar que vengan los campos requeridos
      if (!locationData.id_almacen) {
        throw new Error("id_almacen es requerido");
      }
      
      if (!locationData.pasillo || !locationData.estante || !locationData.nivel) {
        throw new Error("pasillo, estante y nivel son requeridos");
      }

      const response = await apiClient.post(ENDPOINTS.LOCATIONS.BASE, {
        id_almacen: parseInt(locationData.id_almacen),
        pasillo: String(locationData.pasillo).trim(),
        estante: String(locationData.estante).trim(),
        nivel: String(locationData.nivel).trim()
      });

      console.log("✅ [LocationService] Ubicación creada:", response.data);
      return response.data;

    } catch (error) {
      console.error("❌ [LocationService] Error:", error);
      throw error;
    }
  },

  // GET /ubicaciones/:id
  async getById(id) {
    try {
      const response = await apiClient.get(`${ENDPOINTS.LOCATIONS.BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error("❌ [LocationService] Error obteniendo ubicación:", error);
      throw error;
    }
  },

  // PUT /ubicaciones/:id (Admin) - Actualizar ubicación
  async update(id, locationData) {
    try {
      console.log(`📍 [LocationService] Actualizando ubicación ${id}:`, locationData);
      
      const response = await apiClient.put(`${ENDPOINTS.LOCATIONS.BASE}/${id}`, {
        id_almacen: locationData.id_almacen ? parseInt(locationData.id_almacen) : undefined,
        pasillo: locationData.pasillo ? String(locationData.pasillo).trim() : undefined,
        estante: locationData.estante ? String(locationData.estante).trim() : undefined,
        nivel: locationData.nivel ? String(locationData.nivel).trim() : undefined
      });

      console.log("✅ [LocationService] Ubicación actualizada:", response.data);
      return response.data;

    } catch (error) {
      console.error("❌ [LocationService] Error actualizando ubicación:", error);
      throw error;
    }
  },
}