import { useEffect, useCallback } from 'react'
import { useProgressStore } from '../stores/progressStore'
import { progressService, transformProgressData } from '../services/progressService'

export const useProgress = () => {
  const {
    userProgress,
    currentProblemId,
    isLoading,
    lastFetched,
    setUserProgress,
    updateProgress,
    setCurrentProblemId,
    setLoading,
    setLastFetched,
    getTopicStatus,
    getCurrentActiveTopic,
    getCompletedCount,
    getTotalCount,
    getProgressPercent
  } = useProgressStore()

  // Fetch user progress with caching (5 minutes cache)
  const fetchUserProgress = useCallback(async (forceRefresh = false) => {
    const now = new Date()
    const cacheExpiry = 5 * 60 * 1000 // 5 minutes
    
    if (!forceRefresh && lastFetched && (now.getTime() - lastFetched.getTime()) < cacheExpiry) {
      return // Use cached data
    }

    setLoading(true)
    
    try {
      const result = await progressService.fetchUserProgress()
      
      if (result.success && result.data) {
        const transformedData = transformProgressData(result.data)
        // If no API data and we have existing demo data, preserve it
        if (transformedData.length === 0 && userProgress.length > 0) {
          // Keep existing demo data
          setLastFetched(now)
        } else {
          setUserProgress(transformedData)
          setLastFetched(now)
        }
      } else if (result.error && result.error !== 'No authentication token found') {
        console.error('Failed to fetch user progress:', result.error)
        // Keep existing data on error, don't clear it
      }
    } catch (error) {
      console.error('Error in fetchUserProgress:', error)
    } finally {
      setLoading(false)
    }
  }, [lastFetched, setLoading, setUserProgress, setLastFetched])

  // Update progress with optimistic updates
  const handleUpdateProgress = useCallback(async (topicId: string, status: 'not_started' | 'in_progress' | 'completed') => {
    // Optimistic update
    updateProgress(topicId, status)
    
    try {
      const result = await progressService.updateProgress(topicId, status)
      
      if (!result.success) {
        console.error('Failed to update progress on server:', result.error)
        // Could implement rollback here if needed
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      // Could implement rollback here if needed
    }
  }, [updateProgress])

  // Auto-fetch on mount
  useEffect(() => {
    fetchUserProgress()
  }, []) // Only on mount, fetchUserProgress handles caching

  return {
    // State
    userProgress,
    currentProblemId,
    isLoading,
    
    // Actions
    fetchUserProgress,
    updateProgress: handleUpdateProgress,
    setCurrentProblemId,
    
    // Computed values
    getTopicStatus,
    getCurrentActiveTopic,
    getCompletedCount,
    getTotalCount,
    getProgressPercent,
    
    // Helper computed values
    completedCount: getCompletedCount(),
    totalCount: getTotalCount(),
    progressPercent: getProgressPercent(),
    currentActiveTopic: getCurrentActiveTopic()
  }
}
