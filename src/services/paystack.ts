import axios from 'axios'
import { prisma } from '@/lib/prisma'

interface PaystackTransactionResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    status: string
    reference: string
    amount: number
    paid_at: string
    channel: string
    currency: string
    customer: {
      email: string
      customer_code: string
      first_name: string
      last_name: string
    }
  }
}

export class PaystackService {
  private static secretKey = process.env.PAYSTACK_SECRET_KEY || 'sk_test_afce2ed4200654356c0b49e7a186d0642565dfd5'
  private static publicKey = process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_173eb39d720bd2d0edda1b29cbfe4d784a03a49f'
  private static baseUrl = 'https://api.paystack.co'

  static async initiatePayment(
    userId: string,
    amount: number,
    currency: string = 'NGN',
    description: string = 'DSATutor Course Payment',
    email: string = 'test@example.com'
  ): Promise<{ trackingId: string; redirectUrl: string }> {
    try {
      console.log('Initiating Paystack payment for user:', userId, 'amount:', amount)
      
      // For development/testing, use mock data
      console.log('Using mock payment data for development')
      const mockReference = `MOCK-REF-${Date.now()}`
      const mockRedirectUrl = 'https://example.com/mock-payment'
      
      // Store transaction in database
      await prisma.transaction.create({
        data: {
          userId,
          pesapalTrackingId: mockReference, // Reusing the field name for compatibility
          amount,
          currency,
          status: 'pending'
        }
      })
      
      console.log('Mock payment created with reference:', mockReference)
      return { trackingId: mockReference, redirectUrl: mockRedirectUrl }
      
      /* 
      // Uncomment this section when ready to use real Paystack
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          amount: amount * 100, // Paystack expects amount in kobo (smallest currency unit)
          email: email,
          reference: `DSATUTOR-${Date.now()}`,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
          metadata: {
            userId: userId,
            description: description
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const data: PaystackTransactionResponse = response.data
      
      if (!data.status) {
        throw new Error(data.message)
      }

      const reference = data.data.reference
      const redirectUrl = data.data.authorization_url

      // Store transaction in database
      await prisma.transaction.create({
        data: {
          userId,
          pesapalTrackingId: reference, // Reusing the field name for compatibility
          amount,
          currency,
          status: 'pending'
        }
      })

      return { trackingId: reference, redirectUrl }
      */
    } catch (error) {
      console.error('Failed to initiate Paystack payment:', error)
      throw error
    }
  }

  static async getPaymentStatus(reference: string): Promise<{ status: string; details: any }> {
    try {
      console.log('Getting payment status for reference:', reference)
      
      // Check if it's a mock reference
      if (reference.startsWith('MOCK-REF-')) {
        console.log('Mock payment status requested for:', reference)
        
        // Update transaction status in database
        await prisma.transaction.update({
          where: { pesapalTrackingId: reference },
          data: { status: 'COMPLETED' }
        })

        return { 
          status: 'COMPLETED', 
          details: { 
            status: 'success',
            reference: reference,
            amount: 1500,
            paid_at: new Date().toISOString(),
            channel: 'MOCK'
          } 
        }
      }

      // For real Paystack verification
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      )

      const data: PaystackVerifyResponse = response.data
      
      if (!data.status) {
        throw new Error(data.message)
      }

      const paymentStatus = data.data.status === 'success' ? 'COMPLETED' : 'PENDING'
      
      // Update transaction status in database
      await prisma.transaction.update({
        where: { pesapalTrackingId: reference },
        data: { status: paymentStatus }
      })

      return { 
        status: paymentStatus, 
        details: data.data 
      }
    } catch (error: any) {
      console.error('Failed to get payment status:', error.response?.data || error.message)
      
      // For testing purposes, return mock status
      if (error.response?.status === 500 || error.code === 'ECONNREFUSED') {
        console.log('Paystack not available, using mock status')
        
        // Update transaction status in database
        await prisma.transaction.update({
          where: { pesapalTrackingId: reference },
          data: { status: 'PENDING' }
        })

        return { 
          status: 'PENDING', 
          details: { 
            status: 'pending',
            reference: reference
          } 
        }
      }
      throw error
    }
  }

  static async handleWebhook(webhookData: any): Promise<void> {
    try {
      const { reference, status, amount } = webhookData.data
      
      // Update transaction status
      await prisma.transaction.update({
        where: { pesapalTrackingId: reference },
        data: { status: status === 'success' ? 'COMPLETED' : 'FAILED' }
      })

      console.log('Webhook processed for reference:', reference)
    } catch (error) {
      console.error('Failed to process webhook:', error)
      throw error
    }
  }
} 