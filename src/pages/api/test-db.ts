import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      userCount: userCount
    })
  } catch (error: any) {
    console.error('Database test error:', error)
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message 
    })
  }
} 