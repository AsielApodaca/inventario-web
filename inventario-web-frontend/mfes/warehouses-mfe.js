import { WarehouseService } from "../services/warehouseService.js"
import { InventoryService } from "../services/inventoryService.js"
import { LocationService } from "../services/locationService.js"
import { AlmacenUbicacionService } from "../services/almacenUbicacionService.js"
import { UserService } from "../services/userService.js"

class WarehousesMFE extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.warehouses = []
    this.users = []
    this.loading = true
    this.currentWarehouse = null
    this.warehouseLocations = []
    // Mapa temporal para guardar responsables (id_almacen -> nombre_responsable)
    this.responsablesMap = new Map()
  }

  async connectedCallback() {
    this.render();
    await this.loadUsers(); // Cargar usuarios primero
    this.loadWarehouses();
    this.attachEventListeners();
  }

  async loadUsers() {
    try {
        console.log("🔍 Cargando usuarios...");
        const usuarios = await UserService.getAll();
        this.users = Array.isArray(usuarios) ? usuarios : [];
        console.log(`✅ Usuarios cargados: ${this.users.length}`, this.users);
        this.updateUserSelect();
    } catch (e) {
        console.error("❌ Error cargando usuarios:", e);
        this.users = [];
        this.updateUserSelect();
    }
  }

  updateUserSelect() {
    const select = this.shadowRoot.querySelector('#new-wh-manager');
    if(!select) return;
    
    if(this.users.length === 0) {
        select.innerHTML = `<option value="">Sin usuarios disponibles</option>`;
    } else {
        select.innerHTML = `<option value="">-- Seleccionar Responsable * --</option>` + 
            this.users.map(u => {
                // Prioridad: nombre completo > username > id
                const displayName = u.nombre 
                    ? `${u.nombre} ${u.apellido || ''}`.trim()
                    : u.username || `Usuario #${u.id}`;
                return `<option value="${u.id}">${displayName}</option>`;
            }).join('');
    }
  }

  async loadWarehouses() {
    const loadingOverlay = this.shadowRoot.querySelector(".loading-overlay")
    if (loadingOverlay) loadingOverlay.style.display = "flex"
    
    try {
      const response = await WarehouseService.getAll();
      this.warehouses = Array.isArray(response.data) ? response.data : [];
      this.updateWarehousesGrid();

      if (this.warehouses.length === 0) {
          if (loadingOverlay) loadingOverlay.style.display = "none";
          return;
      }

      await Promise.allSettled(
        this.warehouses.map(async (warehouse, index) => {
          try {
            const whId = warehouse.id || warehouse.id_almacen;
            if (!whId) return;

            const ubicacionesRes = await WarehouseService.getUbicaciones(whId);
            warehouse.totalLocations = Array.isArray(ubicacionesRes.data) ? ubicacionesRes.data.length : 0;
            this.updateWarehouseCard(index, warehouse);
          } catch (err) {
            console.warn(`Error loading details for warehouse ${warehouse.id}`, err);
          }
        })
      );
    } catch (error) {
      console.error("Error loading warehouses:", error)
    } finally {
      if (loadingOverlay) loadingOverlay.style.display = "none"
    }
  }

  updateWarehousesGrid() {
    const grid = this.shadowRoot.querySelector(".grid")
    if (!grid) return
    
    if (this.warehouses.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#6b7280;">No hay almacenes registrados.</div>`;
        return;
    }

    grid.innerHTML = this.warehouses.map((wh, index) => this.getWarehouseCardHTML(wh, index)).join("")
    
    grid.querySelectorAll('.btn-manage').forEach(btn => {
        btn.onclick = (e) => {
            const index = e.target.dataset.index;
            this.openLocationManager(this.warehouses[index]);
        };
    });
  }

  getWarehouseCardHTML(wh, index) {
    // Buscar el responsable: primero en el backend, luego en el mapa local
    const responsableBackend = wh.responsable;
    const responsableLocal = this.responsablesMap.get(wh.id);
    
    console.log(`🏢 Almacén ${wh.id}:`, {
        backend: responsableBackend,
        local: responsableLocal,
        mapa: Array.from(this.responsablesMap.entries())
    });
    
    const nombreMostrar = responsableBackend || responsableLocal || 'Sin asignar';

    return `
      <div class="dashboard-card" id="card-${index}">
        <div class="card-header">
          <div class="card-icon">🏢</div>
          <div class="card-info">
            <h3>${wh.nombre}</h3>
            <p>${wh.direccion || 'Sin dirección'}</p>
          </div>
        </div>
        
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px; padding:10px; background:#F3F4F6; border-radius:8px; border:1px solid #E5E7EB;">
            <div style="background:#D1D5DB; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.8rem;">👤</div> 
            <div>
                <span style="font-size:0.75rem; color:#6B7280; display:block; line-height:1;">ENCARGADO</span>
                <strong style="font-size:0.9rem; color:#374151;">${nombreMostrar}</strong>
            </div>
        </div>
        
        <div class="stats-grid">
           <div class="stat-item">
              <span class="stat-label">Ubicaciones</span>
              <span class="stat-value" id="loc-${index}">${wh.totalLocations || '-'}</span>
           </div>
           <div class="stat-item">
              <span class="stat-label">Estado</span>
              <span class="stat-value" style="font-size:0.9rem; color:#059669; font-weight:600;">Activo</span>
           </div>
        </div>

        <div style="margin-top:15px; padding-top:10px; border-top:1px solid #eee;">
            <button class="btn-primary btn-manage" data-index="${index}" style="width:100%;">
                Gestionar Ubicaciones
            </button>
        </div>
      </div>
    `
  }

  updateWarehouseCard(index, wh) {
    const locSpan = this.shadowRoot.querySelector(`#loc-${index}`);
    if(locSpan) locSpan.textContent = wh.totalLocations || 0;
  }

  async openLocationManager(warehouse) {
    this.currentWarehouse = warehouse;
    this.shadowRoot.querySelector('#main-view').style.display = 'none';
    this.shadowRoot.querySelector('#detail-view').style.display = 'block';
    this.shadowRoot.querySelector('#detail-title').textContent = warehouse.nombre;
    this.shadowRoot.querySelector('#detail-subtitle').textContent = warehouse.direccion || '';
    
    // Buscar el responsable: primero en el backend, luego en el mapa local
    const nombreEncargado = warehouse.responsable 
        || this.responsablesMap.get(warehouse.id)
        || 'No asignado';
    
    this.shadowRoot.querySelector('#detail-manager').textContent = nombreEncargado;
    await this.loadLocations(warehouse.id);
  }

  async loadLocations(whId) {
    const listContainer = this.shadowRoot.querySelector('#locations-list');
    listContainer.innerHTML = '<div class="spinner"></div>';
    try {
        const res = await AlmacenUbicacionService.getByAlmacen(whId);
        
        console.log("📦 [Raw] Respuesta ubicaciones:", res);
        
        // El backend retorna: { data: { status: 'success', data: [...] } }
        // Necesitamos llegar hasta res.data.data.data
        if (res?.data?.data?.data && Array.isArray(res.data.data.data)) {
            this.warehouseLocations = res.data.data.data;
        } else if (res?.data?.data && Array.isArray(res.data.data)) {
            this.warehouseLocations = res.data.data;
        } else if (Array.isArray(res?.data)) {
            this.warehouseLocations = res.data;
        } else if (Array.isArray(res)) {
            this.warehouseLocations = res;
        } else {
            this.warehouseLocations = [];
        }
        
        console.log("📦 Ubicaciones procesadas:", this.warehouseLocations);
        this.renderLocationsList();
    } catch (e) {
        console.error("Error cargando ubicaciones:", e);
        this.warehouseLocations = [];
        listContainer.innerHTML = '<p style="color:red">Error cargando ubicaciones</p>';
    }
  }

  renderLocationsList() {
    const container = this.shadowRoot.querySelector('#locations-list');
    
    // Asegurar que sea un array
    if (!Array.isArray(this.warehouseLocations)) {
        console.error("❌ warehouseLocations no es un array:", this.warehouseLocations);
        this.warehouseLocations = [];
    }
    
    if(this.warehouseLocations.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:30px; background:#f9fafb; border-radius:8px; border:1px dashed #d1d5db;">
                <p style="color:#6b7280; margin:0;">No hay ubicaciones creadas.</p>
                <small>Usa el formulario para crear ubicaciones (Pasillo-Estante-Nivel).</small>
            </div>`;
        return;
    }

    container.innerHTML = this.warehouseLocations.map(loc => {
        const pasillo = loc.pasillo || '-';
        const estante = loc.estante || '-';
        const nivel = loc.nivel || '-';
        const ubicacionCodigo = `${pasillo}-${estante}-${nivel}`;
        
        return `
        <div class="location-item">
            <div style="display:flex; align-items:center; gap:10px; flex:1;">
                <div class="loc-icon">📦</div>
                <div>
                    <div style="font-weight:600; color:#374151; font-size:1rem;">${ubicacionCodigo}</div>
                    <div style="font-size:0.8rem; color:#9ca3af; margin-top:2px;">
                        Pasillo: ${pasillo} • Estante: ${estante} • Nivel: ${nivel}
                    </div>
                </div>
            </div>
        </div>
    `;
    }).join('');
  }

  closeLocationManager() {
    this.shadowRoot.querySelector('#detail-view').style.display = 'none';
    this.shadowRoot.querySelector('#main-view').style.display = 'block';
    this.currentWarehouse = null;
    this.loadWarehouses();
  }

  attachEventListeners() {
    // Crear Almacén con Encargado
    const createForm = this.shadowRoot.querySelector('#create-wh-form');
    if(createForm) {
        createForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = createForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            try {
                btn.disabled = true;
                btn.textContent = "Creando...";
                
                const name = this.shadowRoot.querySelector('#new-wh-name').value.trim();
                const addr = this.shadowRoot.querySelector('#new-wh-addr').value.trim();
                const managerId = this.shadowRoot.querySelector('#new-wh-manager').value;

                if (!name) {
                    alert("El nombre del almacén es requerido");
                    return;
                }

                // El responsable es requerido
                if (!managerId) {
                    alert("Debes seleccionar un encargado/responsable");
                    return;
                }

                // Buscar el nombre del usuario seleccionado
                const usuario = this.users.find(u => u.id == parseInt(managerId));
                const responsable = usuario 
                    ? (usuario.nombre ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : usuario.username)
                    : "Desconocido";

                const data = { 
                    nombre: name, 
                    direccion: addr || null,
                    responsable: responsable
                };

                console.log("📤 Creando almacén:", data);
                const response = await WarehouseService.create(data);
                
                console.log("📥 Respuesta del backend al crear:", response);
                
                // Guardar el responsable en el mapa local para mostrarlo después
                // Intentar encontrar el ID en diferentes ubicaciones de la respuesta
                let almacenId = null;
                
                if (response?.data?.data?.id) {
                    almacenId = response.data.data.id;
                } else if (response?.data?.id) {
                    almacenId = response.data.id;
                } else if (response?.id) {
                    almacenId = response.id;
                }
                
                if (almacenId) {
                    this.responsablesMap.set(almacenId, responsable);
                    console.log("💾 Guardado responsable localmente:", almacenId, "->", responsable);
                    console.log("🗺️ Mapa completo:", Array.from(this.responsablesMap.entries()));
                } else {
                    console.warn("⚠️ No se pudo obtener el ID del almacén creado:", response);
                }
                
                createForm.reset();
                this.updateUserSelect();
                await this.loadWarehouses();
                alert("✅ Almacén creado exitosamente");
                
            } catch(err) { 
                console.error("Error creando almacén:", err);
                const errorMsg = err.response?.data?.message || err.message || "Error desconocido";
                alert("❌ Error: " + errorMsg); 
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        };
    }

    this.shadowRoot.querySelector('#btn-back').onclick = () => this.closeLocationManager();

    // Crear Ubicación (Formato BD: pasillo, estante, nivel)
    const locForm = this.shadowRoot.querySelector('#form-create-location');
    if(locForm) {
        locForm.onsubmit = async (e) => {
            e.preventDefault();
            if(!this.currentWarehouse) {
                alert("No hay almacén seleccionado");
                return;
            }

            const btn = locForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            try {
                btn.disabled = true;
                btn.textContent = "Guardando...";
                
                const pasillo = this.shadowRoot.querySelector('#loc-pasillo').value.trim();
                const estante = this.shadowRoot.querySelector('#loc-estante').value.trim();
                const nivel = this.shadowRoot.querySelector('#loc-nivel').value.trim();

                if (!pasillo || !estante || !nivel) {
                    alert("Todos los campos son requeridos");
                    return;
                }

                const ubicacionData = {
                    id_almacen: this.currentWarehouse.id,
                    pasillo: pasillo,
                    estante: estante,
                    nivel: nivel
                };

                console.log("📍 Creando ubicación:", ubicacionData);
                
                await LocationService.create(ubicacionData);
                
                locForm.reset();
                // Resetear preview
                const preview = this.shadowRoot.querySelector('#preview-ubicacion');
                if(preview) preview.textContent = '-';
                
                await this.loadLocations(this.currentWarehouse.id);
                alert(`✅ Ubicación ${pasillo}-${estante}-${nivel} creada exitosamente`);
                
            } catch(err) {
                console.error("Error creando ubicación:", err);
                const errorMsg = err.response?.data?.message || err.message || "Error desconocido";
                alert("❌ Error: " + errorMsg);
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        };
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: 'Inter', system-ui, sans-serif; background-color: #f3f4f6; min-height: 100vh; padding: 2rem; color: #1f2937; }
        
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        h1 { font-size: 1.875rem; font-weight: 700; color: #111827; margin: 0; }
        
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; margin-top:20px; }
        .dashboard-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; transition: transform 0.2s; }
        .dashboard-card:hover { transform: translateY(-4px); }
        
        .card-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .card-icon { width: 48px; height: 48px; background: #e0e7ff; color: #4F46E5; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
        .card-info h3 { margin: 0; font-size: 1.125rem; font-weight: 600; }
        .card-info p { margin: 0; color: #6b7280; font-size: 0.875rem; }
        
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom:10px; }
        .stat-item { display: flex; flex-direction: column; }
        .stat-label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; font-weight: 600; }
        .stat-value { font-size: 1.25rem; font-weight: 700; color: #111827; }

        .btn-primary { background: #4F46E5; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; font-weight: 500; cursor: pointer; transition: background 0.2s; }
        .btn-primary:hover:not(:disabled) { background: #4338ca; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }

        .form-input { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; box-sizing: border-box; background: #f9fafb; font-size: 0.95rem; }
        .form-input:focus { border-color: #4F46E5; background:white; outline:none; }

        .loading-overlay { position: fixed; inset: 0; background: rgba(255,255,255,0.8); z-index: 1000; display: none; align-items: center; justify-content: center; }
        .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #4F46E5; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .detail-layout { display: grid; grid-template-columns: 1fr 400px; gap: 24px; margin-top: 20px; }
        .panel { background: white; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; }
        .location-item { display: flex; justify-content: space-between; align-items: center; padding: 14px; border-bottom: 1px solid #f3f4f6; transition: background 0.15s; }
        .location-item:hover { background: #f9fafb; }
        .location-item:last-child { border-bottom: none; }
        .loc-icon { background:#E0E7FF; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.1rem; }
        
        @media (max-width: 900px) { .detail-layout { grid-template-columns: 1fr; } }
      </style>

      <div class="loading-overlay"><div class="spinner"></div></div>

      <div id="main-view">
          <div class="header">
            <h1>🏢 Almacenes</h1>
          </div>

          <div style="background:white; padding:20px; border-radius:12px; border:1px solid #e5e7eb; margin-bottom:20px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
            <h3 style="margin:0 0 15px 0; font-size:1.1rem; color:#111827; display:flex; align-items:center; gap:8px;">
                <span style="font-size:1.3rem;">➕</span> Registrar Nuevo Almacén
            </h3>
            <form id="create-wh-form" style="display:flex; gap:15px; flex-wrap:wrap; align-items:end;">
                <div style="flex:1; min-width:200px;">
                    <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:5px; color:#374151;">Nombre *</label>
                    <input id="new-wh-name" class="form-input" placeholder="Ej. Almacén Central" required>
                </div>
                <div style="flex:2; min-width:200px;">
                    <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:5px; color:#374151;">Dirección</label>
                    <input id="new-wh-addr" class="form-input" placeholder="Calle, Número, Ciudad">
                </div>
                
                <div style="flex:1; min-width:200px;">
                    <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:5px; color:#374151;">👤 Encargado / Responsable *</label>
                    <select id="new-wh-manager" class="form-input" required>
                        <option value="">Cargando usuarios...</option>
                    </select>
                </div>

                <button type="submit" class="btn-primary" style="height:42px;">Crear Almacén</button>
            </form>
          </div>

          <div class="grid"></div>
      </div>

      <div id="detail-view" style="display:none;">
          <div class="header">
             <div style="display:flex; align-items:center; gap:15px;">
                 <button id="btn-back" class="btn-secondary">← Volver</button>
                 <div>
                    <h1 id="detail-title" style="margin:0; font-size:1.5rem;">Nombre</h1>
                    <div style="display:flex; gap:10px; align-items:center; margin-top:5px;">
                        <span id="detail-subtitle" style="font-size:0.9rem; color:#6b7280;">Dirección</span>
                        <span style="color:#ddd;">|</span>
                        <span style="font-size:0.9rem; color:#4B5563;">👤 Encargado: <strong id="detail-manager">-</strong></span>
                    </div>
                 </div>
             </div>
          </div>

          <div class="detail-layout">
             <div class="panel">
                <h3 style="margin-top:0; border-bottom:2px solid #E0E7FF; padding-bottom:15px; color:#4F46E5; display:flex; align-items:center; gap:8px;">
                    <span>📦</span> Ubicaciones del Almacén
                </h3>
                <div id="locations-list"></div>
             </div>

             <div class="panel" style="height:fit-content;">
                <h3 style="margin-top:0; color:#4F46E5; display:flex; align-items:center; gap:8px;">
                    <span>➕</span> Nueva Ubicación
                </h3>
                <p style="font-size:0.85rem; color:#6b7280; margin:0 0 20px 0; line-height:1.5;">
                    Define la ubicación física usando el formato estándar de tu almacén
                </p>
                <form id="form-create-location">
                    <div style="margin-bottom:15px;">
                        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px; color:#374151;">
                            🚶 Pasillo *
                        </label>
                        <input id="loc-pasillo" class="form-input" placeholder="Ej. A, B, 1, 2..." maxlength="255" required>
                    </div>
                    <div style="margin-bottom:15px;">
                        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px; color:#374151;">
                            📚 Estante *
                        </label>
                        <input id="loc-estante" class="form-input" placeholder="Ej. 01, 02, A1..." maxlength="255" required>
                    </div>
                    <div style="margin-bottom:15px;">
                        <label style="display:block; font-size:0.85rem; font-weight:600; margin-bottom:5px; color:#374151;">
                            ⬆️ Nivel *
                        </label>
                        <input id="loc-nivel" class="form-input" placeholder="Ej. 1, 2, 3..." maxlength="255" required>
                    </div>
                    <div style="background:#E0E7FF; padding:12px; border-radius:8px; margin-bottom:15px; border:2px solid #C7D2FE;">
                        <div style="font-size:0.75rem; color:#4338CA; font-weight:600; margin-bottom:4px;">VISTA PREVIA</div>
                        <div style="font-size:1.1rem; font-weight:700; color:#4F46E5; font-family:monospace;" id="preview-ubicacion">-</div>
                    </div>
                    <button type="submit" class="btn-primary" style="width:100%;">✅ Agregar Ubicación</button>
                </form>
             </div>
          </div>
      </div>
    `
    
    // Preview en tiempo real
    setTimeout(() => {
        const pasillo = this.shadowRoot.querySelector('#loc-pasillo');
        const estante = this.shadowRoot.querySelector('#loc-estante');
        const nivel = this.shadowRoot.querySelector('#loc-nivel');
        const preview = this.shadowRoot.querySelector('#preview-ubicacion');
        
        const updatePreview = () => {
            const p = pasillo?.value.trim() || '-';
            const e = estante?.value.trim() || '-';
            const n = nivel?.value.trim() || '-';
            if(preview) preview.textContent = `${p}-${e}-${n}`;
        };
        
        pasillo?.addEventListener('input', updatePreview);
        estante?.addEventListener('input', updatePreview);
        nivel?.addEventListener('input', updatePreview);
    }, 100);
  }
}

customElements.define("warehouses-mfe", WarehousesMFE)