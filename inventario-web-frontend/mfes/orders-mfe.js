import { OrderService } from '../services/orderService.js';
import { WarehouseService } from '../services/warehouseService.js';
import { SupplierService } from '../services/supplierService.js';
import { ProductService } from '../services/productService.js';

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
    this.statusOptions = [ { value: "", label: "All" } ]; // Se llenará desde backend
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
    // Construir filtros dependiendo la API backend
    const filters = {
      estado: this.statusFilter || undefined,
      id_almacen: this.warehouseFilter || undefined,
      q: this.searchTerm || undefined,
      page: this.currentPage,
      per_page: this.pageSize
    };
    const arr = await OrderService.getAll(filters);
    // Lógica para total (puede llegar paginado)
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
    // Búsqueda y filtros igual (no cambia)
    const input = this.shadowRoot.querySelector("#order-search");
    if(input) input.oninput = e => {
      this.searchTerm = e.target.value;
      this.currentPage=1;
      this.loadOrders();
    };
    const statusSelect = this.shadowRoot.querySelector("#status-filter");
    if(statusSelect) statusSelect.onchange = e=>{
      this.statusFilter = e.target.value;
      this.currentPage=1;
      this.loadOrders();
    };
    const whSelect = this.shadowRoot.querySelector("#warehouse-filter");
    if(whSelect) whSelect.onchange = e=>{
      this.warehouseFilter = e.target.value;
      this.currentPage=1;
      this.loadOrders();
    };
    // Crear Orden
    const addBtn = this.shadowRoot.querySelector(".create-order-btn");
    if(addBtn) addBtn.onclick=()=>this.showCreateOrderModal();
  }

  async showCreateOrderModal() {
    if(this.shadowRoot.querySelector('#create-order-modal')) return;
    // Obtener el listado de productos para el select
    let productsList = await ProductService.getAll();
    // Modal overlay y contenido principal
    const modal = document.createElement('div');
    modal.id = 'create-order-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <h2>Create Purchase Order</h2>
        <form id="order-form" autocomplete="off">
          <label>Supplier:<br>
            <select id="order-supplier" required><option value="">Select supplier...</option></select>
          </label><br>
          <label>Warehouse:<br>
            <select id="order-warehouse" required><option value="">Select warehouse...</option></select>
          </label><br>
          <div style="border:1px solid #eee;margin:16px 0 8px;padding:10px 8px 6px;border-radius:7px;background:#fafaff;">
            <div style="display:flex;gap:8px;align-items:flex-end;">
              <label style="flex:2;">
                Product:
                <select id="order-product-select" style="width:100%;margin-top:2px;">
                  <option value="">Select product...</option>
                  ${productsList.map(p => `<option value="${p.id}">${p.nombre} ${p.codigo_barras ? '('+p.codigo_barras+')' : ''}</option>`).join('')}
                </select>
              </label>
              <label style="flex:1;">
                Qty:
                <input type="number" id="order-product-qty" min="1" value="1" style="width:65px;">
              </label>
              <button type="button" id="add-product-btn" class="btn-small">Add</button>
            </div>
            <div style="font-size:0.93em;color:#555;margin:4px 0 2px 3px;">Tip: Type product name and press letter to jump to it.</div>
            <div style="margin-top:8px;">
              <table style="width:100%;margin-top:9px;"><thead>
                <tr style="background:#f6f7fc;font-size:0.94em;"><th align="left">Product</th><th>Qty</th><th>Price</th><th>Subtotal</th><th></th></tr>
              </thead>
              <tbody id="added-products-list"></tbody></table>
            </div>
            <div style="text-align:right;margin:8px 2px 3px 0;">
              <b>Total: $<span id="order-total">0.00</span></b>
            </div>
          </div>
          <div id="order-error" class="modal-error"></div>
          <div class="modal-actions">
            <button type="submit" class="btn-primary">Save Order</button>
            <button type="button" class="btn-secondary" id="cancel-order-modal">Cancel</button>
          </div>
        </form>
      </div>
      <style>
      .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.28); z-index: 1000; }
      .modal-content { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding:32px;
        border-radius:12px; box-shadow:0 2px 16px rgba(0,0,0,0.12); z-index: 1001; min-width: 380px; width:450px; max-height:90vh;
        overflow:auto; animation:fadeIn 0.22s ease; }
      .modal-actions { margin-top:18px; display:flex; justify-content: flex-end; gap:10px; }
      .btn-primary { background: #4F46E5; color: white; border: none; padding: 9px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
      .btn-primary:hover { background: #4338CA; }
      .btn-secondary { background: #ccc; color: black; padding: 9px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
      .btn-small { padding:5px 11px; background:#e0e7ff;color:#222;border:none;border-radius:5px;cursor:pointer;font-size:0.96em; }
      .btn-small:hover {background:#6366F1;color:white;}
      .modal-error {color:red;margin-top:7px;min-height:19px;}
      @keyframes fadeIn {from { opacity: 0; transform: translate(-50%, -48%); }to{ opacity: 1; transform: translate(-50%, -50%); }}
      tr>td,th{padding:7px 5px;}
      </style>
    `;
    this.shadowRoot.appendChild(modal);
    // Cargar selects de proveedor y almacén (como antes)
    const supplierSelect = modal.querySelector('#order-supplier');
    this.suppliers.forEach(s => supplierSelect.innerHTML += `<option value="${s.id}">${s.nombre}</option>`);
    const warehouseSelect = modal.querySelector('#order-warehouse');
    this.warehouseOptions.filter(w=>w.value).forEach(w => warehouseSelect.innerHTML += `<option value="${w.value}">${w.label}</option>`);
    // --- Estados temporales en memoria para productos añadidos ---
    let productsAdded = [];
    // Agregar producto a la lista
    modal.querySelector('#add-product-btn').onclick = () => {
      const prodId = modal.querySelector('#order-product-select').value;
      const qty = parseInt(modal.querySelector('#order-product-qty').value,10);
      if (!prodId || !qty || qty<=0) { modal.querySelector('#order-error').textContent = 'Select a product and enter quantity.'; return; }
      const productObj = productsList.find(p=>p.id == prodId);
      if (!productObj) { modal.querySelector('#order-error').textContent = 'Product not found.'; return; }
      // Ya en la lista?
      const exists = productsAdded.find(pa=>pa.id==prodId);
      if (exists) { modal.querySelector('#order-error').textContent = 'Product already added.'; return; }
      productsAdded.push({ ...productObj, qty, subtotal: (productObj.precio_compra||0)*qty });
      renderProductsList();
      modal.querySelector('#order-error').textContent = '';
    };
    // Renderizar tabla productos añadidos
    function renderProductsList() {
      const tbody = modal.querySelector('#added-products-list');
      let total = 0;
      tbody.innerHTML = productsAdded.map(p => {
        const st = (p.precio_compra||0)*p.qty;
        total+= st;
        return `<tr><td>${p.nombre}</td><td style="text-align:center;">${p.qty}</td><td style="text-align:right;">$${Number(p.precio_compra||0).toFixed(2)}</td><td style="text-align:right;">$${st.toFixed(2)}</td><td><button type='button' class='btn-small' title='Remove' data-rm-prod='${p.id}' style='color:#c00;padding:2px 8px;'>✖</button></td></tr>`;
      }).join('');
      modal.querySelector('#order-total').textContent = total.toFixed(2);
      // Evento quitar producto
      tbody.querySelectorAll('[data-rm-prod]').forEach(btn => {
        btn.onclick = () => {
          productsAdded = productsAdded.filter(p=>p.id!=btn.getAttribute('data-rm-prod'));
          renderProductsList();
        }
      });
    }
    // Cancelar
    modal.querySelector('#cancel-order-modal').onclick = () => modal.remove();
    // Guardar orden
    modal.querySelector('#order-form').onsubmit = async (e) => {
      e.preventDefault();
      if (!supplierSelect.value || !warehouseSelect.value) { modal.querySelector('#order-error').textContent = 'Select supplier and warehouse.'; return; }
      if (productsAdded.length===0) { modal.querySelector('#order-error').textContent = 'Add at least one product.'; return; }
      try {
        // Calcular el total
        const total = productsAdded.reduce((sum,p)=>sum+(Number(p.precio_compra||0)*p.qty),0);
        const orderData = {
          id_proveedor: parseInt(supplierSelect.value),
          id_almacen: parseInt(warehouseSelect.value),
          productos: productsAdded.map(p=>({id_producto:p.id, cantidad:p.qty, precio:p.precio_compra})),
          total // manda el total directo
        };
        await OrderService.create(orderData);
        modal.remove();
        this.loadOrders();
      } catch(err) {
        modal.querySelector('#order-error').textContent = 'Error saving order.';
      }
    };
  }

  hideCreateOrderModal(modal) {
    modal.remove();
  }

  updateAddedProductsList(modal) {
    const addedProductsList = modal.querySelector('#added-products-list');
    if (!addedProductsList) return;
    addedProductsList.innerHTML = '';
    productsAdded.forEach(item => {
      addedProductsList.innerHTML += `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${this.formatCurrency(item.price)}</td>
          <td>${this.formatCurrency(item.subtotal)}</td>
          <td><button class="remove-product-btn" data-prod-id="${item.product_id}">X</button></td>
        </tr>
      `;
    });
    // Eliminar producto al hacer clic en el botón "X"
    addedProductsList.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.remove-product-btn');
      if (removeBtn) {
        const prodId = removeBtn.getAttribute('data-prod-id');
        productsAdded = productsAdded.filter(item => item.product_id !== prodId);
        this.updateAddedProductsList(modal);
        this.updateTotal(modal);
      }
    });
  }

  updateTotal(modal) {
    const totalSpan = modal.querySelector('#order-total');
    if (!totalSpan) return;
    const total = productsAdded.reduce((sum, item) => sum + item.subtotal, 0);
    totalSpan.textContent = total.toFixed(2);
  }

  getStatusBadge(order) {
    const val = (order.estado || order.status || "").toLowerCase();
    const map = {
      completed: {cls:"badge-success", txt:"Completed"},
      in_process: {cls:"badge-info", txt:"In Process"},
      pendiente: {cls:"badge-warning", txt:"Pending"},
      pending: {cls:"badge-warning", txt:"Pending"},
      cancelled: {cls:"badge-danger", txt:"Cancelled"},
      canceled: {cls:"badge-danger", txt:"Cancelled"},
      proceso: {cls:"badge-info", txt:"In Process"},
      'en proceso': {cls:'badge-info', txt:'In Process'},
      completada: {cls:"badge-success", txt:"Completed"}
    };
    return `<span class="badge ${map[val]?.cls || ''}">${map[val]?.txt || order.estado || order.status || '-'}</span>`;
  }

  getWarehouseLabel(id) {
    if(!id) return 'General';
    return this.warehouseById[id] || id;
  }

  getSupplierLabel(id) {
    if(!id) return 'General';
    return this.supplierById[id] || id;
  }

  renderFilters() {
    const whSelect = this.shadowRoot.querySelector("#warehouse-filter");
    if(whSelect) whSelect.innerHTML = this.warehouseOptions.map(w=>`<option value="${w.value}">${w.label}</option>`).join('');
    const stSelect = this.shadowRoot.querySelector("#status-filter");
    if(stSelect) stSelect.innerHTML = this.statusOptions.map(o=>`<option value="${o.value}">${o.label}</option>`).join("");
  }

  renderTable() {
    const tbody = this.shadowRoot.querySelector("#orders-tbody");
    if(!tbody) return;
    if(this.loading){
      tbody.innerHTML = `<tr><td colspan="7" style="padding:40px;text-align:center;">Cargando...</td></tr>`;
      return;
    }
    if(this.orders.length===0){
      tbody.innerHTML = `<tr><td colspan="7" style="padding:40px;text-align:center;color:#888;">No se encontraron órdenes.</td></tr>`;
      return;
    }
    tbody.innerHTML = this.orders.map(order=>{
      // Buscar el campo de fecha más informativo y formato YYYY-MM-DD
      const dt = order.fecha_orden || order.fecha_creacion || order.createdAt || order.created_at || order.created || order.fecha || '-';
      const formattedDate = dt && typeof dt === 'string' ? dt.slice(0,10) : '-';
      return `
      <tr>
        <td><a href="#" style="color:#4F46E5;font-weight:600;">${order.codigo || order.code || order.id}</a></td>
        <td>${this.getSupplierLabel(order.id_proveedor || order.supplier_id)}</td>
        <td>${this.getWarehouseLabel(order.id_almacen || order.warehouse_id)}</td>
        <td class="text-center">${formattedDate}</td>
        <td class="text-right">${this.formatCurrency(order.total)}</td>
        <td>${this.getStatusBadge(order)}</td>
        <td style="text-align:center;"><button title="Ver" style="border:none;background:transparent;cursor:pointer;font-size:18px;">👁️</button></td>
      </tr>
    `;
    }).join('');
  }

  renderPaginator() {
    const pag = this.shadowRoot.querySelector("#orders-paginator");
    if(!pag) return;
    const lastPage = Math.ceil(this.totalOrders/this.pageSize) || 1;
    let html = "";
    const pageLinks = [this.currentPage-1, this.currentPage, this.currentPage+1].filter(p=>p>=1&&p<=lastPage);
    html += `<button ${this.currentPage===1?'disabled':''} class="pgn-btn" id="pgn-prev">Previous</button>`;
    pageLinks.forEach(p=>{
      html += `<button class="pgn-btn${p===this.currentPage?' active':''}" data-page="${p}">${p}</button>`;
    });
    html += `<button ${this.currentPage===lastPage?'disabled':''} class="pgn-btn" id="pgn-next">Next</button>`;
    pag.innerHTML = html;
    pag.querySelectorAll('[data-page]').forEach(btn=>{
      btn.onclick=()=>{this.currentPage=+btn.getAttribute('data-page');this.loadOrders();}
    });
    const prev = pag.querySelector('#pgn-prev');
    if(prev) prev.onclick=()=>{if(this.currentPage>1){this.currentPage--;this.loadOrders();}}
    const next = pag.querySelector('#pgn-next');
    if(next) next.onclick=()=>{if(this.currentPage<lastPage){this.currentPage++;this.loadOrders();}}
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount||0);
  }

  render() {
    this.shadowRoot.innerHTML = `
    <link rel="stylesheet" href="styles/global.css">
    <div class="page-container">
      <div class="page-header">
        <h1 class="title">📋 Purchase Orders</h1>
        <button class="create-order-btn">+ Create Order</button>
      </div>
      <p class="subtitle">Create and manage purchase orders for your inventory.</p>
      <div class="toolbar">
        <input id="order-search" type="text" class="search-input" placeholder="Search by Order ID or Supplier..." />
        <select id="warehouse-filter" class="toolbar-select"></select>
        <select id="status-filter" class="toolbar-select"></select>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>SUPPLIER</th>
              <th>WAREHOUSE</th>
              <th class="text-center">DATE CREATED</th>
              <th class="text-right">TOTAL</th>
              <th>STATUS</th>
              <th class="text-center"> </th>
            </tr>
          </thead>
          <tbody id="orders-tbody">
          </tbody>
        </table>
      </div>
      <div id="orders-paginator" class="paginator"></div>
      <style>
        :host { display:block; padding:0 20px; }
        .page-header {display: flex; align-items:center; justify-content: space-between; margin-top:30px; margin-bottom:10px;}
        .title {font-size: 1.7rem; font-weight: 700; color: #21223f; margin:0;}
        .subtitle { color: #6B7280; margin-bottom: 18px; margin-top:0; }
        .toolbar {display: flex; gap:10px; margin-bottom:18px;align-items:center;}
        .search-input {padding:10px 14px; border:1px solid #d1d5db; border-radius:5px; min-width:240px;font-size:1rem;}
        .toolbar-select {padding:9px 12px; border:1px solid #d1d5db; border-radius:5px; font-size:1rem;}
        .create-order-btn { background: #6366F1; color:white; font-weight:600; border:none; border-radius:6px; padding:9px 18px; cursor:pointer; font-size:1rem;}
        .create-order-btn:hover { background: #4F46E5; }
        .table-container { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #E5E7EB; }
        table { width:100%; border-collapse: collapse; }
        th, td { padding: 14px 20px; border-bottom: 1px solid #ececec; }
        th { background: #f7f7fb; text-align:left; font-size:0.93rem; color: #555; }
        .text-right { text-align:right; }
        .text-center { text-align:center; }
        tr:last-child td { border-bottom:none; }  tr:hover { background: #f5f7fa; }  
        .badge {padding:4px 11px; border-radius:15px; font-size:0.85rem; font-weight:500;}
        .badge-success{background:#d1fae5;color:#065f46;}
        .badge-info{background:#ddeafe;color:#1e40af;}
        .badge-warning{background:#fef9c3;color:#785000;}
        .badge-danger{background:#fee2e2;color:#991b1b;}
        .paginator { margin-top: 12px; display:flex; gap:5px; }
        .pgn-btn {padding:6px 12px;border:none; border-radius:5px;background:#eef1fb;cursor:pointer;font-weight:500;}
        .pgn-btn.active {background:#6366F1; color:white;}
        .pgn-btn:disabled { background:#ececec; color:#bbb;}
      </style>
    </div>
    `;
    this.renderTable();
    this.renderFilters();
    this.renderPaginator();
  }
}

customElements.define("orders-mfe", OrdersMFE);
