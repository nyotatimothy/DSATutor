import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function PaymentCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const { order_tracking_id } = router.query

      if (!order_tracking_id || typeof order_tracking_id !== 'string') {
        setStatus('failed')
        setMessage('Invalid tracking ID')
        return
      }

      try {
        const response = await fetch(`/api/payments/status?tracking_id=${order_tracking_id}`)
        const data = await response.json()

        if (data.success) {
          setStatus('success')
          setMessage(`Payment ${data.status}`)
        } else {
          setStatus('failed')
          setMessage('Failed to verify payment')
        }
      } catch (error) {
        setStatus('failed')
        setMessage('Error checking payment status')
      }
    }

    if (router.isReady) {
      checkPaymentStatus()
    }
  }, [router.isReady, router.query])

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      {status === 'loading' && (
        <div>
          <h1>Processing Payment...</h1>
          <p>Please wait while we verify your payment.</p>
        </div>
      )}
      
      {status === 'success' && (
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'green' }}>Payment Successful!</h1>
          <p>{message}</p>
          <p>You will receive a confirmation email shortly.</p>
        </div>
      )}
      
      {status === 'failed' && (
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'red' }}>Payment Failed</h1>
          <p>{message}</p>
          <p>Please try again or contact support.</p>
        </div>
      )}
    </div>
  )
} 