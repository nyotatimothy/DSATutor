import type { NextApiRequest, NextApiResponse } from 'next'
import { FirebaseService } from '@/services/firebase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Test Firebase configuration
    const config = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "ai-dsa-tutor.firebasestorage.app",
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    }
    
    res.status(200).json({
      config,
      message: 'Firebase config loaded successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
      code: error.code
    })
  }
} 