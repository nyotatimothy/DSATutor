require('dotenv').config()
const axios = require('axios')
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

const BASE_URL = 'http://localhost:3000/api'
let authToken = null
let testCourseId = null
let testTopicId = null
let testProgressId = null

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
    progress: [],
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

const testProgress = {
  topicId: null, // Will be set after topic creation
  status: 'in_progress'
}

console.log('🚀 Starting Progress API Tests...')
console.log(`📧 Test User Email: ${testUser.email}`)
console.log(`📊 Test Progress Status: ${testProgress.status}`)
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
  
  // Get existing course
  console.log('3. Getting existing course...')
  const getCoursesResult = await makeRequest('GET', '/courses', null, authToken)
  if (getCoursesResult.success && getCoursesResult.data.data.courses.length > 0) {
    testCourseId = getCoursesResult.data.data.courses[0].id
    console.log('✅ Using existing course')
    console.log(`   Course ID: ${testCourseId}`)
    recordTest('authentication', 'Get Existing Course', true)
  } else {
    console.log('❌ Failed to get existing course:', getCoursesResult.error)
    recordTest('authentication', 'Get Existing Course', false, getCoursesResult.error)
  }
  
  // Get existing topic
  console.log('4. Getting existing topic...')
  if (testCourseId) {
    const getTopicsResult = await makeRequest('GET', `/topics?courseId=${testCourseId}`, null, authToken)
    if (getTopicsResult.success && getTopicsResult.data.data.topics.length > 0) {
      testTopicId = getTopicsResult.data.data.topics[0].id
      testProgress.topicId = testTopicId
      console.log('✅ Using existing topic')
      console.log(`   Topic ID: ${testTopicId}`)
      recordTest('authentication', 'Get Existing Topic', true)
    } else {
      console.log('❌ Failed to get existing topic:', getTopicsResult.error)
      recordTest('authentication', 'Get Existing Topic', false, getTopicsResult.error)
    }
  } else {
    console.log('⚠️  Skipping topic retrieval (no course ID)')
    recordTest('authentication', 'Get Existing Topic', false, 'No course ID available')
  }
  
  console.log('')
}

async function testProgressCRUD() {
  console.log('📊 Testing Progress CRUD Operations...')
  
  if (!testTopicId) {
    console.log('⚠️  Skipping progress tests (no topic ID)')
    recordTest('progress', 'All Progress Tests', false, 'No topic ID available')
    console.log('')
    return
  }
  
  // Test 1: Get progress (empty)
  console.log('1. Getting progress (empty)...')
  const getProgressResult = await makeRequest('GET', '/progress', null, authToken)
  if (getProgressResult.success) {
    console.log('✅ Get progress successful')
    console.log(`   Found ${getProgressResult.data.data.progress.length} progress entries`)
    recordTest('progress', 'Get Progress (Empty)', true, { count: getProgressResult.data.data.progress.length })
  } else {
    console.log('❌ Get progress failed:', getProgressResult.error)
    recordTest('progress', 'Get Progress (Empty)', false, getProgressResult.error)
  }
  
  // Test 2: Create progress
  console.log('2. Creating progress...')
  const createProgressResult = await makeRequest('POST', '/progress', testProgress, authToken)
  if (createProgressResult.success) {
    testProgressId = createProgressResult.data.data.progress.id
    console.log('✅ Progress created successfully')
    console.log(`   Progress ID: ${testProgressId}`)
    recordTest('progress', 'Create Progress', true, { progressId: testProgressId })
  } else {
    console.log('❌ Create progress failed:', createProgressResult.error)
    recordTest('progress', 'Create Progress', false, createProgressResult.error)
  }
  
  // Test 3: Get progress (with data)
  console.log('3. Getting progress (with data)...')
  const getProgressWithDataResult = await makeRequest('GET', '/progress', null, authToken)
  if (getProgressWithDataResult.success) {
    console.log('✅ Get progress successful')
    console.log(`   Found ${getProgressWithDataResult.data.data.progress.length} progress entries`)
    recordTest('progress', 'Get Progress (With Data)', true, { count: getProgressWithDataResult.data.data.progress.length })
  } else {
    console.log('❌ Get progress failed:', getProgressWithDataResult.error)
    recordTest('progress', 'Get Progress (With Data)', false, getProgressWithDataResult.error)
  }
  
  // Test 4: Get specific progress
  console.log('4. Getting specific progress...')
  if (testProgressId) {
    const getSpecificProgressResult = await makeRequest('GET', `/progress/${testProgressId}`, null, authToken)
    if (getSpecificProgressResult.success) {
      console.log('✅ Get specific progress successful')
      console.log(`   Status: ${getSpecificProgressResult.data.data.progress.status}`)
      recordTest('progress', 'Get Specific Progress', true, { status: getSpecificProgressResult.data.data.progress.status })
    } else {
      console.log('❌ Get specific progress failed:', getSpecificProgressResult.error)
      recordTest('progress', 'Get Specific Progress', false, getSpecificProgressResult.error)
    }
  } else {
    console.log('⚠️  Skipping get specific progress (no progress ID)')
    recordTest('progress', 'Get Specific Progress', false, 'No progress ID available')
  }
  
  // Test 5: Update progress
  console.log('5. Updating progress...')
  if (testProgressId) {
    const updateProgressResult = await makeRequest('PUT', `/progress/${testProgressId}`, {
      status: 'complete'
    }, authToken)
    if (updateProgressResult.success) {
      console.log('✅ Progress updated successfully')
      console.log(`   New status: ${updateProgressResult.data.data.progress.status}`)
      recordTest('progress', 'Update Progress', true, { 
        status: updateProgressResult.data.data.progress.status
      })
    } else {
      console.log('❌ Update progress failed:', updateProgressResult.error)
      recordTest('progress', 'Update Progress', false, updateProgressResult.error)
    }
  } else {
    console.log('⚠️  Skipping update progress (no progress ID)')
    recordTest('progress', 'Update Progress', false, 'No progress ID available')
  }
  
  // Test 6: Create progress for same topic (should update existing)
  console.log('6. Creating progress for same topic (should update)...')
  const createProgressUpdateResult = await makeRequest('POST', '/progress', {
    topicId: testTopicId,
    status: 'in_progress'
  }, authToken)
  if (createProgressUpdateResult.success) {
    console.log('✅ Progress updated via create (upsert)')
          console.log(`   Status: ${createProgressUpdateResult.data.data.progress.status}`)
      recordTest('progress', 'Create Progress (Upsert)', true, { 
        status: createProgressUpdateResult.data.data.progress.status
      })
  } else {
    console.log('❌ Create progress upsert failed:', createProgressUpdateResult.error)
    recordTest('progress', 'Create Progress (Upsert)', false, createProgressUpdateResult.error)
  }
  
  console.log('')
}

async function testProgressStats() {
  console.log('📈 Testing Progress Statistics...')
  
  // Test 1: Get progress stats
  console.log('1. Getting progress stats...')
  const getStatsResult = await makeRequest('GET', '/progress/stats', null, authToken)
  if (getStatsResult.success) {
    console.log('✅ Get progress stats successful')
    const stats = getStatsResult.data.data.stats
    console.log(`   Total Topics: ${stats.totalTopics}`)
    console.log(`   Completed: ${stats.completedTopics}`)
    console.log(`   In Progress: ${stats.inProgressTopics}`)
    console.log(`   Not Started: ${stats.notStartedTopics}`)
    console.log(`   Completion Rate: ${stats.completionRate.toFixed(1)}%`)
    recordTest('stats', 'Get Progress Stats', true, stats)
  } else {
    console.log('❌ Get progress stats failed:', getStatsResult.error)
    recordTest('stats', 'Get Progress Stats', false, getStatsResult.error)
  }
  
  // Test 2: Get progress stats for specific course
  console.log('2. Getting progress stats for specific course...')
  if (testCourseId) {
    const getCourseStatsResult = await makeRequest('GET', `/progress/stats?courseId=${testCourseId}`, null, authToken)
    if (getCourseStatsResult.success) {
      console.log('✅ Get course progress stats successful')
      const stats = getCourseStatsResult.data.data.stats
      console.log(`   Total Topics: ${stats.totalTopics}`)
      console.log(`   Completion Rate: ${stats.completionRate.toFixed(1)}%`)
      recordTest('stats', 'Get Course Progress Stats', true, stats)
    } else {
      console.log('❌ Get course progress stats failed:', getCourseStatsResult.error)
      recordTest('stats', 'Get Course Progress Stats', false, getCourseStatsResult.error)
    }
  } else {
    console.log('⚠️  Skipping course stats test (no course ID)')
    recordTest('stats', 'Get Course Progress Stats', false, 'No course ID available')
  }
  
  console.log('')
}

async function testValidation() {
  console.log('🔍 Testing Validation...')
  
  // Test 1: Create progress with missing topicId
  console.log('1. Creating progress with missing topicId...')
  const missingTopicIdResult = await makeRequest('POST', '/progress', {
    status: 'in_progress'
  }, authToken)
  if (!missingTopicIdResult.success && missingTopicIdResult.status === 400) {
    console.log('✅ Missing topicId validation (expected)')
    recordTest('validation', 'Missing Topic ID', true)
  } else {
    console.log('❌ Missing topicId validation failed:', missingTopicIdResult)
    recordTest('validation', 'Missing Topic ID', false, missingTopicIdResult)
  }
  
  // Test 2: Create progress with invalid status
  console.log('2. Creating progress with invalid status...')
  const invalidStatusResult = await makeRequest('POST', '/progress', {
    topicId: testTopicId,
    status: 'INVALID_STATUS'
  }, authToken)
  if (!invalidStatusResult.success && invalidStatusResult.status === 400) {
    console.log('✅ Invalid status validation (expected)')
    recordTest('validation', 'Invalid Status', true)
  } else {
    console.log('❌ Invalid status validation failed:', invalidStatusResult)
    recordTest('validation', 'Invalid Status', false, invalidStatusResult)
  }
  
  // Test 3: Create progress with non-existent topic
  console.log('3. Creating progress with non-existent topic...')
  const nonExistentTopicResult = await makeRequest('POST', '/progress', {
    topicId: 'non-existent-topic-id',
    status: 'in_progress'
  }, authToken)
  if (!nonExistentTopicResult.success && nonExistentTopicResult.status === 404) {
    console.log('✅ Non-existent topic validation (expected)')
    recordTest('validation', 'Non-existent Topic', true)
  } else {
    console.log('❌ Non-existent topic validation failed:', nonExistentTopicResult)
    recordTest('validation', 'Non-existent Topic', false, nonExistentTopicResult)
  }
  
  // Test 4: Get non-existent progress
  console.log('4. Getting non-existent progress...')
  const nonExistentProgressResult = await makeRequest('GET', '/progress/non-existent-id', null, authToken)
  if (!nonExistentProgressResult.success && nonExistentProgressResult.status === 404) {
    console.log('✅ Non-existent progress validation (expected)')
    recordTest('validation', 'Non-existent Progress', true)
  } else {
    console.log('❌ Non-existent progress validation failed:', nonExistentProgressResult)
    recordTest('validation', 'Non-existent Progress', false, nonExistentProgressResult)
  }
  
  console.log('')
}

async function testErrorHandling() {
  console.log('⚠️  Testing Error Handling...')
  
  // Test 1: Invalid HTTP methods
  console.log('1. Testing invalid HTTP methods...')
  const invalidMethodProgressResult = await makeRequest('PATCH', '/progress')
  if (!invalidMethodProgressResult.success && invalidMethodProgressResult.status === 405) {
    console.log('✅ Invalid method progress (expected)')
    recordTest('errorHandling', 'Invalid HTTP Method (Progress)', true)
  } else {
    console.log('❌ Invalid method progress failed:', invalidMethodProgressResult)
    recordTest('errorHandling', 'Invalid HTTP Method (Progress)', false, invalidMethodProgressResult)
  }
  
  const invalidMethodStatsResult = await makeRequest('POST', '/progress/stats')
  if (!invalidMethodStatsResult.success && invalidMethodStatsResult.status === 405) {
    console.log('✅ Invalid method stats (expected)')
    recordTest('errorHandling', 'Invalid HTTP Method (Stats)', true)
  } else {
    console.log('❌ Invalid method stats failed:', invalidMethodStatsResult)
    recordTest('errorHandling', 'Invalid HTTP Method (Stats)', false, invalidMethodStatsResult)
  }
  
  // Test 2: Unauthorized access
  console.log('2. Testing unauthorized access...')
  const unauthorizedProgressResult = await makeRequest('GET', '/progress')
  if (!unauthorizedProgressResult.success && unauthorizedProgressResult.status === 401) {
    console.log('✅ Unauthorized progress access (expected)')
    recordTest('errorHandling', 'Unauthorized Progress Access', true)
  } else {
    console.log('❌ Unauthorized progress access failed:', unauthorizedProgressResult)
    recordTest('errorHandling', 'Unauthorized Progress Access', false, unauthorizedProgressResult)
  }
  
  const unauthorizedStatsResult = await makeRequest('GET', '/progress/stats')
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
    await testProgressCRUD()
    await testProgressStats()
    await testValidation()
    await testErrorHandling()
    
    console.log('🎉 Progress API Tests Completed!')
    console.log('')
    console.log('📊 Test Summary:')
    console.log(`Total Tests: ${testResults.summary.totalTests}`)
    console.log(`✅ Passed: ${testResults.summary.passed}`)
    console.log(`❌ Failed: ${testResults.summary.failed}`)
    console.log(`📈 Success Rate: ${testResults.summary.successRate.toFixed(1)}%`)
    console.log('')
    console.log('🔗 Available Endpoints:')
    console.log('   GET    /api/progress - Get user progress')
    console.log('   POST   /api/progress - Create/update progress')
    console.log('   GET    /api/progress/[id] - Get specific progress')
    console.log('   PUT    /api/progress/[id] - Update progress')
    console.log('   DELETE /api/progress/[id] - Delete progress')
    console.log('   GET    /api/progress/stats - Get progress statistics')
    
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