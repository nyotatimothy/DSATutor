import { create } from 'zustand'

export interface UserProgress {
  topicId: string
  status: 'not_started' | 'in_progress' | 'completed'
  startedAt?: Date
  completedAt?: Date
}

interface ProgressStore {
  userProgress: UserProgress[]
  currentProblemId: string | null
  isLoading: boolean
  lastFetched: Date | null
  
  // Actions
  setUserProgress: (progress: UserProgress[]) => void
  updateProgress: (topicId: string, status: UserProgress['status']) => void
  setCurrentProblemId: (problemId: string | null) => void
  setLoading: (loading: boolean) => void
  setLastFetched: (date: Date) => void
  
  // Getters
  getTopicStatus: (topicId: string) => UserProgress['status']
  getCurrentActiveTopic: () => string | null
  getCompletedCount: () => number
  getTotalCount: () => number
  getProgressPercent: () => number
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  userProgress: [
    // Mock some completed problems for demo - topic specific
    { topicId: 'arrays-hashing-problem-1', status: 'completed', startedAt: new Date(), completedAt: new Date() },
    { topicId: 'arrays-hashing-problem-3', status: 'completed', startedAt: new Date(), completedAt: new Date() },
    { topicId: 'two-pointers-problem-2', status: 'completed', startedAt: new Date(), completedAt: new Date() },
    { topicId: 'stack-problem-1', status: 'completed', startedAt: new Date(), completedAt: new Date() },
    { topicId: 'binary-search-problem-2', status: 'in_progress', startedAt: new Date() },
  ],
  currentProblemId: null,
  isLoading: false,
  lastFetched: null,
  
  setUserProgress: (progress) => set({ userProgress: progress }),
  
  updateProgress: (topicId, status) => set((state) => {
    const existingIndex = state.userProgress.findIndex(p => p.topicId === topicId)
    const now = new Date()
    
    if (existingIndex >= 0) {
      const updated = [...state.userProgress]
      updated[existingIndex] = {
        ...updated[existingIndex],
        status,
        startedAt: status === 'in_progress' && !updated[existingIndex].startedAt ? now : updated[existingIndex].startedAt,
        completedAt: status === 'completed' ? now : undefined
      }
      return { userProgress: updated }
    } else {
      return {
        userProgress: [...state.userProgress, {
          topicId,
          status,
          startedAt: status === 'in_progress' ? now : undefined,
          completedAt: status === 'completed' ? now : undefined
        }]
      }
    }
  }),
  
  setCurrentProblemId: (problemId) => set({ currentProblemId: problemId }),
  setLoading: (loading) => set({ isLoading: loading }),
  setLastFetched: (date) => set({ lastFetched: date }),
  
  getTopicStatus: (topicId) => {
    const progress = get().userProgress.find(p => p.topicId === topicId)
    return progress?.status || 'not_started'
  },
  
  getCurrentActiveTopic: () => {
    const activeProgress = get().userProgress.find(p => p.status === 'in_progress')
    return activeProgress?.topicId || null
  },
  
  getCompletedCount: () => {
    return get().userProgress.filter(p => p.status === 'completed').length
  },
  
  getTotalCount: () => {
    return get().userProgress.length
  },
  
  getProgressPercent: () => {
    const total = get().getTotalCount()
    const completed = get().getCompletedCount()
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }
}))
