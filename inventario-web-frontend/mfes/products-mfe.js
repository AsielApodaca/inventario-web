import { ProductService } from "../services/productService.js"

class ProductsMFE extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.products = [];
    this.loading = true; // Empezamos cargando
  }

  async connectedCallback() {
    // 1. PINTAR ESTRUCTURA VISUAL INMEDIATAMENTE
    // Esto evita la pantalla en blanco
    this.render();
    
    // 2. CARGAR DATOS EN SEGUNDO PLANO
    await this.loadProducts();
    
    // 3. CONECTAR EVENTOS
    this.attachEventListeners();
  }

  async loadProducts() {
    try {
      this.loading = true;
      this.updateTableContent(); // Muestra el spinner

      // Llamada al servicio
      this.products = await ProductService.getAll();
      
      console.log("Productos cargados:", this.products); // Debug

    } catch (error) {
      console.error("Error cargando productos:", error);
      this.products = [];
    } finally {
      this.loading = false;
      this.updateTableContent(); // Muestra los datos
      this.updateCount();
    }
  }

  // Actualiza solo el cuerpo de la tabla para no repintar todo el componente
  updateTableContent() {
    const tbody = this.shadowRoot.querySelector('#table-body');
    if (!tbody) return;

    // A) ESTADO CARGANDO
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

    // B) ESTADO VACÍO
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

    // C) ESTADO CON DATOS
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
                <div class="font-medium">${product.nombre}</div>
                <div class="text-muted text-sm">${product.codigo_barras || 'S/N'}</div>
              </div>
            </div>
          </td>
          <td>${product.categoria?.nombre || 'General'}</td>
          <td>${product.proveedor?.nombre || 'General'}</td>
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
    
    // Reconectar event listeners para los botones de editar
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
                // Si es la fila de loading o vacía, no filtramos
                if(row.cells.length < 2) return; 
                
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        });
    }

    const refreshBtn = this.shadowRoot.querySelector('.refresh-btn');
    if(refreshBtn) {
        refreshBtn.addEventListener('click', () => this.loadProducts());
    }
    
    const addBtn = this.shadowRoot.querySelector('.add-btn');
    if(addBtn) {
          addBtn.addEventListener('click', () => this.showCreateProductModal());
    }
    
    // Conectar botones de editar
    this.attachEditButtons();
  }

  attachEditButtons() {
    // Limpiar listeners previos (clonación de nodos para evitar handlers duplicados)
    this.shadowRoot.querySelectorAll('.edit-btn').forEach(btn => {
      const btnClone = btn.cloneNode(true);
      btn.parentNode.replaceChild(btnClone, btn);
      btnClone.addEventListener('click', () => {
        const id = btnClone.getAttribute('data-id');
        this.showEditProductModal(id);
      });
    });
  }

    showCreateProductModal() {
      if (this.shadowRoot.querySelector('#create-product-modal')) return;
      const modal = document.createElement('div');
      modal.id = 'create-product-modal';
      modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <h2>Nuevo Producto</h2>
          <form id="create-product-form">
            <label>Nombre:<br><input name="nombre" required></label><br>
            <label>Categoría:<br><select name="categoria" id="categoria-select" required><option value="">Cargando...</option></select></label><br>
            <label>Proveedor:<br><select name="proveedor" id="proveedor-select" required><option value="">Cargando...</option></select></label><br>
            <label>Código de Barras:<br><input name="codigo_barras"></label><br>
            <label>Precio Compra:<br><input name="precio_compra" type="number" step="0.01" required></label><br>
            <label>Precio Venta:<br><input name="precio_venta" type="number" step="0.01" required></label><br>
            <label>Stock:<br><input name="stock" type="number" required></label><br>
            <label>Stock Mínimo:<br><input name="stock_minimo" type="number" required></label><br>
            <div class="modal-actions">
              <button type="submit" class="btn-primary">Crear</button>
              <button type="button" class="btn-icon" id="cancel-modal">Cancelar</button>
            </div>
            <div id="modal-error" style="color:red;margin-top:8px;"></div>
          </form>
        </div>
        <style>
          .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.3); z-index: 1000; }
          .modal-content { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 32px; border-radius: 10px; box-shadow: 0 2px 16px rgba(0,0,0,0.2); z-index: 1001; min-width: 320px; }
          .modal-actions { margin-top: 16px; display: flex; gap: 10px; }
        </style>
      `;
      this.shadowRoot.appendChild(modal);

      // Cargar categorías y proveedores
      import('../services/categoryService.js').then(({ CategoryService }) => {
        CategoryService.getAll().then((catRes) => {
          let categorias = [];
          // catRes puede ser un objeto axios response o el array directo
          if (Array.isArray(catRes)) {
            categorias = catRes;
          } else if (catRes && Array.isArray(catRes.data)) {
            categorias = catRes.data;
          } else if (catRes && catRes.data && Array.isArray(catRes.data.data)) {
            categorias = catRes.data.data;
          } else if (catRes && catRes.data && Array.isArray(catRes.data.rows)) {
            categorias = catRes.data.rows;
          }
          const select = modal.querySelector('#categoria-select');
          if (categorias.length === 0) {
            select.innerHTML = '<option value="">No hay categorías</option>';
          } else {
            select.innerHTML = '<option value="">Seleccione...</option>' +
              categorias.map(cat => `<option value="${cat.id}">${cat.nombre}</option>`).join('');
          }
        }).catch(() => {
          const select = modal.querySelector('#categoria-select');
          select.innerHTML = '<option value="">Error cargando categorías</option>';
        });
      });
      import('../services/supplierService.js').then(({ SupplierService }) => {
        SupplierService.getAll().then(provs => {
          const select = modal.querySelector('#proveedor-select');
          select.innerHTML = '<option value="">Seleccione...</option>' +
            provs.map(prov => `<option value="${prov.id}">${prov.nombre}</option>`).join('');
        });
      });

      // Cancelar
      modal.querySelector('#cancel-modal').onclick = () => modal.remove();

      // Enviar formulario
      modal.querySelector('#create-product-form').onsubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = Object.fromEntries(new FormData(form));
        // Convertir campos numéricos
        data.precio_compra = parseFloat(data.precio_compra);
        data.precio_venta = parseFloat(data.precio_venta);
        data.stock = parseInt(data.cantidad);
        data.stock_minimo = parseInt(data.stock_minimo);
        // Enviar solo los ids seleccionados con los nombres correctos
        data.id_categoria = parseInt(data.categoria);
        data.id_proveedor = parseInt(data.proveedor);
        delete data.categoria;
        delete data.proveedor;
        try {
          await ProductService.create(data);
          modal.remove();
          this.loadProducts();
        } catch (err) {
          modal.querySelector('#modal-error').textContent = 'Error al crear producto.';
        }
      };
    }

    async showEditProductModal(productId) {
      if (this.shadowRoot.querySelector('#edit-product-modal')) return;
      
      try {
        // 1. Obtener datos del producto
        const product = await ProductService.getById(productId);
        // Normalizar producto
        const flatProduct = product && product.data ? product.data : product;
        // Nueva validación estricta
        if (!flatProduct || typeof flatProduct !== 'object' || Object.keys(flatProduct).length === 0) {
          console.error('No se pudo obtener el producto o está vacío:', flatProduct);
          alert('Error: No se encontró el producto o está vacío.');
          return;
        }
        console.log('Producto a editar (flatProduct):', flatProduct);

        // Obtener IDs de categoría y proveedor (pueden estar directamente o en objetos anidados)
        const categoriaId = flatProduct.id_categoria || flatProduct.categoria?.id || '';
        const proveedorId = flatProduct.id_proveedor || flatProduct.proveedor?.id || '';

        const modal = document.createElement('div');
        modal.id = 'edit-product-modal';
        modal.innerHTML = `
          <div class="modal-overlay"></div>
          <div class="modal-content">
            <h2>Editar Producto</h2>
            <form id="edit-product-form">
              <div class="form-grid">
                <label>
                  Nombre
                  <input name="nombre" value="${this.escapeHtml(flatProduct.nombre || '')}" required>
                </label>
                <label>
                  Categoría
                  <select name="categoria" id="edit-categoria-select" required>
                    <option>Cargando...</option>
                  </select>
                </label>
                <label>
                  Proveedor
                  <select name="proveedor" id="edit-proveedor-select" required>
                    <option>Cargando...</option>
                  </select>
                </label>
                <label>
                  Código de Barras
                  <input name="codigo_barras" value="${this.escapeHtml(flatProduct.codigo_barras || '')}">
                </label>
                <label>
                  Precio Compra
                  <input name="precio_compra" type="number" step="0.01" value="${flatProduct.precio_compra || ''}" required>
                </label>
                <label>
                  Precio Venta
                  <input name="precio_venta" type="number" step="0.01" value="${flatProduct.precio_venta || ''}" required>
                </label>
                <label>
                  Stock
                  <input name="stock" type="number" value="${flatProduct.stock || 0}" required>
                </label>
                <label>
                  Stock Mínimo
                  <input name="stock_minimo" type="number" value="${flatProduct.stock_minimo || 0}" required>
                </label>
              </div>
              <div id="modal-error" class="modal-error"></div>
              <div class="modal-actions">
                <button type="submit" class="btn-primary">Guardar cambios</button>
                <button type="button" class="btn-secondary" id="cancel-edit-modal">Cancelar</button>
              </div>
            </form>
          </div>
          <style>
            .modal-overlay {position: fixed; top: 0; left: 0;width: 100vw; height: 100vh;background: rgba(0,0,0,0.35);z-index: 1000;}
            .modal-content {position: fixed;top: 50%; left: 50%;transform: translate(-50%, -50%);background: #fff;padding: 28px;border-radius: 14px;box-shadow: 0 4px 18px rgba(0,0,0,0.28);z-index: 1001;min-width: 420px;animation: fadeIn 0.25s ease-out;}
            h2 {margin-top: 0;margin-bottom: 16px;font-size: 22px;font-weight: 600;color: #222;}
            .form-grid {display: grid;grid-template-columns: 1fr 1fr;gap: 14px;}
            label {display: flex;flex-direction: column;font-size: 14px;color: #333;}
            input, select {margin-top: 4px;padding: 8px;border-radius: 6px;border: 1px solid #ccc;font-size: 14px;}
            .modal-actions {margin-top: 20px;display: flex;justify-content: flex-end;gap: 10px;}
            .btn-primary {background: #007bff;color: white;padding: 8px 16px;border: none;border-radius: 6px;cursor: pointer;}
            .btn-secondary {background: #ccc;color: black;padding: 8px 16px;border: none;border-radius: 6px;cursor: pointer;}
            .modal-error {color: red;margin-top: 8px;min-height: 18px;}@keyframes fadeIn {from { opacity: 0; transform: translate(-50%, -48%); }to{ opacity: 1; transform: translate(-50%, -50%); }}
          </style>
        `;

        this.shadowRoot.appendChild(modal);

        // 2. Cargar categorías
        import('../services/categoryService.js').then(({ CategoryService }) => {
          CategoryService.getAll().then(catRes => {
            let categorias = [];
            // Manejar diferentes formatos de respuesta
            if (Array.isArray(catRes)) {
              categorias = catRes;
            } else if (catRes && Array.isArray(catRes.data)) {
              categorias = catRes.data;
            } else if (catRes && catRes.data && Array.isArray(catRes.data.data)) {
              categorias = catRes.data.data;
            } else if (catRes && catRes.data && Array.isArray(catRes.data.rows)) {
              categorias = catRes.data.rows;
            }

            const select = modal.querySelector('#edit-categoria-select');
            if (categorias.length === 0) {
              select.innerHTML = '<option value="">No hay categorías</option>';
            } else {
              select.innerHTML = '<option value="">Seleccione...</option>' +
                categorias.map(c => `<option value="${c.id}" ${c.id == categoriaId ? 'selected' : ''}>${c.nombre}</option>`).join('');
            }
          }).catch(err => {
            console.error('Error cargando categorías:', err);
            const select = modal.querySelector('#edit-categoria-select');
            select.innerHTML = '<option value="">Error cargando categorías</option>';
          });
        });

        // 3. Cargar proveedores
        import('../services/supplierService.js').then(({ SupplierService }) => {
          SupplierService.getAll().then(provRes => {
            let proveedores = [];
            // Manejar diferentes formatos de respuesta
            if (Array.isArray(provRes)) {
              proveedores = provRes;
            } else if (provRes && Array.isArray(provRes.data)) {
              proveedores = provRes.data;
            } else if (provRes && provRes.data && Array.isArray(provRes.data.data)) {
              proveedores = provRes.data.data;
            } else if (provRes && provRes.data && Array.isArray(provRes.data.rows)) {
              proveedores = provRes.data.rows;
            }

            const select = modal.querySelector('#edit-proveedor-select');
            if (proveedores.length === 0) {
              select.innerHTML = '<option value="">No hay proveedores</option>';
            } else {
              select.innerHTML = '<option value="">Seleccione...</option>' +
                proveedores.map(p => `<option value="${p.id}" ${p.id == proveedorId ? 'selected' : ''}>${p.nombre}</option>`).join('');
            }
          }).catch(err => {
            console.error('Error cargando proveedores:', err);
            const select = modal.querySelector('#edit-proveedor-select');
            select.innerHTML = '<option value="">Error cargando proveedores</option>';
          });
        });

        // 4. Cerrar modal
        modal.querySelector('#cancel-edit-modal').addEventListener('click', () => {
          modal.remove();
        });

        // 5. Guardar cambios
        modal.querySelector('#edit-product-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());

          // Convertir campos numéricos
          data.precio_compra = parseFloat(data.precio_compra);
          data.precio_venta = parseFloat(data.precio_venta);
          data.stock = parseInt(data.stock);
          data.stock_minimo = parseInt(data.stock_minimo);
          // Enviar solo los ids seleccionados con los nombres correctos
          data.id_categoria = parseInt(data.categoria);
          data.id_proveedor = parseInt(data.proveedor);
          delete data.categoria;
          delete data.proveedor;

          try {
            await ProductService.update(productId, data);
            modal.remove();
            await this.loadProducts();
          } catch (error) {
            modal.querySelector('#modal-error').textContent =
              'Error guardando cambios: ' + (error?.message || 'Desconocido');
          }
        });
      } catch (error) {
        console.error('Error al abrir modal de edición:', error);
        alert('Error al cargar el producto: ' + (error?.message || 'Desconocido'));
      }
    }

    // Función helper para escapar HTML y prevenir XSS
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
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
              <tbody id="table-body">
                 </tbody>
            </table>
          </div>
      </div>

      <style>
        /* ESTILOS INTEGRADOS */
        :host { display: block; padding: 20px; box-sizing: border-box; height: 100%; }
        
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .page-title h1 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #111827; }
        .page-title p { margin: 4px 0 0; color: #6B7280; font-size: 0.9rem; }

        .toolbar { background: white; padding: 16px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; gap: 16px; margin-bottom: 24px; align-items: center; border: 1px solid #E5E7EB; }
        .search-wrapper { flex: 1; position: relative; }
        .search-input { width: 100%; padding: 10px 16px; padding-left: 40px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 0.95rem; outline: none; box-sizing: border-box; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9CA3AF; }

        .table-container { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #E5E7EB; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #F9FAFB; color: #6B7280; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; padding: 12px 24px; text-align: left; border-bottom: 1px solid #E5E7EB; }
        td { padding: 16px 24px; border-bottom: 1px solid #E5E7EB; color: #374151; font-size: 0.9rem; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:hover { background-color: #F9FAFB; }

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