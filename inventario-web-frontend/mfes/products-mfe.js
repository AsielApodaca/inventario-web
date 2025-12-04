import { ProductService } from "../services/productService.js"

class ProductsMFE extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.products = [];
    this.loading = true; 
  }

  async connectedCallback() {
    this.render();
    await this.loadProducts();
    this.attachEventListeners();
  }

  async loadProducts() {
    try {
      this.loading = true;
      this.updateTableContent(); 
      this.products = await ProductService.getAll();
    } catch (error) {
      console.error("Error cargando productos:", error);
      this.products = [];
    } finally {
      this.loading = false;
      this.updateTableContent();
      this.updateCount();
    }
  }

  updateTableContent() {
    const tbody = this.shadowRoot.querySelector('#table-body');
    if (!tbody) return;

    if (this.loading) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="padding: 50px; text-align: center;">
                    <div class="spinner"></div>
                    <p style="color: #6B7280; margin-top: 10px; font-size: 0.9rem;">Consultando catálogo...</p>
                </td>
            </tr>`;
        return;
    }

    if (!this.products || this.products.length === 0) {
      tbody.innerHTML = `
        <tr>
            <td colspan="8" style="padding: 40px; text-align: center; color: #6B7280;">
                <div style="font-size: 2rem; margin-bottom: 10px;">📦</div>
                No hay productos registrados.
            </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = this.products.map(product => {
      const stock = Number(product.stock) || 0;
      const min = Number(product.stock_minimo) || 0;
      const isLowStock = stock <= min;
      const badgeClass = isLowStock ? 'badge-danger' : 'badge-success';
      const badgeText = isLowStock ? 'Bajo Stock' : 'En Stock';
      
      return `
        <tr>
          <td>
            <div class="product-name">
              <div class="product-icon">📦</div>
              <div>
                <div class="font-medium">${this.escapeHtml(product.nombre)}</div>
                <div class="text-muted text-sm">${this.escapeHtml(product.codigo_barras || 'S/N')}</div>
              </div>
            </div>
          </td>
          <td>${this.escapeHtml(product.categoria?.nombre || 'General')}</td>
          <td>${this.escapeHtml(product.proveedor?.nombre || 'General')}</td>
          <td class="text-right">${this.formatCurrency(product.precio_compra)}</td>
          <td class="text-right">${this.formatCurrency(product.precio_venta)}</td>
          <td class="text-center">
            <span class="${isLowStock ? 'text-danger font-bold' : ''}">${stock}</span>
          </td>
          <td><span class="badge ${badgeClass}">${badgeText}</span></td>
          <td class="text-center">
             <button class="btn-icon edit-btn" data-id="${product.id}" title="Editar">✏️</button>
          </td>
        </tr>
      `
    }).join('');
    
    this.attachEditButtons();
  }

  updateCount() {
      const label = this.shadowRoot.querySelector('#total-count');
      if(label) label.textContent = `${this.products.length} productos encontrados`;
  }

  attachEventListeners() {
    const searchInput = this.shadowRoot.querySelector('#search-input');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const rows = this.shadowRoot.querySelectorAll('#table-body tr');
            rows.forEach(row => {
                if(row.cells.length < 2) return; 
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }

    const refreshBtn = this.shadowRoot.querySelector('.refresh-btn');
    if(refreshBtn) refreshBtn.addEventListener('click', () => this.loadProducts());
    
    const addBtn = this.shadowRoot.querySelector('.add-btn');
    if(addBtn) addBtn.addEventListener('click', () => this.showCreateProductModal());
    
    this.attachEditButtons();
  }

  attachEditButtons() {
    this.shadowRoot.querySelectorAll('.edit-btn').forEach(btn => {
      // Clonar para evitar duplicados
      const btnClone = btn.cloneNode(true);
      btn.parentNode.replaceChild(btnClone, btn);
      btnClone.addEventListener('click', () => {
        const id = btnClone.getAttribute('data-id');
        this.showEditProductModal(id);
      });
    });
  }

  // --- MODAL CREAR (AGREGADO DESCRIPCIÓN) ---
  showCreateProductModal() {
      if (this.shadowRoot.querySelector('#create-product-modal')) return;
      const modal = document.createElement('div');
      modal.id = 'create-product-modal';
      modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <h2>Nuevo Producto</h2>
          <form id="create-product-form">
            <div class="form-grid">
                <label>Nombre *<br><input name="nombre" required></label>
                <label>Código de Barras<br><input name="codigo_barras"></label>
                
                <label>Categoría *<br><select name="categoria" id="categoria-select" required><option>Cargando...</option></select></label>
                <label>Proveedor *<br><select name="proveedor" id="proveedor-select" required><option>Cargando...</option></select></label>
                
                <label>Precio Compra *<br><input name="precio_compra" type="number" step="0.01" required></label>
                <label>Precio Venta *<br><input name="precio_venta" type="number" step="0.01" required></label>
                
                <label>Stock Inicial *<br><input name="stock" type="number" required></label>
                <label>Stock Mínimo *<br><input name="stock_minimo" type="number" required></label>
            </div>
            
            <label style="margin-top:10px; display:block;">Descripción<br>
                <textarea name="descripcion" rows="3" style="width:100%; border:1px solid #ccc; border-radius:6px; padding:8px;"></textarea>
            </label>

            <div class="modal-actions">
              <button type="button" class="btn-icon" id="cancel-modal">Cancelar</button>
              <button type="submit" class="btn-primary">Crear Producto</button>
            </div>
            <div id="modal-error" style="color:red;margin-top:8px;"></div>
          </form>
        </div>
        <style>
          .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; }
          .modal-content { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 12px; z-index: 1001; min-width: 500px; max-height: 90vh; overflow-y: auto; }
          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .modal-actions { margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px; }
          input, select { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }
        </style>
      `;
      this.shadowRoot.appendChild(modal);

      this.loadSelectOptions(modal, '#categoria-select', '#proveedor-select');

      modal.querySelector('#cancel-modal').onclick = () => modal.remove();

      modal.querySelector('#create-product-form').onsubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = Object.fromEntries(new FormData(form));
        
        // Formateo de datos
        data.precio_compra = parseFloat(data.precio_compra);
        data.precio_venta = parseFloat(data.precio_venta);
        data.stock = parseInt(data.stock);
        data.stock_minimo = parseInt(data.stock_minimo);
        data.id_categoria = parseInt(data.categoria);
        data.id_proveedor = parseInt(data.proveedor);
        delete data.categoria;
        delete data.proveedor;

        try {
          await ProductService.create(data);
          alert("Producto creado exitosamente");
          modal.remove();
          this.loadProducts();
        } catch (err) {
          modal.querySelector('#modal-error').textContent = 'Error: ' + err.message;
        }
      };
  }

  // --- MODAL EDITAR (AGREGADO DESCRIPCIÓN) ---
  async showEditProductModal(productId) {
      if (this.shadowRoot.querySelector('#edit-product-modal')) return;
      
      try {
        const productRes = await ProductService.getById(productId);
        const prod = productRes.data || productRes;
        
        if (!prod) throw new Error("Producto no encontrado");

        const catId = prod.id_categoria || prod.categoria?.id || '';
        const provId = prod.id_proveedor || prod.proveedor?.id || '';

        const modal = document.createElement('div');
        modal.id = 'edit-product-modal';
        modal.innerHTML = `
          <div class="modal-overlay"></div>
          <div class="modal-content">
            <h2>Editar Producto</h2>
            <form id="edit-product-form">
              <div class="form-grid">
                <label>Nombre<br><input name="nombre" value="${this.escapeHtml(prod.nombre)}" required></label>
                <label>Código<br><input name="codigo_barras" value="${this.escapeHtml(prod.codigo_barras || '')}"></label>
                
                <label>Categoría<br><select name="categoria" id="edit-cat-select" required></select></label>
                <label>Proveedor<br><select name="proveedor" id="edit-prov-select" required></select></label>
                
                <label>Precio Compra<br><input name="precio_compra" type="number" step="0.01" value="${prod.precio_compra}" required></label>
                <label>Precio Venta<br><input name="precio_venta" type="number" step="0.01" value="${prod.precio_venta}" required></label>
                
                <label>Stock<br><input name="stock" type="number" value="${prod.stock}" required></label>
                <label>Mínimo<br><input name="stock_minimo" type="number" value="${prod.stock_minimo}" required></label>
              </div>

              <label style="margin-top:10px; display:block;">Descripción<br>
                <textarea name="descripcion" rows="3" style="width:100%; border:1px solid #ccc; border-radius:6px; padding:8px;">${this.escapeHtml(prod.descripcion || '')}</textarea>
              </label>

              <div class="modal-actions">
                <button type="button" class="btn-icon" id="cancel-edit">Cancelar</button>
                <button type="submit" class="btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
          <style>
            .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; }
            .modal-content { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 12px; z-index: 1001; min-width: 500px; }
            .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .modal-actions { margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px; }
            input, select { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }
          </style>
        `;
        this.shadowRoot.appendChild(modal);

        // Cargar opciones y pre-seleccionar
        this.loadSelectOptions(modal, '#edit-cat-select', '#edit-prov-select', catId, provId);

        modal.querySelector('#cancel-edit').onclick = () => modal.remove();

        modal.querySelector('#edit-product-form').onsubmit = async (e) => {
            e.preventDefault();
            const form = e.target;
            const data = Object.fromEntries(new FormData(form));
            
            data.precio_compra = parseFloat(data.precio_compra);
            data.precio_venta = parseFloat(data.precio_venta);
            data.stock = parseInt(data.stock);
            data.stock_minimo = parseInt(data.stock_minimo);
            data.id_categoria = parseInt(data.categoria);
            data.id_proveedor = parseInt(data.proveedor);
            delete data.categoria;
            delete data.proveedor;

            try {
                await ProductService.update(productId, data);
                alert("Producto actualizado");
                modal.remove();
                this.loadProducts();
            } catch (err) {
                alert("Error al actualizar: " + err.message);
            }
        };

      } catch (error) {
        alert("Error cargando producto: " + error.message);
      }
  }

  // Helper para cargar selects
  async loadSelectOptions(modal, catSelector, provSelector, selectedCat = null, selectedProv = null) {
      const catSelect = modal.querySelector(catSelector);
      const provSelect = modal.querySelector(provSelector);

      // Cargar Categorías
      import('../services/categoryService.js').then(({ CategoryService }) => {
          CategoryService.getAll().then(cats => {
              // Buscar array en la respuesta
              const list = Array.isArray(cats) ? cats : (cats.data || []);
              catSelect.innerHTML = list.length 
                  ? list.map(c => `<option value="${c.id}" ${c.id == selectedCat ? 'selected' : ''}>${c.nombre}</option>`).join('')
                  : '<option>No hay categorías</option>';
          });
      });

      // Cargar Proveedores
      import('../services/supplierService.js').then(({ SupplierService }) => {
          SupplierService.getAll().then(provs => {
              const list = Array.isArray(provs) ? provs : (provs.data || []);
              provSelect.innerHTML = list.length
                  ? list.map(p => `<option value="${p.id}" ${p.id == selectedProv ? 'selected' : ''}>${p.nombre}</option>`).join('')
                  : '<option>No hay proveedores</option>';
          });
      });
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles/global.css">
      
      <div class="page-container">
          <div class="page-header">
            <div class="page-title">
              <h1>Inventario de Productos</h1>
              <p>Gestiona tu catálogo, precios y existencias.</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn-icon refresh-btn" title="Recargar Datos">↻</button>
                <button class="btn-primary add-btn">
                  <span>+</span> Nuevo Producto
                </button>
            </div>
          </div>

          <div class="toolbar">
            <div class="search-wrapper">
              <span class="search-icon">🔍</span>
              <input type="text" id="search-input" class="search-input" placeholder="Buscar por nombre, código o descripción...">
            </div>
            <div id="total-count" class="text-muted text-sm">Cargando...</div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Proveedor</th>
                  <th class="text-right">Costo</th>
                  <th class="text-right">Precio</th>
                  <th class="text-center">Stock</th>
                  <th>Estado</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody id="table-body"></tbody>
            </table>
          </div>
      </div>

      <style>
        /* --- LAYOUT GENERAL --- */
        :host { 
            display: block; 
            padding: 20px; 
            box-sizing: border-box; 
            height: 100%; 
            overflow: hidden; /* El scroll lo maneja la tabla interna */
        }
        
        .page-container { 
            display: flex; 
            flex-direction: column; 
            height: 100%; 
            max-height: 100%;
        }
        
        /* --- HEADER Y TOOLBAR FIJOS --- */
        .page-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 24px; 
            flex-shrink: 0; /* No encoger */
        }
        .page-title h1 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #111827; }
        .page-title p { margin: 4px 0 0; color: #6B7280; font-size: 0.9rem; }

        .toolbar { 
            background: white; 
            padding: 16px; 
            border-radius: 8px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
            display: flex; 
            gap: 16px; 
            margin-bottom: 24px; 
            align-items: center; 
            border: 1px solid #E5E7EB;
            flex-shrink: 0; /* No encoger */
        }
        .search-wrapper { flex: 1; position: relative; }
        .search-input { width: 100%; padding: 10px 16px; padding-left: 40px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 0.95rem; outline: none; box-sizing: border-box; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9CA3AF; }

        /* --- TABLA CON SCROLL INTERNO --- */
        .table-container { 
            background: white; 
            border-radius: 8px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
            border: 1px solid #E5E7EB;
            
            /* Magia del Scroll: */
            flex: 1;            /* Ocupar todo el espacio restante vertical */
            overflow: auto;     /* Activar scroll si es necesario */
            min-height: 0;      /* Fix para Flexbox */
        }

        table { width: 100%; border-collapse: collapse; }
        
        th { 
            background: #F9FAFB; 
            color: #6B7280; 
            font-weight: 600; 
            text-transform: uppercase; 
            font-size: 0.75rem; 
            letter-spacing: 0.05em; 
            padding: 12px 24px; 
            text-align: left; 
            border-bottom: 1px solid #E5E7EB;
            
            /* Encabezados Fijos (Sticky Header) */
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        td { padding: 16px 24px; border-bottom: 1px solid #E5E7EB; color: #374151; font-size: 0.9rem; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:hover { background-color: #F9FAFB; }

        /* --- UTILIDADES VISUALES --- */
        .product-name { display: flex; align-items: center; gap: 12px; }
        .product-icon { width: 40px; height: 40px; background: #EEF2FF; color: #4F46E5; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 1.2rem; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-muted { color: #6B7280; }
        .text-sm { font-size: 0.8rem; }
        .font-medium { font-weight: 500; color: #111827; }
        .font-bold { font-weight: 700; }
        .text-danger { color: #DC2626; }

        .badge { padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        .badge-success { background: #D1FAE5; color: #065F46; }
        .badge-danger { background: #FEE2E2; color: #991B1B; }

        .btn-primary { background: #4F46E5; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 8px; }
        .btn-primary:hover { background: #4338CA; }
        .btn-icon { background: transparent; border: 1px solid #D1D5DB; cursor: pointer; padding: 8px 12px; border-radius: 6px; font-size: 1rem; color: #6B7280; }
        .btn-icon:hover { background: #F3F4F6; color: #374151; }

        .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #4F46E5; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `
  }
}

customElements.define("products-mfe", ProductsMFE)