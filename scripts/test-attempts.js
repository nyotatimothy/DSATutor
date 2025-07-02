require('dotenv').config()
const axios = require('axios')
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

const BASE_URL = 'http://localhost:3000/api'
let authToken = null
let testTopicId = null
let testAttemptId = null

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
    attempts: [],
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

const testAttempt = {
  topicId: null, // Will be set after topic retrieval
  code: 'function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }',
  result: 'pass',
  timeTaken: 120
}

console.log('🚀 Starting Attempt API Tests...')
console.log(`📧 Test User Email: ${testUser.email}`)
console.log(`💻 Test Code: ${testAttempt.code.substring(0, 50)}...`)
console.log(`✅ Test Result: ${testAttempt.result}`)
console.log(`⏱️ Test Time: ${testAttempt.timeTaken} seconds`)
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
  
  // Get existing topic
  console.log('3. Getting existing topic...')
  const getCoursesResult = await makeRequest('GET', '/courses', null, authToken)
  if (getCoursesResult.success && getCoursesResult.data.data.courses.length > 0) {
    const courseId = getCoursesResult.data.data.courses[0].id
    const getTopicsResult = await makeRequest('GET', `/topics?courseId=${courseId}`, null, authToken)
    if (getTopicsResult.success && getTopicsResult.data.data.topics.length > 0) {
      testTopicId = getTopicsResult.data.data.topics[0].id
      testAttempt.topicId = testTopicId
      console.log('✅ Using existing topic')
      console.log(`   Topic ID: ${testTopicId}`)
      recordTest('authentication', 'Get Existing Topic', true)
    } else {
      console.log('❌ Failed to get existing topic:', getTopicsResult.error)
      recordTest('authentication', 'Get Existing Topic', false, getTopicsResult.error)
    }
  } else {
    console.log('❌ Failed to get existing course:', getCoursesResult.error)
    recordTest('authentication', 'Get Existing Topic', false, getCoursesResult.error)
  }
  
  console.log('')
}

async function testAttemptsCRUD() {
  console.log('💻 Testing Attempt CRUD Operations...')
  
  if (!testTopicId) {
    console.log('⚠️  Skipping attempt tests (no topic ID)')
    recordTest('attempts', 'All Attempt Tests', false, 'No topic ID available')
    console.log('')
    return
  }
  
  // Test 1: Get attempts (empty)
  console.log('1. Getting attempts (empty)...')
  const getAttemptsResult = await makeRequest('GET', '/attempts', null, authToken)
  if (getAttemptsResult.success) {
    console.log('✅ Get attempts successful')
    console.log(`   Found ${getAttemptsResult.data.data.attempts.length} attempts`)
    recordTest('attempts', 'Get Attempts (Empty)', true, { count: getAttemptsResult.data.data.attempts.length })
  } else {
    console.log('❌ Get attempts failed:', getAttemptsResult.error)
    recordTest('attempts', 'Get Attempts (Empty)', false, getAttemptsResult.error)
  }
  
  // Test 2: Create attempt
  console.log('2. Creating attempt...')
  const createAttemptResult = await makeRequest('POST', '/attempts', testAttempt, authToken)
  if (createAttemptResult.success) {
    testAttemptId = createAttemptResult.data.data.attempt.id
    console.log('✅ Attempt created successfully')
    console.log(`   Attempt ID: ${testAttemptId}`)
    recordTest('attempts', 'Create Attempt', true, { attemptId: testAttemptId })
  } else {
    console.log('❌ Create attempt failed:', createAttemptResult.error)
    recordTest('attempts', 'Create Attempt', false, createAttemptResult.error)
  }
  
  // Test 3: Get attempts (with data)
  console.log('3. Getting attempts (with data)...')
  const getAttemptsWithDataResult = await makeRequest('GET', '/attempts', null, authToken)
  if (getAttemptsWithDataResult.success) {
    console.log('✅ Get attempts successful')
    console.log(`   Found ${getAttemptsWithDataResult.data.data.attempts.length} attempts`)
    recordTest('attempts', 'Get Attempts (With Data)', true, { count: getAttemptsWithDataResult.data.data.attempts.length })
  } else {
    console.log('❌ Get attempts failed:', getAttemptsWithDataResult.error)
    recordTest('attempts', 'Get Attempts (With Data)', false, getAttemptsWithDataResult.error)
  }
  
  // Test 4: Get specific attempt
  console.log('4. Getting specific attempt...')
  if (testAttemptId) {
    const getSpecificAttemptResult = await makeRequest('GET', `/attempts/${testAttemptId}`, null, authToken)
    if (getSpecificAttemptResult.success) {
      console.log('✅ Get specific attempt successful')
      console.log(`   Result: ${getSpecificAttemptResult.data.data.attempt.result}`)
      console.log(`   Time: ${getSpecificAttemptResult.data.data.attempt.timeTaken}s`)
      recordTest('attempts', 'Get Specific Attempt', true, { 
        result: getSpecificAttemptResult.data.data.attempt.result,
        timeTaken: getSpecificAttemptResult.data.data.attempt.timeTaken
      })
    } else {
      console.log('❌ Get specific attempt failed:', getSpecificAttemptResult.error)
      recordTest('attempts', 'Get Specific Attempt', false, getSpecificAttemptResult.error)
    }
  } else {
    console.log('⚠️  Skipping get specific attempt (no attempt ID)')
    recordTest('attempts', 'Get Specific Attempt', false, 'No attempt ID available')
  }
  
  // Test 5: Update attempt
  console.log('5. Updating attempt...')
  if (testAttemptId) {
    const updateAttemptResult = await makeRequest('PUT', `/attempts/${testAttemptId}`, {
      result: 'fail',
      timeTaken: 180
    }, authToken)
    if (updateAttemptResult.success) {
      console.log('✅ Attempt updated successfully')
      console.log(`   New result: ${updateAttemptResult.data.data.attempt.result}`)
      console.log(`   New time: ${updateAttemptResult.data.data.attempt.timeTaken}s`)
      recordTest('attempts', 'Update Attempt', true, { 
        result: updateAttemptResult.data.data.attempt.result,
        timeTaken: updateAttemptResult.data.data.attempt.timeTaken
      })
    } else {
      console.log('❌ Update attempt failed:', updateAttemptResult.error)
      recordTest('attempts', 'Update Attempt', false, updateAttemptResult.error)
    }
  } else {
    console.log('⚠️  Skipping update attempt (no attempt ID)')
    recordTest('attempts', 'Update Attempt', false, 'No attempt ID available')
  }
  
  // Test 6: Create second attempt
  console.log('6. Creating second attempt...')
  const createSecondAttemptResult = await makeRequest('POST', '/attempts', {
    topicId: testTopicId,
    code: 'function bubbleSort(arr) { /* implementation */ }',
    result: 'pass',
    timeTaken: 90
  }, authToken)
  if (createSecondAttemptResult.success) {
    const secondAttemptId = createSecondAttemptResult.data.data.attempt.id
    console.log('✅ Second attempt created successfully')
    console.log(`   Attempt ID: ${secondAttemptId}`)
    recordTest('attempts', 'Create Second Attempt', true, { attemptId: secondAttemptId })
  } else {
    console.log('❌ Create second attempt failed:', createSecondAttemptResult.error)
    recordTest('attempts', 'Create Second Attempt', false, createSecondAttemptResult.error)
  }
  
  console.log('')
}

async function testAttemptsStats() {
  console.log('📊 Testing Attempt Statistics...')
  
  // Test 1: Get attempt stats
  console.log('1. Getting attempt stats...')
  const getStatsResult = await makeRequest('GET', '/attempts/stats', null, authToken)
  if (getStatsResult.success) {
    console.log('✅ Get attempt stats successful')
    const stats = getStatsResult.data.data.stats
    console.log(`   Total Attempts: ${stats.totalAttempts}`)
    console.log(`   Passed: ${stats.passedAttempts}`)
    console.log(`   Failed: ${stats.failedAttempts}`)
    console.log(`   Success Rate: ${stats.successRate}%`)
    console.log(`   Average Time: ${stats.averageTimeTaken}s`)
    recordTest('stats', 'Get Attempt Stats', true, stats)
  } else {
    console.log('❌ Get attempt stats failed:', getStatsResult.error)
    recordTest('stats', 'Get Attempt Stats', false, getStatsResult.error)
  }
  
  // Test 2: Get attempt stats for specific topic
  console.log('2. Getting attempt stats for specific topic...')
  if (testTopicId) {
    const getTopicStatsResult = await makeRequest('GET', `/attempts/stats?topicId=${testTopicId}`, null, authToken)
    if (getTopicStatsResult.success) {
      console.log('✅ Get topic attempt stats successful')
      const stats = getTopicStatsResult.data.data.stats
      console.log(`   Total Attempts: ${stats.totalAttempts}`)
      console.log(`   Success Rate: ${stats.successRate}%`)
      recordTest('stats', 'Get Topic Attempt Stats', true, stats)
    } else {
      console.log('❌ Get topic attempt stats failed:', getTopicStatsResult.error)
      recordTest('stats', 'Get Topic Attempt Stats', false, getTopicStatsResult.error)
    }
  } else {
    console.log('⚠️  Skipping topic stats test (no topic ID)')
    recordTest('stats', 'Get Topic Attempt Stats', false, 'No topic ID available')
  }
  
  // Test 3: Filter attempts by result
  console.log('3. Filtering attempts by result...')
  const getPassedAttemptsResult = await makeRequest('GET', '/attempts?result=pass', null, authToken)
  if (getPassedAttemptsResult.success) {
    console.log('✅ Get passed attempts successful')
    console.log(`   Found ${getPassedAttemptsResult.data.data.attempts.length} passed attempts`)
    recordTest('stats', 'Filter Attempts by Result', true, { count: getPassedAttemptsResult.data.data.attempts.length })
  } else {
    console.log('❌ Get passed attempts failed:', getPassedAttemptsResult.error)
    recordTest('stats', 'Filter Attempts by Result', false, getPassedAttemptsResult.error)
  }
  
  console.log('')
}

async function testValidation() {
  console.log('🔍 Testing Validation...')
  
  // Test 1: Create attempt with missing topicId
  console.log('1. Creating attempt with missing topicId...')
  const missingTopicIdResult = await makeRequest('POST', '/attempts', {
    code: 'function test() {}',
    result: 'pass',
    timeTaken: 60
  }, authToken)
  if (!missingTopicIdResult.success && missingTopicIdResult.status === 400) {
    console.log('✅ Missing topicId validation (expected)')
    recordTest('validation', 'Missing Topic ID', true)
  } else {
    console.log('❌ Missing topicId validation failed:', missingTopicIdResult)
    recordTest('validation', 'Missing Topic ID', false, missingTopicIdResult)
  }
  
  // Test 2: Create attempt with missing code
  console.log('2. Creating attempt with missing code...')
  const missingCodeResult = await makeRequest('POST', '/attempts', {
    topicId: testTopicId,
    result: 'pass',
    timeTaken: 60
  }, authToken)
  if (!missingCodeResult.success && missingCodeResult.status === 400) {
    console.log('✅ Missing code validation (expected)')
    recordTest('validation', 'Missing Code', true)
  } else {
    console.log('❌ Missing code validation failed:', missingCodeResult)
    recordTest('validation', 'Missing Code', false, missingCodeResult)
  }
  
  // Test 3: Create attempt with invalid result
  console.log('3. Creating attempt with invalid result...')
  const invalidResultResult = await makeRequest('POST', '/attempts', {
    topicId: testTopicId,
    code: 'function test() {}',
    result: 'invalid',
    timeTaken: 60
  }, authToken)
  if (!invalidResultResult.success && invalidResultResult.status === 400) {
    console.log('✅ Invalid result validation (expected)')
    recordTest('validation', 'Invalid Result', true)
  } else {
    console.log('❌ Invalid result validation failed:', invalidResultResult)
    recordTest('validation', 'Invalid Result', false, invalidResultResult)
  }
  
  // Test 4: Create attempt with negative time
  console.log('4. Creating attempt with negative time...')
  const negativeTimeResult = await makeRequest('POST', '/attempts', {
    topicId: testTopicId,
    code: 'function test() {}',
    result: 'pass',
    timeTaken: -10
  }, authToken)
  if (!negativeTimeResult.success && negativeTimeResult.status === 400) {
    console.log('✅ Negative time validation (expected)')
    recordTest('validation', 'Negative Time', true)
  } else {
    console.log('❌ Negative time validation failed:', negativeTimeResult)
    recordTest('validation', 'Negative Time', false, negativeTimeResult)
  }
  
  // Test 5: Create attempt with non-existent topic
  console.log('5. Creating attempt with non-existent topic...')
  const nonExistentTopicResult = await makeRequest('POST', '/attempts', {
    topicId: 'non-existent-topic-id',
    code: 'function test() {}',
    result: 'pass',
    timeTaken: 60
  }, authToken)
  if (!nonExistentTopicResult.success && nonExistentTopicResult.status === 404) {
    console.log('✅ Non-existent topic validation (expected)')
    recordTest('validation', 'Non-existent Topic', true)
  } else {
    console.log('❌ Non-existent topic validation failed:', nonExistentTopicResult)
    recordTest('validation', 'Non-existent Topic', false, nonExistentTopicResult)
  }
  
  // Test 6: Get non-existent attempt
  console.log('6. Getting non-existent attempt...')
  const nonExistentAttemptResult = await makeRequest('GET', '/attempts/non-existent-id', null, authToken)
  if (!nonExistentAttemptResult.success && nonExistentAttemptResult.status === 404) {
    console.log('✅ Non-existent attempt validation (expected)')
    recordTest('validation', 'Non-existent Attempt', true)
  } else {
    console.log('❌ Non-existent attempt validation failed:', nonExistentAttemptResult)
    recordTest('validation', 'Non-existent Attempt', false, nonExistentAttemptResult)
  }
  
  console.log('')
}

async function testErrorHandling() {
  console.log('⚠️  Testing Error Handling...')
  
  // Test 1: Unauthorized access
  console.log('1. Testing unauthorized access...')
  const unauthorizedAttemptsResult = await makeRequest('GET', '/attempts')
  if (!unauthorizedAttemptsResult.success && unauthorizedAttemptsResult.status === 401) {
    console.log('✅ Unauthorized attempts access (expected)')
    recordTest('errorHandling', 'Unauthorized Attempts Access', true)
  } else {
    console.log('❌ Unauthorized attempts access failed:', unauthorizedAttemptsResult)
    recordTest('errorHandling', 'Unauthorized Attempts Access', false, unauthorizedAttemptsResult)
  }
  
  const unauthorizedStatsResult = await makeRequest('GET', '/attempts/stats')
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
    await testAttemptsCRUD()
    await testAttemptsStats()
    await testValidation()
    await testErrorHandling()
    
    console.log('🎉 Attempt API Tests Completed!')
    console.log('')
    console.log('📊 Test Summary:')
    console.log(`Total Tests: ${testResults.summary.totalTests}`)
    console.log(`✅ Passed: ${testResults.summary.passed}`)
    console.log(`❌ Failed: ${testResults.summary.failed}`)
    console.log(`📈 Success Rate: ${testResults.summary.successRate.toFixed(1)}%`)
    console.log('')
    console.log('🔗 Available Endpoints:')
    console.log('   GET    /api/attempts - Get user attempts')
    console.log('   POST   /api/attempts - Create attempt')
    console.log('   GET    /api/attempts/[id] - Get specific attempt')
    console.log('   PUT    /api/attempts/[id] - Update attempt')
    console.log('   DELETE /api/attempts/[id] - Delete attempt')
    console.log('   GET    /api/attempts/stats - Get attempt statistics')
    
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