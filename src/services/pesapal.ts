import axios from 'axios'
import { prisma } from '@/lib/prisma'

interface PesapalAuthResponse {
  token: string
  expires_in: number
}

interface PesapalPaymentRequest {
  id: string
  currency: string
  amount: number
  description: string
  callback_url: string
  notification_id: string
  billing_address: {
    email_address: string
    phone_number: string
    country_code: string
    first_name: string
    middle_name?: string
    last_name: string
    line_1: string
    line_2?: string
    city: string
    state: string
    postal_code: string
    zip_code: string
  }
}

export class PesapalService {
  private static baseUrl = process.env.PESAPAL_BASE_URL
  private static consumerKey = process.env.PESAPAL_CONSUMER_KEY
  private static consumerSecret = process.env.PESAPAL_CONSUMER_SECRET

  private static async getAuthToken(): Promise<string> {
    // For development/testing, always return mock token
    console.log('Using mock Pesapal auth token for development')
    return 'mock-pesapal-token'
    
    /* 
    // Uncomment this section when ready to use real Pesapal
    try {
      console.log('Getting Pesapal auth token...')
      console.log('Base URL:', this.baseUrl)
      console.log('Consumer Key:', this.consumerKey ? 'Set' : 'Not set')
      console.log('Consumer Secret:', this.consumerSecret ? 'Set' : 'Not set')
      
      const response = await axios.post(`${this.baseUrl}/api/Auth/RequestToken`, {
        consumer_key: this.consumerKey,
        consumer_secret: this.consumerSecret
      })
      
      console.log('Pesapal auth response:', response.data)
      const data: PesapalAuthResponse = response.data
      return data.token
    } catch (error: any) {
      console.error('Failed to get Pesapal auth token:', error.response?.data || error.message)
      
      // For testing purposes, return a mock token
      if (error.response?.status === 500 || error.code === 'ECONNREFUSED') {
        console.log('Pesapal not available, using mock token')
        return 'mock-pesapal-token'
      }
      throw error
    }
    */
  }

  static async initiatePayment(
    userId: string,
    amount: number,
    currency: string = 'KES',
    description: string = 'DSATutor Course Payment'
  ): Promise<{ trackingId: string; redirectUrl: string }> {
    try {
      console.log('Initiating Pesapal payment for user:', userId, 'amount:', amount)
      
      // For development/testing, always use mock data
      console.log('Using mock payment data for development')
      const mockTrackingId = `MOCK-TRACK-${Date.now()}`
      const mockRedirectUrl = 'https://example.com/mock-payment'
      
      // Store transaction in database
      await prisma.transaction.create({
        data: {
          userId,
          pesapalTrackingId: mockTrackingId,
          amount,
          currency,
          status: 'pending'
        }
      })
      
      console.log('Mock payment created with tracking ID:', mockTrackingId)
      return { trackingId: mockTrackingId, redirectUrl: mockRedirectUrl }
      
      /* 
      // Uncomment this section when ready to use real Pesapal
      const token = await this.getAuthToken()
      
      const paymentRequest: PesapalPaymentRequest = {
        id: `ORDER-${Date.now()}`,
        currency,
        amount,
        description,
        callback_url: process.env.PESAPAL_CALLBACK_URL!,
        notification_id: `${process.env.PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`,
        billing_address: {
          email_address: 'test@example.com',
          phone_number: '+254700000000',
          country_code: 'KE',
          first_name: 'Test',
          last_name: 'User',
          line_1: 'Test Address',
          city: 'Nairobi',
          state: 'Nairobi',
          postal_code: '00100',
          zip_code: '00100'
        }
      }

      let response
      try {
        response = await axios.post(
          `${this.baseUrl}/api/Transactions/SubmitOrderRequest`,
          paymentRequest,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )
      } catch (error: any) {
        console.error('Pesapal payment initiation failed:', error.response?.data || error.message)
        
        // For testing purposes, return mock data
        if (error.response?.status === 500 || error.code === 'ECONNREFUSED') {
          console.log('Pesapal not available, using mock payment data')
          const mockTrackingId = `MOCK-TRACK-${Date.now()}`
          const mockRedirectUrl = 'https://example.com/mock-payment'
          
          // Store transaction in database
          await prisma.transaction.create({
            data: {
              userId,
              pesapalTrackingId: mockTrackingId,
              amount,
              currency,
              status: 'pending'
            }
          })
          
          return { trackingId: mockTrackingId, redirectUrl: mockRedirectUrl }
        }
        throw error
      }

      const trackingId = response.data.order_tracking_id
      const redirectUrl = response.data.redirect_url

      // Store transaction in database
      await prisma.transaction.create({
        data: {
          userId,
          pesapalTrackingId: trackingId,
          amount,
          currency,
          status: 'pending'
        }
      })

      return { trackingId, redirectUrl }
      */
    } catch (error) {
      console.error('Failed to initiate Pesapal payment:', error)
      throw error
    }
  }

  static async getPaymentStatus(trackingId: string): Promise<{ status: string; details: any }> {
    try {
      // Check if it's a mock tracking ID
      if (trackingId.startsWith('MOCK-TRACK-')) {
        console.log('Mock payment status requested for:', trackingId)
        
        // Update transaction status in database
        await prisma.transaction.update({
          where: { pesapalTrackingId: trackingId },
          data: { status: 'COMPLETED' }
        })

        return { 
          status: 'COMPLETED', 
          details: { 
            payment_status_description: 'COMPLETED',
            order_tracking_id: trackingId,
            payment_method: 'MOCK'
          } 
        }
      }

      const token = await this.getAuthToken()
      
      const response = await axios.get(
        `${this.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${trackingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const status = response.data.payment_status_description
      
      // Update transaction status in database
      await prisma.transaction.update({
        where: { pesapalTrackingId: trackingId },
        data: { status }
      })

      return { status, details: response.data }
    } catch (error: any) {
      console.error('Failed to get payment status:', error.response?.data || error.message)
      
      // For testing purposes, return mock status
      if (error.response?.status === 500 || error.code === 'ECONNREFUSED') {
        console.log('Pesapal not available, using mock status')
        
        // Update transaction status in database
        await prisma.transaction.update({
          where: { pesapalTrackingId: trackingId },
          data: { status: 'PENDING' }
        })

        return { 
          status: 'PENDING', 
          details: { 
            payment_status_description: 'PENDING',
            order_tracking_id: trackingId
          } 
        }
      }
      throw error
    }
  }

  static async handleIPN(ipnData: any): Promise<void> {
    try {
      const { order_tracking_id, payment_status_description } = ipnData
      
      // Update transaction status
      await prisma.transaction.update({
        where: { pesapalTrackingId: order_tracking_id },
        data: { status: payment_status_description }
      })

      console.log('IPN processed for tracking ID:', order_tracking_id)
    } catch (error) {
      console.error('Failed to process IPN:', error)
      throw error
    }
  }
} 