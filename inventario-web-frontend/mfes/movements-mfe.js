import { MovementService } from "../services/movementService.js"

class MovementsMFE extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.movements = [];
    this.loading = true;
  }

  async connectedCallback() {
    this.render(); // 1. Pintar estructura
    await this.fetchMovements(); // 2. Cargar datos
    this.attachEventListeners();
  }

  async fetchMovements() {
    try {
      this.loading = true;
      this.updateList(); // Mostrar spinner

      this.movements = await MovementService.getAll();
      console.log("Movimientos procesados en MFE:", this.movements); // DEBUG

    } catch (error) {
      console.error("Error fetching movements:", error);
      this.movements = [];
    } finally {
      this.loading = false;
      this.updateList(); // Mostrar datos
    }
  }

  formatDate(dateString) {
      if(!dateString) return '-';
      return new Date(dateString).toLocaleDateString('es-MX', {
          year: 'numeric', month: 'short', day: 'numeric', 
          hour: '2-digit', minute:'2-digit'
      });
  }

  // Actualiza solo la lista para no perder el foco del formulario
  updateList() {
      const listContainer = this.shadowRoot.querySelector('.movements-list');
      if(!listContainer) return;

      if(this.loading) {
          listContainer.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <div class="spinner"></div>
                <p style="color: #6B7280; margin-top: 10px;">Cargando movimientos...</p>
            </div>`;
          return;
      }

      if(!this.movements || this.movements.length === 0) {
          listContainer.innerHTML = `<div class="empty-state">No hay movimientos registrados.</div>`;
          return;
      }

      listContainer.innerHTML = this.movements.map(m => {
          // Lógica defensiva: Si algo falta, usamos valores por defecto
          const isEntry = (m.tipo_movimiento || '').toLowerCase() === 'entrada';
          const colorClass = isEntry ? 'bg-green' : 'bg-red';
          const textClass = isEntry ? 'text-green' : 'text-red';
          const sign = isEntry ? '+' : '-';
          const arrow = isEntry ? '↓' : '↑';
          
          // Nombres seguros
          const prodName = m.producto?.nombre || `Producto #${m.id_producto || '?'}`;
          
          // Manejo especial de ubicación (por si no existe en BD)
          let ubicName = 'Ubicación General';
          if (m.ubicacion?.nombre) ubicName = m.ubicacion.nombre;
          else if (m.id_ubicacion) ubicName = `Ubicación #${m.id_ubicacion}`;

          // Fecha segura
          const fecha = this.formatDate(m.fecha_movimiento || m.createdAt);

          return `
            <div class="movement-item">
              <div class="icon-circle ${colorClass}">${arrow}</div>
              <div class="movement-details">
                <div class="item-title">${(m.tipo_movimiento || 'Movimiento').toUpperCase()}: ${prodName}</div>
                <div class="item-meta">${m.motivo || 'Sin motivo'}</div>
                <div class="item-meta">📅 ${fecha}</div>
              </div>
              <div style="text-align: right;">
                <div class="item-qty ${textClass}">${sign}${m.cantidad || 0}</div>
                <div class="item-meta">${ubicName}</div>
              </div>
            </div>
          `;
      }).join('');
  }

  attachEventListeners() {
    const refreshBtn = this.shadowRoot.querySelector('.refresh-btn');
    if(refreshBtn) {
        refreshBtn.addEventListener('click', () => this.fetchMovements());
    }
    
    // ... aquí puedes volver a conectar tu formulario ...
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles/global.css">
      
      <div class="page-container">
          <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
             <div>
                 <h1 style="font-size: 1.5rem; font-weight: 700; margin:0;">Movimientos de Inventario</h1>
                 <p style="color: #6B7280; margin: 5px 0 0;">Historial de entradas y salidas.</p>
             </div>
             <button class="refresh-btn" title="Actualizar">↻</button>
          </div>

          <div class="layout">
            <div class="main-panel">
              <div class="movements-list">
                 </div>
            </div>
          </div>
      </div>

      <style>
        :host { display: block; padding: 20px; box-sizing: border-box; height: 100%; }
        .page-container { display: flex; flex-direction: column; height: calc(100vh - 100px); }
        .layout { display: flex; flex: 1; min-height: 0; background: white; border-radius: 8px; border: 1px solid #E5E7EB; overflow: hidden; }
        .main-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .movements-list { flex: 1; overflow-y: auto; padding: 0; }
        
        .movement-item { display: flex; padding: 16px; border-bottom: 1px solid #F3F4F6; align-items: center; gap: 16px; }
        .movement-item:hover { background: #F9FAFB; }
        
        .icon-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: bold; flex-shrink: 0; }
        .bg-green { background: #D1FAE5; color: #065F46; }
        .bg-red { background: #FEE2E2; color: #991B1B; }
        
        .movement-details { flex: 1; }
        .item-title { font-weight: 600; color: #1F2937; font-size: 0.95rem; }
        .item-meta { font-size: 0.8rem; color: #6B7280; margin-top: 2px; }
        .item-qty { font-weight: 700; font-size: 1.1rem; }
        .text-green { color: #059669; }
        .text-red { color: #DC2626; }
        
        .refresh-btn { background: white; border: 1px solid #D1D5DB; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 1.2rem; }
        .refresh-btn:hover { background: #F3F4F6; }
        
        .empty-state { padding: 40px; text-align: center; color: #9CA3AF; font-style: italic; }
        .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #4F46E5; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `
  }
}

customElements.define("movements-mfe", MovementsMFE)