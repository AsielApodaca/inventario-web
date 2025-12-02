import { SupplierService } from "../services/supplierService.js"

class SuppliersMFE extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.suppliers = [];
    this.selectedSupplier = null;
    this.loading = true; // Estado inicial de carga
  }

  async connectedCallback() {
    this.render(); 

    // 2. CARGAR DATOS EN SEGUNDO PLANO
    await this.fetchSuppliers();
    
    // 3. ACTUALIZAR INTERFAZ CON DATOS
    if (this.suppliers.length > 0) {
        this.selectedSupplier = this.suppliers[0];
    }
    this.loading = false; // Terminó la carga
    
    this.render(); // Re-pintar con los datos reales
    this.attachEventListeners();
  }

  async fetchSuppliers() {
    try {
      this.suppliers = await SupplierService.getAll();
    } catch (error) {
      console.error("Error cargando proveedores:", error);
      this.suppliers = [];
    }
  }

  attachEventListeners() {
    const listContainer = this.shadowRoot.querySelector(".supplier-list-container");
    if(listContainer) {
        listContainer.addEventListener("click", (e) => {
            const item = e.target.closest(".supplier-item");
            if (item) {
                const id = parseInt(item.dataset.id);
                this.selectSupplier(id);
            }
        });
    }

    const form = this.shadowRoot.querySelector(".supplier-form")
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault()
            const saveBtn = this.shadowRoot.querySelector(".save-btn")
            const inputs = form.querySelectorAll("input");
            
            const newSupplier = {
                nombre: inputs[0].value,
                telefono: inputs[1].value, 
                email: inputs[3].value,
                direccion: "Dirección pendiente", 
            };

            try {
                saveBtn.textContent = "...";
                saveBtn.disabled = true;
                await SupplierService.create(newSupplier);
                alert("Proveedor creado!");
                form.reset();
                this.loading = true;
                this.render(); // Mostrar loading
                await this.fetchSuppliers();
                this.loading = false;
                this.render();
                this.attachEventListeners();
            } catch (error) {
                alert("Error: " + error.message);
            } finally {
                if(saveBtn) { saveBtn.textContent = "Guardar"; saveBtn.disabled = false; }
            }
        })
    }
  }

  selectSupplier(id) {
      this.selectedSupplier = this.suppliers.find(s => s.id === id);
      this.render();
      this.attachEventListeners();
  }

  getInitials(name) {
      return name ? name.substring(0, 2).toUpperCase() : '??';
  }

  render() {
    // Lógica del contenido de la lista (Loading vs Datos vs Vacío)
    let listContent = '';
    
    if (this.loading) {
        listContent = `
            <div style="padding: 20px; text-align: center; color: #6B7280;">
                <div class="spinner"></div>
                <p style="margin-top: 10px; font-size: 0.9rem;">Cargando proveedores...</p>
            </div>`;
    } else if (this.suppliers.length > 0) {
        listContent = this.suppliers.map(s => `
            <div class="supplier-item ${this.selectedSupplier?.id === s.id ? 'active' : ''}" data-id="${s.id}">
                <div class="badge-corner">${this.getInitials(s.nombre)}</div>
                <div style="flex: 1;">
                    <div class="supplier-name">${s.nombre}</div>
                    <div class="supplier-email">${s.email || 'Sin email'}</div>
                </div>
            </div>
        `).join('');
    } else {
        listContent = '<div class="empty-state">No hay proveedores registrados.</div>';
    }

    // HTML de detalles
    let detailsHTML = '<div class="empty-state">Selecciona un proveedor</div>';
    if (!this.loading && this.selectedSupplier) {
        const s = this.selectedSupplier;
        detailsHTML = `
             <div class="details-card">
                 <div class="details-header">
                    <div class="big-badge">${this.getInitials(s.nombre)}</div>
                    <h2>${s.nombre}</h2>
                 </div>
                 <div class="info-group">
                     <label>Información de Contacto</label>
                     <div class="info-row"><span>📞 Teléfono:</span> <strong>${s.telefono || 'N/A'}</strong></div>
                     <div class="info-row"><span>📧 Email:</span> <strong>${s.email || 'N/A'}</strong></div>
                     <div class="info-row"><span>📍 Dirección:</span> <strong>${s.direccion || 'N/A'}</strong></div>
                 </div>
             </div>
        `;
    }

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles/global.css">
      
      <div class="page-container">
          <div class="section-header">
             <h1>Gestión de Proveedores</h1>
             <p>Administra tu lista de proveedores y contactos.</p>
          </div>

          <div class="split-view">
            <div class="panel list-panel">
              <div class="panel-header">
                  <h3>Lista de Proveedores</h3>
              </div>
              <div class="scroll-area supplier-list-container">
                  ${listContent}
              </div>
            </div>

            <div class="panel details-panel">
               <div class="panel-header"><h3>Detalles</h3></div>
               <div class="scroll-area">${detailsHTML}</div>
            </div>

            <div class="panel form-panel">
               <div class="panel-header"><h3>Nuevo Proveedor</h3></div>
               <div class="scroll-area">
                  <form class="supplier-form">
                    <div class="form-group">
                        <label>Nombre Empresa *</label>
                        <input type="text" class="input" required placeholder="Ej: Tech Solutions">
                    </div>
                    <div class="form-group">
                        <label>Teléfono</label>
                        <input type="text" class="input" placeholder="555-123-4567">
                    </div>
                    <div class="form-group">
                        <label>Nombre Contacto</label>
                        <input type="text" class="input" placeholder="Opcional">
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" class="input" required placeholder="contacto@empresa.com">
                    </div>
                    <button type="submit" class="btn-primary save-btn">Guardar Proveedor</button>
                  </form>
               </div>
            </div>
          </div>
      </div>

      <style>
        :host { display: block; height: 100%; padding: 20px; box-sizing: border-box; }
        .page-container { display: flex; flex-direction: column; height: calc(100vh - 100px); }
        .section-header h1 { margin: 0; font-size: 1.5rem; color: #111827; }
        .section-header p { margin: 5px 0 20px 0; color: #6B7280; }
        .split-view { display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 20px; flex: 1; min-height: 0; }
        .panel { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #E5E7EB; }
        .panel-header { padding: 15px; border-bottom: 1px solid #E5E7EB; background: #F9FAFB; }
        .panel-header h3 { margin: 0; font-size: 1rem; font-weight: 600; color: #374151; }
        .scroll-area { flex: 1; overflow-y: auto; padding: 15px; }
        
        .supplier-item { display: flex; align-items: center; padding: 12px; border-bottom: 1px solid #F3F4F6; cursor: pointer; transition: background 0.2s; }
        .supplier-item:hover { background: #F9FAFB; }
        .supplier-item.active { background: #EEF2FF; border-left: 3px solid #4F46E5; }
        .badge-corner { width: 36px; height: 36px; background: #E0E7FF; color: #4F46E5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem; margin-right: 12px; }
        .supplier-name { font-weight: 500; color: #1F2937; }
        .supplier-email { font-size: 0.8rem; color: #6B7280; }
        
        /* Detalles y Form */
        .details-header { text-align: center; margin-bottom: 20px; }
        .big-badge { width: 60px; height: 60px; background: #4F46E5; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 10px auto; }
        .info-group { margin-bottom: 20px; background: #F9FAFB; padding: 15px; border-radius: 8px; }
        .info-row { margin-bottom: 8px; font-size: 0.95rem; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-size: 0.9rem; font-weight: 500; }
        .input { width: 100%; padding: 8px 10px; border: 1px solid #D1D5DB; border-radius: 6px; box-sizing: border-box; }
        .btn-primary { width: 100%; padding: 10px; background: #4F46E5; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
        .btn-primary:hover { background: #4338CA; }
        .empty-state { text-align: center; color: #9CA3AF; padding: 20px; font-style: italic; }

        /* Spinner */
        .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #4F46E5; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `
  }
}

customElements.define("suppliers-mfe", SuppliersMFE)