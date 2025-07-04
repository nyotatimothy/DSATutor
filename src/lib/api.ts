const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message: string
  error?: string
}

export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin" | "super_admin"
}

export interface Course {
  id: string
  title: string
  description: string
  createdBy: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  topics?: Topic[]
}

export interface Topic {
  id: string
  title: string
  description: string
  order: number
  courseId: string
}

export interface Progress {
  id: string
  userId: string
  topicId: string
  status: "not_started" | "in_progress" | "complete"
  completedAt: string
  topic: Topic
}

class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "API request failed")
    }

    return data
  }

  // Auth endpoints
  async signup(email: string, password: string, name: string) {
    return this.request<{ user: User; token: string }>("/auth/signup-new", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    })
  }

  async login(email: string, password: string) {
    return this.request<{ user: User; token: string }>("/auth/login-new", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async resetPassword(email: string) {
    return this.request("/auth/reset-new", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  // Course endpoints
  async getCourses() {
    return this.request<Course[]>("/courses")
  }

  async getCourse(id: string) {
    return this.request<Course>(`/courses/${id}`)
  }

  async createCourse(title: string, description: string) {
    return this.request<Course>("/courses", {
      method: "POST",
      body: JSON.stringify({ title, description }),
    })
  }

  // Progress endpoints
  async getProgress() {
    return this.request<Progress[]>("/progress")
  }

  async updateProgress(topicId: string, status: string) {
    return this.request("/progress", {
      method: "POST",
      body: JSON.stringify({ topicId, status }),
    })
  }

  // AI endpoints
  async analyzeCode(code: string, problemDescription: string, language: string) {
    return this.request("/ai/analyze", {
      method: "POST",
      body: JSON.stringify({ code, problemDescription, language }),
    })
  }

  async getHint(userCode: string, problemDescription: string, userStuck: boolean) {
    return this.request("/ai/hint", {
      method: "POST",
      body: JSON.stringify({ userCode, problemDescription, userStuck }),
    })
  }

  // Super admin endpoints
  async getAllUsers() {
    return this.request("/super-admin/users")
  }

  async getAnalytics() {
    return this.request("/super-admin/analytics")
  }
}

export const apiClient = new ApiClient()
