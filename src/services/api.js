import axios from 'axios'

// Backend API base URL — adjust host/port if your API runs elsewhere
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true, // ensure HttpOnly cookies (if any) are sent
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach XSRF token from localStorage to every request (as required)
api.interceptors.request.use((config) => {
  const xsrf = localStorage.getItem('xsrfToken')
  if (xsrf) {
    // axios normalizes headers; set header expected by backend
    config.headers['x-xsrf-token'] = xsrf
  }
  return config
})

export default api
