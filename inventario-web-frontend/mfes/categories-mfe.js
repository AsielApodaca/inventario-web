import { CategoryService } from "../services/categoryService.js"

class CategoriesMFE extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.categories = [];
    this.categoryTree = [];
    this.selectedCategory = null; // Si es null, estamos en modo CREAR
    this.expandedIds = new Set();
    this.loading = true;
  }

  async connectedCallback() {
    this.render(); 
    await this.loadCategories();
    this.attachEventListeners();
  }

  async loadCategories() {
    try {
      this.loading = true;
      this.renderTree(); 

      this.categories = await CategoryService.getAll();
      
      // Construir árbol jerárquico
      this.categoryTree = this.buildTree(this.categories);
      
      // Expandir todo por defecto
      this.categories.forEach(c => this.expandedIds.add(c.id));

    } catch (error) {
      console.error("Error:", error);
    } finally {
      this.loading = false;
      this.renderTree();
      this.renderForm(); // Importante: actualiza el formulario
    }
  }

  buildTree(items) {
      const rootItems = [];
      const lookup = {};
      items.forEach(item => lookup[item.id] = { ...item, children: [] });
      items.forEach(item => {
          if (item.id_categoria_padre && lookup[item.id_categoria_padre]) {
              lookup[item.id_categoria_padre].children.push(lookup[item.id]);
          } else {
              rootItems.push(lookup[item.id]);
          }
      });
      return rootItems;
  }

  renderTreeNodes(nodes, level = 0) {
      if (!nodes || nodes.length === 0) return '';

      return nodes.map(node => {
          const isSelected = this.selectedCategory?.id === node.id;
          const hasChildren = node.children.length > 0;
          const isExpanded = this.expandedIds.has(node.id);
          const arrow = hasChildren ? (isExpanded ? '▼' : '▶') : '';
          const icon = hasChildren ? (isExpanded ? '📂' : '📁') : '🏷️';

          return `
            <div class="tree-node">
                <div class="tree-content ${isSelected ? 'selected' : ''}" 
                     style="padding-left: ${level * 20 + 10}px"
                     data-id="${node.id}">
                    <span class="toggle-btn" data-id="${node.id}">${arrow}</span>
                    <span class="node-icon">${icon}</span>
                    <span class="node-name">${node.nombre}</span>
                </div>
                ${isExpanded && hasChildren ? 
                    `<div class="tree-children">${this.renderTreeNodes(node.children, level + 1)}</div>` : ''}
            </div>
          `;
      }).join('');
  }

  renderTree() {
      const container = this.shadowRoot.querySelector('#tree-view');
      if (!container) return;

      if (this.loading) {
          container.innerHTML = '<div class="spinner"></div>';
          return;
      }
      if (this.categories.length === 0) {
          container.innerHTML = '<div class="empty-state">No hay categorías.</div>';
          return;
      }
      container.innerHTML = this.renderTreeNodes(this.categoryTree);
  }

  // --- FORMULARIO (Aquí ocurre la magia del cambio Crear/Editar) ---
  renderForm() {
      const formContainer = this.shadowRoot.querySelector('#form-container');
      if (!formContainer) return;

      const isEdit = !!this.selectedCategory;
      const title = isEdit ? `Edit '${this.selectedCategory.nombre}'` : 'Add New Category';
      const btnText = isEdit ? 'Save Changes' : 'Create Category';
      
      const name = this.selectedCategory?.nombre || '';
      const parentId = this.selectedCategory?.id_categoria_padre || '';
      const desc = this.selectedCategory?.descripcion || '';

      // Filtramos la lista para que una categoría no pueda ser su propio padre
      const options = this.categories
          .filter(c => !isEdit || c.id !== this.selectedCategory.id)
          .map(c => `<option value="${c.id}" ${c.id == parentId ? 'selected' : ''}>${c.nombre}</option>`)
          .join('');

      formContainer.innerHTML = `
          <div class="card-header">
              <h3>${title}</h3>
          </div>
          <form id="category-form" style="padding: 24px;">
              <div class="form-group">
                  <label>Category Name</label>
                  <input type="text" class="input" name="nombre" value="${name}" required placeholder="e.g. Laptops">
              </div>
              
              <div class="form-group">
                  <label>Parent Category</label>
                  <select class="input" name="id_categoria_padre">
                      <option value="">None (Top Level)</option>
                      ${options}
                  </select>
              </div>

              <div class="form-group">
                  <label>Description (Optional)</label>
                  <textarea class="input" name="descripcion" rows="4" placeholder="Enter description...">${desc}</textarea>
              </div>
              
              <div class="form-actions">
                  <button type="button" class="btn-text cancel-btn">Cancel</button>
                  <button type="submit" class="btn-primary">${btnText}</button>
                  ${isEdit ? '<button type="button" class="btn-text delete-btn" style="color:red; margin-right:auto;">Delete</button>' : ''}
              </div>
          </form>
      `;
      
      this.attachFormEvents(); // Reconectar eventos del formulario nuevo
  }

  attachEventListeners() {
      const treeView = this.shadowRoot.querySelector('#tree-view');
      const addBtn = this.shadowRoot.querySelector('#add-btn');
      const searchInput = this.shadowRoot.querySelector('#search-input');

      // 1. CLICK EN ÁRBOL (Seleccionar o Expandir)
      if(treeView) {
          treeView.addEventListener('click', (e) => {
              if (e.target.classList.contains('toggle-btn')) {
                  e.stopPropagation();
                  const id = parseInt(e.target.dataset.id);
                  this.expandedIds.has(id) ? this.expandedIds.delete(id) : this.expandedIds.add(id);
                  this.renderTree();
                  return;
              }
              const row = e.target.closest('.tree-content');
              if(row) {
                  const id = parseInt(row.dataset.id);
                  this.selectedCategory = this.categories.find(c => c.id === id);
                  this.renderTree(); // Actualiza azul de selección
                  this.renderForm(); // Muestra datos en formulario
              }
          });
      }

      // 2. BOTÓN "ADD NEW CATEGORY" (Tu requerimiento principal)
      if(addBtn) {
          addBtn.addEventListener('click', () => {
              this.selectedCategory = null; // Limpiamos selección
              this.renderForm(); // Formulario se renderiza vacío
              this.renderTree(); // Árbol pierde la selección azul
          });
      }

      // 3. BUSCADOR
      if(searchInput) {
          searchInput.addEventListener('input', (e) => {
              const term = e.target.value.toLowerCase();
              if (!term) {
                  this.categoryTree = this.buildTree(this.categories);
              } else {
                  const filtered = this.categories.filter(c => c.nombre.toLowerCase().includes(term));
                  this.categoryTree = filtered.map(c => ({...c, children: []})); // Lista plana al buscar
              }
              this.renderTree();
          });
      }
      
      this.attachFormEvents();
  }

  attachFormEvents() {
      const form = this.shadowRoot.querySelector('#category-form');
      const cancelBtn = this.shadowRoot.querySelector('.cancel-btn');
      const deleteBtn = this.shadowRoot.querySelector('.delete-btn');

      if(cancelBtn) {
          cancelBtn.addEventListener('click', () => {
              this.selectedCategory = null;
              this.renderForm();
              this.renderTree();
          });
      }

      if(deleteBtn) {
          deleteBtn.addEventListener('click', async () => {
              if(confirm('¿Seguro que deseas eliminar esta categoría?')) {
                  await CategoryService.delete(this.selectedCategory.id);
                  this.selectedCategory = null;
                  await this.loadCategories();
              }
          });
      }

      // SUBMIT DEL FORMULARIO (Crear o Editar)
      if(form) {
          form.addEventListener('submit', async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData.entries());
              
              // Backend espera null, no string vacío
              if (data.id_categoria_padre === "") data.id_categoria_padre = null;

              try {
                  if (this.selectedCategory) {
                      await CategoryService.update(this.selectedCategory.id, data);
                      alert("Categoría actualizada");
                  } else {
                      // AQUÍ SE CREA LA NUEVA
                      await CategoryService.create(data);
                      alert("Categoría creada exitosamente");
                  }
                  this.selectedCategory = null; // Reseteamos tras guardar
                  await this.loadCategories(); // Recargamos lista
                  
              } catch (err) {
                  alert("Error: " + err.message);
              }
          });
      }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles/global.css">
      
      <div class="page-container">
        <div class="section-header">
            <div>
                <h1>Category Management</h1>
                <p>Organize your product categories.</p>
            </div>
            <button class="btn-primary" id="add-btn">+ Add New Category</button>
        </div>

        <div class="grid-layout">
            <div class="card tree-panel">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="search-input" placeholder="Filter categories...">
                </div>
                <div id="tree-view" class="scroll-area"></div>
            </div>

            <div class="card form-panel" id="form-container">
                <div class="card-header"><h3>Select a category</h3></div>
                <div class="empty-state" style="padding-top:50px;">
                    Select a category to edit or create a new one.
                </div>
            </div>
        </div>
      </div>

      <style>
        :host { display: block; padding: 20px; box-sizing: border-box; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .section-header h1 { margin: 0; font-size: 1.5rem; color: #111827; }
        .section-header p { margin: 4px 0 0; color: #6B7280; font-size: 0.95rem; }

        .grid-layout { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; height: calc(100vh - 150px); }
        .card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #E5E7EB; overflow: hidden; display: flex; flex-direction: column; }
        
        .card-header { padding: 20px; border-bottom: 1px solid #F3F4F6; }
        .card-header h3 { margin: 0; font-size: 1.1rem; color: #111827; }

        .tree-panel { background: #F9FAFB; border: none; }
        .search-box { padding: 15px; position: relative; }
        .search-box input { width: 100%; padding: 10px 10px 10px 35px; border: 1px solid #E5E7EB; border-radius: 6px; box-sizing: border-box; background: white; }
        .search-icon { position: absolute; left: 25px; top: 50%; transform: translateY(-50%); opacity: 0.5; }
        .scroll-area { flex: 1; overflow-y: auto; padding: 10px; }
        
        .tree-content { display: flex; align-items: center; padding: 8px; cursor: pointer; border-radius: 6px; margin-bottom: 2px; }
        .tree-content:hover { background: #E5E7EB; }
        .tree-content.selected { background: #EEF2FF; color: #4F46E5; font-weight: 500; }
        .toggle-btn { width: 24px; display: flex; justify-content: center; color: #9CA3AF; margin-right: 5px; }
        .node-icon { margin-right: 8px; }

        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-size: 0.9rem; font-weight: 500; }
        .input { width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; box-sizing: border-box; }
        .btn-primary { background: #4F46E5; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; }
        .btn-text { background: transparent; border: 1px solid #E5E7EB; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
        .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        
        .spinner { margin: 20px auto; width: 30px; height: 30px; border: 3px solid #eee; border-top: 3px solid #4F46E5; border-radius: 50%; animation: spin 1s infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .empty-state { text-align: center; color: #9CA3AF; padding: 20px; font-style: italic; }
      </style>
    `
  }
}

customElements.define("categories-mfe", CategoriesMFE)