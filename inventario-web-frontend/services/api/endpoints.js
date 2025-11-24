const API_BASE_URL = "http://localhost:3000/api"

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    VERIFY: `${API_BASE_URL}/auth/verify`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },
  PRODUCTS: {
    BASE: `${API_BASE_URL}/products`,
    SEARCH: `${API_BASE_URL}/products/search`,
    BY_CATEGORY: `${API_BASE_URL}/products/category`,
  },
  CATEGORIES: {
    BASE: `${API_BASE_URL}/categories`,
  },
  SUPPLIERS: {
    BASE: `${API_BASE_URL}/suppliers`,
  },
  INVENTORY: {
    BASE: `${API_BASE_URL}/inventory`,
    TRANSFER: `${API_BASE_URL}/inventory/transfer`,
    ADJUST: `${API_BASE_URL}/inventory/adjust`,
  },
  ORDERS: {
    BASE: `${API_BASE_URL}/orders`,
  },
  MOVEMENTS: {
    BASE: `${API_BASE_URL}/movements`,
    REPORTS: `${API_BASE_URL}/movements/reports`,
  },
}
