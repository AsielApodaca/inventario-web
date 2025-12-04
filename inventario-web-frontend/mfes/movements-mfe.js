import { MovementService } from '../services/movementService.js';
import { ProductService } from '../services/productService.js';
import { WarehouseService } from '../services/warehouseService.js';
import { InventoryService } from '../services/inventoryService.js';           // <--- NUEVO
import { AlmacenUbicacionService } from '../services/almacenUbicacionService.js'; // <--- NUEVO

class MovementsMFE extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.movements = [];
    this.products = [];
    this.warehouses = [];
    this.filterType = 'all'; 
  }

  async connectedCallback() {
    this.render();
    this.loadResources();
    this.loadMovements();
    
    this.attachEvents();
  }

  async loadResources() {
    try {
        const [prodRes, wareRes] = await Promise.all([
            ProductService.getAll(),
            WarehouseService.getAll()
        ]);
        this.products = prodRes || [];
        // Normalización de almacenes
        this.warehouses = Array.isArray(wareRes) ? wareRes : (wareRes.data || []);
        
        this.updateFormOptions();
    } catch (e) {
        console.error("Error recursos:", e);
    }
  }

  async loadMovements() {
    try {
        // Usamos rango amplio para asegurar que salgan todos
        const res = await MovementService.getByDate({
            fecha_inicio: '2000-01-01',
            fecha_fin: '2030-12-31' 
        });
        
        let data = [];
        if (Array.isArray(res)) data = res;
        else if (Array.isArray(res.data)) data = res.data; 
        else if (Array.isArray(res.data?.data)) data = res.data.data;

        // Enriquecer con nombres de almacén
        this.allMovements = data.map(m => {
            const warehouse = this.warehouses.find(w => w.id == m.id_almacen);
            return {
                ...m,
                almacen_nombre: m.almacen?.nombre || warehouse?.nombre || `Almacén ${m.id_almacen}`
            };
        });

        this.applyFilter();
    } catch (error) {
        console.error(error);
        const list = this.shadowRoot.querySelector('.movements-list');
        if(list) list.innerHTML = `<div style="padding:20px;color:red;text-align:center">Error: ${error.message}</div>`;
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

  updateFormOptions() {
    const prodSelect = this.shadowRoot.querySelector('#mov-product');
    const wareSelect = this.shadowRoot.querySelector('#mov-warehouse');
    if(prodSelect) prodSelect.innerHTML = `<option value="">Seleccionar producto...</option>` + this.products.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
    if(wareSelect) wareSelect.innerHTML = `<option value="">Seleccionar almacén...</option>` + this.warehouses.map(w => `<option value="${w.id}">${w.nombre}</option>`).join('');
  }

  getTypeConfig(type) {
    const t = (type || '').toLowerCase();
    if (t.includes('entrada')) return { icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />', color: 'text-green', bg: 'bg-green', label: 'Entrada', sign: '+' };
    if (t.includes('salida')) return { icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />', color: 'text-red', bg: 'bg-red', label: 'Salida', sign: '-' };
    return { icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />', color: 'text-orange', bg: 'bg-orange', label: 'Ajuste', sign: '' };
  }

  // --- RENDERIZADO DE LA LISTA CON BOTÓN DE ACCIÓN ---
  renderList() {
    const container = this.shadowRoot.querySelector('.movements-list');
    if (!container) return;
    container.innerHTML = '';

    if (this.movements.length === 0) {
        container.innerHTML = `<div class="empty-state">No hay movimientos.</div>`;
        return;
    }

    this.movements.forEach(m => {
        const config = this.getTypeConfig(m.tipo_movimiento);
        const dateStr = new Date(m.createdAt || m.fecha_movimiento).toLocaleString();
        const prodName = m.producto?.nombre || 'Producto desconocido';
        
        const item = document.createElement('div');
        item.className = 'movement-item';
        
        // Logica botón: Solo si es Entrada (para sumar stock)
        // Podrías agregar una bandera 'procesado' si tu backend la tuviera.
        let actionBtn = '';
        if (m.tipo_movimiento === 'entrada') {
            actionBtn = `<button class="btn-process" data-id="${m.id}">📥 Agregar al Stock</button>`;
        }

        item.innerHTML = `
            <div class="icon-box ${config.bg} ${config.color}">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">${config.icon}</svg>
            </div>
            <div class="info-col">
                <div class="main-text">${config.label}: ${prodName}</div>
                <div class="sub-text">${m.almacen_nombre} • Ref: ${m.referencia || '-'}</div>
                <div class="date-text">${dateStr}</div>
            </div>
            <div class="qty-col">
                <div class="qty-val ${config.color}">${config.sign}${m.cantidad}</div>
                ${actionBtn}
            </div>
        `;
        
        // Evento del botón
        const btn = item.querySelector('.btn-process');
        if(btn) {
            btn.onclick = () => this.showProcessModal(m);
        }

        container.appendChild(item);
    });
  }

  // --- NUEVA FUNCIONALIDAD: PROCESAR ENTRADA ---
  async showProcessModal(movement) {
    // 1. Obtener ubicaciones del almacén de este movimiento
    let locations = [];
    try {
        const res = await AlmacenUbicacionService.getByAlmacen(movement.id_almacen);
        // Normalización de respuesta de ubicaciones
        locations = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    } catch(e) {
        console.warn("No se pudieron cargar ubicaciones", e);
    }

    if(locations.length === 0) {
        alert("⚠️ Este almacén no tiene ubicaciones configuradas. Crea ubicaciones primero.");
        return;
    }

    // 2. Crear Modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-card">
            <h3>Agregar al Inventario</h3>
            <p style="color:#666; font-size:0.9rem; margin-bottom:15px;">
                Vas a agregar <strong>${movement.cantidad}</strong> unidades de 
                <strong>${movement.producto?.nombre || 'Producto'}</strong> al 
                <strong>${movement.almacen_nombre}</strong>.
            </p>

            <label class="form-label">Selecciona Ubicación (Estante/Rack):</label>
            <select id="process-location" class="form-select" style="margin-bottom:20px;">
                <option value="">-- Seleccionar --</option>
                ${locations.map(loc => `<option value="${loc.id}">${loc.nombre} (${loc.codigo || loc.id})</option>`).join('')}
            </select>

            <div style="display:flex; gap:10px; justify-content:flex-end;">
                <button class="btn-cancel">Cancelar</button>
                <button class="btn-confirm">Confirmar y Guardar</button>
            </div>
        </div>
    `;
    this.shadowRoot.appendChild(modal);

    // Eventos Modal
    const select = modal.querySelector('select');
    modal.querySelector('.btn-cancel').onclick = () => modal.remove();
    
    modal.querySelector('.btn-confirm').onclick = async () => {
        const locationId = select.value;
        if(!locationId) {
            alert("Debes seleccionar una ubicación.");
            return;
        }

        try {
            const btn = modal.querySelector('.btn-confirm');
            btn.textContent = "Guardando...";
            btn.disabled = true;

            // LLAMADA AL INVENTARIO
            await InventoryService.create({
                id_almacen: movement.id_almacen,
                id_producto: movement.id_producto,
                id_ubicacion: parseInt(locationId),
                cantidad: movement.cantidad,
                // Opcional: min/max stock si tu API lo pide, si no, se deja default
                stock_minimo: 0, 
                stock_maximo: 100 
            });

            alert("✅ ¡Stock actualizado correctamente!");
            modal.remove();
            // Opcional: Podrías marcar el movimiento como 'procesado' visualmente si guardaras eso en localstorage o BD
            
        } catch(err) {
            console.error(err);
            alert("Error al guardar en inventario: " + (err.response?.data?.message || err.message));
            modal.querySelector('.btn-confirm').disabled = false;
        }
    };
  }

  updateFilterButtons() {
    const btns = this.shadowRoot.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
        if(btn.dataset.filter === this.filterType) btn.classList.add('active');
        else btn.classList.remove('active');
    });
  }

  attachEvents() {
    // Filtros
    this.shadowRoot.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => {
            this.filterType = btn.dataset.filter;
            this.applyFilter();
        };
    });

    // Formulario Manual
    const form = this.shadowRoot.querySelector('#manual-movement-form');
    if(form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            // ... (Misma lógica de guardado manual que ya tenías) ...
            // Solo asegurate de usar: tipo_movimiento, id_producto, etc.
            const btn = form.querySelector('button[type="submit"]');
            try {
                btn.disabled = true;
                const type = this.shadowRoot.querySelector('#mov-type').value;
                const prodId = this.shadowRoot.querySelector('#mov-product').value;
                const wareId = this.shadowRoot.querySelector('#mov-warehouse').value;
                const qty = this.shadowRoot.querySelector('#mov-qty').value;
                const reason = this.shadowRoot.querySelector('#mov-reason').value;

                await MovementService.createEntry({
                    tipo_movimiento: type,
                    id_producto: parseInt(prodId),
                    id_almacen: parseInt(wareId),
                    cantidad: parseInt(qty),
                    motivo: reason,
                    referencia: "MANUAL-" + Date.now().toString().slice(-4)
                });

                alert("Registrado");
                form.reset();
                setTimeout(() => this.loadMovements(), 500);
            } catch(er) { alert(er.message); }
            finally { btn.disabled = false; }
        };
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: 'Inter', sans-serif; background-color: #f3f4f6; min-height: 100vh; padding: 24px; color: #1f2937; }
        
        /* LAYOUT */
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .header h1 { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0; }
        
        .content-grid { display: grid; grid-template-columns: 1fr 380px; gap: 24px; align-items: start; }
        
        /* IZQUIERDA */
        .filters-bar { display: flex; gap: 10px; margin-bottom: 20px; }
        .filter-btn { background: white; border: 1px solid #e5e7eb; padding: 6px 16px; border-radius: 20px; cursor: pointer; color: #6b7280; font-weight: 500; }
        .filter-btn.active { background: #4F46E5; color: white; border-color: #4F46E5; }

        .movements-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .card-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 20px; }

        .movement-item { display: flex; align-items: center; padding: 16px 0; border-bottom: 1px solid #f3f4f6; }
        .icon-box { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; }
        .info-col { flex: 1; }
        .main-text { font-weight: 600; font-size: 0.95rem; }
        .sub-text { font-size: 0.85rem; color: #6b7280; }
        .date-text { font-size: 0.75rem; color: #9ca3af; }
        .qty-col { text-align: right; display:flex; flex-direction:column; align-items:flex-end; gap:5px; }
        .qty-val { font-weight: 700; font-size: 1rem; }

        .btn-process {
            background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE;
            padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600;
            cursor: pointer; transition: all 0.2s;
        }
        .btn-process:hover { background: #2563EB; color: white; }

        /* DERECHA */
        .form-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid #e5e7eb; position: sticky; top: 20px; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px; }
        .form-select, .form-input, .form-textarea { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; box-sizing: border-box; }
        .btn-submit { width: 100%; background: #4F46E5; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; }

        /* COLORES */
        .text-green { color: #059669; } .bg-green { background: #d1fae5; }
        .text-red { color: #dc2626; }   .bg-red { background: #fee2e2; }
        .text-orange { color: #d97706; } .bg-orange { background: #fef3c7; }

        /* MODAL */
        .modal-overlay { position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5); z-index:999; display:flex; justify-content:center; align-items:center; }
        .modal-card { background:white; padding:25px; border-radius:12px; width:400px; box-shadow:0 20px 25px rgba(0,0,0,0.2); }
        .btn-confirm { background:#4F46E5; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; }
        .btn-cancel { background:transparent; border:1px solid #ccc; padding:8px 16px; border-radius:6px; cursor:pointer; }
      </style>

      <div class="header">
        <div><h1>Movimientos de Inventario</h1></div>
      </div>

      <div class="content-grid">
        <div class="left-panel">
            <div class="filters-bar">
                <button class="filter-btn active" data-filter="all">Todos</button>
                <button class="filter-btn" data-filter="entrada">Entradas</button>
                <button class="filter-btn" data-filter="salida">Salidas</button>
            </div>
            <div class="movements-card">
                <div class="card-title">Historial</div>
                <div class="movements-list">Cargando...</div>
            </div>
        </div>

        <div class="right-panel">
            <div class="form-card">
                <div class="card-title">Registrar Manual</div>
                <form id="manual-movement-form">
                    <div class="form-group"><label class="form-label">Tipo</label><select id="mov-type" class="form-select"><option value="entrada">Entrada</option><option value="salida">Salida</option><option value="ajuste">Ajuste</option></select></div>
                    <div class="form-group"><label class="form-label">Producto</label><select id="mov-product" class="form-select"></select></div>
                    <div class="form-group"><label class="form-label">Almacén</label><select id="mov-warehouse" class="form-select"></select></div>
                    <div class="form-group"><label class="form-label">Cantidad</label><input type="number" id="mov-qty" class="form-input" min="1" required></div>
                    <div class="form-group"><label class="form-label">Nota</label><textarea id="mov-reason" class="form-textarea"></textarea></div>
                    <button type="submit" class="btn-submit">Registrar</button>
                </form>
            </div>
        </div>
      </div>
    `;
  }
}
customElements.define("movements-mfe", MovementsMFE);