import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../lib/prisma'
import { PaystackService } from '../services/paystack'

export class PaymentController {
  // Get payments for a user
  static async getUserPayments(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { status, paymentMethod } = req.query as { status?: string; paymentMethod?: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      const where: any = { userId }
      
      if (status) {
        where.status = status
      }
      
      if (paymentMethod) {
        where.paymentMethod = paymentMethod
      }

      const payments = await prisma.payment.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        }
      })

      return res.status(200).json({
        success: true,
        data: {
          payments,
          count: payments.length
        }
      })
    } catch (error) {
      console.error('Get user payments error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Get specific payment
  static async getPayment(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { id } = req.query as { id: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      const payment = await prisma.payment.findFirst({
        where: {
          id: id as string,
          userId
        }
      })

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        })
      }

      return res.status(200).json({
        success: true,
        data: { payment }
      })
    } catch (error) {
      console.error('Get payment error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Create payment
  static async createPayment(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { amount, currency } = req.body as {
        amount: number
        currency: string
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      // Validation
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be a positive number'
        })
      }

      if (!currency || !['NGN', 'USD', 'EUR', 'GBP'].includes(currency)) {
        return res.status(400).json({
          success: false,
          error: 'Currency must be NGN, USD, EUR, or GBP'
        })
      }



      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          userId,
          paystackRef: `MOCK-REF-${Date.now()}`, // Will be updated with real reference
          amount,
          currency,
          status: 'pending'
        }
      })

      // For now, return the payment without Paystack integration
      // In production, this would integrate with Paystack
      return res.status(201).json({
        success: true,
        data: { 
          payment,
          authorizationUrl: 'https://example.com/mock-payment'
        }
      })
    } catch (error) {
      console.error('Create payment error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Update payment
  static async updatePayment(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { id } = req.query as { id: string }
      const { status } = req.body as {
        status?: string
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      // Check if payment exists and belongs to user
      const existingPayment = await prisma.payment.findFirst({
        where: {
          id: id as string,
          userId
        }
      })

      if (!existingPayment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        })
      }

      // Validation
      if (status && !['pending', 'success', 'failed'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status must be pending, success, or failed'
        })
      }

      const updateData: any = {}
      if (status) updateData.status = status

      const payment = await prisma.payment.update({
        where: { id: id as string },
        data: updateData
      })

      return res.status(200).json({
        success: true,
        data: { payment }
      })
    } catch (error) {
      console.error('Update payment error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Delete payment
  static async deletePayment(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { id } = req.query as { id: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      // Check if payment exists and belongs to user
      const existingPayment = await prisma.payment.findFirst({
        where: {
          id: id as string,
          userId
        }
      })

      if (!existingPayment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        })
      }

      // Only allow deletion of pending or failed payments
      if (existingPayment.status === 'success') {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete successful payments'
        })
      }

      await prisma.payment.delete({
        where: { id: id as string }
      })

      return res.status(200).json({
        success: true,
        message: 'Payment deleted successfully'
      })
    } catch (error) {
      console.error('Delete payment error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Get payment statistics for a user
  static async getPaymentStats(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      const payments = await prisma.payment.findMany({
        where: { userId }
      })

      const totalPayments = payments.length
      const successfulPayments = payments.filter((p: any) => p.status === 'success').length
      const failedPayments = payments.filter((p: any) => p.status === 'failed').length
      const pendingPayments = payments.filter((p: any) => p.status === 'pending').length

      const totalAmount = payments
        .filter((p: any) => p.status === 'success')
        .reduce((sum: number, p: any) => sum + p.amount, 0)

      const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0

      const stats = {
        totalPayments,
        successfulPayments,
        failedPayments,
        pendingPayments,
        totalAmount: Math.round(totalAmount * 100) / 100,
        successRate: Math.round(successRate * 100) / 100
      }

      return res.status(200).json({
        success: true,
        data: { stats }
      })
    } catch (error) {
      console.error('Get payment stats error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Verify payment with Paystack
  static async verifyPayment(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { reference } = req.query as { reference: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      if (!reference) {
        return res.status(400).json({
          success: false,
          error: 'Reference is required'
        })
      }

      // Find payment by external reference
      const payment = await prisma.payment.findFirst({
        where: {
          paystackRef: reference,
          userId
        }
      })

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        })
      }

      // For now, return mock verification
      // In production, this would verify with Paystack
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'success'
        }
      })

      return res.status(200).json({
        success: true,
        data: { 
          payment: updatedPayment,
          verified: true
        }
      })
    } catch (error) {
      console.error('Verify payment error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
} 
 
import { prisma } from '../lib/prisma'
import { PaystackService } from '../services/paystack'

export class PaymentController {
  // Get payments for a user
  static async getUserPayments(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { status, paymentMethod } = req.query as { status?: string; paymentMethod?: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      const where: any = { userId }
      
      if (status) {
        where.status = status
      }
      
      if (paymentMethod) {
        where.paymentMethod = paymentMethod
      }

      const payments = await prisma.payment.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        }
      })

      return res.status(200).json({
        success: true,
        data: {
          payments,
          count: payments.length
        }
      })
    } catch (error) {
      console.error('Get user payments error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Get specific payment
  static async getPayment(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { id } = req.query as { id: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      const payment = await prisma.payment.findFirst({
        where: {
          id: id as string,
          userId
        }
      })

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        })
      }

      return res.status(200).json({
        success: true,
        data: { payment }
      })
    } catch (error) {
      console.error('Get payment error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Create payment
  static async createPayment(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { amount, currency } = req.body as {
        amount: number
        currency: string
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      // Validation
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be a positive number'
        })
      }

      if (!currency || !['NGN', 'USD', 'EUR', 'GBP'].includes(currency)) {
        return res.status(400).json({
          success: false,
          error: 'Currency must be NGN, USD, EUR, or GBP'
        })
      }



      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          userId,
          paystackRef: `MOCK-REF-${Date.now()}`, // Will be updated with real reference
          amount,
          currency,
          status: 'pending'
        }
      })

      // For now, return the payment without Paystack integration
      // In production, this would integrate with Paystack
      return res.status(201).json({
        success: true,
        data: { 
          payment,
          authorizationUrl: 'https://example.com/mock-payment'
        }
      })
    } catch (error) {
      console.error('Create payment error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Update payment
  static async updatePayment(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { id } = req.query as { id: string }
      const { status } = req.body as {
        status?: string
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      // Check if payment exists and belongs to user
      const existingPayment = await prisma.payment.findFirst({
        where: {
          id: id as string,
          userId
        }
      })

      if (!existingPayment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        })
      }

      // Validation
      if (status && !['pending', 'success', 'failed'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status must be pending, success, or failed'
        })
      }

      const updateData: any = {}
      if (status) updateData.status = status

      const payment = await prisma.payment.update({
        where: { id: id as string },
        data: updateData
      })

      return res.status(200).json({
        success: true,
        data: { payment }
      })
    } catch (error) {
      console.error('Update payment error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Delete payment
  static async deletePayment(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { id } = req.query as { id: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      // Check if payment exists and belongs to user
      const existingPayment = await prisma.payment.findFirst({
        where: {
          id: id as string,
          userId
        }
      })

      if (!existingPayment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        })
      }

      // Only allow deletion of pending or failed payments
      if (existingPayment.status === 'success') {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete successful payments'
        })
      }

      await prisma.payment.delete({
        where: { id: id as string }
      })

      return res.status(200).json({
        success: true,
        message: 'Payment deleted successfully'
      })
    } catch (error) {
      console.error('Delete payment error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Get payment statistics for a user
  static async getPaymentStats(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      const payments = await prisma.payment.findMany({
        where: { userId }
      })

      const totalPayments = payments.length
      const successfulPayments = payments.filter((p: any) => p.status === 'success').length
      const failedPayments = payments.filter((p: any) => p.status === 'failed').length
      const pendingPayments = payments.filter((p: any) => p.status === 'pending').length

      const totalAmount = payments
        .filter((p: any) => p.status === 'success')
        .reduce((sum: number, p: any) => sum + p.amount, 0)

      const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0

      const stats = {
        totalPayments,
        successfulPayments,
        failedPayments,
        pendingPayments,
        totalAmount: Math.round(totalAmount * 100) / 100,
        successRate: Math.round(successRate * 100) / 100
      }

      return res.status(200).json({
        success: true,
        data: { stats }
      })
    } catch (error) {
      console.error('Get payment stats error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // Verify payment with Paystack
  static async verifyPayment(req: NextApiRequest, res: NextApiResponse) {
    try {
      const userId = (req as any).user?.id
      const { reference } = req.query as { reference: string }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
      }

      if (!reference) {
        return res.status(400).json({
          success: false,
          error: 'Reference is required'
        })
      }

      // Find payment by external reference
      const payment = await prisma.payment.findFirst({
        where: {
          paystackRef: reference,
          userId
        }
      })

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        })
      }

      // For now, return mock verification
      // In production, this would verify with Paystack
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'success'
        }
      })

      return res.status(200).json({
        success: true,
        data: { 
          payment: updatedPayment,
          verified: true
        }
      })
    } catch (error) {
      console.error('Verify payment error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
} 
 