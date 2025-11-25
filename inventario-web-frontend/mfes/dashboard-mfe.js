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
      const [products, orders] = await Promise.all([
        ProductService.getAll().catch(() => ({ data: [] })),
        OrderService.getAll().catch(() => ({ data: [] })),
      ])

      // Aquí actualizarías las métricas con datos reales
      // const totalProducts = products.data.length
      // this.shadowRoot.querySelector('#total-products').textContent = totalProducts
    } catch (error) {
      console.log("Dashboard fetch error (usando datos estáticos):", error)
    }
  }

  attachEventListeners() {
    // Botón Run Report
    const reportBtn = this.shadowRoot.querySelector(".report-btn")
    reportBtn.addEventListener("click", () => {
      alert("Generating report...")
    })

    // Botón Add Product
    const addProductBtn = this.shadowRoot.querySelector(".add-product-btn")
    addProductBtn.addEventListener("click", () => {
      alert("Opening add product form...")
    })
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles/global.css">
      <link rel="stylesheet" href="styles/dashboard.css">

      <div class="section-header">
        <div>
          <h1 style="font-size: 1.5rem; font-weight: 700;">Dashboard</h1>
          <p style="color: var(--text-secondary);">An overview of your inventory metrics and alerts.</p>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-outline report-btn">Run Report</button>
          <button class="btn btn-primary add-product-btn">+ Add Product</button>
        </div>
      </div>

      <div class="grid-cards">
        <div class="card">
          <div class="metric-title">Total Products</div>
          <div class="metric-value" id="total-products">12,450</div>
          <div class="metric-trend trend-up">
            <span>↑</span>
            <span>+1.5% from last month</span>
          </div>
        </div>
        
        <div class="card">
          <div class="metric-title">Low Stock</div>
          <div class="metric-value">82</div>
          <div class="metric-trend trend-up">
            <span>↑</span>
            <span>+5 items from last week</span>
          </div>
        </div>
        
        <div class="card">
          <div class="metric-title">Pending Orders</div>
          <div class="metric-value">35</div>
          <div class="metric-trend trend-down">
            <span>↓</span>
            <span>-2.1% from last month</span>
          </div>
        </div>
        
        <div class="card">
          <div class="metric-title">Inventory Value</div>
          <div class="metric-value">$1.2M</div>
          <div class="metric-trend trend-up">
            <span>↑</span>
            <span>+0.8% from last month</span>
          </div>
        </div>
      </div>

      <div class="charts-container">
        <div class="card">
          <h3 style="margin-bottom: 1rem; font-weight: 600;">Monthly Movements</h3>
          <div class="chart-placeholder">
            [ Bar Chart Visualization Placeholder ]
            <br>
            Showing In/Out stock over time
          </div>
        </div>
        
        <div class="card">
          <h3 style="margin-bottom: 1rem; font-weight: 600;">Products by Category</h3>
          <div class="chart-placeholder">
            [ Donut Chart Placeholder ]
          </div>
        </div>
      </div>
    `
  }
}

customElements.define("dashboard-mfe", DashboardMFE)