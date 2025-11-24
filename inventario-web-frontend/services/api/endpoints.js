export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    VERIFY: "/auth/verify",
    LOGOUT: "/auth/logout",
  },
  PRODUCTS: {
    BASE: "/productos",
    SEARCH: "/productos/buscar",
    BY_CATEGORY: "/productos/categoria",
    BY_CODE: "/productos/codigo",
    LOW_STOCK: "/productos/bajo-stock",
  },
  CATEGORIES: {
    BASE: "/categorias",
  },
  SUPPLIERS: {
    BASE: "/proveedores",
  },
  INVENTORY: {
    BASE: "/inventario",
    TRANSFER: "/inventario/transferir",
    ADJUST: "/inventario/ajustar",
  },
  ORDERS: {
    BASE: "/ordenes-compra",
  },
  MOVEMENTS: {
    BASE: "/movimientos-inventario",
    REPORTS: "/movimientos-inventario/reporte",
  },
  USERS: {
    BASE: "/usuarios",
  },
  LOCATIONS: {
    BASE: "/ubicaciones",
  },
  WAREHOUSES: {
    BASE: "/almacenes",
  },
};
