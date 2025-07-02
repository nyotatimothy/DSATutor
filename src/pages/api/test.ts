import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({
    firebaseApiKey: process.env.FIREBASE_API_KEY ? 'Set' : 'Not set',
    resendApiKey: process.env.RESEND_API_KEY ? 'Set' : 'Not set',
    pesapalKey: process.env.PESAPAL_CONSUMER_KEY ? 'Set' : 'Not set',
    databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
  })
} 