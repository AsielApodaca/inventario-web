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
             <button class="btn-icon" title="Editar">✏️</button>
          </td>
        </tr>
      `
    }).join('');
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
        addBtn.addEventListener('click', () => alert("Funcionalidad de Crear Producto pendiente de implementar"));
    }
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