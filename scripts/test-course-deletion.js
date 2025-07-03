const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'
const SUPER_ADMIN_EMAIL = 'superadmin@example.com'
const SUPER_ADMIN_PASSWORD = 'TestPassword123!'

let authToken = null
let testCourseId = null

// Helper function to make authenticated requests
const makeAuthRequest = async (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  }
  
  if (data) {
    config.data = data
  }
  
  return axios(config)
}

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
}

const logTest = (testName, success, error = null, details = null) => {
  const result = { testName, success, error: error?.message || null, details }
  testResults.tests.push(result)
  
  if (success) {
    testResults.passed++
    console.log(`✅ ${testName}`)
    if (details) {
      console.log(`   ${details}`)
    }
  } else {
    testResults.failed++
    console.log(`❌ ${testName}: ${error?.message || 'Unknown error'}`)
  }
}

// Authentication
const authenticateSuperAdmin = async () => {
  try {
    console.log('\n🔐 Authenticating super admin...')
    
    const response = await axios.post(`${BASE_URL}/auth/login-new`, {
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD
    })
    
    if (response.data.success) {
      authToken = response.data.data.token
      logTest('Super Admin Authentication', true)
      return true
    } else {
      logTest('Super Admin Authentication', false, new Error('Login failed'))
      return false
    }
  } catch (error) {
    logTest('Super Admin Authentication', false, error)
    return false
  }
}

// Create a test course
const createTestCourse = async () => {
  try {
    console.log('\n📚 Creating test course...')
    
    // First, create a test user to be the course creator
    const userResponse = await axios.post(`${BASE_URL}/auth/signup-new`, {
      email: `test-creator-${Date.now()}@example.com`,
      password: 'testpass123',
      fullName: 'Test Course Creator'
    })
    
    if (!userResponse.data.success) {
      throw new Error('Failed to create test user')
    }
    
    const creatorId = userResponse.data.data.user.id
    
    // Create a test course
    const courseResponse = await makeAuthRequest('POST', '/courses', {
      title: `Test Course for Deletion ${Date.now()}`,
      description: 'This is a test course to test deletion logic',
      createdBy: creatorId
    })
    
    if (courseResponse.data.success) {
      testCourseId = courseResponse.data.data.course.id
      logTest('Create Test Course', true, null, `Course ID: ${testCourseId}`)
      return true
    } else {
      logTest('Create Test Course', false, new Error(courseResponse.data.message))
      return false
    }
  } catch (error) {
    logTest('Create Test Course', false, error)
    return false
  }
}

// Test regular deletion (no activity)
const testRegularDeletion = async () => {
  console.log('\n🗑️ Testing Regular Deletion (No Activity)...')
  
  if (!testCourseId) {
    logTest('Regular Deletion', false, new Error('No test course available'))
    return
  }
  
  try {
    const response = await makeAuthRequest('DELETE', `/super-admin/courses/${testCourseId}/delete`)
    if (response.data.success) {
      logTest('Regular Deletion', true, null, 'Course deleted successfully')
      testCourseId = null // Course is now deleted
      return true
    } else {
      logTest('Regular Deletion', false, new Error(response.data.message))
      return false
    }
  } catch (error) {
    logTest('Regular Deletion', false, error)
    return false
  }
}

// Test soft deletion (with activity)
const testSoftDeletion = async () => {
  console.log('\n🔄 Testing Soft Deletion (With Activity)...')
  
  // Create a new test course first
  const courseCreated = await createTestCourse()
  if (!courseCreated) {
    return
  }
  
  // Simulate activity by creating some progress/attempts
  try {
    // Get the course topics
    const courseResponse = await makeAuthRequest('GET', `/courses/${testCourseId}`)
    if (!courseResponse.data.success || !courseResponse.data.data.topics.length) {
      logTest('Soft Deletion', false, new Error('No topics found in test course'))
      return
    }
    
    const topicId = courseResponse.data.data.topics[0].id
    
    // Create a test user for progress
    const userResponse = await axios.post(`${BASE_URL}/auth/signup-new`, {
      email: `test-student-${Date.now()}@example.com`,
      password: 'testpass123',
      fullName: 'Test Student'
    })
    
    if (!userResponse.data.success) {
      logTest('Soft Deletion', false, new Error('Failed to create test student'))
      return
    }
    
    const studentId = userResponse.data.data.user.id
    const studentEmail = userResponse.data.data.user.email
    // Login as test student to get token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login-new`, {
      email: studentEmail,
      password: 'testpass123'
    })
    const studentToken = loginResponse.data.data.token
    // Create some progress
    await axios.post(`${BASE_URL}/progress`, {
      topicId: topicId,
      status: 'in_progress'
    }, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    })
    // Create some attempts
    await axios.post(`${BASE_URL}/attempts`, {
      topicId: topicId,
      code: 'console.log("Hello World")',
      result: 'pass',
      timeTaken: 30
    }, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    })
    
    logTest('Create Test Activity', true, null, 'Added progress and attempts to course')
  } catch (error) {
    logTest('Create Test Activity', false, error)
    return
  }
  
  // Now try to delete the course (should trigger soft delete)
  try {
    const response = await makeAuthRequest('DELETE', `/super-admin/courses/${testCourseId}/delete`)
    if (response.data.success) {
      logTest('Soft Deletion', true, null, 'Course deactivated (soft delete)')
      console.log(`   Activity Summary: ${JSON.stringify(response.data.data.activitySummary)}`)
      return true
    } else {
      logTest('Soft Deletion', false, new Error(response.data.message))
      return false
    }
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('activity')) {
      logTest('Soft Deletion (Protected)', true, null, 'Course protected from deletion (expected)')
      console.log(`   Activity Summary: ${JSON.stringify(error.response.data.data.activitySummary)}`)
      return true
    } else {
      logTest('Soft Deletion', false, error)
      return false
    }
  }
}

// Test force deletion
const testForceDeletion = async () => {
  console.log('\n💥 Testing Force Deletion...')
  
  // Create a new test course with activity
  const courseCreated = await createTestCourse()
  if (!courseCreated) {
    return
  }
  
  // Add activity (simplified version)
  try {
    const courseResponse = await makeAuthRequest('GET', `/courses/${testCourseId}`)
    if (courseResponse.data.success && courseResponse.data.data.topics.length > 0) {
      const topicId = courseResponse.data.data.topics[0].id
      
      // Create test user and add activity
      const userResponse = await axios.post(`${BASE_URL}/auth/signup-new`, {
        email: `test-force-${Date.now()}@example.com`,
        password: 'testpass123',
        fullName: 'Test Force User'
      })
      
      if (userResponse.data.success) {
        const userId = userResponse.data.data.user.id
        const userEmail = userResponse.data.data.user.email
        // Login as test user to get token
        const loginResponse = await axios.post(`${BASE_URL}/auth/login-new`, {
          email: userEmail,
          password: 'testpass123'
        })
        const userToken = loginResponse.data.data.token
        // Add progress
        await axios.post(`${BASE_URL}/progress`, {
          topicId: topicId,
          status: 'complete'
        }, {
          headers: { 'Authorization': `Bearer ${userToken}` }
        })
        logTest('Create Force Test Activity', true, null, 'Added activity to course')
      }
    }
  } catch (error) {
    logTest('Create Force Test Activity', false, error)
  }
  
  // Try force deletion
  try {
    const response = await makeAuthRequest('DELETE', `/super-admin/courses/${testCourseId}/delete`, {
      force: 'true'
    })
    if (response.data.success) {
      logTest('Force Deletion', true, null, 'Course force deleted successfully')
      console.log(`   Deleted Data: ${JSON.stringify(response.data.data.deletedData)}`)
      testCourseId = null
      return true
    } else {
      logTest('Force Deletion', false, new Error(response.data.message))
      return false
    }
  } catch (error) {
    logTest('Force Deletion', false, error)
    return false
  }
}

// Test cascade deletion
const testCascadeDeletion = async () => {
  console.log('\n🌊 Testing Cascade Deletion...')
  
  // Create a new test course with activity
  const courseCreated = await createTestCourse()
  if (!courseCreated) {
    return
  }
  
  // Add activity
  try {
    const courseResponse = await makeAuthRequest('GET', `/courses/${testCourseId}`)
    if (courseResponse.data.success && courseResponse.data.data.topics.length > 0) {
      const topicId = courseResponse.data.data.topics[0].id
      
      // Create test user and add activity
      const userResponse = await axios.post(`${BASE_URL}/auth/signup-new`, {
        email: `test-cascade-${Date.now()}@example.com`,
        password: 'testpass123',
        fullName: 'Test Cascade User'
      })
      
      if (userResponse.data.success) {
        const userId = userResponse.data.data.user.id
        const userEmail = userResponse.data.data.user.email
        // Login as test user to get token
        const loginResponse = await axios.post(`${BASE_URL}/auth/login-new`, {
          email: userEmail,
          password: 'testpass123'
        })
        const userToken = loginResponse.data.data.token
        // Add progress and attempts
        await axios.post(`${BASE_URL}/progress`, {
          topicId: topicId,
          status: 'in_progress'
        }, {
          headers: { 'Authorization': `Bearer ${userToken}` }
        })
        await axios.post(`${BASE_URL}/attempts`, {
          topicId: topicId,
          code: 'function test() { return true; }',
          result: 'pass',
          timeTaken: 45
        }, {
          headers: { 'Authorization': `Bearer ${userToken}` }
        })
        logTest('Create Cascade Test Activity', true, null, 'Added progress and attempts')
      }
    }
  } catch (error) {
    logTest('Create Cascade Test Activity', false, error)
  }
  
  // Try cascade deletion
  try {
    const response = await makeAuthRequest('DELETE', `/super-admin/courses/${testCourseId}/delete`, {
      cascade: 'true'
    })
    if (response.data.success) {
      logTest('Cascade Deletion', true, null, 'Course and all related data deleted')
      console.log(`   Deleted Data: ${JSON.stringify(response.data.data.deletedData)}`)
      testCourseId = null
      return true
    } else {
      logTest('Cascade Deletion', false, new Error(response.data.message))
      return false
    }
  } catch (error) {
    logTest('Cascade Deletion', false, error)
    return false
  }
}

// Test course reactivation
const testCourseReactivation = async () => {
  console.log('\n🔄 Testing Course Reactivation...')
  
  // Create a test course and soft delete it
  const courseCreated = await createTestCourse()
  if (!courseCreated) {
    return
  }
  
  // Soft delete the course first
  try {
    const deleteResponse = await makeAuthRequest('DELETE', `/super-admin/courses/${testCourseId}/delete`)
    if (!deleteResponse.data.success) {
      logTest('Course Reactivation', false, new Error('Failed to soft delete course for reactivation test'))
      return
    }
    
    logTest('Soft Delete for Reactivation', true, null, 'Course soft deleted')
  } catch (error) {
    logTest('Soft Delete for Reactivation', false, error)
    return
  }
  
  // Now try to reactivate it
  try {
    const response = await makeAuthRequest('POST', `/super-admin/courses/${testCourseId}/reactivate`)
    if (response.data.success) {
      logTest('Course Reactivation', true, null, 'Course reactivated successfully')
      console.log(`   Reactivated Course: ${response.data.data.course.title}`)
      return true
    } else {
      logTest('Course Reactivation', false, new Error(response.data.message))
      return false
    }
  } catch (error) {
    logTest('Course Reactivation', false, error)
    return false
  }
}

// Test course status filtering
const testCourseStatusFiltering = async () => {
  console.log('\n🔍 Testing Course Status Filtering...')
  
  try {
    // Get all courses (active and inactive)
    const allResponse = await makeAuthRequest('GET', '/super-admin/courses?status=all')
    if (allResponse.data.success) {
      logTest('Get All Courses (All Status)', true, null, `Found ${allResponse.data.data.length} courses`)
    } else {
      logTest('Get All Courses (All Status)', false, new Error(allResponse.data.message))
    }
    
    // Get only active courses
    const activeResponse = await makeAuthRequest('GET', '/super-admin/courses?status=active')
    if (activeResponse.data.success) {
      logTest('Get Active Courses', true, null, `Found ${activeResponse.data.data.length} active courses`)
    } else {
      logTest('Get Active Courses', false, new Error(activeResponse.data.message))
    }
    
    // Get only inactive courses
    const inactiveResponse = await makeAuthRequest('GET', '/super-admin/courses?status=inactive')
    if (inactiveResponse.data.success) {
      logTest('Get Inactive Courses', true, null, `Found ${inactiveResponse.data.data.length} inactive courses`)
    } else {
      logTest('Get Inactive Courses', false, new Error(inactiveResponse.data.message))
    }
    
  } catch (error) {
    logTest('Course Status Filtering', false, error)
  }
}

// Main test execution
const runAllTests = async () => {
  console.log('🚀 Starting Course Deletion Logic Tests...')
  console.log('=' * 60)
  
  // Authenticate first
  const authSuccess = await authenticateSuperAdmin()
  if (!authSuccess) {
    console.log('❌ Authentication failed. Cannot proceed with tests.')
    return
  }
  
  // Run all test suites
  await testRegularDeletion()
  await testSoftDeletion()
  await testForceDeletion()
  await testCascadeDeletion()
  await testCourseReactivation()
  await testCourseStatusFiltering()
  
  // Print results
  console.log('\n' + '=' * 60)
  console.log('📋 Course Deletion Test Results Summary:')
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log(`📊 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`)
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:')
    testResults.tests
      .filter(test => !test.success)
      .forEach(test => {
        console.log(`   - ${test.testName}: ${test.error}`)
      })
  }
  
  console.log('\n🎉 Course Deletion Logic Tests Complete!')
}

// Run tests
runAllTests().catch(console.error) 