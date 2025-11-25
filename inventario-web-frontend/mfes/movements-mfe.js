import { MovementService } from "../services/movementService.js"

class MovementsMFE extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: "open" })
  }

  async connectedCallback() {
    this.render()
    this.attachEventListeners()
    await this.fetchMovements()
  }

  async fetchMovements() {
    try {
      const response = await MovementService.getAll()
      if (response && response.data) {
        // Aquí actualizarías la lista con datos reales
        console.log("Movements loaded:", response.data)
      }
    } catch (error) {
      console.log("Movement fetch error (usando datos estáticos):", error)
    }
  }

  attachEventListeners() {
    // Filtros
    const filterBtns = this.shadowRoot.querySelectorAll(".filter-btn")
    filterBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        filterBtns.forEach(b => b.classList.remove("active"))
        e.target.classList.add("active")
        // Aquí implementarías la lógica de filtrado
      })
    })

    // Formulario de registro
    const form = this.shadowRoot.querySelector(".register-form")
    form.addEventListener("submit", async (e) => {
      e.preventDefault()
      const submitBtn = this.shadowRoot.querySelector(".submit-btn")
      
      try {
        submitBtn.textContent = "Registering..."
        submitBtn.disabled = true

        // Aquí llamarías al servicio para crear el movimiento
        // await MovementService.create(formData)
        
        alert("Movement registered successfully!")
        form.reset()
      } catch (error) {
        alert("Error registering movement: " + error.message)
      } finally {
        submitBtn.textContent = "Register Movement"
        submitBtn.disabled = false
      }
    })
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles/global.css">
      <link rel="stylesheet" href="styles/movements.css">

      <div class="section-header" style="margin-bottom: 1.5rem;">
         <h1 style="font-size: 1.5rem; font-weight: 700;">Inventory Movements</h1>
         <p style="color: var(--text-secondary);">Track all stock entries, exits, and adjustments.</p>
      </div>

      <div class="layout">
        <!-- Left Column: List -->
        <div class="main-panel">
          <div class="filters">
            <span style="font-weight: 600; font-size: 0.875rem;">Filter by type:</span>
            <button class="filter-btn active">All</button>
            <button class="filter-btn">Entry</button>
            <button class="filter-btn">Exit</button>
            <button class="filter-btn">Adjustment</button>
          </div>

          <div class="movements-list">
            <!-- Item 1 -->
            <div class="movement-item">
              <div class="icon-circle bg-green-100">↓</div>
              <div class="movement-details">
                <div class="item-title">Stock Entry: Ergonomic Office Chair</div>
                <div class="item-meta">PO-2024-051 from Comfort Seating Inc. to Central Warehouse</div>
                <div class="item-meta">May 20, 2024, 10:30 AM</div>
              </div>
              <div style="text-align: right;">
                <div class="item-qty text-green">+100</div>
                <div class="item-meta">New Stock: 125</div>
              </div>
            </div>
            
            <!-- Item 2 -->
            <div class="movement-item">
              <div class="icon-circle bg-red-100">↑</div>
              <div class="movement-details">
                <div class="item-title">Stock Exit: Adjustable Standing Desk</div>
                <div class="item-meta">SO-2024-112 to Customer Order</div>
                <div class="item-meta">May 19, 2024, 02:15 PM</div>
              </div>
              <div style="text-align: right;">
                <div class="item-qty text-red">-5</div>
                <div class="item-meta">New Stock: 42</div>
              </div>
            </div>

            <!-- Item 3 -->
            <div class="movement-item">
              <div class="icon-circle bg-yellow-100">✎</div>
              <div class="movement-details">
                <div class="item-title">Stock Adjustment: Wireless Mechanical Keyboard</div>
                <div class="item-meta">Cycle count discrepancy in Downtown Warehouse</div>
                <div class="item-meta">May 18, 2024, 09:00 AM</div>
              </div>
              <div style="text-align: right;">
                <div class="item-qty text-yellow">-2</div>
                <div class="item-meta">New Stock: 8</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Form -->
        <div class="side-panel">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem;">Register Manual Movement</h3>
          
          <form class="register-form">
            <div class="form-group">
              <label class="form-label">Movement Type</label>
              <select class="input" required>
                <option value="">Select type...</option>
                <option value="entry">Stock Entry</option>
                <option value="exit">Stock Exit</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Product</label>
              <input type="text" class="input" placeholder="Search by SKU or Name..." required>
            </div>

            <div class="form-group">
              <label class="form-label">Warehouse</label>
              <select class="input" required>
                <option value="">Select warehouse...</option>
                <option value="central">Central Warehouse</option>
                <option value="west">West Coast Hub</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Quantity</label>
              <input type="number" class="input" placeholder="e.g. 10" required>
            </div>

            <div class="form-group">
              <label class="form-label">Reason / Note</label>
              <textarea class="input" rows="3" placeholder="e.g. Found during stock count"></textarea>
            </div>

            <button type="submit" class="btn btn-primary submit-btn" style="width: 100%; margin-top: 1rem;">
              Register Movement
            </button>
          </form>
        </div>
      </div>
    `
  }
}

customElements.define("movements-mfe", MovementsMFE)