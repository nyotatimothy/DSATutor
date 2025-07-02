require('dotenv').config()
const axios = require('axios')
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

const BASE_URL = 'http://localhost:3000/api'
let authToken = null
let adminToken = null
let testCourseId = null
let testTopicId = null

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
    courses: [],
    topics: [],
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

const testAdmin = {
  email: `admin-${Date.now()}@example.com`,
  password: 'AdminPassword123!',
  fullName: 'Test Admin'
}

const testCourse = {
  title: 'Test Course',
  description: 'This is a test course for DSA'
}

const testTopic = {
  title: 'Test Topic',
  position: 1,
  content: 'This is the content of the test topic'
}

console.log('🚀 Starting Course & Topic API Tests...')
console.log(`📧 Test User Email: ${testUser.email}`)
console.log(`👤 Test Admin Email: ${testAdmin.email}`)
console.log(`📚 Test Course: ${testCourse.title}`)
console.log(`📖 Test Topic: ${testTopic.title}`)
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

async function testAuth() {
  console.log('🔐 Testing Authentication...')
  
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
  
  // Create admin user
  console.log('3. Creating admin user...')
  const adminSignupResult = await makeRequest('POST', '/auth/signup-new', testAdmin)
  if (adminSignupResult.success) {
    console.log('✅ Admin user created')
    recordTest('authentication', 'Create Admin User', true)
  } else {
    console.log('❌ Admin user creation failed:', adminSignupResult.error)
    recordTest('authentication', 'Create Admin User', false, adminSignupResult.error)
  }
  
  // Login admin user
  console.log('4. Logging in admin user...')
  const adminLoginResult = await makeRequest('POST', '/auth/login-new', {
    email: testAdmin.email,
    password: testAdmin.password
  })
  if (adminLoginResult.success) {
    adminToken = adminLoginResult.data.data.token
    console.log('✅ Admin user logged in')
    recordTest('authentication', 'Login Admin User', true)
  } else {
    console.log('❌ Admin user login failed:', adminLoginResult.error)
    recordTest('authentication', 'Login Admin User', false, adminLoginResult.error)
  }
  
  console.log('')
}

async function setAdminRole() {
  // Set the admin user to role: 'ADMIN' after creation
  await prisma.user.update({
    where: { email: testAdmin.email },
    data: { role: 'ADMIN' }
  })
}

async function testCourses() {
  console.log('📚 Testing Course APIs...')
  
  // Test 1: Get courses (empty)
  console.log('1. Getting courses (empty)...')
  const getCoursesResult = await makeRequest('GET', '/courses')
  if (getCoursesResult.success) {
    console.log('✅ Get courses successful')
    console.log(`   Found ${getCoursesResult.data.data.courses.length} courses`)
    recordTest('courses', 'Get Courses (Empty)', true, { count: getCoursesResult.data.data.courses.length })
  } else {
    console.log('❌ Get courses failed:', getCoursesResult.error)
    recordTest('courses', 'Get Courses (Empty)', false, getCoursesResult.error)
  }
  
  // Test 2: Create course (unauthorized)
  console.log('2. Creating course (unauthorized)...')
  const createCourseUnauthorizedResult = await makeRequest('POST', '/courses', testCourse, authToken)
  if (!createCourseUnauthorizedResult.success && createCourseUnauthorizedResult.status === 403) {
    console.log('✅ Create course unauthorized (expected)')
    recordTest('courses', 'Create Course (Unauthorized)', true)
  } else {
    console.log('❌ Create course unauthorized test failed:', createCourseUnauthorizedResult)
    recordTest('courses', 'Create Course (Unauthorized)', false, createCourseUnauthorizedResult)
  }
  
  // Test 3: Create course (admin)
  console.log('3. Creating course (admin)...')
  const createCourseResult = await makeRequest('POST', '/courses', testCourse, adminToken)
  if (createCourseResult.success) {
    testCourseId = createCourseResult.data.data.course.id
    console.log('✅ Course created successfully')
    console.log(`   Course ID: ${testCourseId}`)
    recordTest('courses', 'Create Course (Admin)', true, { courseId: testCourseId })
  } else {
    console.log('❌ Create course failed:', createCourseResult.error)
    recordTest('courses', 'Create Course (Admin)', false, createCourseResult.error)
  }
  
  // Test 4: Get courses (with data)
  console.log('4. Getting courses (with data)...')
  const getCoursesWithDataResult = await makeRequest('GET', '/courses')
  if (getCoursesWithDataResult.success) {
    console.log('✅ Get courses successful')
    console.log(`   Found ${getCoursesWithDataResult.data.data.courses.length} courses`)
    recordTest('courses', 'Get Courses (With Data)', true, { count: getCoursesWithDataResult.data.data.courses.length })
  } else {
    console.log('❌ Get courses failed:', getCoursesWithDataResult.error)
    recordTest('courses', 'Get Courses (With Data)', false, getCoursesWithDataResult.error)
  }
  
  // Test 5: Get single course
  console.log('5. Getting single course...')
  if (testCourseId) {
    const getCourseResult = await makeRequest('GET', `/courses/${testCourseId}`)
    if (getCourseResult.success) {
      console.log('✅ Get single course successful')
      console.log(`   Course: ${getCourseResult.data.data.course.title}`)
      recordTest('courses', 'Get Single Course', true, { title: getCourseResult.data.data.course.title })
    } else {
      console.log('❌ Get single course failed:', getCourseResult.error)
      recordTest('courses', 'Get Single Course', false, getCourseResult.error)
    }
  } else {
    console.log('⚠️  Skipping get single course (no course ID)')
    recordTest('courses', 'Get Single Course', false, 'No course ID available')
  }
  
  // Test 6: Update course (unauthorized)
  console.log('6. Updating course (unauthorized)...')
  if (testCourseId) {
    const updateCourseUnauthorizedResult = await makeRequest('PUT', `/courses/${testCourseId}`, {
      title: 'Updated Course Title'
    }, authToken)
    if (!updateCourseUnauthorizedResult.success && updateCourseUnauthorizedResult.status === 403) {
      console.log('✅ Update course unauthorized (expected)')
      recordTest('courses', 'Update Course (Unauthorized)', true)
    } else {
      console.log('❌ Update course unauthorized test failed:', updateCourseUnauthorizedResult)
      recordTest('courses', 'Update Course (Unauthorized)', false, updateCourseUnauthorizedResult)
    }
  } else {
    console.log('⚠️  Skipping update course unauthorized (no course ID)')
    recordTest('courses', 'Update Course (Unauthorized)', false, 'No course ID available')
  }
  
  // Test 7: Update course (admin)
  console.log('7. Updating course (admin)...')
  if (testCourseId) {
    const updateCourseResult = await makeRequest('PUT', `/courses/${testCourseId}`, {
      title: 'Updated Course Title'
    }, adminToken)
    if (updateCourseResult.success) {
      console.log('✅ Course updated successfully')
      console.log(`   New title: ${updateCourseResult.data.data.course.title}`)
      recordTest('courses', 'Update Course (Admin)', true, { newTitle: updateCourseResult.data.data.course.title })
    } else {
      console.log('❌ Update course failed:', updateCourseResult.error)
      recordTest('courses', 'Update Course (Admin)', false, updateCourseResult.error)
    }
  } else {
    console.log('⚠️  Skipping update course (no course ID)')
    recordTest('courses', 'Update Course (Admin)', false, 'No course ID available')
  }
  
  // Test 8: Get courses (no filtering since we removed difficulty and isPublished)
  console.log('8. Getting courses...')
  const getCoursesFinalResult = await makeRequest('GET', '/courses')
  if (getCoursesFinalResult.success) {
    console.log('✅ Get courses successful')
    console.log(`   Found ${getCoursesFinalResult.data.data.courses.length} courses`)
    recordTest('courses', 'Get Courses (Final)', true, { count: getCoursesFinalResult.data.data.courses.length })
  } else {
    console.log('❌ Get courses failed:', getCoursesFinalResult.error)
    recordTest('courses', 'Get Courses (Final)', false, getCoursesFinalResult.error)
  }
  
  console.log('')
}

async function testTopics() {
  console.log('📖 Testing Topic APIs...')
  
  if (!testCourseId) {
    console.log('⚠️  Skipping topic tests (no course ID)')
    recordTest('topics', 'All Topic Tests', false, 'No course ID available')
    console.log('')
    return
  }
  
  // Test 1: Get topics (empty)
  console.log('1. Getting topics (empty)...')
  const getTopicsResult = await makeRequest('GET', `/topics?courseId=${testCourseId}`)
  if (getTopicsResult.success) {
    console.log('✅ Get topics successful')
    console.log(`   Found ${getTopicsResult.data.data.topics.length} topics`)
    recordTest('topics', 'Get Topics (Empty)', true, { count: getTopicsResult.data.data.topics.length })
  } else {
    console.log('❌ Get topics failed:', getTopicsResult.error)
    recordTest('topics', 'Get Topics (Empty)', false, getTopicsResult.error)
  }
  
  // Test 2: Create topic (unauthorized)
  console.log('2. Creating topic (unauthorized)...')
  const createTopicUnauthorizedResult = await makeRequest('POST', '/topics', {
    ...testTopic,
    courseId: testCourseId
  }, authToken)
  if (!createTopicUnauthorizedResult.success && createTopicUnauthorizedResult.status === 403) {
    console.log('✅ Create topic unauthorized (expected)')
    recordTest('topics', 'Create Topic (Unauthorized)', true)
  } else {
    console.log('❌ Create topic unauthorized test failed:', createTopicUnauthorizedResult)
    recordTest('topics', 'Create Topic (Unauthorized)', false, createTopicUnauthorizedResult)
  }
  
  // Test 3: Create topic (admin)
  console.log('3. Creating topic (admin)...')
  const createTopicResult = await makeRequest('POST', '/topics', {
    ...testTopic,
    courseId: testCourseId
  }, adminToken)
  if (createTopicResult.success) {
    testTopicId = createTopicResult.data.data.topic.id
    console.log('✅ Topic created successfully')
    console.log(`   Topic ID: ${testTopicId}`)
    recordTest('topics', 'Create Topic (Admin)', true, { topicId: testTopicId })
  } else {
    console.log('❌ Create topic failed:', createTopicResult.error)
    recordTest('topics', 'Create Topic (Admin)', false, createTopicResult.error)
  }
  
  // Test 4: Get topics (with data)
  console.log('4. Getting topics (with data)...')
  const getTopicsWithDataResult = await makeRequest('GET', `/topics?courseId=${testCourseId}`)
  if (getTopicsWithDataResult.success) {
    console.log('✅ Get topics successful')
    console.log(`   Found ${getTopicsWithDataResult.data.data.topics.length} topics`)
    recordTest('topics', 'Get Topics (With Data)', true, { count: getTopicsWithDataResult.data.data.topics.length })
  } else {
    console.log('❌ Get topics failed:', getTopicsWithDataResult.error)
    recordTest('topics', 'Get Topics (With Data)', false, getTopicsWithDataResult.error)
  }
  
  // Test 5: Get single topic
  console.log('5. Getting single topic...')
  if (testTopicId) {
    const getTopicResult = await makeRequest('GET', `/topics/${testTopicId}`)
    if (getTopicResult.success) {
      console.log('✅ Get single topic successful')
      console.log(`   Topic: ${getTopicResult.data.data.topic.title}`)
      recordTest('topics', 'Get Single Topic', true, { title: getTopicResult.data.data.topic.title })
    } else {
      console.log('❌ Get single topic failed:', getTopicResult.error)
      recordTest('topics', 'Get Single Topic', false, getTopicResult.error)
    }
  } else {
    console.log('⚠️  Skipping get single topic (no topic ID)')
    recordTest('topics', 'Get Single Topic', false, 'No topic ID available')
  }
  
  // Test 6: Update topic (unauthorized)
  console.log('6. Updating topic (unauthorized)...')
  if (testTopicId) {
    const updateTopicUnauthorizedResult = await makeRequest('PUT', `/topics/${testTopicId}`, {
      title: 'Updated Topic Title'
    }, authToken)
    if (!updateTopicUnauthorizedResult.success && updateTopicUnauthorizedResult.status === 403) {
      console.log('✅ Update topic unauthorized (expected)')
      recordTest('topics', 'Update Topic (Unauthorized)', true)
    } else {
      console.log('❌ Update topic unauthorized test failed:', updateTopicUnauthorizedResult)
      recordTest('topics', 'Update Topic (Unauthorized)', false, updateTopicUnauthorizedResult)
    }
  } else {
    console.log('⚠️  Skipping update topic unauthorized (no topic ID)')
    recordTest('topics', 'Update Topic (Unauthorized)', false, 'No topic ID available')
  }
  
  // Test 7: Update topic (admin)
  console.log('7. Updating topic (admin)...')
  if (testTopicId) {
    const updateTopicResult = await makeRequest('PUT', `/topics/${testTopicId}`, {
      title: 'Updated Topic Title'
    }, adminToken)
    if (updateTopicResult.success) {
      console.log('✅ Topic updated successfully')
      console.log(`   New title: ${updateTopicResult.data.data.topic.title}`)
      recordTest('topics', 'Update Topic (Admin)', true, { newTitle: updateTopicResult.data.data.topic.title })
    } else {
      console.log('❌ Update topic failed:', updateTopicResult.error)
      recordTest('topics', 'Update Topic (Admin)', false, updateTopicResult.error)
    }
  } else {
    console.log('⚠️  Skipping update topic (no topic ID)')
    recordTest('topics', 'Update Topic (Admin)', false, 'No topic ID available')
  }
  
  // Test 8: Create second topic for reordering
  console.log('8. Creating second topic...')
  const createSecondTopicResult = await makeRequest('POST', '/topics', {
    ...testTopic,
    title: 'Second Topic',
    position: 2,
    courseId: testCourseId
  }, adminToken)
  if (createSecondTopicResult.success) {
    const secondTopicId = createSecondTopicResult.data.data.topic.id
    console.log('✅ Second topic created successfully')
    recordTest('topics', 'Create Second Topic', true, { topicId: secondTopicId })
    
    // Test 9: Reorder topics
    console.log('9. Reordering topics...')
    const reorderTopicsResult = await makeRequest('POST', '/topics/reorder', {
      courseId: testCourseId,
      topicPositions: [
        { id: secondTopicId, position: 1 },
        { id: testTopicId, position: 2 }
      ]
    }, adminToken)
    if (reorderTopicsResult.success) {
      console.log('✅ Topics reordered successfully')
      recordTest('topics', 'Reorder Topics', true)
    } else {
      console.log('❌ Reorder topics failed:', reorderTopicsResult.error)
      recordTest('topics', 'Reorder Topics', false, reorderTopicsResult.error)
    }
  } else {
    console.log('❌ Create second topic failed:', createSecondTopicResult.error)
    recordTest('topics', 'Create Second Topic', false, createSecondTopicResult.error)
  }
  
  // Test 10: Get topics (no filtering needed since we removed isPublished)
  console.log('10. Getting topics...')
  const getTopicsFinalResult = await makeRequest('GET', `/topics?courseId=${testCourseId}`)
  if (getTopicsFinalResult.success) {
    console.log('✅ Get topics successful')
    console.log(`   Found ${getTopicsFinalResult.data.data.topics.length} topics`)
    recordTest('topics', 'Get Topics (Final)', true, { count: getTopicsFinalResult.data.data.topics.length })
  } else {
    console.log('❌ Get topics failed:', getTopicsFinalResult.error)
    recordTest('topics', 'Get Topics (Final)', false, getTopicsFinalResult.error)
  }
  
  console.log('')
}

async function testValidation() {
  console.log('🔍 Testing Validation...')
  
  // Test 1: Create course with missing title
  console.log('1. Creating course with missing title...')
  const missingTitleResult = await makeRequest('POST', '/courses', {
    description: 'This is a test course'
  }, adminToken)
  if (!missingTitleResult.success && missingTitleResult.status === 400) {
    console.log('✅ Missing title validation (expected)')
    recordTest('validation', 'Missing Course Title', true)
  } else {
    console.log('❌ Missing title validation failed:', missingTitleResult)
    recordTest('validation', 'Missing Course Title', false, missingTitleResult)
  }
  
  // Test 2: Create course with missing description
  console.log('2. Creating course with missing description...')
  const missingDescriptionResult = await makeRequest('POST', '/courses', {
    title: 'Test Course'
  }, adminToken)
  if (!missingDescriptionResult.success && missingDescriptionResult.status === 400) {
    console.log('✅ Missing description validation (expected)')
    recordTest('validation', 'Missing Course Description', true)
  } else {
    console.log('❌ Missing description validation failed:', missingDescriptionResult)
    recordTest('validation', 'Missing Course Description', false, missingDescriptionResult)
  }
  
  // Test 3: Create topic with invalid position
  console.log('3. Creating topic with invalid position...')
  if (testCourseId) {
    const invalidPositionResult = await makeRequest('POST', '/topics', {
      ...testTopic,
      courseId: testCourseId,
      position: 2000
    }, adminToken)
    if (!invalidPositionResult.success && invalidPositionResult.status === 400) {
      console.log('✅ Invalid position validation (expected)')
      recordTest('validation', 'Invalid Topic Position', true)
    } else {
      console.log('❌ Invalid position validation failed:', invalidPositionResult)
      recordTest('validation', 'Invalid Topic Position', false, invalidPositionResult)
    }
  } else {
    console.log('⚠️  Skipping invalid position test (no course ID)')
    recordTest('validation', 'Invalid Topic Position', false, 'No course ID available')
  }
  
  // Test 4: Get non-existent course
  console.log('4. Getting non-existent course...')
  const nonExistentCourseResult = await makeRequest('GET', '/courses/non-existent-id')
  if (!nonExistentCourseResult.success && nonExistentCourseResult.status === 404) {
    console.log('✅ Non-existent course validation (expected)')
    recordTest('validation', 'Non-existent Course', true)
  } else {
    console.log('❌ Non-existent course validation failed:', nonExistentCourseResult)
    recordTest('validation', 'Non-existent Course', false, nonExistentCourseResult)
  }
  
  // Test 5: Get non-existent topic
  console.log('5. Getting non-existent topic...')
  const nonExistentTopicResult = await makeRequest('GET', '/topics/non-existent-id')
  if (!nonExistentTopicResult.success && nonExistentTopicResult.status === 404) {
    console.log('✅ Non-existent topic validation (expected)')
    recordTest('validation', 'Non-existent Topic', true)
  } else {
    console.log('❌ Non-existent topic validation failed:', nonExistentTopicResult)
    recordTest('validation', 'Non-existent Topic', false, nonExistentTopicResult)
  }
  
  console.log('')
}

async function testErrorHandling() {
  console.log('⚠️  Testing Error Handling...')
  
  // Test 1: Invalid HTTP methods
  console.log('1. Testing invalid HTTP methods...')
  const invalidMethodCourseResult = await makeRequest('PATCH', '/courses')
  if (!invalidMethodCourseResult.success && invalidMethodCourseResult.status === 405) {
    console.log('✅ Invalid method course (expected)')
    recordTest('errorHandling', 'Invalid HTTP Method (Course)', true)
  } else {
    console.log('❌ Invalid method course failed:', invalidMethodCourseResult)
    recordTest('errorHandling', 'Invalid HTTP Method (Course)', false, invalidMethodCourseResult)
  }
  
  const invalidMethodTopicResult = await makeRequest('PATCH', '/topics')
  if (!invalidMethodTopicResult.success && invalidMethodTopicResult.status === 405) {
    console.log('✅ Invalid method topic (expected)')
    recordTest('errorHandling', 'Invalid HTTP Method (Topic)', true)
  } else {
    console.log('❌ Invalid method topic failed:', invalidMethodTopicResult)
    recordTest('errorHandling', 'Invalid HTTP Method (Topic)', false, invalidMethodTopicResult)
  }
  
  // Test 2: Missing required fields
  console.log('2. Testing missing required fields...')
  const missingFieldsCourseResult = await makeRequest('POST', '/courses', {
    title: 'Test Course'
    // Missing description
  }, adminToken)
  if (!missingFieldsCourseResult.success && missingFieldsCourseResult.status === 400) {
    console.log('✅ Missing fields course (expected)')
    recordTest('errorHandling', 'Missing Required Fields (Course)', true)
  } else {
    console.log('❌ Missing fields course failed:', missingFieldsCourseResult)
    recordTest('errorHandling', 'Missing Required Fields (Course)', false, missingFieldsCourseResult)
  }
  
  if (testCourseId) {
    const missingFieldsTopicResult = await makeRequest('POST', '/topics', {
      title: 'Test Topic'
      // Missing courseId, position, and content
    }, adminToken)
    if (!missingFieldsTopicResult.success && missingFieldsTopicResult.status === 400) {
      console.log('✅ Missing fields topic (expected)')
      recordTest('errorHandling', 'Missing Required Fields (Topic)', true)
    } else {
      console.log('❌ Missing fields topic failed:', missingFieldsTopicResult)
      recordTest('errorHandling', 'Missing Required Fields (Topic)', false, missingFieldsTopicResult)
    }
  } else {
    console.log('⚠️  Skipping missing fields topic test (no course ID)')
    recordTest('errorHandling', 'Missing Required Fields (Topic)', false, 'No course ID available')
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
    await testAuth()
    await setAdminRole()
    await testCourses()
    await testTopics()
    await testValidation()
    await testErrorHandling()
    
    console.log('🎉 Course & Topic API Tests Completed!')
    console.log('')
    console.log('📊 Test Summary:')
    console.log(`Total Tests: ${testResults.summary.totalTests}`)
    console.log(`✅ Passed: ${testResults.summary.passed}`)
    console.log(`❌ Failed: ${testResults.summary.failed}`)
    console.log(`📈 Success Rate: ${testResults.summary.successRate.toFixed(1)}%`)
    console.log('')
    console.log('🔗 Available Endpoints:')
    console.log('   GET    /api/courses - List courses')
    console.log('   POST   /api/courses - Create course (admin only)')
    console.log('   GET    /api/courses/[id] - Get single course')
    console.log('   PUT    /api/courses/[id] - Update course (admin only)')
    console.log('   DELETE /api/courses/[id] - Delete course (admin only)')
    console.log('   GET    /api/topics - List topics for course')
    console.log('   POST   /api/topics - Create topic (admin only)')
    console.log('   GET    /api/topics/[id] - Get single topic')
    console.log('   PUT    /api/topics/[id] - Update topic (admin only)')
    console.log('   DELETE /api/topics/[id] - Delete topic (admin only)')
    console.log('   POST   /api/topics/reorder - Reorder topics (admin only)')
    
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