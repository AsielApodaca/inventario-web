import { SupplierService } from "../services/supplierService.js"

class SuppliersMFE extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: "open" })
  }

  async connectedCallback() {
    this.render()
    this.attachEventListeners()
    await this.fetchSuppliers()
  }

  async fetchSuppliers() {
    try {
      const response = await SupplierService.getAll()
      if (response && response.data) {
        console.log("Suppliers loaded:", response.data)
      }
    } catch (error) {
      console.log("Supplier fetch error (usando datos estáticos):", error)
    }
  }

  attachEventListeners() {
    // Items de la lista
    const supplierItems = this.shadowRoot.querySelectorAll(".supplier-item")
    supplierItems.forEach(item => {
      item.addEventListener("click", (e) => {
        supplierItems.forEach(i => i.classList.remove("active"))
        e.currentTarget.classList.add("active")
      })
    })

    // Tabs
    const tabs = this.shadowRoot.querySelectorAll(".tab")
    tabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        tabs.forEach(t => t.classList.remove("active"))
        e.target.classList.add("active")
      })
    })

    // Formulario
    const form = this.shadowRoot.querySelector(".supplier-form")
    form.addEventListener("submit", async (e) => {
      e.preventDefault()
      const saveBtn = this.shadowRoot.querySelector(".save-btn")
      
      try {
        saveBtn.textContent = "Saving..."
        saveBtn.disabled = true

        // await SupplierService.create(formData)
        
        alert("Supplier saved successfully!")
        form.reset()
      } catch (error) {
        alert("Error: " + error.message)
      } finally {
        saveBtn.textContent = "Save Supplier"
        saveBtn.disabled = false
      }
    })

    // Botón cancelar
    const cancelBtn = this.shadowRoot.querySelector(".cancel-btn")
    cancelBtn.addEventListener("click", () => {
      form.reset()
    })
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles/global.css">
      <link rel="stylesheet" href="styles/suppliers.css">

      <div class="section-header" style="margin-bottom: 1.5rem;">
         <h1 style="font-size: 1.5rem; font-weight: 700;">Suppliers Management</h1>
      </div>

      <div class="split-view">
        
        <div class="col">
          <div class="col-header">
              <input type="text" class="input" placeholder="Search suppliers...">
          </div>
          <div class="scroll-area">
              <div class="supplier-item active">
                  <div class="supplier-id">SUP-00123</div>
                  <div class="supplier-name">Global Tech Imports</div>
                  <div style="font-size: 0.85rem; color: var(--text-secondary);">jane.doe@globaltech.com</div>
                  <div class="badge-corner">GTI</div>
              </div>
              
              <div class="supplier-item">
                  <div class="supplier-id">SUP-00245</div>
                  <div class="supplier-name">Precision Parts Inc.</div>
                  <div style="font-size: 0.85rem; color: var(--text-secondary);">mark@precision.co</div>
                  <div class="badge-corner" style="background: #d1fae5; color: #065f46;">PPI</div>
              </div>

              <div class="supplier-item">
                  <div class="supplier-id">SUP-00389</div>
                  <div class="supplier-name">Connect Electronics</div>
                  <div style="font-size: 0.85rem; color: var(--text-secondary);">s.chen@connect.dev</div>
                  <div class="badge-corner" style="background: #f3e8ff; color: #6b21a8;">CE</div>
              </div>
          </div>
        </div>

        <div class="col">
           <div class="col-header">
             <div class="tabs" style="margin-bottom: 0; border: none;">
               <div class="tab active">Supplier Details</div>
               <div class="tab">Order History</div>
             </div>
           </div>
           <div class="scroll-area">
              <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem;">Global Tech Imports</h2>
              
              <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 2rem;">
                  <div class="detail-row">
                      <div class="detail-label">Company Name</div>
                      <div class="detail-val">Global Tech Imports</div>
                  </div>
                  <div class="detail-row">
                      <div class="detail-label">Tax ID</div>
                      <div class="detail-val">US-123456789</div>
                  </div>
              </div>

              <div class="detail-row">
                  <div class="detail-label">Address</div>
                  <div class="detail-val">123 Innovation Drive, Tech Park, CA 94043, USA</div>
              </div>

              <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 2rem;">
                  <div class="detail-row">
                      <div class="detail-label">Primary Contact</div>
                      <div class="detail-val">Jane Doe</div>
                  </div>
                  <div class="detail-row">
                      <div class="detail-label">Payment Terms</div>
                      <div class="detail-val">Net 30 Days</div>
                  </div>
              </div>
              
              <div style="background: #f9fafb; padding: 1rem; border-radius: var(--radius-md);">
                  <div class="detail-label" style="margin-bottom: 0.5rem;">Internal Notes</div>
                  <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">
                      Preferred shipping carrier is FedEx. Responsive and reliable supplier for critical components. Annual review scheduled for Q4.
                  </p>
              </div>
           </div>
        </div>

        <div class="col">
           <div class="col-header">Add New Supplier</div>
           <div class="scroll-area">
              <form class="supplier-form">
                <div class="form-section">
                    <div class="section-title">Company Information</div>
                    <div class="form-group">
                        <span class="label">Company Name</span>
                        <input type="text" class="input" required>
                    </div>
                    <div class="form-group">
                        <span class="label">Tax ID</span>
                        <input type="text" class="input" required>
                    </div>
                </div>

                <div class="form-section">
                    <div class="section-title">Contact Details</div>
                    <div class="form-group">
                        <span class="label">Contact Name</span>
                        <input type="text" class="input" required>
                    </div>
                    <div class="form-group">
                        <span class="label">Email</span>
                        <input type="email" class="input" required>
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button type="button" class="btn btn-outline cancel-btn" style="flex: 1;">Cancel</button>
                    <button type="submit" class="btn btn-primary save-btn" style="flex: 1;">Save Supplier</button>
                </div>
              </form>
           </div>
        </div>

      </div>
    `
  }
}

customElements.define("suppliers-mfe", SuppliersMFE)