import { MovementService } from '../services/movementService.js';
import { ProductService } from '../services/productService.js';
import { WarehouseService } from '../services/warehouseService.js';

class MovementsMFE extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.movements = [];
    this.allMovements = []; // Copia para filtrar localmente
    this.filterType = 'all'; 
  }

  async connectedCallback() {
    this.render(); // Pintar estructura base
    await this.loadMovements(); // Cargar datos
    this.attachEvents(); // Conectar filtros
  }

  async loadMovements() {
    try {
        const list = this.shadowRoot.querySelector('.movements-list');
        if(list) list.innerHTML = `<div style="padding:40px; text-align:center;"><div class="spinner"></div><p style="color:#666; margin-top:10px;">Cargando historial...</p></div>`;

        // Traemos todo el historial (Rango amplio por defecto)
        const res = await MovementService.getByDate({
            fecha_inicio: '2000-01-01',
            fecha_fin: '2030-12-31' 
        });
        
        let data = [];
        if (Array.isArray(res)) data = res;
        else if (Array.isArray(res.data)) data = res.data; 
        else if (Array.isArray(res.data?.data)) data = res.data.data;

        // Enriquecemos datos si es necesario (ej: nombres de almacén si vienen solo IDs)
        // Nota: Si tu backend ya trae los 'includes', esto es opcional, pero seguro.
        this.allMovements = data;
        
        this.applyFilter();

    } catch (error) {
        console.error(error);
        const list = this.shadowRoot.querySelector('.movements-list');
        if(list) list.innerHTML = `<div style="padding:20px;color:red;text-align:center">Error cargando movimientos: ${error.message}</div>`;
    }
  }

  applyFilter() {
    if (this.filterType === 'all') {
        this.movements = this.allMovements;
    } else {
        this.movements = this.allMovements.filter(m => 
            (m.tipo_movimiento || '').toLowerCase() === this.filterType
        );
    }
    this.renderList();
    this.updateFilterButtons();
  }

  updateFilterButtons() {
    const btns = this.shadowRoot.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
        if(btn.dataset.filter === this.filterType) btn.classList.add('active');
        else btn.classList.remove('active');
    });
  }

  getTypeConfig(type) {
    const t = (type || '').toLowerCase();
    if (t.includes('entrada')) return { icon: '⬇', color: 'text-green', bg: 'bg-green', label: 'Entrada', sign: '+' };
    if (t.includes('salida')) return { icon: '⬆', color: 'text-red', bg: 'bg-red', label: 'Salida', sign: '-' };
    return { icon: '✎', color: 'text-orange', bg: 'bg-orange', label: 'Ajuste', sign: '' };
  }

  renderList() {
    const container = this.shadowRoot.querySelector('.movements-list');
    if (!container) return;
    container.innerHTML = '';

    if (this.movements.length === 0) {
        container.innerHTML = `<div class="empty-state">No se encontraron movimientos.</div>`;
        return;
    }

    this.movements.forEach(m => {
        const config = this.getTypeConfig(m.tipo_movimiento);
        const dateStr = new Date(m.createdAt || m.fecha_movimiento).toLocaleString();
        
        // Nombres seguros
        const prodName = m.producto?.nombre || `Producto #${m.id_producto}`;
        const whName = m.almacen?.nombre || `Almacén #${m.id_almacen}`;
        
        const item = document.createElement('div');
        item.className = 'movement-item';
        
        item.innerHTML = `
            <div class="icon-box ${config.bg} ${config.color}">
               ${config.icon}
            </div>
            <div class="info-col">
                <div class="main-text">${config.label}: ${prodName}</div>
                <div class="sub-text">${whName} • ${m.motivo || 'Sin nota'}</div>
                <div class="date-text">${dateStr}</div>
            </div>
            <div class="qty-col">
                <div class="qty-val ${config.color}">${config.sign}${m.cantidad}</div>
            </div>
        `;
        container.appendChild(item);
    });
  }

  attachEvents() {
    this.shadowRoot.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => {
            this.filterType = btn.dataset.filter;
            this.applyFilter();
        };
    });
    
    // Botón de recargar
    const refreshBtn = this.shadowRoot.querySelector('.refresh-btn');
    if(refreshBtn) refreshBtn.onclick = () => this.loadMovements();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: 'Inter', sans-serif; padding: 24px; box-sizing: border-box; height: 100%; }
        
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .header h1 { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0; }
        
        /* Contenedor principal que ocupa todo el ancho */
        .card { background: white; border-radius: 12px; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; overflow: hidden; display: flex; flex-direction: column; min-height: 400px; }
        
        /* Barra de herramientas */
        .toolbar { padding: 16px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; background: #f9fafb; }
        
        .filters-bar { display: flex; gap: 8px; }
        .filter-btn { background: white; border: 1px solid #d1d5db; padding: 6px 16px; border-radius: 6px; cursor: pointer; color: #6b7280; font-size: 0.9rem; font-weight: 500; transition: all 0.2s; }
        .filter-btn:hover { background: #f3f4f6; }
        .filter-btn.active { background: #4F46E5; color: white; border-color: #4F46E5; }

        .refresh-btn { background: white; border: 1px solid #d1d5db; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: #6b7280; }
        .refresh-btn:hover { background: #f3f4f6; color: #374151; }

        /* Lista */
        .movements-list { flex: 1; overflow-y: auto; padding: 0; }
        .movement-item { display: flex; align-items: center; padding: 16px 24px; border-bottom: 1px solid #f3f4f6; transition: background 0.1s; }
        .movement-item:hover { background: #f9fafb; }
        .movement-item:last-child { border-bottom: none; }

        .icon-box { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; font-size: 1.2rem; flex-shrink: 0; }
        
        .info-col { flex: 1; }
        .main-text { font-weight: 600; font-size: 0.95rem; color: #1f2937; }
        .sub-text { font-size: 0.85rem; color: #6b7280; margin-top: 2px; }
        .date-text { font-size: 0.75rem; color: #9ca3af; margin-top: 2px; }
        
        .qty-col { text-align: right; min-width: 80px; }
        .qty-val { font-weight: 700; font-size: 1rem; }

        /* Colores */
        .text-green { color: #059669; } .bg-green { background: #d1fae5; }
        .text-red { color: #dc2626; }   .bg-red { background: #fee2e2; }
        .text-orange { color: #d97706; } .bg-orange { background: #fef3c7; }

        .empty-state { padding: 60px; text-align: center; color: #9ca3af; font-style: italic; }
        
        /* Spinner */
        .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #4F46E5; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>

      <div class="header">
        <h1>Historial de Movimientos</h1>
      </div>

      <div class="card">
        <div class="toolbar">
            <div class="filters-bar">
                <button class="filter-btn active" data-filter="all">Todos</button>
                <button class="filter-btn" data-filter="entrada">Entradas</button>
                <button class="filter-btn" data-filter="salida">Salidas</button>
            </div>
            <button class="refresh-btn" title="Actualizar">↻</button>
        </div>
        
        <div class="movements-list">
            </div>
      </div>
    `;
  }
}
customElements.define("movements-mfe", MovementsMFE);