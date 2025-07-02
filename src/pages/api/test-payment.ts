import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { userId, amount } = req.body
    
    console.log('Test payment request:', { userId, amount })
    
    const mockTrackingId = `MOCK-TRACK-${Date.now()}`
    const mockRedirectUrl = 'https://example.com/mock-payment'
    
    res.status(200).json({
      success: true,
      trackingId: mockTrackingId,
      redirectUrl: mockRedirectUrl,
      message: 'Mock payment created successfully'
    })
  } catch (error: any) {
    console.error('Test payment error:', error)
    res.status(500).json({ 
      error: 'Test payment failed',
      details: error.message 
    })
  }
} 