const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'

async function testPayments() {
  console.log('🧪 Testing Payment Endpoints...\n')

  try {
    // Test 1: Initiate Payment
    console.log('1. Testing Payment Initiation...')
    const initiateResponse = await axios.post(`${BASE_URL}/payments/initiate`, {
      userId: '7b1e3f4d-9543-4724-b967-f5950b295877', // Using real user ID
      amount: 1500,
      currency: 'NGN',
      description: 'DSATutor Premium Course'
    })
    console.log('✅ Payment Initiation Success:', initiateResponse.data)
    console.log('')

    const trackingId = initiateResponse.data.trackingId

    // Test 2: Check Payment Status
    console.log('2. Testing Payment Status...')
    const statusResponse = await axios.get(`${BASE_URL}/payments/status?tracking_id=${trackingId}`)
    console.log('✅ Payment Status Success:', statusResponse.data)
    console.log('')

    // Test 3: Simulate Webhook
    console.log('3. Testing Paystack Webhook...')
    const webhookResponse = await axios.post(`${BASE_URL}/payments/ipn`, {
      data: {
        reference: trackingId,
        status: 'success',
        amount: 150000
      }
    })
    console.log('✅ Webhook Success:', webhookResponse.data)
    console.log('')

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message)
  }
}

testPayments() 