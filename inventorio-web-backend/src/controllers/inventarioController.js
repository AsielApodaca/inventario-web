import InventarioService from '../services/inventarioService.js';

export const inventarioController = {
  // POST /api/inventario
  createInventario: async (req, res, next) => {
    try {
      const inventarioData = req.body;
      const nuevoInventario = await InventarioService.registrarProductoEnUbicacion(inventarioData);
      
      res.status(201).json({
        status: 'success',
        message: 'Producto registrado en ubicación exitosamente',
        data: nuevoInventario
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('debe ser mayor') ||
          error.message.includes('ya está registrado')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/inventario/producto/:id_producto
  getStockByProducto: async (req, res, next) => {
    try {
      const { id_producto } = req.params;
      const resultado = await InventarioService.consultarStockPorProducto(parseInt(id_producto));
      
      res.status(200).json({
        status: 'success',
        data: resultado.inventarios,
        metadata: {
          resumen: resultado.resumen
        },
        count: resultado.inventarios.length
      });
    } catch (error) {
      if (error.message.includes('inválido')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/inventario/ubicacion/:id_ubicacion
  getProductosByUbicacion: async (req, res, next) => {
    try {
      const { id_ubicacion } = req.params;
      const resultado = await InventarioService.consultarProductosPorUbicacion(parseInt(id_ubicacion));
      
      res.status(200).json({
        status: 'success',
        data: resultado.inventarios,
        metadata: {
          resumen: resultado.resumen
        },
        count: resultado.inventarios.length
      });
    } catch (error) {
      if (error.message.includes('inválido')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // PUT /api/inventario/:id/cantidad
  updateCantidad: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;
      
      if (cantidad === undefined || cantidad < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'La cantidad debe ser mayor o igual a 0'
        });
      }

      const inventarioActualizado = await InventarioService.actualizarCantidad(parseInt(id), cantidad);
      
      res.status(200).json({
        status: 'success',
        message: 'Cantidad actualizada exitosamente',
        data: inventarioActualizado
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado') || 
          error.message.includes('debe ser mayor')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // PATCH /api/inventario/:id/ajustar
  ajustarInventario: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { ajuste, motivo } = req.body;
      
      if (ajuste === undefined || ajuste === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'El ajuste debe ser diferente de 0'
        });
      }

      if (!motivo || motivo.trim() === '') {
        return res.status(400).json({
          status: 'error',
          message: 'El motivo del ajuste es requerido'
        });
      }

      const inventarioAjustado = await InventarioService.ajustarInventario(parseInt(id), ajuste, motivo.trim());
      
      const tipoAjuste = ajuste > 0 ? 'incrementado' : 'disminuido';
      res.status(200).json({
        status: 'success',
        message: `Inventario ${tipoAjuste} exitosamente`,
        data: inventarioAjustado,
        metadata: {
          ajuste,
          motivo: motivo.trim()
        }
      });
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado') || 
          error.message.includes('diferente de 0') || error.message.includes('requerido') ||
          error.message.includes('negativa')) {
        const statusCode = error.message.includes('no encontrado') ? 404 : 400;
        return res.status(statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/inventario/producto/:id_producto/disponibilidad
  verificarDisponibilidad: async (req, res, next) => {
    try {
      const { id_producto } = req.params;
      const { cantidad } = req.query;
      
      if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'El parámetro "cantidad" es requerido y debe ser un número positivo'
        });
      }

      const disponibilidad = await InventarioService.verificarDisponibilidad(
        parseInt(id_producto), 
        parseFloat(cantidad)
      );
      
      res.status(200).json({
        status: 'success',
        data: disponibilidad
      });
    } catch (error) {
      if (error.message.includes('inválido')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      next(error);
    }
  },

  // GET /api/inventario/:id
  getInventarioById: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Como el service no tiene un método específico para obtener por ID,
      // podemos buscar en todas las ubicaciones y filtrar
      // Esto es ineficiente para grandes volúmenes de datos
      const todosInventarios = await InventarioService.consultarProductosPorUbicacion(1); // ID temporal
      const inventario = todosInventarios.inventarios.find(inv => inv.id === parseInt(id));
      
      if (!inventario) {
        return res.status(404).json({
          status: 'error',
          message: 'Registro de inventario no encontrado'
        });
      }

      res.status(200).json({
        status: 'success',
        data: inventario
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/inventario/:id
  deleteInventario: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Como el service no tiene eliminación, informamos al cliente
      return res.status(501).json({
        status: 'error',
        message: 'Funcionalidad de eliminación no implementada en el servicio'
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/inventario/transferir
  transferirInventario: async (req, res, next) => {
    try {
      const { id_producto, id_ubicacion_origen, id_ubicacion_destino, cantidad } = req.body;
      
      // Validaciones básicas
      if (!id_producto || !id_ubicacion_origen || !id_ubicacion_destino || !cantidad) {
        return res.status(400).json({
          status: 'error',
          message: 'Todos los campos son requeridos: id_producto, id_ubicacion_origen, id_ubicacion_destino, cantidad'
        });
      }

      if (id_ubicacion_origen === id_ubicacion_destino) {
        return res.status(400).json({
          status: 'error',
          message: 'La ubicación de origen y destino no pueden ser la misma'
        });
      }

      if (cantidad <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'La cantidad debe ser mayor a 0'
        });
      }

      // Verificar disponibilidad en origen
      const stockOrigen = await InventarioService.consultarStockPorProducto(parseInt(id_producto));
      const inventarioOrigen = stockOrigen.inventarios.find(inv => 
        inv.id_ubicacion === parseInt(id_ubicacion_origen)
      );

      if (!inventarioOrigen) {
        return res.status(404).json({
          status: 'error',
          message: 'El producto no se encuentra en la ubicación de origen'
        });
      }

      if (inventarioOrigen.cantidad < cantidad) {
        return res.status(400).json({
          status: 'error',
          message: `Cantidad insuficiente en ubicación de origen. Disponible: ${inventarioOrigen.cantidad}, Requerida: ${cantidad}`
        });
      }

      // En una implementación real, aquí se realizaría la transferencia
      // Por ahora, solo informamos que no está implementado
      return res.status(501).json({
        status: 'error',
        message: 'Funcionalidad de transferencia no implementada en el servicio',
        data: {
          id_producto: parseInt(id_producto),
          id_ubicacion_origen: parseInt(id_ubicacion_origen),
          id_ubicacion_destino: parseInt(id_ubicacion_destino),
          cantidad: parseFloat(cantidad),
          disponible_origen: inventarioOrigen.cantidad
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/inventario/stock-total
  getStockTotal: async (req, res, next) => {
    try {
      // En una implementación real, esto llamaría a un método del service
      // que calcule el stock total de todos los productos
      return res.status(501).json({
        status: 'error',
        message: 'Funcionalidad de stock total no implementada en el servicio'
      });
    } catch (error) {
      next(error);
    }
  }
};