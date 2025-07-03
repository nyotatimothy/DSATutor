import { NextApiRequest, NextApiResponse } from 'next'

// Error types
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  PAYMENT = 'PAYMENT',
  AI_SERVICE = 'AI_SERVICE',
  DATABASE = 'DATABASE',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  INTERNAL = 'INTERNAL'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Custom error class
export class AppError extends Error {
  public type: ErrorType
  public severity: ErrorSeverity
  public statusCode: number
  public isOperational: boolean
  public context?: any

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    statusCode: number = 500,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: any
  ) {
    super(message)
    this.type = type
    this.severity = severity
    this.statusCode = statusCode
    this.isOperational = true
    this.context = context

    Error.captureStackTrace(this, this.constructor)
  }
}

// Error logger
class ErrorLogger {
  private errors: Array<{
    timestamp: Date
    error: AppError
    request?: {
      method: string
      url: string
      ip: string
      userAgent: string
      userId?: string
    }
  }> = []

  log(error: AppError, req?: NextApiRequest) {
    const errorEntry = {
      timestamp: new Date(),
      error,
      request: req ? {
        method: req.method || 'UNKNOWN',
        url: req.url || 'UNKNOWN',
        ip: this.getClientIP(req),
        userAgent: req.headers['user-agent'] || 'UNKNOWN',
        userId: (req as any).user?.id
      } : undefined
    }

    this.errors.push(errorEntry)

    // Log to console with different levels based on severity
    const logMessage = this.formatLogMessage(errorEntry)
    
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('🚨 CRITICAL ERROR:', logMessage)
        break
      case ErrorSeverity.HIGH:
        console.error('❌ HIGH ERROR:', logMessage)
        break
      case ErrorSeverity.MEDIUM:
        console.warn('⚠️ MEDIUM ERROR:', logMessage)
        break
      case ErrorSeverity.LOW:
        console.log('ℹ️ LOW ERROR:', logMessage)
        break
    }

    // In production, send to external logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogger(errorEntry)
    }
  }

  private formatLogMessage(entry: any): string {
    const { timestamp, error, request } = entry
    return `
Time: ${timestamp.toISOString()}
Type: ${error.type}
Severity: ${error.severity}
Message: ${error.message}
Status: ${error.statusCode}
${request ? `
Request: ${request.method} ${request.url}
IP: ${request.ip}
User: ${request.userId || 'Anonymous'}
User-Agent: ${request.userAgent}
` : ''}
Stack: ${error.stack}
Context: ${JSON.stringify(error.context, null, 2)}
`
  }

  private getClientIP(req: NextApiRequest): string {
    return req.headers['x-forwarded-for'] as string ||
           req.headers['x-real-ip'] as string ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           'unknown'
  }

  private sendToExternalLogger(entry: any) {
    // In production, send to services like Sentry, LogRocket, etc.
    // For now, just store in memory
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-500) // Keep last 500 errors
    }
  }

  getRecentErrors(limit: number = 50) {
    return this.errors.slice(-limit)
  }

  getErrorsByType(type: ErrorType) {
    return this.errors.filter(entry => entry.error.type === type)
  }

  getErrorsBySeverity(severity: ErrorSeverity) {
    return this.errors.filter(entry => entry.error.severity === severity)
  }
}

// Global error logger instance
export const errorLogger = new ErrorLogger()

// Error handler middleware
export function errorHandler(
  error: Error | AppError,
  req: NextApiRequest,
  res: NextApiResponse
) {
  let appError: AppError

  // Convert to AppError if it's not already
  if (error instanceof AppError) {
    appError = error
  } else {
    appError = new AppError(
      error.message || 'An unexpected error occurred',
      ErrorType.INTERNAL,
      500,
      ErrorSeverity.HIGH,
      { originalError: error }
    )
  }

  // Log the error
  errorLogger.log(appError, req)

  // Don't expose internal errors to client in production
  const isProduction = process.env.NODE_ENV === 'production'
  const isOperational = appError.isOperational

  if (isProduction && !isOperational) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    })
  }

  // Return appropriate error response
  return res.status(appError.statusCode).json({
    success: false,
    error: appError.type,
    message: appError.message,
    ...(appError.context && !isProduction && { context: appError.context })
  })
}

// Async error wrapper
export function asyncHandler(fn: Function) {
  return (req: NextApiRequest, res: NextApiResponse) => {
    Promise.resolve(fn(req, res)).catch((error) => {
      errorHandler(error, req, res)
    })
  }
}

// Common error creators
export const createError = {
  validation: (message: string, context?: any) =>
    new AppError(message, ErrorType.VALIDATION, 400, ErrorSeverity.LOW, context),

  authentication: (message: string = 'Authentication required') =>
    new AppError(message, ErrorType.AUTHENTICATION, 401, ErrorSeverity.MEDIUM),

  authorization: (message: string = 'Insufficient permissions') =>
    new AppError(message, ErrorType.AUTHORIZATION, 403, ErrorSeverity.MEDIUM),

  notFound: (resource: string) =>
    new AppError(`${resource} not found`, ErrorType.NOT_FOUND, 404, ErrorSeverity.LOW),

  rateLimit: (message: string = 'Rate limit exceeded') =>
    new AppError(message, ErrorType.RATE_LIMIT, 429, ErrorSeverity.MEDIUM),

  payment: (message: string, context?: any) =>
    new AppError(message, ErrorType.PAYMENT, 400, ErrorSeverity.HIGH, context),

  aiService: (message: string, context?: any) =>
    new AppError(message, ErrorType.AI_SERVICE, 503, ErrorSeverity.HIGH, context),

  database: (message: string, context?: any) =>
    new AppError(message, ErrorType.DATABASE, 500, ErrorSeverity.HIGH, context),

  externalService: (service: string, message: string, context?: any) =>
    new AppError(`${service} service error: ${message}`, ErrorType.EXTERNAL_SERVICE, 503, ErrorSeverity.HIGH, context),

  internal: (message: string, context?: any) =>
    new AppError(message, ErrorType.INTERNAL, 500, ErrorSeverity.HIGH, context)
}

// Error monitoring and alerting
export class ErrorMonitor {
  private alertThresholds = {
    [ErrorSeverity.CRITICAL]: 1, // Alert on first critical error
    [ErrorSeverity.HIGH]: 5,     // Alert after 5 high errors
    [ErrorSeverity.MEDIUM]: 20,  // Alert after 20 medium errors
    [ErrorSeverity.LOW]: 100     // Alert after 100 low errors
  }

  private errorCounts: { [key in ErrorSeverity]: number } = {
    [ErrorSeverity.CRITICAL]: 0,
    [ErrorSeverity.HIGH]: 0,
    [ErrorSeverity.MEDIUM]: 0,
    [ErrorSeverity.LOW]: 0
  }

  checkThresholds() {
    Object.entries(this.errorCounts).forEach(([severity, count]) => {
      const threshold = this.alertThresholds[severity as ErrorSeverity]
      if (count >= threshold) {
        this.sendAlert(severity as ErrorSeverity, count)
        this.errorCounts[severity as ErrorSeverity] = 0 // Reset after alert
      }
    })
  }

  private sendAlert(severity: ErrorSeverity, count: number) {
    const message = `🚨 Error Alert: ${count} ${severity} errors detected`
    console.error(message)
    
    // In production, send to monitoring service (Sentry, PagerDuty, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Send to external alerting service
    }
  }

  incrementCount(severity: ErrorSeverity) {
    this.errorCounts[severity]++
    this.checkThresholds()
  }
}

export const errorMonitor = new ErrorMonitor() 