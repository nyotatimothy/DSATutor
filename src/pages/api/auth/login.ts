import type { NextApiRequest, NextApiResponse } from 'next'
import { FirebaseService } from '@/services/firebase'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Sign in with Firebase
    const userCredential = await FirebaseService.signIn(email, password)
    const firebaseUid = userCredential.user.uid

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        notifications: {
          where: { status: 'unread' },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName
      },
      notifications: user.notifications
    })
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    
    res.status(500).json({ error: 'Failed to sign in' })
  }
} 