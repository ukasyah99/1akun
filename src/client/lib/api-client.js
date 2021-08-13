import axios from "axios"
import createAuthRefreshInterceptor from "axios-auth-refresh"
import { getAccessToken, setAccessToken } from "./access-token"
import { getRefreshToken } from "./refresh-token"

const apiClient = axios.create({
  baseURL: "/api",
})

apiClient.interceptors.request.use(config => {
  const accessToken = getAccessToken()
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }
  return config
})

const refreshAuthLogic = async (failedRequest) => {
  let response
  try {
    const refreshToken = getRefreshToken()
    response = await apiClient.post("/auth/refresh", { refresh_token: refreshToken })
  } catch (error) {}

  const accessToken = response.data.access_token
  setAccessToken(accessToken)
  failedRequest.response.config.headers['Authorization'] = `Bearer ${accessToken}`

  return Promise.resolve()
}

createAuthRefreshInterceptor(apiClient, refreshAuthLogic, { statusCodes: [403] })

export default apiClient
