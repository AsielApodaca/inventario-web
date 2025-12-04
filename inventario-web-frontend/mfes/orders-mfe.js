import { OrderService } from '../services/orderService.js';
import { WarehouseService } from '../services/warehouseService.js';
import { SupplierService } from '../services/supplierService.js';
import { ProductService } from '../services/productService.js';
import { DetalleOrdenCompraService } from '../services/detalleOrdenCompraService.js';
import { MovementService } from '../services/movementService.js';

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
    // Eventos de búsqueda y filtros (se mantienen igual)
    const input = this.shadowRoot.querySelector("#search-input"); // Ojo: asegurate que este ID coincida con tu HTML
    if(input) input.oninput = e => {
      this.searchTerm = e.target.value;
      this.currentPage=1;
      this.loadOrders();
    };
    
    // ... tus selectores de filtros ...

    // --- AQUÍ ESTÁ LA CORRECCIÓN ---
    // ANTES: this.shadowRoot.querySelector(".create-order-btn");
    // AHORA: Usamos el ID "#create-order-btn" que es el que pusiste en el HTML
    const addBtn = this.shadowRoot.querySelector("#create-order-btn");
    
    if(addBtn) {
        addBtn.onclick = () => this.showCreateOrderModal();
    } else {
        console.error("No se encontró el botón de crear orden");
    }
  }

  async showCreateOrderModal() {
    if(this.shadowRoot.querySelector('#create-order-modal')) return;
    let allProductsList = await ProductService.getAll();
    
    const modal = document.createElement('div');
    modal.id = 'create-order-modal';
    // Nota: Eliminé el <select id="order-warehouse"> del HTML abajo
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
              <thead>
                <tr style="border-bottom:1px solid #ddd; text-align:left;"><th>Producto</th><th>Cant</th><th>$$</th><th></th></tr>
              </thead>
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
      <style>
         /* Mismos estilos que tenías, omitidos para brevedad */
         .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 1000; }
         .modal-content { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding:25px; border-radius:12px; z-index: 1001; width:500px; max-width:95vw; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
         .modal-actions { margin-top:20px; display:flex; justify-content: flex-end; gap:10px; }
         .btn-primary { background: #4F46E5; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
         .btn-secondary { background: #e5e7eb; color: #374151; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
         .modal-error { color: #dc2626; margin-top: 10px; font-size: 0.9rem; }
         select, input { padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; }
      </style>
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
      supplierSelect.disabled = false;
    };

    // Lógica añadir producto (sin cambios funcionales importantes)
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

    // --- GUARDAR ORDEN ---
    modal.querySelector('#order-form').onsubmit = async (e) => {
      e.preventDefault();
      if (!supplierSelect.value) return;
      if (productsAdded.length===0) return;
      
      try {
        const total = productsAdded.reduce((sum,p)=>sum+p.subtotal,0);
        
        // PAYLOAD LIMPIO: SIN ALMACÉN
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
    // Formatos comunes
    const cand = [
      res.id,
      res.id_orden,
      res.data?.id,
      res.data?.id_orden,
      res.data?.data?.id,
      res.data?.data?.id_orden,
      res.data?.data?.data?.id,
      res.data?.data?.data?.id_orden,
      res.data?.orden?.id,
      res.data?.order?.id,
    ];
    return cand.find(v => typeof v === "number" || (typeof v === "string" && v !== ""));
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
      pendiente: {cls:"badge-warning", txt:"Pendiente"},
      aprobada:  {cls:"badge-info",    txt:"Aprobada"},
      enviada:   {cls:"badge-info",    txt:"Enviada"},
      recibida:  {cls:"badge-success", txt:"Recibida"},
      cancelada: {cls:"badge-danger",  txt:"Cancelada"}
    };
    
    if(val === 'completada') return `<span class="badge badge-success">Recibida*</span>`;

    const conf = map[val] || {cls:"badge-secondary", txt: val || '?'};
    return `<span class="badge ${conf.cls}">${conf.txt}</span>`;
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
    const tableBody = this.shadowRoot.querySelector('tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const currentOrders = this.orders.slice(startIndex, endIndex);

    if (this.orders.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center" style="padding: 40px; color: #9ca3af;">
             No se encontraron órdenes.
          </td>
        </tr>`;
      this.renderPaginator();
      return;
    }

    currentOrders.forEach(order => {
      const tr = document.createElement('tr');
      
      tr.innerHTML = `
        <td>
            <span class="font-mono text-main">#${order.codigo || order.id}</span>
        </td>
        <td>
            <div class="text-main" style="font-weight:600;">${this.getSupplierLabel(order.id_proveedor)}</div>
        </td>
        <td class="text-center text-sub">
            ${(order.fecha_orden || order.createdAt || '').slice(0, 10)}
        </td>
        <td class="text-right">
            <span class="amount">${this.formatCurrency(order.total)}</span>
        </td>
        <td class="text-center">
            ${this.getStatusBadge(order)}
        </td>
        <td>
          <div class="actions-cell">
            <button class="icon-btn edit btn-edit" title="Editar Orden">
              <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
            
            <button class="icon-btn view btn-details" title="Ver Detalles">
              <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </button>
          </div>
        </td>
      `;
      
      tr.querySelector('.btn-details').onclick = () => this.showOrderDetailModal(order.id);
      
      const editBtn = tr.querySelector('.btn-edit');
      const estado = (order.estado || '').toLowerCase();
      if(estado !== 'pendiente') {
          editBtn.style.opacity = '0.3';
          editBtn.style.cursor = 'not-allowed';
      } else {
          editBtn.onclick = () => alert("Editar orden " + order.id);
      }

      tableBody.appendChild(tr);
    });

    this.renderPaginator();
  }

  attachDetailButtons() {
    const buttons = this.shadowRoot.querySelectorAll(".view-order-btn");
    buttons.forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-order-id");
        if (id) this.showOrderDetailModal(id);
      };
    });
  }

  async showOrderDetailModal(orderId) {
    const existing = this.shadowRoot.querySelector("#order-detail-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "order-detail-modal";
    
    // VARIABLES DE DATOS
    let orderData = null;
    let detailList = [];
    let total = 0;

    try {
      // 1. OBTENER DATOS DEL SERVIDOR
      const [orderRes, detailsRes] = await Promise.all([
        OrderService.getById(orderId),
        DetalleOrdenCompraService.getByOrden(orderId)
      ]);

      orderData = orderRes.data?.data?.data || orderRes.data?.data || orderRes.data || orderRes;
      
      // Normalizar lista de productos (busca en todos los lugares posibles)
      const potentialArrays = [
        detailsRes?.data?.data?.data,
        detailsRes?.data?.data,
        detailsRes?.data,
        detailsRes?.detalles,
        orderData?.detalles,
        detailsRes
      ];

      for (const candidate of potentialArrays) {
        if (Array.isArray(candidate) && candidate.length > 0) {
          detailList = candidate;
          break;
        }
      }

      // Calcular total
      total = detailList.reduce((sum, d) => sum + (Number(d.precio_unitario||d.precio||0) * Number(d.cantidad||d.qty||0)), 0);

    } catch (error) {
      console.error(error);
      alert("Error cargando detalles: " + error.message);
      return;
    }

    // 2. GENERAR HTML DEL MODAL
    // Usamos this.warehouseOptions que ya cargaste al inicio para llenar el select
    const warehouseOptionsHtml = this.warehouseOptions
        .filter(w => w.value !== "") // Quitamos la opción "Todos"
        .map(w => `<option value="${w.value}">${w.label}</option>`)
        .join('');

    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-panel">
        
        <div class="modal-header">
          <div>
            <h2 style="margin:0; font-size:1.5rem; color:#111827;">Detalle de Orden</h2>
            <p style="margin:4px 0 0; color:#6B7280; font-size:0.9rem;">
               ID: <span style="font-family:monospace; font-weight:600;">#${orderData.codigo || orderData.id}</span>
               &nbsp;•&nbsp; 
               ${orderData.fecha_orden ? new Date(orderData.fecha_orden).toLocaleDateString() : ''}
            </p>
          </div>
          <button class="close-btn" title="Cerrar">
            <svg style="width:24px;height:24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div id="detail-body">
            
            <div class="info-grid">
                <div class="info-item">
                    <span class="label">Proveedor</span>
                    <span class="value" style="font-weight:600; color:#1f2937;">
                        ${this.getSupplierLabel(orderData.id_proveedor)}
                    </span>
                </div>
                <div class="info-item">
                     <span class="label">Estado</span>
                     <div style="margin-top:4px;">${this.renderStatusPill(orderData.estado)}</div>
                </div>
                <div class="info-item">
                     <span class="label">Total</span>
                     <span class="value" style="font-size:1.1rem; color:#111827;">
                        ${this.formatCurrency(total)}
                     </span>
                </div>
            </div>

            <div class="products-section">
                <h4 style="margin:0 0 15px 0; font-size:1rem; color:#374151;">Productos (${detailList.length})</h4>
                ${detailList.length > 0 ? `
                  <div class="table-responsive">
                    <table>
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th class="text-center">Cant.</th>
                          <th class="text-right">Precio</th>
                          <th class="text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${detailList.map(item => `
                          <tr>
                            <td>
                                <div style="font-weight:500; color:#111827;">
                                    ${item.producto?.nombre || item.nombre_producto || 'Item sin nombre'}
                                </div>
                            </td>
                            <td class="text-center" style="font-weight:600;">${item.cantidad}</td>
                            <td class="text-right">${this.formatCurrency(item.precio_unitario)}</td>
                            <td class="text-right" style="font-weight:600;">
                                ${this.formatCurrency(item.subtotal || (item.cantidad * item.precio_unitario))}
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                  <div style="text-align:right; margin-top:15px; font-weight:bold; font-size:1.1rem;">
                    Total Final: ${this.formatCurrency(total)}
                  </div>
                ` : `<p style="text-align:center;color:#666;">No hay productos.</p>`}
            </div>

            <div id="reception-zone" style="margin-top:25px; background:#f3f4f6; padding:20px; border-radius:12px; border:1px solid #e5e7eb;">
                <h4 style="margin:0 0 10px 0; color:#111827;">Recepción de Mercancía</h4>
                
                <div style="display:flex; gap:15px; align-items:flex-end; flex-wrap:wrap;">
                    <div style="flex-grow:1;">
                        <label style="display:block; font-size:0.85rem; font-weight:600; color:#4b5563; margin-bottom:5px;">
                            Seleccione Almacén de Destino:
                        </label>
                        <select id="receive-warehouse-select" style="width:100%; padding:10px; border-radius:8px; border:1px solid #d1d5db;">
                            <option value="">-- Seleccione un Almacén --</option>
                            ${warehouseOptionsHtml}
                        </select>
                    </div>
                    <button id="btn-receive" class="btn-primary">
                        Confirmar Entrada
                    </button>
                </div>
            </div>

        </div>
      </div>

      <style>
        /* Estilos CSS (Iguales a los anteriores + tabla responsive) */
        .modal-overlay { position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.6); backdrop-filter: blur(2px); z-index:1000; }
        .modal-panel { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#fff; width:90%; max-width:700px; max-height:90vh; overflow-y:auto; border-radius:16px; z-index:1001; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); }
        .modal-header { display:flex; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #f3f4f6; }
        .close-btn { border:none; background:#f3f4f6; width:32px; height:32px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.2s; }
        .close-btn:hover { background:#fee2e2; color:#ef4444; }
        #detail-body { padding:24px; }
        .info-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; background:#f9fafb; padding:15px; border-radius:8px; margin-bottom:20px; border:1px solid #e5e7eb;}
        .info-item .label { font-size:0.75rem; text-transform:uppercase; color:#6b7280; font-weight:700; display:block; margin-bottom:4px; }
        table { width:100%; border-collapse:collapse; }
        th { background:#f9fafb; padding:10px; text-align:left; font-size:0.8rem; color:#6b7280; text-transform:uppercase; font-weight:600; border-bottom:1px solid #e5e7eb; }
        td { padding:12px 10px; border-bottom:1px solid #f3f4f6; font-size:0.9rem; }
        .text-right { text-align:right; } .text-center { text-align:center; }
        .status-pill { padding:4px 10px; border-radius:20px; font-size:0.75rem; font-weight:700; text-transform:uppercase; }
        .status-pill.pendiente { background:#fffbeb; color:#b45309; }
        .status-pill.recibida { background:#ecfdf5; color:#047857; }
        .status-pill.cancelada { background:#fef2f2; color:#b91c1c; }
        .btn-primary { background:#4F46E5; color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:600; cursor:pointer; height:42px; }
        .btn-primary:hover { background:#4338ca; }
        .btn-primary:disabled { background:#9ca3af; cursor:not-allowed; }
      </style>
    `;
    this.shadowRoot.appendChild(modal);

    // EVENTOS
    modal.querySelector(".close-btn").onclick = () => modal.remove();
    modal.querySelector(".modal-overlay").onclick = () => modal.remove();

    // LÓGICA DE RECEPCIÓN
    const btnReceive = modal.querySelector("#btn-receive");
    const warehouseSelect = modal.querySelector("#receive-warehouse-select");
    const receptionZone = modal.querySelector("#reception-zone");

    // Ocultar zona de recepción si ya no es pendiente
    const estadoActual = (orderData.estado || '').toLowerCase();
    if (['recibida', 'cancelada', 'completada'].includes(estadoActual)) {
        receptionZone.style.display = 'none';
    }

    // ... dentro de showOrderDetailModal ...

    btnReceive.onclick = async () => {
        // 1. VALIDACIÓN
        const selectedWarehouseId = warehouseSelect.value;
        if (!selectedWarehouseId) {
            alert("⚠️ Debes seleccionar un Almacén de Destino.");
            warehouseSelect.focus();
            return;
        }

        if(!confirm(`¿Recibir mercancía en el almacén seleccionado?\nEsta acción aumentará el stock.`)) return;

        try {
            btnReceive.disabled = true;
            btnReceive.textContent = "Procesando...";

            if(detailList.length > 0) {
                const movePromises = detailList.map(d => MovementService.createEntry({
                    id_producto: d.id_producto || d.producto?.id,
                    id_almacen: parseInt(selectedWarehouseId),
                    cantidad: d.cantidad || d.qty,
                    tipo_movimiento: "entrada",
                    referencia: String(orderData.id),
                    motivo: `Recepción OC #${orderData.id}`
                }));
                await Promise.all(movePromises);
            }

            // 2. ACTUALIZAR ESTADO (CORREGIDO)
            // El backend exige la propiedad "nuevoEstado" en el cuerpo de la petición.
            await OrderService.updateStatus(orderId, { 
                nuevoEstado: "recibida" 
            });

            alert("✅ Orden recibida correctamente.");
            modal.remove();
            setTimeout(() => this.loadOrders(), 500);

        } catch(e) {
            console.error("Error al recibir:", e);
            // Mostrar mensaje detallado del backend si existe
            const msg = e.response?.data?.message || e.message;
            const validationDetails = e.response?.data?.errors?.[0]?.msg; // Extraer detalle específico
            
            alert(`❌ Error: ${msg} ${validationDetails ? `(${validationDetails})` : ''}`);
            
            btnReceive.disabled = false;
            btnReceive.textContent = "Reintentar";
        }
    };
  }

  normalizeDetailArray(detailsRes) {
    // Cuando viene directo como array
    if (Array.isArray(detailsRes)) return detailsRes;
    // Axios response: data: { data: [...] }
    if (Array.isArray(detailsRes?.data?.data)) return detailsRes.data.data;
    // Axios response: data: [...]
    if (Array.isArray(detailsRes?.data)) return detailsRes.data;
    // Controller personalizado: { status, data: [...], metadata, count }
    if (Array.isArray(detailsRes?.data?.detalles)) return detailsRes.data.detalles;
    if (Array.isArray(detailsRes?.rows)) return detailsRes.rows;
    if (Array.isArray(detailsRes?.data?.rows)) return detailsRes.data.rows;
    return [];
  }

  renderStatusPill(status) {
    const val = (status || '').toLowerCase();
    // Mapeamos a las clases CSS definidas en el modal
    const map = {
      pendiente: 'pendiente',
      aprobada:  'info',
      enviada:   'info',
      recibida:  'recibida',
      cancelada: 'cancelada',
      completada: 'recibida' // Compatibilidad visual
    };
    return `<span class="status-pill ${map[val] || 'info'}">${val.toUpperCase()}</span>`;
  }

  renderPaginator() {
    const prevBtn = this.shadowRoot.querySelector('#prev-btn');
    const nextBtn = this.shadowRoot.querySelector('#next-btn');
    const pageInfo = this.shadowRoot.querySelector('#page-info');

    // Si el HTML no se ha renderizado aún, salir
    if (!prevBtn || !nextBtn || !pageInfo) return;

    const totalPages = Math.ceil(this.orders.length / this.pageSize);
    
    // Seguridad: si filtramos y la página actual ya no existe, volver a la 1
    if (this.currentPage > totalPages && totalPages > 0) {
        this.currentPage = 1;
        this.renderTable(); 
        return;
    }

    pageInfo.textContent = `Page ${totalPages === 0 ? 0 : this.currentPage} of ${totalPages}`;

    prevBtn.disabled = this.currentPage === 1;
    nextBtn.disabled = this.currentPage >= totalPages || totalPages === 0;

    // Eventos (limpios y llamando a la función correcta 'renderTable')
    prevBtn.onclick = () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderTable();
      }
    };

    nextBtn.onclick = () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderTable();
      }
    };
  }
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount||0);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1f2937; background: #f3f4f6; min-height: 100vh; padding: 20px; }
        
        /* --- HEADER & CONTROLS --- */
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 15px; }
        h1 { font-size: 1.75rem; font-weight: 700; color: #111827; margin: 0; }
        
        .filters-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; background: white; padding: 12px; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
        select, input { padding: 9px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem; outline: none; transition: border-color 0.2s; background-color: #f9fafb; }
        select:focus, input:focus { border-color: #4F46E5; background: #fff; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
        
        .create-btn { background: #4F46E5; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2); }
        .create-btn:hover { background: #4338ca; transform: translateY(-1px); }

        /* --- TABLE CARD DESIGN --- */
        .table-card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden; border: 1px solid #e5e7eb; }
        
        table { width: 100%; border-collapse: separate; border-spacing: 0; }
        
        thead th { background: #f9fafb; padding: 16px 24px; text-align: left; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
        
        tbody tr { transition: background-color 0.2s; }
        tbody tr:hover { background-color: #f9fafb; }
        tbody td { padding: 16px 24px; border-bottom: 1px solid #f3f4f6; font-size: 0.95rem; vertical-align: middle; }
        tbody tr:last-child td { border-bottom: none; }

        /* --- TYPOGRAPHY & BADGES --- */
        .text-main { font-weight: 500; color: #111827; }
        .text-sub { font-size: 0.85rem; color: #6b7280; margin-top: 2px; }
        .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #6b7280; font-size: 0.85rem; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .amount { font-weight: 600; color: #111827; letter-spacing: -0.02em; }

        /* --- ACTION BUTTONS --- */
        .actions-cell { display: flex; gap: 8px; justify-content: center; }
        .icon-btn { border: none; background: transparent; padding: 6px; border-radius: 6px; cursor: pointer; transition: all 0.2s; color: #6b7280; display: flex; align-items: center; justify-content: center; }
        .icon-btn:hover { background: #f3f4f6; color: #111827; }
        .icon-btn.edit:hover { background: #eff6ff; color: #2563eb; }
        .icon-btn.view:hover { background: #f0fdf4; color: #166534; }
        .icon-svg { width: 18px; height: 18px; stroke-width: 2; }

        /* --- PAGINATION --- */
        .pagination-container { padding: 16px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; background: #fff; }
        .page-btn { background: white; border: 1px solid #d1d5db; padding: 6px 14px; border-radius: 6px; font-weight: 500; cursor: pointer; color: #374151; transition: all 0.2s; }
        .page-btn:hover:not(:disabled) { border-color: #9ca3af; background: #f9fafb; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; background: #f3f4f6; }
      </style>

      <div class="top-bar">
        <h1>Gestión de Órdenes</h1>
        <button id="create-order-btn" class="create-btn">
           <svg class="icon-svg" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
           Nueva Orden
        </button>
      </div>

      <div class="filters-bar">
         <input type="text" id="search-input" placeholder="Buscar por ID..." style="min-width: 250px;" />
         <select id="status-filter"><option value="">Todos los estados</option></select>
      </div>

      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>ID Orden</th>
              <th>Proveedor</th> <th class="text-center">Fecha</th>
              <th class="text-right">Total</th>
              <th class="text-center">Estado</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="6" style="text-align:center; padding: 40px;">Cargando órdenes...</td></tr>
          </tbody>
        </table>

        <div class="pagination-container">
            <button id="prev-btn" class="page-btn">Anterior</button>
            <span id="page-info" class="text-sub" style="margin:0;">Página 1</span>
            <button id="next-btn" class="page-btn">Siguiente</button>
        </div>
      </div>
    `;
  }
}

customElements.define("orders-mfe", OrdersMFE);
