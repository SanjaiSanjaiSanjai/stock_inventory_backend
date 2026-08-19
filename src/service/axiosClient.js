import axios from 'axios'

const API_URL = 'http://localhost:8000'
const REFRESH_TOKEN_URL = '/refresh-token'
let refreshRequest = null

export const API_BASE_URL = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  // Keep this if the backend stores the refresh token in an HttpOnly cookie.
  withCredentials: true,
})

const getStoredAccessToken = () => localStorage.getItem('accessToken')
const setStoredAccessToken = (token) => {
  if (token) {
    localStorage.setItem('accessToken', token)
  } else {
    localStorage.removeItem('accessToken')
  }
}

const getAccessTokenFromResponse = (response) => {
  const payload = response?.data ?? {}
  return payload.access_token || payload.accessToken || payload.token || null
}

const redirectToLogin = () => {
  setStoredAccessToken(null)
  if (window.location.pathname !== '/login') window.location.assign('/login')
}

API_BASE_URL.interceptors.request.use((config) => {
  const accessToken = getStoredAccessToken()
  if (accessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
    }
  }
  return config
})

API_BASE_URL.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const requestUrl = originalRequest?.url
    const isAuthenticationRequest = requestUrl === '/login' || requestUrl === '/signup' || requestUrl === REFRESH_TOKEN_URL || requestUrl === `${API_URL}${REFRESH_TOKEN_URL}`

    // A 401 means the access token may have expired. Refresh it only once,
    // then replay the request that originally failed.
    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthenticationRequest) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      // Reuse one refresh request when several API calls fail at the same time.
      if (!refreshRequest) {
        refreshRequest = axios.post(`${API_URL}${REFRESH_TOKEN_URL}`, null, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        }).finally(() => {
          refreshRequest = null
        })
      }

      const refreshResponse = await refreshRequest
      const newAccessToken = getAccessTokenFromResponse(refreshResponse)

      if (!newAccessToken) throw new Error('Refresh response did not include an access token.')

      setStoredAccessToken(newAccessToken)
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newAccessToken}`,
      }
      return API_BASE_URL(originalRequest)
    } catch (refreshError) {
      redirectToLogin()
      return Promise.reject(refreshError)
    }
  },
)
