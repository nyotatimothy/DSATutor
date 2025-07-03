import { NextApiRequest, NextApiResponse } from 'next'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  message?: string
  statusCode?: number
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (in production, use Redis)
const rateLimitStore: RateLimitStore = {}

// Rate limit configurations for different endpoints
const rateLimitConfigs: { [key: string]: RateLimitConfig } = {
  // Authentication endpoints - stricter limits
  '/api/auth/login': { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
  '/api/auth/signup': { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 signups per hour
  '/api/auth/reset': { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 resets per hour
  
  // AI endpoints - moderate limits
  '/api/ai/analyze': { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
  '/api/ai/assess': { windowMs: 60 * 1000, maxRequests: 10 },
  '/api/ai/hint': { windowMs: 60 * 1000, maxRequests: 20 },
  '/api/ai/generate-problem': { windowMs: 5 * 60 * 1000, maxRequests: 5 }, // 5 problems per 5 minutes
  
  // Payment endpoints - strict limits
  '/api/payments/initiate': { windowMs: 60 * 1000, maxRequests: 5 }, // 5 payments per minute
  '/api/payments/verify': { windowMs: 60 * 1000, maxRequests: 10 },
  
  // Default limits for other endpoints
  default: { windowMs: 60 * 1000, maxRequests: 100 } // 100 requests per minute
}

export function rateLimit(req: NextApiRequest, res: NextApiResponse) {
  const path = req.url || ''
  const config = rateLimitConfigs[path] || rateLimitConfigs.default
  
  // Get client identifier (IP + user agent for better accuracy)
  const clientId = getClientId(req)
  const now = Date.now()
  
  // Get or create rate limit entry for this client
  if (!rateLimitStore[clientId]) {
    rateLimitStore[clientId] = {
      count: 0,
      resetTime: now + config.windowMs
    }
  }
  
  const entry = rateLimitStore[clientId]
  
  // Reset if window has passed
  if (now > entry.resetTime) {
    entry.count = 0
    entry.resetTime = now + config.windowMs
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    
    res.setHeader('Retry-After', retryAfter)
    res.setHeader('X-RateLimit-Limit', config.maxRequests)
    res.setHeader('X-RateLimit-Remaining', 0)
    res.setHeader('X-RateLimit-Reset', entry.resetTime)
    
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: config.message || `Too many requests. Try again in ${retryAfter} seconds.`,
      retryAfter
    })
  }
  
  // Increment counter
  entry.count++
  
  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', config.maxRequests)
  res.setHeader('X-RateLimit-Remaining', config.maxRequests - entry.count)
  res.setHeader('X-RateLimit-Reset', entry.resetTime)
  
  return null // Continue to next middleware
}

function getClientId(req: NextApiRequest): string {
  // Get IP address
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress || 
             'unknown'
  
  // Get user agent
  const userAgent = req.headers['user-agent'] || 'unknown'
  
  // Create a hash-like identifier
  return `${Array.isArray(ip) ? ip[0] : ip}-${userAgent.substring(0, 50)}`
}

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key]
    }
  })
}, 5 * 60 * 1000)

// Role-based rate limiting
export function roleBasedRateLimit(req: NextApiRequest, res: NextApiResponse) {
  const user = (req as any).user
  const path = req.url || ''
  
  // Different limits based on user role
  let multiplier = 1
  
  if (user) {
    switch (user.role) {
      case 'super_admin':
        multiplier = 5 // 5x higher limits for super admins
        break
      case 'admin':
        multiplier = 3 // 3x higher limits for admins
        break
      case 'creator':
        multiplier = 2 // 2x higher limits for creators
        break
      default:
        multiplier = 1 // Normal limits for students
    }
  }
  
  // Apply multiplier to existing config
  const baseConfig = rateLimitConfigs[path] || rateLimitConfigs.default
  const adjustedConfig = {
    ...baseConfig,
    maxRequests: Math.floor(baseConfig.maxRequests * multiplier)
  }
  
  // Use the same logic as regular rate limiting but with adjusted config
  const clientId = getClientId(req)
  const now = Date.now()
  
  if (!rateLimitStore[clientId]) {
    rateLimitStore[clientId] = {
      count: 0,
      resetTime: now + adjustedConfig.windowMs
    }
  }
  
  const entry = rateLimitStore[clientId]
  
  if (now > entry.resetTime) {
    entry.count = 0
    entry.resetTime = now + adjustedConfig.windowMs
  }
  
  if (entry.count >= adjustedConfig.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    
    res.setHeader('Retry-After', retryAfter)
    res.setHeader('X-RateLimit-Limit', adjustedConfig.maxRequests)
    res.setHeader('X-RateLimit-Remaining', 0)
    res.setHeader('X-RateLimit-Reset', entry.resetTime)
    
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: `Rate limit exceeded for your role. Try again in ${retryAfter} seconds.`,
      retryAfter
    })
  }
  
  entry.count++
  
  res.setHeader('X-RateLimit-Limit', adjustedConfig.maxRequests)
  res.setHeader('X-RateLimit-Remaining', adjustedConfig.maxRequests - entry.count)
  res.setHeader('X-RateLimit-Reset', entry.resetTime)
  
  return null
} 