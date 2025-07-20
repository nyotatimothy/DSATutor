import { UserProgress } from '../stores/progressStore'
import { debounce } from '../utils/debounce'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ProgressApiData {
  progress: Array<{
    topicId: string
    status: 'not_started' | 'in_progress' | 'completed'
    startedAt?: string
    completedAt?: string
  }>
}

export interface CurrentPositionData {
  currentTopic?: {
    topic: {
      title: string
      id: string
    }
  }
  redirectTo?: string
}

// Debounced fetch functions
const debouncedFetchUserProgress = debounce(async (): Promise<ApiResponse<ProgressApiData>> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dsatutor_token') : null
    
    if (!token) {
      // Return success with empty data for demo/development purposes
      return {
        success: true,
        data: { progress: [] }
      }
    }

    const response = await fetch('/api/progress', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      data: data.data || { progress: [] }
    }
  } catch (error) {
    console.error('Failed to fetch user progress:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: { progress: [] } // Fallback empty state
    }
  }
}, 400)

const debouncedFetchCurrentPosition = debounce(async (): Promise<ApiResponse<CurrentPositionData>> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dsatutor_token') : null
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found'
      }
    }

    const response = await fetch('/api/progress/current-position', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      data: data.data || {}
    }
  } catch (error) {
    console.error('Failed to fetch current position:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: {} // Fallback empty state
    }
  }
}, 400)

export const progressService = {
  fetchUserProgress: debouncedFetchUserProgress,
  fetchCurrentPosition: debouncedFetchCurrentPosition,
  
  // Update progress with optimistic updates
  updateProgress: async (topicId: string, status: UserProgress['status']): Promise<ApiResponse<any>> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('dsatutor_token') : null
      
      if (!token) {
        // Return success for demo/development purposes when no token
        console.warn('No authentication token found, progress update skipped')
        return {
          success: true,
          data: { message: 'Progress updated locally (demo mode)' }
        }
      }

      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topicId,
          status
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}

// Helper function to transform API data to store format
export const transformProgressData = (apiData: ProgressApiData): UserProgress[] => {
  return apiData.progress.map(item => ({
    topicId: item.topicId,
    status: item.status,
    startedAt: item.startedAt ? new Date(item.startedAt) : undefined,
    completedAt: item.completedAt ? new Date(item.completedAt) : undefined
  }))
}
