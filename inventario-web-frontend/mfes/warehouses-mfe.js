import { WarehouseService } from "../services/warehouseService.js"
import { InventoryService } from "../services/inventoryService.js"

class WarehousesMFE extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.warehouses = []
    this.loading = true
  }

  async connectedCallback() {
    this.render();
    await this.loadWarehouses();
    this.attachEventListeners();
  }

  async loadWarehouses() {
    const loadingOverlay = this.shadowRoot.querySelector(".loading-overlay")
    if (loadingOverlay) loadingOverlay.style.display = "flex"
    
    try {
      // 1. Obtener lista base
      const response = await WarehouseService.getAll();
      this.warehouses = Array.isArray(response.data) ? response.data : [];

      // 2. Renderizar base inmediatamente
      this.updateWarehousesGrid();

      if (this.warehouses.length === 0) return;

      // 3. Cargar detalles en segundo plano
      await Promise.allSettled(
        this.warehouses.map(async (warehouse, index) => {
          try {
            const whId = warehouse.id || warehouse.id_almacen;
            if (!whId) return;

            // Cargar Ubicaciones
            const ubicacionesRes = await WarehouseService.getUbicaciones(whId);
            warehouse.ubicaciones = ubicacionesRes.data || [];

            // Contar productos
            let total = 0;
            if (warehouse.ubicaciones.length > 0) {
                const inventoryPromises = warehouse.ubicaciones.map(ub => 
                    InventoryService.getByUbicacion(ub.id || ub.id_ubicacion)
                );
                const results = await Promise.all(inventoryPromises);
                results.forEach(res => {
                    const items = res.data || [];
                    total += items.length;
                });
            }
            warehouse.totalProductos = total;
            
            // Actualizar tarjeta específica
            this.updateCard(index, warehouse);

          } catch (error) {
            console.warn(`Error detalles almacén ${index}:`, error);
          }
        })
      );
      
    } catch (error) {
      console.error("Error loading warehouses:", error);
    } finally {
      if (loadingOverlay) loadingOverlay.style.display = "none";
    }
  }

  updateWarehousesGrid() {
    const container = this.shadowRoot.querySelector(".grid-warehouses");
    if (!container) return;

    // Estado Vacío
    if (this.warehouses.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #9CA3AF; border: 2px dashed #E5E7EB; border-radius: 12px;">
                <div style="font-size: 3rem; margin-bottom: 10px;">🏭</div>
                <p style="margin-bottom: 20px;">No hay almacenes registrados.</p>
                <button class="btn-primary add-new-btn">Crear el Primer Almacén</button>
            </div>`;
        this.attachAddEvent(container);
        return;
    }

    // Renderizado normal
    const cardsHTML = this.warehouses.map((w, i) => this.getCardHTML(w, i)).join('');
    const addCardHTML = `
      <div class="wh-card add-card add-new-btn">
        <div class="add-icon">+</div>
        <div style="font-weight: 500;">Nuevo Almacén</div>
      </div>
    `;

    container.innerHTML = cardsHTML + addCardHTML;
    this.attachCardEvents(container);
  }

  getCardHTML(warehouse, index) {
      const displayId = warehouse.id || warehouse.id_almacen || '?';
      const numLocations = warehouse.ubicaciones?.length || 0;
      const numProducts = warehouse.totalProductos !== undefined ? warehouse.totalProductos : '-';
      
      let stockPercent = 0;
      let stockColor = 'gray';
      let stockText = 'Calculating...';
      
      if (typeof numProducts === 'number' && numProducts > 0) {
          stockPercent = Math.min((numProducts / 50) * 100, 100);
          if (stockPercent > 60) { stockColor = 'green'; stockText = 'Healthy'; }
          else if (stockPercent > 20) { stockColor = 'orange'; stockText = 'Low Stock'; }
          else { stockColor = 'red'; stockText = 'Critical'; }
      } else if (numProducts === 0) {
          stockColor = 'red'; stockText = 'Empty';
      }

      return `
        <div class="wh-card" data-index="${index}">
          <div class="wh-header">
            <div>
              <div class="wh-name">${warehouse.nombre}</div>
              <div class="wh-id">WH-${String(displayId).padStart(3, '0')}</div>
            </div>
            <div class="wh-location">
                <span>📍</span> ${warehouse.direccion || 'Sin dirección'}
            </div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-val">${numLocations}</div>
              <div class="stat-label">Ubicaciones</div>
            </div>
            <div class="stat-box">
              <div class="stat-val">${numProducts}</div>
              <div class="stat-label">Productos</div>
            </div>
          </div>

          <div class="progress-container">
            <div class="progress-header">
              <span>Nivel de Stock</span>
              <span style="color: var(--${stockColor}, #666)">${stockPercent}% ${stockText}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill bg-${stockColor}" style="width: ${stockPercent}%"></div>
            </div>
          </div>
        </div>
      `;
  }

  updateCard(index, warehouse) {
      const oldCard = this.shadowRoot.querySelector(`.wh-card[data-index="${index}"]`);
      if (oldCard) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = this.getCardHTML(warehouse, index);
          const newCard = tempDiv.firstElementChild;
          oldCard.replaceWith(newCard);
          // Reconectar click
          newCard.addEventListener('click', () => alert(`Detalles: ${warehouse.nombre}`));
      }
  }

  attachCardEvents(container) {
      container.querySelectorAll('.wh-card:not(.add-card)').forEach(card => {
          card.addEventListener('click', () => {
              const index = card.getAttribute('data-index');
              const wh = this.warehouses[index];
              alert(`Almacén: ${wh.nombre}\nResponsable: ${wh.responsable || 'N/A'}`);
          });
      });
      this.attachAddEvent(container);
  }

  attachAddEvent(container) {
      const addBtn = container.querySelector('.add-new-btn');
      if(addBtn) addBtn.addEventListener('click', () => this.showAddWarehouseModal());
  }

  attachEventListeners() {
      const headerBtn = this.shadowRoot.querySelector('.header-add-btn');
      if (headerBtn) {
          headerBtn.addEventListener('click', () => this.showAddWarehouseModal());
      }
  }

  showAddWarehouseModal() {
      const modal = document.createElement('div');
      modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h2>Nuevo Almacén</h2>
                <form id="new-wh-form">
                    <label>Nombre</label>
                    <input name="nombre" class="input" required>
                    <label>Dirección</label>
                    <input name="direccion" class="input" required>
                    <label>Responsable</label>
                    <input name="responsable" class="input" required>
                    <div style="display:flex; gap:10px; margin-top:20px; justify-content:flex-end;">
                        <button type="button" class="btn-outline close-modal">Cancelar</button>
                        <button type="submit" class="btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
      `;
      this.shadowRoot.appendChild(modal);
      
      modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
      
      modal.querySelector('form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          
          try {
              await WarehouseService.create(data);
              alert("✅ Almacén creado");
              modal.remove();
              this.loadWarehouses(); // Recargar lista
          } catch(err) {
              alert("Error: " + err.message);
          }
      });
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles/global.css">
      <style>
        :host { display: block; padding: 20px; box-sizing: border-box; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .section-header h1 { margin: 0; font-size: 1.5rem; color: #111827; }
        
        /* Grid Layout */
        .grid-warehouses { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        
        /* Card Styles (Restaurado) */
        .wh-card {
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .wh-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        
        /* Header & Location */
        .wh-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .wh-name { font-weight: 700; font-size: 1.1rem; color: #1F2937; }
        .wh-id { font-size: 0.75rem; color: #9CA3AF; }
        .wh-location { font-size: 0.85rem; color: #6B7280; display: flex; align-items: center; gap: 4px; }
        
        /* Stats Grid (Sin fondo gris) */
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .stat-box { } 
        .stat-val { font-weight: 700; font-size: 1.2rem; color: #111827; }
        .stat-label { font-size: 0.7rem; color: #6B7280; text-transform: uppercase; }
        
        /* Progress Bar con Texto */
        .progress-container { }
        .progress-header { display: flex; justify-content: space-between; font-size: 0.75rem; color: #6B7280; margin-bottom: 4px; }
        .progress-bar { height: 6px; background: #E5E7EB; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 10px; }
        
        /* Colores y Variables CSS */
        .bg-green { background: #10B981; --green: #10B981; }
        .bg-orange { background: #F59E0B; --orange: #F59E0B; }
        .bg-red { background: #EF4444; --red: #EF4444; }
        .bg-gray { background: #D1D5DB; --gray: #6B7280; }
        
        /* Add Card */
        .add-card { border: 2px dashed #E5E7EB; align-items: center; justify-content: center; min-height: 200px; color: #6B7280; gap: 8px; }
        .add-card:hover { border-color: #4F46E5; color: #4F46E5; }
        .add-icon { font-size: 2rem; }
        
        /* Loading & Modal */
        .loading-overlay { position: fixed; inset: 0; background: rgba(255,255,255,0.8); z-index: 1000; display: none; align-items: center; justify-content: center; }
        .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #4F46E5; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* Modal Styles */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; justify-content: center; align-items: center; }
        .modal-content { background: white; padding: 2rem; border-radius: 12px; width: 400px; }
        .input { width: 100%; padding: 8px; border: 1px solid #D1D5DB; border-radius: 6px; margin-bottom: 10px; box-sizing: border-box; }
        .btn-primary { background: #4F46E5; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; }
        .btn-outline { background: white; border: 1px solid #D1D5DB; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
      </style>

      <div class="loading-overlay"><div class="spinner"></div></div>

      <div class="section-header">
         <div>
            <h1>Almacenes</h1>
            <p style="margin:0; color:#6B7280;">Gestión de edificios e inventario.</p>
         </div>
         <button class="btn-primary header-add-btn">+ Almacén</button>
      </div>

      <div class="grid-warehouses"></div>
    `;
  }
}

customElements.define("warehouses-mfe", WarehousesMFE)