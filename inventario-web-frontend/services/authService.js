import apiClient from "./api/apiClient.js"
import { ENDPOINTS } from "./api/endpoints.js"

export const AuthService = {
  async login(username, password) {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { username, password })
      const resultado = response.data.data.data
      const { token, usuario } = resultado
      if (token) {
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(usuario))
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  async register(userData) {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async verifyToken() {
    try {
      const response = await apiClient.get(ENDPOINTS.AUTH.VERIFY)
      return response.data
    } catch (error) {
      throw error
    }
  },

  logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"))
  },

  isAuthenticated() {
    return !!localStorage.getItem("token")
  },
}
