// lib/api-client.ts
import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Tạo axios instance với cấu hình Sanctum
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,   // Gửi cookie session
  withXSRFToken: true,     // Tự động đính kèm XSRF-TOKEN header
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Lấy CSRF cookie trước mỗi mutation (POST/PUT/DELETE)
export async function getCsrfCookie(): Promise<void> {
  await apiClient.get('/sanctum/csrf-cookie')
}

// Interceptor xử lý lỗi toàn cục
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Redirect về trang login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Helper functions cho từng loại request
export const api = {
  // GET - không cần CSRF
  get: <T>(url: string, params?: Record<string, unknown>) =>
    apiClient.get<T>(url, { params }),

  // POST - cần CSRF cookie trước
  post: async <T>(url: string, data?: unknown) => {
    await getCsrfCookie()
    return apiClient.post<T>(url, data)
  },

  // PUT - cần CSRF cookie trước
  put: async <T>(url: string, data?: unknown) => {
    await getCsrfCookie()
    return apiClient.put<T>(url, data)
  },

  // DELETE - cần CSRF cookie trước
  delete: async <T>(url: string) => {
    await getCsrfCookie()
    return apiClient.delete<T>(url)
  },
}

export default api


// Support Ticket API functions
export const supportTicketApi = {
  createTicket: async (data: {
    title: string
    description: string
    category: 'complaint' | 'support' | 'report' | 'feedback'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    attachment_url?: string
  }) => api.post('/support-tickets', data),

  getTickets: async (params?: {
    category?: string
    status?: string
    priority?: string
    search?: string
    per_page?: number
    page?: number
  }) => api.get('/support-tickets', params),

  getTicketDetail: async (ticketId: number) =>
    api.get(`/support-tickets/${ticketId}`),

  updateTicketStatus: async (ticketId: number, status: string) =>
    api.put(`/support-tickets/${ticketId}`, { status }),

  deleteTicket: async (ticketId: number) =>
    api.delete(`/support-tickets/${ticketId}`),

  addReply: async (ticketId: number, data: {
    message: string
    attachment_url?: string
  }) => api.post(`/support-tickets/${ticketId}/replies`, data),

  deleteReply: async (ticketId: number, replyId: number) =>
    api.delete(`/support-tickets/${ticketId}/replies/${replyId}`),
}
