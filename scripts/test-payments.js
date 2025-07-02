require('dotenv').config()
const axios = require('axios')
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

const BASE_URL = 'http://localhost:3000/api'
let authToken = null
let testPaymentId = null

// Test results tracking
const testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    successRate: 0
  },
  details: {
    authentication: [],
    payments: [],
    stats: [],
    validation: [],
    errorHandling: []
  }
}

// Test data
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  fullName: 'Test User'
}

const testPayment = {
  amount: 1500,
  currency: 'NGN'
}

console.log('🚀 Starting Payment API Tests...')
console.log(`📧 Test User Email: ${testUser.email}`)
console.log(`💰 Test Amount: ${testPayment.amount} ${testPayment.currency}`)

console.log('')

async function makeRequest(method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    if (data) {
      config.data = data
    }
    
    const response = await axios(config)
    return { success: true, data: response.data, status: response.status }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    }
  }
}

function recordTest(category, testName, passed, details = null) {
  const testResult = {
    name: testName,
    passed,
    timestamp: new Date().toISOString(),
    details
  }
  
  testResults.details[category].push(testResult)
  testResults.summary.totalTests++
  
  if (passed) {
    testResults.summary.passed++
  } else {
    testResults.summary.failed++
  }
  
  testResults.summary.successRate = (testResults.summary.passed / testResults.summary.totalTests) * 100
}

async function setupTestData() {
  console.log('🔧 Setting up test data...')
  
  // Create test user
  console.log('1. Creating test user...')
  const signupResult = await makeRequest('POST', '/auth/signup-new', testUser)
  if (signupResult.success) {
    console.log('✅ Test user created')
    recordTest('authentication', 'Create Test User', true)
  } else {
    console.log('❌ Test user creation failed:', signupResult.error)
    recordTest('authentication', 'Create Test User', false, signupResult.error)
  }
  
  // Login test user
  console.log('2. Logging in test user...')
  const loginResult = await makeRequest('POST', '/auth/login-new', {
    email: testUser.email,
    password: testUser.password
  })
  if (loginResult.success) {
    authToken = loginResult.data.data.token
    console.log('✅ Test user logged in')
    recordTest('authentication', 'Login Test User', true)
  } else {
    console.log('❌ Test user login failed:', loginResult.error)
    recordTest('authentication', 'Login Test User', false, loginResult.error)
  }
  
  console.log('')
}

async function testPaymentsCRUD() {
  console.log('💰 Testing Payment CRUD Operations...')
  
  // Test 1: Get payments (empty)
  console.log('1. Getting payments (empty)...')
  const getPaymentsResult = await makeRequest('GET', '/payments', null, authToken)
  if (getPaymentsResult.success) {
    console.log('✅ Get payments successful')
    console.log(`   Found ${getPaymentsResult.data.data.payments.length} payments`)
    recordTest('payments', 'Get Payments (Empty)', true, { count: getPaymentsResult.data.data.payments.length })
  } else {
    console.log('❌ Get payments failed:', getPaymentsResult.error)
    recordTest('payments', 'Get Payments (Empty)', false, getPaymentsResult.error)
  }
  
  // Test 2: Create payment
  console.log('2. Creating payment...')
  const createPaymentResult = await makeRequest('POST', '/payments', testPayment, authToken)
  if (createPaymentResult.success) {
    testPaymentId = createPaymentResult.data.data.payment.id
    console.log('✅ Payment created successfully')
    console.log(`   Payment ID: ${testPaymentId}`)
    console.log(`   External Reference: ${createPaymentResult.data.data.payment.externalReference}`)
    console.log(`   Authorization URL: ${createPaymentResult.data.data.authorizationUrl}`)
    recordTest('payments', 'Create Payment', true, { paymentId: testPaymentId })
  } else {
    console.log('❌ Create payment failed:', createPaymentResult.error)
    recordTest('payments', 'Create Payment', false, createPaymentResult.error)
  }
  
  // Test 3: Get payments (with data)
  console.log('3. Getting payments (with data)...')
  const getPaymentsWithDataResult = await makeRequest('GET', '/payments', null, authToken)
  if (getPaymentsWithDataResult.success) {
    console.log('✅ Get payments successful')
    console.log(`   Found ${getPaymentsWithDataResult.data.data.payments.length} payments`)
    recordTest('payments', 'Get Payments (With Data)', true, { count: getPaymentsWithDataResult.data.data.payments.length })
  } else {
    console.log('❌ Get payments failed:', getPaymentsWithDataResult.error)
    recordTest('payments', 'Get Payments (With Data)', false, getPaymentsWithDataResult.error)
  }
  
  // Test 4: Get specific payment
  console.log('4. Getting specific payment...')
  if (testPaymentId) {
    const getSpecificPaymentResult = await makeRequest('GET', `/payments/${testPaymentId}`, null, authToken)
    if (getSpecificPaymentResult.success) {
      console.log('✅ Get specific payment successful')
      console.log(`   Status: ${getSpecificPaymentResult.data.data.payment.status}`)
      console.log(`   Amount: ${getSpecificPaymentResult.data.data.payment.amount} ${getSpecificPaymentResult.data.data.payment.currency}`)
      recordTest('payments', 'Get Specific Payment', true, { 
        status: getSpecificPaymentResult.data.data.payment.status,
        amount: getSpecificPaymentResult.data.data.payment.amount
      })
    } else {
      console.log('❌ Get specific payment failed:', getSpecificPaymentResult.error)
      recordTest('payments', 'Get Specific Payment', false, getSpecificPaymentResult.error)
    }
  } else {
    console.log('⚠️  Skipping get specific payment (no payment ID)')
    recordTest('payments', 'Get Specific Payment', false, 'No payment ID available')
  }
  
  // Test 5: Update payment
  console.log('5. Updating payment...')
  if (testPaymentId) {
    const updatePaymentResult = await makeRequest('PUT', `/payments/${testPaymentId}`, {
      status: 'success',
      transactionId: 'mock-transaction-id'
    }, authToken)
    if (updatePaymentResult.success) {
      console.log('✅ Payment updated successfully')
      console.log(`   New status: ${updatePaymentResult.data.data.payment.status}`)
      console.log(`   Transaction ID: ${updatePaymentResult.data.data.payment.transactionId}`)
      recordTest('payments', 'Update Payment', true, { 
        status: updatePaymentResult.data.data.payment.status,
        transactionId: updatePaymentResult.data.data.payment.transactionId
      })
    } else {
      console.log('❌ Update payment failed:', updatePaymentResult.error)
      recordTest('payments', 'Update Payment', false, updatePaymentResult.error)
    }
  } else {
    console.log('⚠️  Skipping update payment (no payment ID)')
    recordTest('payments', 'Update Payment', false, 'No payment ID available')
  }
  
  // Test 6: Create second payment
  console.log('6. Creating second payment...')
  const createSecondPaymentResult = await makeRequest('POST', '/payments', {
    amount: 2500,
    currency: 'USD'
  }, authToken)
  if (createSecondPaymentResult.success) {
    const secondPaymentId = createSecondPaymentResult.data.data.payment.id
    console.log('✅ Second payment created successfully')
    console.log(`   Payment ID: ${secondPaymentId}`)
    recordTest('payments', 'Create Second Payment', true, { paymentId: secondPaymentId })
  } else {
    console.log('❌ Create second payment failed:', createSecondPaymentResult.error)
    recordTest('payments', 'Create Second Payment', false, createSecondPaymentResult.error)
  }
  
  console.log('')
}

async function testPaymentsStats() {
  console.log('📊 Testing Payment Statistics...')
  
  // Test 1: Get payment stats
  console.log('1. Getting payment stats...')
  const getStatsResult = await makeRequest('GET', '/payments/stats', null, authToken)
  if (getStatsResult.success) {
    console.log('✅ Get payment stats successful')
    const stats = getStatsResult.data.data.stats
    console.log(`   Total Payments: ${stats.totalPayments}`)
    console.log(`   Successful: ${stats.successfulPayments}`)
    console.log(`   Failed: ${stats.failedPayments}`)
    console.log(`   Pending: ${stats.pendingPayments}`)
    console.log(`   Total Amount: ${stats.totalAmount}`)
    console.log(`   Success Rate: ${stats.successRate}%`)
    recordTest('stats', 'Get Payment Stats', true, stats)
  } else {
    console.log('❌ Get payment stats failed:', getStatsResult.error)
    recordTest('stats', 'Get Payment Stats', false, getStatsResult.error)
  }
  
  // Test 2: Filter payments by status
  console.log('2. Filtering payments by status...')
  const getSuccessfulPaymentsResult = await makeRequest('GET', '/payments?status=successful', null, authToken)
  if (getSuccessfulPaymentsResult.success) {
    console.log('✅ Get successful payments successful')
    console.log(`   Found ${getSuccessfulPaymentsResult.data.data.payments.length} successful payments`)
    recordTest('stats', 'Filter Payments by Status', true, { count: getSuccessfulPaymentsResult.data.data.payments.length })
  } else {
    console.log('❌ Get successful payments failed:', getSuccessfulPaymentsResult.error)
    recordTest('stats', 'Filter Payments by Status', false, getSuccessfulPaymentsResult.error)
  }
  

  
  console.log('')
}

async function testPaymentVerification() {
  console.log('🔍 Testing Payment Verification...')
  
  if (!testPaymentId) {
    console.log('⚠️  Skipping payment verification tests (no payment ID)')
    recordTest('validation', 'Payment Verification', false, 'No payment ID available')
    console.log('')
    return
  }
  
  // Test 1: Verify payment with reference
  console.log('1. Verifying payment with reference...')
  const verifyPaymentResult = await makeRequest('GET', `/payments/verify?reference=MOCK-REF-${Date.now()}`, null, authToken)
  if (!verifyPaymentResult.success && verifyPaymentResult.status === 404) {
    console.log('✅ Payment verification failed as expected (invalid reference)')
    recordTest('validation', 'Payment Verification (Invalid Reference)', true)
  } else {
    console.log('❌ Payment verification test failed:', verifyPaymentResult)
    recordTest('validation', 'Payment Verification (Invalid Reference)', false, verifyPaymentResult)
  }
  
  console.log('')
}

async function testValidation() {
  console.log('🔍 Testing Validation...')
  
  // Test 1: Create payment with missing amount
  console.log('1. Creating payment with missing amount...')
  const missingAmountResult = await makeRequest('POST', '/payments', {
    currency: 'NGN',
    paymentMethod: 'card',
    description: 'Test payment'
  }, authToken)
  if (!missingAmountResult.success && missingAmountResult.status === 400) {
    console.log('✅ Missing amount validation (expected)')
    recordTest('validation', 'Missing Amount', true)
  } else {
    console.log('❌ Missing amount validation failed:', missingAmountResult)
    recordTest('validation', 'Missing Amount', false, missingAmountResult)
  }
  
  // Test 2: Create payment with negative amount
  console.log('2. Creating payment with negative amount...')
  const negativeAmountResult = await makeRequest('POST', '/payments', {
    amount: -100,
    currency: 'NGN',
    paymentMethod: 'card',
    description: 'Test payment'
  }, authToken)
  if (!negativeAmountResult.success && negativeAmountResult.status === 400) {
    console.log('✅ Negative amount validation (expected)')
    recordTest('validation', 'Negative Amount', true)
  } else {
    console.log('❌ Negative amount validation failed:', negativeAmountResult)
    recordTest('validation', 'Negative Amount', false, negativeAmountResult)
  }
  
  // Test 3: Create payment with invalid currency
  console.log('3. Creating payment with invalid currency...')
  const invalidCurrencyResult = await makeRequest('POST', '/payments', {
    amount: 1000,
    currency: 'INVALID',
    paymentMethod: 'card',
    description: 'Test payment'
  }, authToken)
  if (!invalidCurrencyResult.success && invalidCurrencyResult.status === 400) {
    console.log('✅ Invalid currency validation (expected)')
    recordTest('validation', 'Invalid Currency', true)
  } else {
    console.log('❌ Invalid currency validation failed:', invalidCurrencyResult)
    recordTest('validation', 'Invalid Currency', false, invalidCurrencyResult)
  }
  

  

  
  // Test 4: Get non-existent payment
  console.log('4. Getting non-existent payment...')
  const nonExistentPaymentResult = await makeRequest('GET', '/payments/non-existent-id', null, authToken)
  if (!nonExistentPaymentResult.success && nonExistentPaymentResult.status === 404) {
    console.log('✅ Non-existent payment validation (expected)')
    recordTest('validation', 'Non-existent Payment', true)
  } else {
    console.log('❌ Non-existent payment validation failed:', nonExistentPaymentResult)
    recordTest('validation', 'Non-existent Payment', false, nonExistentPaymentResult)
  }
  
  // Test 5: Update payment with invalid status
  console.log('5. Updating payment with invalid status...')
  if (testPaymentId) {
    const invalidStatusResult = await makeRequest('PUT', `/payments/${testPaymentId}`, {
      status: 'invalid_status'
    }, authToken)
    if (!invalidStatusResult.success && invalidStatusResult.status === 400) {
      console.log('✅ Invalid status validation (expected)')
      recordTest('validation', 'Invalid Status', true)
    } else {
      console.log('❌ Invalid status validation failed:', invalidStatusResult)
      recordTest('validation', 'Invalid Status', false, invalidStatusResult)
    }
  } else {
    console.log('⚠️  Skipping invalid status test (no payment ID)')
    recordTest('validation', 'Invalid Status', false, 'No payment ID available')
  }
  
  console.log('')
}

async function testErrorHandling() {
  console.log('⚠️  Testing Error Handling...')
  
  // Test 1: Unauthorized access
  console.log('1. Testing unauthorized access...')
  const unauthorizedPaymentsResult = await makeRequest('GET', '/payments')
  if (!unauthorizedPaymentsResult.success && unauthorizedPaymentsResult.status === 401) {
    console.log('✅ Unauthorized payments access (expected)')
    recordTest('errorHandling', 'Unauthorized Payments Access', true)
  } else {
    console.log('❌ Unauthorized payments access failed:', unauthorizedPaymentsResult)
    recordTest('errorHandling', 'Unauthorized Payments Access', false, unauthorizedPaymentsResult)
  }
  
  const unauthorizedStatsResult = await makeRequest('GET', '/payments/stats')
  if (!unauthorizedStatsResult.success && unauthorizedStatsResult.status === 401) {
    console.log('✅ Unauthorized stats access (expected)')
    recordTest('errorHandling', 'Unauthorized Stats Access', true)
  } else {
    console.log('❌ Unauthorized stats access failed:', unauthorizedStatsResult)
    recordTest('errorHandling', 'Unauthorized Stats Access', false, unauthorizedStatsResult)
  }
  
  console.log('')
}

function saveTestResults() {
  const resultsPath = path.join(__dirname, '..', 'test-results.json')
  fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2))
  console.log(`📊 Test results saved to: ${resultsPath}`)
}

async function runTests() {
  try {
    await setupTestData()
    await testPaymentsCRUD()
    await testPaymentsStats()
    await testPaymentVerification()
    await testValidation()
    await testErrorHandling()
    
    console.log('🎉 Payment API Tests Completed!')
    console.log('')
    console.log('📊 Test Summary:')
    console.log(`Total Tests: ${testResults.summary.totalTests}`)
    console.log(`✅ Passed: ${testResults.summary.passed}`)
    console.log(`❌ Failed: ${testResults.summary.failed}`)
    console.log(`📈 Success Rate: ${testResults.summary.successRate.toFixed(1)}%`)
    console.log('')
    console.log('🔗 Available Endpoints:')
    console.log('   GET    /api/payments - Get user payments')
    console.log('   POST   /api/payments - Create payment')
    console.log('   GET    /api/payments/[id] - Get specific payment')
    console.log('   PUT    /api/payments/[id] - Update payment')
    console.log('   DELETE /api/payments/[id] - Delete payment')
    console.log('   GET    /api/payments/stats - Get payment statistics')
    console.log('   GET    /api/payments/verify - Verify payment with Paystack')
    
    // Save test results
    saveTestResults()
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the tests
runTests() 