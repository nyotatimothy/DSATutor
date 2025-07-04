"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { apiClient, type User } from "../lib/api"

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize auth state from localStorage
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      apiClient.setToken(storedToken)
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password)

    if (response.success && response.data) {
      const { user: userData, token: userToken } = response.data
      setUser(userData)
      setToken(userToken)

      localStorage.setItem("token", userToken)
      localStorage.setItem("user", JSON.stringify(userData))
      apiClient.setToken(userToken)
    } else {
      throw new Error(response.message)
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    const response = await apiClient.signup(email, password, name)

    if (response.success && response.data) {
      const { user: userData, token: userToken } = response.data
      setUser(userData)
      setToken(userToken)

      localStorage.setItem("token", userToken)
      localStorage.setItem("user", JSON.stringify(userData))
      apiClient.setToken(userToken)
    } else {
      throw new Error(response.message)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    apiClient.setToken("")
  }

  const hasRole = (role: string) => {
    return user?.role === role
  }

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    signup,
    logout,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
