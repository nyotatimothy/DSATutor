import type { NextApiRequest, NextApiResponse } from 'next'
import { FirebaseService } from '@/services/firebase'
import { EmailService } from '@/services/email'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' })
    }

    // Create user in Firebase
    const userCredential = await FirebaseService.signUp(email, password)
    const firebaseUid = userCredential.user.uid

    // Create user in database
    const user = await prisma.user.create({
      data: {
        firebaseUid,
        email,
        name
      }
    })

    // Send welcome email
    await EmailService.sendWelcomeEmail(email, name)

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        message: 'Welcome to DSATutor! Your account has been created successfully.',
        status: 'unread'
      }
    })

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    
    if (error.code === 'auth/email-already-in-use') {
      return res.status(400).json({ error: 'Email already registered' })
    }
    
    res.status(500).json({ error: 'Failed to create account' })
  }
} 