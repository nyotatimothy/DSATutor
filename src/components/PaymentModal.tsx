'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { 
  CreditCard,
  Lock,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  courseId: string;
  price: number;
  onPaymentSuccess: (courseId: string) => void;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  courseTitle, 
  courseId, 
  price, 
  onPaymentSuccess 
}: PaymentModalProps) {
  const [paymentCode, setPaymentCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    message: string;
    transactionId?: string;
  } | null>(null)
  const [showTestCodes, setShowTestCodes] = useState(false)

  const testCodes = [
    { code: 'SUCCESS123', description: 'Successful payment', type: 'success' },
    { code: 'VISA4444', description: 'Visa payment success', type: 'success' },
    { code: 'MPESA567', description: 'M-Pesa payment success', type: 'success' },
    { code: 'FAIL001', description: 'Insufficient funds', type: 'error' },
    { code: 'FAIL002', description: 'Invalid payment method', type: 'error' },
    { code: 'DECLINE99', description: 'Payment declined', type: 'error' },
    { code: 'ERROR500', description: 'Gateway error', type: 'error' },
    { code: 'TIMEOUT01', description: 'Payment timeout', type: 'error' }
  ]

  const handlePayment = async () => {
    if (!paymentCode.trim()) {
      setPaymentResult({
        success: false,
        message: 'Please enter a payment code'
      })
      return
    }

    setIsProcessing(true)
    setPaymentResult(null)

    try {
      const response = await fetch('/api/payments/unlock-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'demo-user',
          courseId,
          paymentCode: paymentCode.trim(),
          amount: price
        })
      })

      const data = await response.json()

      setPaymentResult({
        success: data.success,
        message: data.message,
        transactionId: data.transactionId
      })

      if (data.success) {
        // Wait a moment to show success message
        setTimeout(() => {
          onPaymentSuccess(courseId)
          handleClose()
        }, 2000)
      }

    } catch (error) {
      setPaymentResult({
        success: false,
        message: 'Network error. Please try again.'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setPaymentCode('')
    setPaymentResult(null)
    setIsProcessing(false)
    setShowTestCodes(false)
    onClose()
  }

  const copyTestCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setPaymentCode(code)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-orange-500" />
            <span>Unlock Course</span>
          </DialogTitle>
          <DialogDescription>
            Complete payment to unlock access to this course
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Course Info */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <h3 className="font-medium text-gray-900 mb-1">{courseTitle}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Course Access</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-green-600">${price}</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    One-time
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          {!paymentResult && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentCode">Payment Code</Label>
                <Input
                  id="paymentCode"
                  type="text"
                  placeholder="Enter payment code"
                  value={paymentCode}
                  onChange={(e) => setPaymentCode(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your payment code to complete the transaction
                </p>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ${price}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Payment Result */}
          {paymentResult && (
            <Card className={`border-2 ${
              paymentResult.success 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  {paymentResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      paymentResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {paymentResult.success ? 'Payment Successful!' : 'Payment Failed'}
                    </h4>
                    <p className={`text-sm ${
                      paymentResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {paymentResult.message}
                    </p>
                    {paymentResult.transactionId && (
                      <p className="text-xs text-green-600 mt-1">
                        Transaction ID: {paymentResult.transactionId}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Codes Section */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTestCodes(!showTestCodes)}
              className="w-full"
            >
              {showTestCodes ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showTestCodes ? 'Hide' : 'Show'} Test Payment Codes
            </Button>

            {showTestCodes && (
              <div className="mt-3 space-y-2">
                <div className="text-xs text-gray-600 mb-2">
                  Use these codes to test different payment scenarios:
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {testCodes.map((test, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded border text-xs ${
                        test.type === 'success'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div>
                        <span className="font-mono font-medium">{test.code}</span>
                        <span className="text-gray-600 ml-2">- {test.description}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyTestCode(test.code)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {paymentResult && !paymentResult.success && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPaymentResult(null)
                  setPaymentCode('')
                }}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          )}

          {!paymentResult && (
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
