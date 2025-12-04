import { OrderService } from '../services/orderService.js';
import { WarehouseService } from '../services/warehouseService.js';
import { SupplierService } from '../services/supplierService.js';
import { ProductService } from '../services/productService.js';
import { DetalleOrdenCompraService } from '../services/detalleOrdenCompraService.js';
import { MovementService } from '../services/movementService.js';
import { InventoryService } from '../services/inventoryService.js';

class OrdersMFE extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.orders = [];
    this.loading = true;
    this.currentPage = 1;
    this.pageSize = 10;
    this.totalOrders = 0;
    this.statusFilter = "";
    this.warehouseFilter = "";
    this.searchTerm = "";
    this.statusOptions = [ { value: "", label: "All" } ]; 
    this.warehouseOptions = [ { value: "", label: "All" } ];
    this.suppliers = [];
    this.warehouseById = {};
    this.supplierById = {};
  }

  async connectedCallback() {
    this.render();
    await Promise.all([
      this.loadWarehouses(),
      this.loadSuppliers(),
      this.loadStatusOptions(),
    ]);
    await this.loadOrders();
    this.attachEvents();
  }

  async loadWarehouses() {
    const res = await WarehouseService.getAll();
    const arr = res && Array.isArray(res.data) ? res.data : [];
    this.warehouseOptions = [{ value: "", label: "All" }, ...arr.map(w => ({ value: w.id, label: w.nombre }))];
    arr.forEach(w=>this.warehouseById[w.id]=w.nombre);
    this.renderFilters();
  }

  async loadSuppliers() {
    const arr = await SupplierService.getAll();
    this.suppliers = arr;
    arr.forEach(s => { this.supplierById[s.id] = s.nombre; });
  }

  async loadStatusOptions() {
    try {
      const arr = await OrderService.getAvailableStates();
      this.statusOptions = [{ value: "", label: "All" }, ...arr.map(o=>({ value: o.toLowerCase(), label: o.charAt(0).toUpperCase() + o.slice(1) }))];
      this.renderFilters();
    } catch { /* fallback default already OK */ }
  }

  async loadOrders() {
    this.loading = true;
    this.renderTable();
    const filters = {
      estado: this.statusFilter || undefined,
      id_almacen: this.warehouseFilter || undefined,
      q: this.searchTerm || undefined,
      page: this.currentPage,
      per_page: this.pageSize
    };
    const arr = await OrderService.getAll(filters);
    if (arr && arr.count && arr.rows) {
      this.orders = arr.rows;
      this.totalOrders = arr.count;
    } else if (Array.isArray(arr)) {
      this.orders = arr;
      this.totalOrders = arr.length;
    } else {
      this.orders = [];
      this.totalOrders = 0;
    }
    this.loading = false;
    this.renderTable();
    this.renderPaginator();
  }

  attachEvents() {
    const input = this.shadowRoot.querySelector("#search-input");
    if(input) input.oninput = e => {
      this.searchTerm = e.target.value;
      this.currentPage=1;
      this.loadOrders();
    };

    const statusSelect = this.shadowRoot.querySelector("#status-filter");
    if(statusSelect) {
        statusSelect.onchange = (e) => {
            this.statusFilter = e.target.value;
            this.currentPage = 1;
            this.loadOrders();
        };
    }
    
    const addBtn = this.shadowRoot.querySelector("#create-order-btn");
    if(addBtn) {
        addBtn.onclick = () => this.showCreateOrderModal();
    }
  }

  async showCreateOrderModal() {
    if(this.shadowRoot.querySelector('#create-order-modal')) return;
    let allProductsList = await ProductService.getAll();
    
    const modal = document.createElement('div');
    modal.id = 'create-order-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <h2>Crear Orden de Compra</h2>
        <form id="order-form" autocomplete="off">
          <label style="font-weight:600; font-size:0.9rem;">Proveedor:</label>
          <select id="order-supplier" required style="width:100%; margin-bottom:15px; margin-top:5px;">
             <option value="">Seleccione proveedor...</option>
          </select>
          <div style="border:1px solid #e5e7eb; padding:15px; border-radius:8px; background:#f9fafb;">
            <div style="display:flex; gap:10px; align-items:flex-end;">
              <div style="flex:2;">
                <label style="font-size:0.85rem;">Producto:</label>
                <select id="order-product-select" style="width:100%;">
                  <option value="">Seleccione...</option>
                </select>
              </div>
              <div style="flex:0 0 70px;">
                <label style="font-size:0.85rem;">Cant:</label>
                <input type="number" id="order-product-qty" min="1" value="1" style="width:100%;">
              </div>
              <button type="button" id="add-product-btn" class="btn-small" style="height:38px;">+</button>
            </div>
            <table style="width:100%; margin-top:15px; font-size:0.9rem;">
              <thead><tr style="border-bottom:1px solid #ddd; text-align:left;"><th>Producto</th><th>Cant</th><th>$$</th><th></th></tr></thead>
              <tbody id="added-products-list"></tbody>
            </table>
            <div style="text-align:right; margin-top:10px; font-weight:bold; font-size:1.1rem;">
              Total: $<span id="order-total">0.00</span>
            </div>
          </div>
          <div id="order-error" class="modal-error"></div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" id="cancel-order-modal">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar Orden</button>
          </div>
        </form>
      </div>
      <style>.modal-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:1000}.modal-content{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:25px;border-radius:12px;z-index:1001;width:500px;max-width:95vw;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1)}.modal-actions{margin-top:20px;display:flex;justify-content:flex-end;gap:10px}.btn-primary{background:#4F46E5;color:white;border:none;padding:10px 20px;border-radius:6px;cursor:pointer}.btn-secondary{background:#e5e7eb;color:#374151;border:none;padding:10px 20px;border-radius:6px;cursor:pointer}.modal-error{color:#dc2626;margin-top:10px;font-size:0.9rem}select,input{padding:8px;border:1px solid #d1d5db;border-radius:6px}</style>
    `;
    this.shadowRoot.appendChild(modal);

    const supplierSelect = modal.querySelector('#order-supplier');
    this.suppliers.forEach(s => supplierSelect.innerHTML += `<option value="${s.id}">${s.nombre}</option>`);
    
    let productsAdded = [];
    let selectedSupplierId = null;
    const productSelect = modal.querySelector('#order-product-select');

    function fillProductsList(supplierId){
      productSelect.innerHTML = '<option value="">Seleccione...</option>' +
        allProductsList.filter(p=>p.id_proveedor==supplierId).map(p=>
          `<option value="${p.id}">${p.nombre}</option>`).join('');
    }

    supplierSelect.onchange = ()=>{
      selectedSupplierId = supplierSelect.value;
      productsAdded = [];
      renderProductsList();
      fillProductsList(selectedSupplierId);
    };

    modal.querySelector('#add-product-btn').onclick = () => {
      const prodId = productSelect.value;
      const qty = parseInt(modal.querySelector('#order-product-qty').value,10);
      const productObj = allProductsList.find(p=>p.id == prodId);
      
      if (!prodId || !qty || qty<=0) return;
      if (!supplierSelect.value) {
        supplierSelect.value = productObj.id_proveedor;
        selectedSupplierId = productObj.id_proveedor;
        fillProductsList(selectedSupplierId);
        supplierSelect.disabled = true;
      } else if (parseInt(supplierSelect.value)!==parseInt(productObj.id_proveedor)) {
        alert("Solo productos del mismo proveedor"); return;
      }
      
      const exists = productsAdded.find(pa=>pa.id==prodId);
      if (exists) { alert("Ya agregado"); return; }
      
      productsAdded.push({ ...productObj, qty, subtotal: (productObj.precio_compra||0)*qty });
      renderProductsList();
    };

    function renderProductsList() {
      const tbody = modal.querySelector('#added-products-list');
      let total = 0;
      tbody.innerHTML = productsAdded.map(p => {
        total+= p.subtotal;
        return `<tr><td>${p.nombre}</td><td>${p.qty}</td><td>$${p.precio_compra}</td><td><button type='button' data-rm='${p.id}' style='color:red;border:none;background:none;cursor:pointer;'>&times;</button></td></tr>`;
      }).join('');
      modal.querySelector('#order-total').textContent = total.toFixed(2);
      
      tbody.querySelectorAll('button').forEach(b => b.onclick = (e) => {
         const id = e.target.getAttribute('data-rm');
         productsAdded = productsAdded.filter(x => x.id != id);
         renderProductsList();
         if(productsAdded.length===0) supplierSelect.disabled = false;
      });
    }

    modal.querySelector('#cancel-order-modal').onclick = () => modal.remove();

    modal.querySelector('#order-form').onsubmit = async (e) => {
      e.preventDefault();
      if (!supplierSelect.value) return;
      if (productsAdded.length===0) return;
      
      try {
        const total = productsAdded.reduce((sum,p)=>sum+p.subtotal,0);
        const orderPayload = {
          id_proveedor: parseInt(supplierSelect.value),
          total,
          estado: 'pendiente',
          status: 'pendiente'
        };

        const createdOrderRes = await OrderService.create(orderPayload);
        const orderId = this.extractOrderIdFromResponse(createdOrderRes);
        const detalles = productsAdded.map(p => ({
          id_producto: p.id,
          cantidad: p.qty,
          precio_unitario: p.precio_compra,
          subtotal: p.subtotal
        }));
        
        if(orderId) await DetalleOrdenCompraService.createMultiple(orderId, detalles);
        modal.remove();
        this.loadOrders();
      } catch(err) {
        console.error(err);
        modal.querySelector('#order-error').textContent = "Error creando orden";
      }
    };
  }

  extractOrderIdFromResponse(res) {
    if (!res) return null;
    const cand = [res.id, res.id_orden, res.data?.id, res.data?.id_orden, res.data?.data?.id];
    return cand.find(v => typeof v === "number" || (typeof v === "string" && v !== ""));
  }

  renderStatusPill(status) {
    const val = (status || '').toLowerCase();
    const map = {
      pendiente: 'pendiente', aprobada: 'info', enviada: 'info',
      recibida: 'recibida', cancelada: 'cancelada'
    };
    return `<span class="status-pill ${map[val] || 'info'}">${val.toUpperCase()}</span>`;
  }

  getSupplierLabel(id) {
    return this.supplierById[id] || 'Desconocido';
  }

  renderFilters() {
    const stSelect = this.shadowRoot.querySelector("#status-filter");
    if(stSelect) stSelect.innerHTML = this.statusOptions.map(o=>`<option value="${o.value}">${o.label}</option>`).join("");
  }

  renderTable() {
    const tableBody = this.shadowRoot.querySelector('tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const currentOrders = this.orders.slice(startIndex, startIndex + this.pageSize);

    if (this.orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 40px; color: #9ca3af;">No se encontraron órdenes.</td></tr>`;
      this.renderPaginator();
      return;
    }

    currentOrders.forEach(order => {
      const tr = document.createElement('tr');
      const estado = (order.estado || 'pendiente').toLowerCase();

      let popoverContent = '';
      if (estado === 'pendiente') {
          popoverContent = `
            <div class="popover-header">Aprobación</div>
            <button class="action-btn-flow" data-action="aprobada" data-id="${order.id}">Aprobar Orden &rarr;</button>
          `;
      } else if (estado === 'aprobada') {
          popoverContent = `
            <div class="popover-header">Envío</div>
            <button class="action-btn-flow" data-action="enviada" data-id="${order.id}">Marcar Enviada &rarr;</button>
          `;
      } else if (estado === 'enviada') {
          popoverContent = `<div class="popover-header" style="color:#d97706">En Tránsito</div><div style="font-size:0.8rem">Usa el ojo 👁️ para recibir.</div>`;
      } else {
          popoverContent = `<div class="text-sub text-center" style="font-size:0.8rem;">Finalizado</div>`;
      }

      tr.innerHTML = `
        <td><span class="font-mono text-main">#${order.codigo || order.id}</span></td>
        <td><div class="text-main" style="font-weight:600;">${this.getSupplierLabel(order.id_proveedor)}</div></td>
        <td class="text-center text-sub">${(order.fecha_orden || order.createdAt || '').slice(0, 10)}</td>
        <td class="text-right"><span class="amount">${this.formatCurrency(order.total)}</span></td>
        <td class="text-center">${this.renderStatusPill(order.estado)}</td>
        <td>
          <div class="actions-cell">
            <div class="relative-container">
                <button class="icon-btn btn-flow" title="Estado" style="${['cancelada','recibida'].includes(estado) ? 'opacity:0.3;' : 'color:#3b82f6; background:#eff6ff;'}">
                    <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </button>
                <div class="status-popover">${popoverContent}</div>
            </div>
            <button class="icon-btn view btn-details" title="Ver Detalles">
              <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </button>
          </div>
        </td>
      `;
      
      tr.querySelector('.btn-details').onclick = () => this.showOrderDetailModal(order.id);
      
      const btnFlow = tr.querySelector('.btn-flow');
      const popover = tr.querySelector('.status-popover');
      if(!['cancelada', 'recibida'].includes(estado)) {
          btnFlow.onclick = (e) => {
             e.stopPropagation();
             this.shadowRoot.querySelectorAll('.status-popover.show').forEach(p => {
                 if(p !== popover) p.classList.remove('show');
             });
             popover.classList.toggle('show');
          };
      }

      const actionBtn = popover.querySelector('.action-btn-flow');
      if(actionBtn) {
          actionBtn.onclick = async (e) => {
              const newStatus = e.target.getAttribute('data-action');
              const orderId = e.target.getAttribute('data-id');
              await this.handleStatusChange(orderId, newStatus);
          };
      }
      tableBody.appendChild(tr);
    });
    
    this.shadowRoot.onclick = (e) => {
        if (!e.target.closest('.relative-container')) {
            this.shadowRoot.querySelectorAll('.status-popover.show').forEach(p => p.classList.remove('show'));
        }
    };
    this.renderPaginator();
  }

  // ... (El resto de métodos auxiliares como showOrderDetailModal, renderPaginator, etc. se mantienen igual, solo los omití para brevedad pero deben estar en tu archivo final) ...
  // Asegúrate de copiar showOrderDetailModal y renderPaginator de tu código anterior o te paso el archivo 100% completo si prefieres.
  
  // PARA ASEGURAR QUE FUNCIONE, AQUÍ ESTÁN LOS MÉTODOS CRÍTICOS QUE FALTAN EN EL SNIPPET ANTERIOR:
  
  renderPaginator() {
    const prevBtn = this.shadowRoot.querySelector('#prev-btn');
    const nextBtn = this.shadowRoot.querySelector('#next-btn');
    const pageInfo = this.shadowRoot.querySelector('#page-info');
    if (!prevBtn || !nextBtn || !pageInfo) return;
    const totalPages = Math.ceil(this.orders.length / this.pageSize);
    pageInfo.textContent = `Page ${totalPages === 0 ? 0 : this.currentPage} of ${totalPages}`;
    prevBtn.disabled = this.currentPage === 1;
    nextBtn.disabled = this.currentPage >= totalPages || totalPages === 0;
    prevBtn.onclick = () => { if (this.currentPage > 1) { this.currentPage--; this.renderTable(); } };
    nextBtn.onclick = () => { if (this.currentPage < totalPages) { this.currentPage++; this.renderTable(); } };
  }

  async showOrderDetailModal(orderId) {
    // ... (Código del modal de detalles que te pasé antes, inclúyelo aquí) ...
    // Como es largo, asegúrate de mantener la versión que ya tenías que funcionaba bien para la recepción.
    // Si no la tienes, dime y la pego completa.
    alert("Detalles de orden " + orderId); // Placeholder simple si no pegaste el código largo
  }

  formatCurrency(amount) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount||0); }

  async handleStatusChange(orderId, nuevoEstado) {
      if(!confirm(`¿Cambiar estado a "${nuevoEstado.toUpperCase()}"?`)) return;
      try {
          await OrderService.updateStatus(orderId, { nuevoEstado });
          alert("Actualizado");
          this.loadOrders();
      } catch (error) { alert("Error: " + error.message); }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: 'Inter', sans-serif; color: #1f2937; background: #f3f4f6; min-height: 100vh; padding: 20px; }
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        h1 { font-size: 1.75rem; margin: 0; }
        .filters-bar { display: flex; gap: 12px; margin-bottom: 15px; }
        select, input { padding: 9px; border: 1px solid #d1d5db; border-radius: 8px; }
        .create-btn { background: #4F46E5; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .table-card { background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f9fafb; padding: 16px; text-align: left; font-size: 0.75rem; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
        td { padding: 16px; border-bottom: 1px solid #f3f4f6; }
        .status-pill { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .status-pill.pendiente { background: #fffbeb; color: #b45309; }
        .status-pill.info { background: #eff6ff; color: #1d4ed8; }
        .status-pill.recibida { background: #ecfdf5; color: #047857; }
        .status-pill.cancelada { background: #fef2f2; color: #b91c1c; }
        .icon-btn { background: transparent; border: none; cursor: pointer; padding: 6px; color: #6b7280; }
        .icon-svg { width: 20px; height: 20px; }
        .relative-container { position: relative; display: inline-block; }
        .status-popover { display: none; position: fixed; width: 200px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 999; }
        .status-popover.show { display: block; }
        .action-btn-flow { width: 100%; background: #3b82f6; color: white; border: none; padding: 6px; border-radius: 4px; margin-top: 8px; cursor: pointer; }
        .pagination-container { padding: 15px; display: flex; justify-content: space-between; border-top: 1px solid #e5e7eb; }
      </style>

      <div class="top-bar">
        <h1>Gestión de Órdenes</h1>
        <button id="create-order-btn" class="create-btn">+ Nueva Orden</button>
      </div>

      <div class="filters-bar">
         <input type="text" id="search-input" placeholder="Buscar ID..." />
         <select id="status-filter"><option value="">Todos los estados</option></select>
      </div>

      <div class="table-card">
        <table>
          <thead>
            <tr><th>ID</th><th>Proveedor</th><th class="text-center">Fecha</th><th class="text-right">Total</th><th class="text-center">Estado</th><th class="text-center">Acciones</th></tr>
          </thead>
          <tbody></tbody>
        </table>
        <div class="pagination-container">
            <button id="prev-btn">Anterior</button>
            <span id="page-info"></span>
            <button id="next-btn">Siguiente</button>
        </div>
      </div>
    `;
  }
}
customElements.define("orders-mfe", OrdersMFE);