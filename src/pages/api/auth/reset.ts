import type { NextApiRequest, NextApiResponse } from 'next'
import { FirebaseService } from '@/services/firebase'
import { EmailService } from '@/services/email'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    // Send password reset email via Firebase
    await FirebaseService.resetPassword(email)

    // Send custom email notification
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
    await EmailService.sendPasswordResetEmail(email, resetLink)

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    })
  } catch (error: any) {
    console.error('Password reset error:', error)
    
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.status(500).json({ error: 'Failed to send password reset email' })
  }
} 