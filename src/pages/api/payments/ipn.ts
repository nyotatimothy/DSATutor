import type { NextApiRequest, NextApiResponse } from 'next'
import { PaystackService } from '@/services/paystack'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const ipnData = req.body

    if (!ipnData.data?.reference) {
      return res.status(400).json({ error: 'Invalid webhook data' })
    }

    await PaystackService.handleWebhook(ipnData)

    res.status(200).json({ success: true, message: 'IPN processed successfully' })
  } catch (error: any) {
    console.error('IPN processing error:', error)
    res.status(500).json({ error: 'Failed to process IPN' })
  }
} 