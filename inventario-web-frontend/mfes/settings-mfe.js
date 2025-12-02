import { UserService } from "../services/userService.js"
import { AuthService } from "../services/authService.js"

class SettingsMFE extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: "open" })
    this.users = [];
    this.selectedUser = null; 
    this.loading = true;
  }

  async connectedCallback() {
    this.render(); // 1. Pintar estructura base
    await this.loadUsers(); // 2. Cargar datos
    this.attachEventListeners(); // 3. Eventos iniciales
  }

  async loadUsers() {
    try {
      this.loading = true;
      this.renderUserList(); // Muestra spinner en la lista

      this.users = await UserService.getAll();
      console.log("Usuarios cargados:", this.users); // Debug
      
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      this.users = [];
    } finally {
      this.loading = false;
      this.renderUserList(); // Muestra la lista real
    }
  }

  // Renderiza solo la lista para ser eficientes
  renderUserList() {
    const listContainer = this.shadowRoot.querySelector('#users-list');
    if (!listContainer) return;

    if (this.loading) {
      listContainer.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';
      return;
    }

    if (this.users.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No hay usuarios registrados.</div>';
        return;
    }

    listContainer.innerHTML = this.users.map(u => {
      const isSelected = this.selectedUser?.id === u.id ? 'selected' : '';
      const initial = u.username ? u.username.charAt(0).toUpperCase() : '?';
      // Simulamos estado activo ya que el backend a veces no lo trae
      const isActive = u.activo !== false; 

      return `
        <div class="user-row ${isSelected}" data-id="${u.id}">
          <div class="user-info">
            <div class="avatar">${initial}</div>
            <div>
              <div class="user-name">${u.username}</div>
              <div class="user-email">${u.email || 'usuario@sistema.com'}</div>
            </div>
          </div>
          <div class="user-role">${u.rol || 'User'}</div>
          <div><span class="badge ${isActive ? 'badge-active' : 'badge-inactive'}">${isActive ? 'Active' : 'Inactive'}</span></div>
          <div class="actions">
            <button class="btn-icon edit-btn" data-id="${u.id}" title="Editar">✏️</button>
            <button class="btn-icon delete-btn" data-id="${u.id}" title="Eliminar">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Renderiza el formulario derecho (Cambia título y botón si es editar)
  renderForm() {
    const isEdit = !!this.selectedUser;
    const title = isEdit ? 'Edit User' : 'Add User'; // Texto según botón azul de tu imagen
    const btnText = isEdit ? 'Save Changes' : 'Create User';
    
    const name = this.selectedUser?.username || '';
    const role = this.selectedUser?.rol || 'admin';

    const formContainer = this.shadowRoot.querySelector('#form-container');
    if (formContainer) {
        formContainer.innerHTML = `
            <div class="card-header">
                <h3>${title}</h3>
            </div>
            <form id="user-form" style="padding: 20px;">
                <div class="form-group">
                    <label>Username / Full Name</label>
                    <input type="text" class="input" name="username" value="${name}" required placeholder="John Doe">
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select class="input" name="rol">
                        <option value="admin" ${role === 'admin' ? 'selected' : ''}>Administrator</option>
                        <option value="manager" ${role === 'manager' ? 'selected' : ''}>Warehouse Manager</option>
                        <option value="user" ${role === 'user' ? 'selected' : ''}>Inventory Clerk</option>
                    </select>
                </div>
                
                ${!isEdit ? `
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" class="input" name="password" required placeholder="******">
                </div>` : ''}
                
                <div class="form-actions">
                    <button type="button" class="btn-text cancel-btn">Cancel</button>
                    <button type="submit" class="btn-primary">${btnText}</button>
                </div>
            </form>
        `;
        this.attachFormEvents();
    }
  }

  attachEventListeners() {
    // Botón principal azul "+ Add User"
    const addBtn = this.shadowRoot.querySelector('#add-user-main-btn');
    if(addBtn) {
        addBtn.addEventListener('click', () => {
            this.selectedUser = null;
            this.renderForm();
            this.renderUserList(); // Limpia selección visual
        });
    }

    // Delegación en la lista (Click en fila o botones)
    const list = this.shadowRoot.querySelector('#users-list');
    if(list) {
        list.addEventListener('click', (e) => {
            // Si click en botón eliminar
            if (e.target.closest('.delete-btn')) {
                const id = parseInt(e.target.closest('.delete-btn').dataset.id);
                if(confirm('¿Eliminar usuario?')) this.handleDelete(id);
                return;
            }
            
            // Si click en la fila o botón editar -> Seleccionar
            const row = e.target.closest('.user-row');
            if (row) {
                const id = parseInt(row.dataset.id);
                this.selectedUser = this.users.find(u => u.id === id);
                this.renderUserList(); // Actualiza clase 'selected'
                this.renderForm();
            }
        });
    }
    
    this.attachFormEvents();
  }

  attachFormEvents() {
      const form = this.shadowRoot.querySelector('#user-form');
      const cancelBtn = this.shadowRoot.querySelector('.cancel-btn');

      if(cancelBtn) {
          cancelBtn.addEventListener('click', () => {
              this.selectedUser = null;
              this.renderForm();
              this.renderUserList();
          });
      }

      if(form) {
          form.addEventListener('submit', (e) => this.handleSubmit(e));
      }
  }

  async handleSubmit(e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      
      try {
          if(this.selectedUser) {
              await UserService.update(this.selectedUser.id, data);
              alert("Usuario actualizado");
          } else {
              await AuthService.register(data);
              alert("Usuario creado");
          }
          this.selectedUser = null;
          this.renderForm();
          await this.loadUsers();
      } catch (error) {
          alert("Error: " + (error.message || "Error al guardar"));
      }
  }

  async handleDelete(id) {
      try {
          await UserService.delete(id);
          await this.loadUsers();
      } catch (error) {
          alert("Error eliminando: " + error.message);
      }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="styles/global.css">
      
      <div class="page-container">
        <div class="header-section">
            <div style="display:flex; align-items:center; gap: 10px;">
                <span style="font-size: 2rem; color: #4F46E5;">⚙️</span>
                <div>
                    <h1>User Configuration</h1>
                    <p>Manage users, roles, and permissions.</p>
                </div>
            </div>
        </div>

        <div class="content-grid">
            
            <div class="card">
                <div class="card-header">
                    <h3>Users</h3>
                    <button class="btn-primary small" id="add-user-main-btn">+ Add User</button>
                </div>
                
                <div class="table-header">
                    <span>USER</span>
                    <span>ROLE</span>
                    <span>STATUS</span>
                    <span></span>
                </div>
                
                <div id="users-list" class="scroll-area">
                    </div>
            </div>

            <div class="card" id="form-container">
                <div class="card-header">
                    <h3>Add New User</h3>
                </div>
                <form id="user-form" style="padding: 20px;">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" class="input" name="username" required>
                    </div>
                    <div class="form-group">
                        <label>Role</label>
                        <select class="input" name="rol">
                            <option value="admin">Administrator</option>
                            <option value="manager">Warehouse Manager</option>
                            <option value="user">Inventory Clerk</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" class="input" name="password" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-text cancel-btn">Cancel</button>
                        <button type="submit" class="btn-primary">Create User</button>
                    </div>
                </form>
            </div>

        </div>

        <div class="card permissions-section">
            <div class="card-header no-border">
                <h3>Manage Permissions: Administrator</h3>
            </div>
            <div class="permissions-grid">
                <div class="perm-col">
                    <div class="perm-title">📦 Products</div>
                    <div class="check-row"><span class="check">✔</span> View Products</div>
                    <div class="check-row"><span class="check">✔</span> Create/Edit Products</div>
                    <div class="check-row"><span class="check">✔</span> Delete Products</div>
                </div>
                <div class="perm-col">
                    <div class="perm-title">🏢 Warehouses</div>
                    <div class="check-row"><span class="check">✔</span> View Warehouses</div>
                    <div class="check-row"><span class="check">✔</span> Create/Edit Warehouses</div>
                    <div class="check-row"><span class="check">✔</span> Delete Warehouses</div>
                </div>
                <div class="perm-col">
                    <div class="perm-title">🚚 Suppliers</div>
                    <div class="check-row"><span class="check">✔</span> View Suppliers</div>
                    <div class="check-row"><span class="check">✔</span> Create/Edit Suppliers</div>
                </div>
                <div class="perm-col">
                    <div class="perm-title">⚙️ System</div>
                    <div class="check-row"><span class="check">✔</span> Manage Users</div>
                    <div class="check-row"><span class="check">✔</span> View System Logs</div>
                </div>
            </div>
        </div>

      </div>

      <style>
        :host { display: block; padding: 20px; box-sizing: border-box; font-family: 'Inter', sans-serif; }
        
        .header-section { margin-bottom: 24px; }
        .header-section h1 { margin: 0; font-size: 1.5rem; color: #111827; }
        .header-section p { margin: 4px 0 0; color: #6B7280; font-size: 0.95rem; }

        .content-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; margin-bottom: 24px; }
        
        .card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #E5E7EB; overflow: hidden; display: flex; flex-direction: column; }
        
        .card-header { padding: 20px; border-bottom: 1px solid #F3F4F6; display: flex; justify-content: space-between; align-items: center; }
        .card-header h3 { margin: 0; font-size: 1.1rem; color: #111827; }
        .card-header.no-border { border-bottom: none; padding-bottom: 0; }

        /* Lista Usuarios */
        .table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 0.5fr; padding: 10px 20px; background: #F9FAFB; font-size: 0.75rem; font-weight: 600; color: #6B7280; letter-spacing: 0.05em; }
        
        .scroll-area { max-height: 400px; overflow-y: auto; }
        
        .user-row { display: grid; grid-template-columns: 2fr 1fr 1fr 0.5fr; padding: 16px 20px; align-items: center; border-bottom: 1px solid #F3F4F6; transition: background 0.2s; cursor: pointer; }
        .user-row:hover { background: #F9FAFB; }
        .user-row.selected { background: #EEF2FF; border-left: 3px solid #4F46E5; }

        .user-info { display: flex; gap: 12px; align-items: center; }
        .avatar { width: 36px; height: 36px; background: #1F2937; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .user-name { font-weight: 500; color: #1F2937; font-size: 0.95rem; }
        .user-email { font-size: 0.8rem; color: #6B7280; }
        .user-role { color: #4B5563; font-size: 0.9rem; }

        /* Badges */
        .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
        .badge-active { background: #D1FAE5; color: #065F46; }
        .badge-inactive { background: #FEE2E2; color: #991B1B; }

        /* Formulario */
        #form-container { padding: 0; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 6px; font-size: 0.9rem; font-weight: 500; color: #374151; }
        .input { width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 0.95rem; box-sizing: border-box; }
        .input:focus { border-color: #4F46E5; outline: none; ring: 2px solid #E0E7FF; }

        .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
        
        .btn-primary { background: #4F46E5; color: white; padding: 8px 16px; border-radius: 6px; border: none; font-weight: 500; cursor: pointer; }
        .btn-primary:hover { background: #4338CA; }
        .btn-primary.small { padding: 6px 12px; font-size: 0.85rem; }
        
        .btn-text { background: transparent; border: none; color: #6B7280; cursor: pointer; font-weight: 500; }
        .btn-text:hover { color: #1F2937; }
        
        .btn-icon { background: transparent; border: none; cursor: pointer; opacity: 0.6; font-size: 1.1rem; }
        .btn-icon:hover { opacity: 1; transform: scale(1.1); }

        /* Permisos */
        .permissions-section { min-height: 200px; padding: 20px; }
        .permissions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 10px; }
        .perm-title { font-weight: 600; color: #111827; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .check-row { margin-bottom: 8px; font-size: 0.9rem; color: #4B5563; display: flex; align-items: center; gap: 8px; }
        .check { color: #4F46E5; font-weight: bold; }

        .spinner-container { padding: 40px; display: flex; justify-content: center; }
        .spinner { width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #4F46E5; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `
  }
}

customElements.define("settings-mfe", SettingsMFE)