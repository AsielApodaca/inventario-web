import { WarehouseService } from "../services/warehouseService.js"
import { InventoryService } from "../services/inventoryService.js"

class WarehousesMFE extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.warehouses = []
  }

  async connectedCallback() {
    this.render()
    await this.loadWarehouses()
    this.attachEventListeners()
  }

  async loadWarehouses() {
    const loadingOverlay = this.shadowRoot.querySelector(".loading-overlay")
    
    try {
      loadingOverlay.style.display = "flex"

      const response = await WarehouseService.getAll()
      this.warehouses = Array.isArray(response.data) ? response.data : []
      
      // Para cada almacén, obtener sus ubicaciones y estadísticas
      await Promise.all(
        this.warehouses.map(async (warehouse) => {
          try {
            const ubicacionesRes = await WarehouseService.getUbicaciones(warehouse.id_almacen)
            warehouse.ubicaciones = Array.isArray(ubicacionesRes.data) ? ubicacionesRes.data : []
            
            // Contar productos por ubicación
            let totalProductos = 0
            for (const ubicacion of warehouse.ubicaciones) {
              try {
                const inventarioRes = await InventoryService.getByUbicacion(ubicacion.id_ubicacion)
                const items = Array.isArray(inventarioRes.data) ? inventarioRes.data : []
                totalProductos += items.length
              } catch (e) {
                console.error('Error loading inventory for location:', e)
              }
            }
            warehouse.totalProductos = totalProductos
          } catch (error) {
            console.error(`Error loading locations for warehouse ${warehouse.id_almacen}:`, error)
            warehouse.ubicaciones = []
            warehouse.totalProductos = 0
          }
        })
      )

      this.updateWarehousesGrid()
      
    } catch (error) {
      console.error("Error loading warehouses:", error)
      this.showError("Error al cargar almacenes")
    } finally {
      loadingOverlay.style.display = "none"
    }
  }

  attachEventListeners() {
    const addNewBtn = this.shadowRoot.querySelector(".add-new-btn")
    addNewBtn.addEventListener("click", () => {
      this.showAddWarehouseModal()
    })
  }

  updateWarehousesGrid() {
    const container = this.shadowRoot.querySelector(".grid-warehouses")
    
    const warehouseCards = this.warehouses.map((warehouse, index) => {
      const numLocations = warehouse.ubicaciones?.length || 0
      const numProducts = warehouse.totalProductos || 0
      
      // Calcular nivel de stock (simulado basado en productos)
      let stockLevel = 0
      let stockColor = 'red'
      let stockText = 'Crítico'
      
      if (numProducts > 0) {
        // Simulamos un porcentaje basado en la cantidad de productos
        stockLevel = Math.min(Math.floor((numProducts / 50) * 100), 100)
        
        if (stockLevel >= 70) {
          stockColor = 'green'
          stockText = 'Saludable'
        } else if (stockLevel >= 40) {
          stockColor = 'orange'
          stockText = 'Stock Bajo'
        } else {
          stockColor = 'red'
          stockText = 'Crítico'
        }
      }

      return `
        <div class="wh-card" data-id="${warehouse.id_almacen}">
          <div class="wh-header">
            <div>
              <div class="wh-name">${warehouse.nombre}</div>
              <div class="wh-id">WH-${String(warehouse.id_almacen).padStart(3, '0')}</div>
            </div>
          </div>
          <div class="wh-location">
             <span>📍</span> ${warehouse.direccion || 'Ubicación no especificada'}
          </div>
          <div class="stats-grid">
            <div>
              <div class="stat-label">Ubicaciones</div>
              <div class="stat-val">${numLocations}</div>
            </div>
            <div>
              <div class="stat-label">Productos</div>
              <div class="stat-val">${numProducts}</div>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-header">
              <span class="stat-label">Nivel de Stock</span>
              <span class="stat-label" style="color: ${this.getColorForLevel(stockColor)}">${stockLevel}% ${stockText}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill fill-${stockColor}" style="width: ${stockLevel}%"></div>
            </div>
          </div>
        </div>
      `
    }).join('')

    const addCard = `
      <div class="wh-card add-card add-new-btn">
        <div class="add-icon">+</div>
        <div style="font-weight: 500;">Agregar Nuevo Almacén</div>
        <div style="font-size: 0.8rem; margin-top: 0.5rem;">Expande tu red de inventario</div>
      </div>
    `

    container.innerHTML = warehouseCards + addCard

    // Agregar event listeners a las tarjetas
    const cards = container.querySelectorAll(".wh-card:not(.add-card)")
    cards.forEach(card => {
      card.addEventListener("click", () => {
        const id = parseInt(card.dataset.id)
        this.showWarehouseDetails(id)
      })
    })
  }

  getColorForLevel(level) {
    const colors = {
      'green': '#059669',
      'orange': '#d97706',
      'red': '#dc2626'
    }
    return colors[level] || '#6b7280'
  }

  showWarehouseDetails(id) {
    const warehouse = this.warehouses.find(w => w.id_almacen === id)
    if (!warehouse) return

    const modal = document.createElement('div')
    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 2rem; border-radius: 1rem; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
          <h2 style="margin-bottom: 1rem;">${warehouse.nombre}</h2>
          <p style="color: #6b7280; margin-bottom: 1rem;">
            <strong>Dirección:</strong> ${warehouse.direccion || 'No especificada'}
          </p>
          <p style="color: #6b7280; margin-bottom: 1rem;">
            <strong>Ubicaciones:</strong> ${warehouse.ubicaciones?.length || 0}
          </p>
          <p style="color: #6b7280; margin-bottom: 1.5rem;">
            <strong>Total de productos:</strong> ${warehouse.totalProductos || 0}
          </p>
          
          <h3 style="margin-top: 1.5rem; margin-bottom: 0.5rem;">Ubicaciones:</h3>
          <div style="max-height: 200px; overflow-y: auto;">
            ${warehouse.ubicaciones?.map(ub => `
              <div style="padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; margin-bottom: 0.5rem;">
                <strong>${ub.codigo}</strong> - ${ub.nombre || 'Sin nombre'}
                <br><small style="color: #6b7280;">Pasillo: ${ub.pasillo || 'N/A'} | Estante: ${ub.estante || 'N/A'} | Nivel: ${ub.nivel || 'N/A'}</small>
              </div>
            `).join('') || '<p style="color: #6b7280;">No hay ubicaciones registradas</p>'}
          </div>
          
          <button onclick="this.closest('div').parentElement.remove()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
            Cerrar
          </button>
        </div>
      </div>
    `
    document.body.appendChild(modal)
  }

  showAddWarehouseModal() {
    const modal = document.createElement('div')
    modal.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 2rem; border-radius: 1rem; max-width: 500px; width: 90%;">
          <h2 style="margin-bottom: 1.5rem;">Agregar Nuevo Almacén</h2>
          <form id="warehouse-form">
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Nombre del Almacén *</label>
              <input type="text" name="nombre" required style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
            </div>
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Dirección</label>
              <textarea name="direccion" rows="3" style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem;"></textarea>
            </div>
            <div style="display: flex; gap: 1rem;">
              <button type="button" onclick="this.closest('div').parentElement.parentElement.remove()" style="flex: 1; padding: 0.5rem 1rem; background: #e5e7eb; border: none; border-radius: 0.5rem; cursor: pointer;">
                Cancelar
              </button>
              <button type="submit" style="flex: 1; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    `
    document.body.appendChild(modal)

    const form = modal.querySelector('#warehouse-form')
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const formData = new FormData(form)
      const data = {
        nombre: formData.get('nombre'),
        direccion: formData.get('direccion')
      }

      try {
        const response = await WarehouseService.create(data)
        if (response.status === 'success') {
          alert('Almacén creado exitosamente')
          modal.remove()
          await this.loadWarehouses()
        }
      } catch (error) {
        alert('Error al crear almacén: ' + (error.message || 'Error desconocido'))
      }
    })
  }

  showError(message) {
    const errorDiv = this.shadowRoot.querySelector(".error-banner")
    if (errorDiv) {
      errorDiv.textContent = message
      errorDiv.style.display = "block"
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles/global.css">
      <link rel="stylesheet" href="styles/warehouses.css">

      <div class="loading-overlay">
        <div class="spinner"></div>
      </div>

      <div class="error-banner" style="display: none;"></div>

      <div class="section-header" style="margin-bottom: 1.5rem; display: flex; justify-content: space-between;">
         <div>
           <h1 style="font-size: 1.5rem; font-weight: 700;">Vista General de Almacenes</h1>
           <p style="color: var(--text-secondary);">Navega visualmente por almacenes, ubicaciones y productos.</p>
         </div>
         <button class="btn btn-primary add-new-btn">+ Nuevo Almacén</button>
      </div>

      <div class="grid-warehouses">
        <!-- Populated dynamically -->
      </div>

      <style>
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-banner {
          background: #fee2e2;
          color: #dc2626;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          border-left: 4px solid #dc2626;
        }

        .wh-card:not(.add-card) {
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .wh-card:not(.add-card):hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .add-new-btn {
          cursor: pointer;
        }

        .fill-green { background: #059669; }
        .fill-orange { background: #d97706; }
        .fill-red { background: #dc2626; }
      </style>
    `
  }
}

customElements.define("warehouses-mfe", WarehousesMFE)