import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

// Validation schemas for different endpoints
const validationSchemas = {
  // Auth validation
  auth: {
    signup: z.object({
      email: z.string().email('Invalid email format').max(255, 'Email too long'),
      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password too long')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
          'Password must contain uppercase, lowercase, number, and special character'),
      fullName: z.string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name too long')
        .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces')
    }),
    
    login: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(1, 'Password is required')
    }),
    
    reset: z.object({
      email: z.string().email('Invalid email format')
    })
  },
  
  // Course validation
  course: {
    create: z.object({
      title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title too long')
        .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, 'Title contains invalid characters'),
      description: z.string()
        .max(1000, 'Description too long')
        .optional()
    }),
    
    update: z.object({
      title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title too long')
        .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, 'Title contains invalid characters')
        .optional(),
      description: z.string()
        .max(1000, 'Description too long')
        .optional()
    })
  },
  
  // Topic validation
  topic: {
    create: z.object({
      title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title too long')
        .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, 'Title contains invalid characters'),
      content: z.string()
        .min(10, 'Content must be at least 10 characters')
        .max(50000, 'Content too long'), // 50KB limit
      position: z.number().int().min(1, 'Position must be at least 1'),
      courseId: z.string().uuid('Invalid course ID')
    }),
    
    update: z.object({
      title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title too long')
        .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, 'Title contains invalid characters')
        .optional(),
      content: z.string()
        .min(10, 'Content must be at least 10 characters')
        .max(50000, 'Content too long')
        .optional(),
      position: z.number().int().min(1, 'Position must be at least 1').optional()
    })
  },
  
  // Progress validation
  progress: {
    create: z.object({
      topicId: z.string().uuid('Invalid topic ID'),
      status: z.enum(['not_started', 'in_progress', 'complete'], {
        errorMap: () => ({ message: 'Status must be not_started, in_progress, or complete' })
      })
    }),
    
    update: z.object({
      status: z.enum(['not_started', 'in_progress', 'complete'], {
        errorMap: () => ({ message: 'Status must be not_started, in_progress, or complete' })
      })
    })
  },
  
  // Attempt validation
  attempt: {
    create: z.object({
      topicId: z.string().uuid('Invalid topic ID').optional(),
      code: z.string()
        .min(1, 'Code is required')
        .max(100000, 'Code too long'), // 100KB limit
      timeTaken: z.number().int().min(0, 'Time taken must be non-negative').max(3600, 'Time taken too high')
    })
  },
  
  // Payment validation
  payment: {
    initiate: z.object({
      amount: z.number().int().min(100, 'Amount must be at least 100').max(1000000, 'Amount too high'),
      currency: z.enum(['NGN', 'USD', 'EUR'], {
        errorMap: () => ({ message: 'Currency must be NGN, USD, or EUR' })
      }).default('NGN'),
      description: z.string().max(500, 'Description too long').optional()
    }),
    
    verify: z.object({
      reference: z.string()
        .min(10, 'Reference must be at least 10 characters')
        .max(100, 'Reference too long')
        .regex(/^[a-zA-Z0-9\-_]+$/, 'Reference contains invalid characters')
    })
  },
  
  // AI validation
  ai: {
    analyze: z.object({
      code: z.string()
        .min(1, 'Code is required')
        .max(50000, 'Code too long'),
      language: z.enum(['javascript', 'python', 'java', 'cpp', 'csharp'], {
        errorMap: () => ({ message: 'Language must be javascript, python, java, cpp, or csharp' })
      }).default('javascript')
    }),
    
    assess: z.object({
      code: z.string()
        .min(1, 'Code is required')
        .max(50000, 'Code too long'),
      problem: z.string()
        .min(10, 'Problem description is required')
        .max(2000, 'Problem description too long')
    }),
    
    hint: z.object({
      topicId: z.string().uuid('Invalid topic ID'),
      attemptId: z.string().uuid('Invalid attempt ID').optional()
    })
  },
  
  // Super admin validation
  superAdmin: {
    updateUserRole: z.object({
      role: z.enum(['student', 'creator', 'admin', 'super_admin'], {
        errorMap: () => ({ message: 'Role must be student, creator, admin, or super_admin' })
      })
    }),
    
    bulkUpdate: z.object({
      userIds: z.array(z.string().uuid('Invalid user ID')).min(1, 'At least one user ID required').max(100, 'Too many users'),
      role: z.enum(['student', 'creator', 'admin'], {
        errorMap: () => ({ message: 'Role must be student, creator, or admin' })
      })
    }),
    
    deleteCourse: z.object({
      force: z.boolean().optional(),
      cascade: z.boolean().optional()
    })
  }
}

// Input sanitization function
function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove potential XSS vectors
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .trim()
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

// Validation middleware factory
export function validate(schemaKey: string, schemaName: string) {
  return (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get the appropriate schema
      const schemaGroup = validationSchemas[schemaKey as keyof typeof validationSchemas]
      const schema = schemaGroup ? (schemaGroup as any)[schemaName] : undefined
      
      if (!schema) {
        return res.status(500).json({
          success: false,
          error: 'Validation schema not found',
          message: 'Internal server error'
        })
      }
      
      // Sanitize input
      const sanitizedData = sanitizeInput(req.body)
      
      // Validate input
      const validatedData = schema.parse(sanitizedData)
      
      // Replace request body with validated data
      req.body = validatedData
      
      return null // Continue to next middleware
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'Invalid input data',
          details: errors
        })
      }
      
      return res.status(500).json({
        success: false,
        error: 'Validation error',
        message: 'Internal server error'
      })
    }
  }
}

// Security headers middleware
export function securityHeaders(req: NextApiRequest, res: NextApiResponse) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://api.openai.com https://api.paystack.co; " +
    "frame-ancestors 'none';"
  )
  
  return null
}

// Request size limiting
export function requestSizeLimit(maxSize: number = 1024 * 1024) { // 1MB default
  return (req: NextApiRequest, res: NextApiResponse) => {
    const contentLength = parseInt(req.headers['content-length'] || '0')
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        error: 'Request too large',
        message: `Request size exceeds ${Math.round(maxSize / 1024)}KB limit`
      })
    }
    
    return null
  }
}

// SQL injection prevention (basic check)
export function sqlInjectionCheck(req: NextApiRequest, res: NextApiResponse) {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\b\s+['"]\w+['"]\s*=\s*['"]\w+['"])/i,
    /(--|\/\*|\*\/|;)/,
    /(\b(WAITFOR|DELAY)\b)/i
  ]
  
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value))
    }
    if (Array.isArray(value)) {
      return value.some(checkValue)
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue)
    }
    return false
  }
  
  const hasSqlInjection = checkValue(req.body) || checkValue(req.query)
  
  if (hasSqlInjection) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input',
      message: 'Request contains potentially malicious content'
    })
  }
  
  return null
} 