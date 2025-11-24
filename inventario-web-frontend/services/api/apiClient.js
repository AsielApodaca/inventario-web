// Create Axios Instance
// Assuming axios is loaded globally via CDN in index.html, but we try to access it safely.
// If using modules, we might import it. Here we use window.axios.
const axiosInstance = window.axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request Interceptor: Add Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response Interceptor: Handle Errors & Auth
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Logic to refresh token could go here.
      // For now, logout.
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.reload()
      return Promise.reject(error)
    }

    // Handle other errors
    if (error.response) {
      console.error("[API Error]", error.response.data)
    } else if (error.request) {
      console.error("[Network Error] No response received")
    } else {
      console.error("[Error]", error.message)
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
