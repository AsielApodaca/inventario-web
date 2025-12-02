import { ProductService } from "../services/productService.js"
import { OrderService } from "../services/orderService.js"

class DashboardMFE extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: "open" })
  }

  async connectedCallback() {
    this.render()
    this.attachEventListeners()
    await this.fetchData()
  }

  async fetchData() {
    try {
      // 1. Mostrar estado de carga visual
      this.updateLoadingState(true);

      // 2. Llamada paralela a los servicios
      // Nota: Tus servicios ya retornan el array limpio [], así que no necesitamos .data
      const [products, orders] = await Promise.all([
        ProductService.getAll(),
        OrderService.getAll()
      ])

      console.log("Dashboard Data:", { products, orders });

      // 3. Cálculos en tiempo real

      // A) Total Productos
      const totalProducts = products.length;

      // B) Stock Bajo (stock <= stock_minimo)
      const lowStockCount = products.filter(p => {
          return Number(p.stock) <= Number(p.stock_minimo);
      }).length;

      // C) Órdenes Pendientes
      const pendingOrders = orders.filter(o => o.estado === 'pendiente').length;

      // D) Valor del Inventario (Precio Compra * Stock)
      const inventoryValue = products.reduce((total, p) => {
          const precio = Number(p.precio_compra) || 0;
          const stock = Number(p.stock) || 0;
          return total + (precio * stock);
      }, 0);

      // 4. Actualizar el DOM
      this.updateElementText('total-products', totalProducts);
      this.updateElementText('low-stock', lowStockCount);
      this.updateElementText('pending-orders', pendingOrders);
      this.updateElementText('inventory-value', this.formatCurrency(inventoryValue));

    } catch (error) {
      console.error("Dashboard fetch error:", error)
    } finally {
      this.updateLoadingState(false);
    }
  }

  // --- Helpers ---

  updateElementText(id, text) {
      const el = this.shadowRoot.getElementById(id);
      if (el) el.textContent = text;
  }

  updateLoadingState(isLoading) {
      const ids = ['total-products', 'low-stock', 'pending-orders', 'inventory-value'];
      const state = isLoading ? "..." : "";
      if (isLoading) {
          ids.forEach(id => this.updateElementText(id, state));
      }
  }

  formatCurrency(value) {
      return new Intl.NumberFormat('es-MX', { 
          style: 'currency', 
          currency: 'MXN' 
      }).format(value);
  }

  attachEventListeners() {
    const reportBtn = this.shadowRoot.querySelector(".report-btn")
    if(reportBtn) {
        reportBtn.addEventListener("click", () => {
            this.fetchData(); // Botón "Run Report" ahora recarga los datos
        })
    }

    const addProductBtn = this.shadowRoot.querySelector(".add-product-btn")
    if(addProductBtn) {
        addProductBtn.addEventListener("click", () => {
             // Disparamos evento para navegar a la vista de productos
             window.dispatchEvent(new CustomEvent('navigate', { detail: { route: 'products' } }));
        })
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles/global.css">
      <link rel="stylesheet" href="styles/dashboard.css">

      <div class="section-header">
        <div>
          <h1 style="font-size: 1.5rem; font-weight: 700;">Dashboard</h1>
          <p style="color: var(--text-secondary);">Resumen de métricas de inventario.</p>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-outline report-btn">↻ Actualizar</button>
          <button class="btn btn-primary add-product-btn">+ Producto</button>
        </div>
      </div>

      <div class="grid-cards">
        <div class="card">
          <div class="metric-title">Total Productos</div>
          <div class="metric-value" id="total-products">0</div>
          <div class="metric-trend trend-up">
            <span>📦</span>
            <span>En catálogo</span>
          </div>
        </div>
        
        <div class="card">
          <div class="metric-title">Stock Bajo</div>
          <div class="metric-value" id="low-stock" style="color: #e11d48;">0</div>
          <div class="metric-trend trend-down">
            <span>⚠️</span>
            <span>Requieren atención</span>
          </div>
        </div>
        
        <div class="card">
          <div class="metric-title">Órdenes Pendientes</div>
          <div class="metric-value" id="pending-orders">0</div>
          <div class="metric-trend">
            <span>⏳</span>
            <span>Por recibir</span>
          </div>
        </div>
        
        <div class="card">
          <div class="metric-title">Valor Inventario</div>
          <div class="metric-value" id="inventory-value">$0.00</div>
          <div class="metric-trend trend-up">
            <span>💰</span>
            <span>Costo total</span>
          </div>
        </div>
      </div>

      <div class="charts-container">
        

[Image of dashboard data flow architecture]

        <div class="card">
          <h3 style="margin-bottom: 1rem; font-weight: 600;">Estado del Sistema</h3>
          <div class="chart-placeholder" style="text-align: left; align-items: flex-start; padding: 10px;">
             <div style="display: flex; align-items: center; gap: 8px; color: green; font-weight: bold; margin-bottom: 5px;">
                <span>✅</span> 
                <span>Conectado a BD</span>
             </div>
             <p style="font-size: 0.9rem; color: #666; margin: 0;">Datos sincronizados en tiempo real.</p>
          </div>
        </div>
    `
  }
}

customElements.define("dashboard-mfe", DashboardMFE)