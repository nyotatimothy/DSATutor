import { NextApiRequest, NextApiResponse } from 'next'

interface PaymentRequest {
  userId: string;
  courseId: string;
  paymentCode: string;
  amount: number;
}

interface PaymentResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  unlockedCourse?: string;
}

// Sample payment codes for testing
const PAYMENT_CODES = {
  'SUCCESS123': { status: 'success', message: 'Payment processed successfully' },
  'VISA4444': { status: 'success', message: 'Payment completed via Visa' },
  'MPESA567': { status: 'success', message: 'M-Pesa payment successful' },
  'FAIL001': { status: 'failed', message: 'Insufficient funds' },
  'FAIL002': { status: 'failed', message: 'Invalid payment method' },
  'DECLINE99': { status: 'failed', message: 'Payment declined by bank' },
  'ERROR500': { status: 'error', message: 'Payment gateway error. Please try again.' },
  'TIMEOUT01': { status: 'error', message: 'Payment timeout. Please try again.' }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<PaymentResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { userId, courseId, paymentCode, amount }: PaymentRequest = req.body

    if (!userId || !courseId || !paymentCode || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, courseId, paymentCode, amount'
      })
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Check payment code
    const paymentResult = PAYMENT_CODES[paymentCode as keyof typeof PAYMENT_CODES]
    
    if (!paymentResult) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment code. Please check your payment details.'
      })
    }

    if (paymentResult.status === 'success') {
      // Generate transaction ID
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // In a real app, you would:
      // 1. Process actual payment
      // 2. Update user's course access in database
      // 3. Send confirmation email
      
      return res.status(200).json({
        success: true,
        message: paymentResult.message,
        transactionId,
        unlockedCourse: courseId
      })
    } else {
      // Payment failed or error
      return res.status(402).json({
        success: false,
        message: paymentResult.message
      })
    }

  } catch (error) {
    console.error('Payment processing error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error during payment processing'
    })
  }
}
