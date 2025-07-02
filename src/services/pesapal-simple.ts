import { prisma } from '@/lib/prisma'

export class PesapalService {
  static async initiatePayment(
    userId: string,
    amount: number,
    currency: string = 'KES',
    description: string = 'DSATutor Course Payment'
  ): Promise<{ trackingId: string; redirectUrl: string }> {
    try {
      console.log('Initiating mock payment for user:', userId, 'amount:', amount)
      
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
    } catch (error) {
      console.error('Failed to initiate payment:', error)
      throw error
    }
  }

  static async getPaymentStatus(trackingId: string): Promise<{ status: string; details: any }> {
    try {
      console.log('Getting payment status for:', trackingId)
      
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
    } catch (error) {
      console.error('Failed to get payment status:', error)
      throw error
    }
  }
} 