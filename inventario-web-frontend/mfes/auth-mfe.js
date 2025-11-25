import { AuthService } from "../services/authService.js"

class AuthMFE extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: "open" })
  }

  connectedCallback() {
    this.render()
    this.attachEventListeners()
  }

  attachEventListeners() {
    const form = this.shadowRoot.querySelector("form")
    const loginBtn = this.shadowRoot.querySelector(".login-btn")
    const emailInput = this.shadowRoot.querySelector('input[type="email"]')
    const passwordInput = this.shadowRoot.querySelector('input[type="password"]')
    const errorDiv = this.shadowRoot.querySelector(".error-message")

    form.addEventListener("submit", async (e) => {
      e.preventDefault()
      
      const email = emailInput.value.trim()
      const password = passwordInput.value.trim()

      if (!email || !password) {
        this.showError("Por favor complete todos los campos")
        return
      }

      try {
        loginBtn.textContent = "Iniciando sesión..."
        loginBtn.disabled = true
        errorDiv.style.display = "none"

        // Llamada real al backend
        const response = await AuthService.login(email, password)
        
        // Guardar token y usuario
        if (response.data && response.data.token) {
          localStorage.setItem("token", response.data.token)
          localStorage.setItem("user", JSON.stringify(response.data.usuario))
          
          // Disparar evento de login exitoso
          window.dispatchEvent(new CustomEvent("login-success", { 
            detail: response.data 
          }))
        } else {
          throw new Error("Respuesta del servidor inválida")
        }
      } catch (error) {
        console.error("Login error:", error)
        const message = error.response?.data?.message || error.message || "Error al iniciar sesión"
        this.showError(message)
        
        loginBtn.textContent = "Iniciar Sesión"
        loginBtn.disabled = false
      }
    })
  }

  showError(message) {
    const errorDiv = this.shadowRoot.querySelector(".error-message")
    errorDiv.textContent = message
    errorDiv.style.display = "block"
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/styles/header.css">
<link rel="stylesheet" href="/styles/sidebar.css">


      <div class="login-container">
        <div class="login-card">
          <div class="brand">WARENCLOUD</div>
          <h2 class="title">Iniciar Sesión</h2>
          <p class="subtitle">Bienvenido de vuelta, ingrese sus credenciales.</p>
          
          <div class="error-message" style="display: none;"></div>
          
          <form>
            <div class="form-group">
              <label class="label">Email</label>
              <input 
                type="email" 
                class="input" 
                placeholder="tu@email.com"
                required
              >
            </div>
            
            <div class="form-group">
              <label class="label">Contraseña</label>
              <input 
                type="password" 
                class="input" 
                placeholder="Ingresa tu contraseña"
                required
              >
            </div>

            <div class="links">
              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox"> Recordarme
              </label>
              <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" class="login-btn">Iniciar Sesión</button>
          </form>
        </div>
      </div>

      <style>
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1rem;
        }

        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          border-left: 4px solid #dc2626;
        }

        .forgot-link {
          color: var(--primary-color);
          text-decoration: none;
          font-size: 0.875rem;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }
      </style>
    `
  }
}

customElements.define("auth-mfe", AuthMFE)