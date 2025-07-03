const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'
const SUPER_ADMIN_EMAIL = 'superadmin@example.com'
const SUPER_ADMIN_PASSWORD = 'TestPassword123!'

let authToken = null
let testUsers = []
let testCourses = []

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

const logTest = (testName, success, error = null) => {
  const result = { testName, success, error: error?.message || null }
  testResults.tests.push(result)
  
  if (success) {
    testResults.passed++
    console.log(`✅ ${testName}`)
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

// User Management Tests
const testUserManagement = async () => {
  console.log('\n👥 Testing User Management...')
  
  // Get all users
  try {
    const response = await makeAuthRequest('GET', '/super-admin/users')
    if (response.data.success) {
      logTest('Get All Users', true)
      console.log(`   Found ${response.data.data.length} users`)
    } else {
      logTest('Get All Users', false, new Error(response.data.message))
    }
  } catch (error) {
    logTest('Get All Users', false, error)
  }
  
  // Get user statistics
  try {
    const response = await makeAuthRequest('GET', '/super-admin/users/statistics')
    if (response.data.success) {
      logTest('Get User Statistics', true)
      console.log(`   Total users: ${response.data.data.overview.totalUsers}`)
      console.log(`   Active users: ${response.data.data.overview.activeUsers}`)
    } else {
      logTest('Get User Statistics', false, new Error(response.data.message))
    }
  } catch (error) {
    logTest('Get User Statistics', false, error)
  }
  
  // Create test users for further testing
  try {
    const testUserPromises = []
    for (let i = 1; i <= 3; i++) {
      testUserPromises.push(
        axios.post(`${BASE_URL}/auth/signup-new`, {
          email: `test-user-${i}-${Date.now()}@example.com`,
          password: 'testpass123',
          fullName: `Test User ${i}`
        })
      )
    }
    
    const userResponses = await Promise.all(testUserPromises)
    testUsers = userResponses.map(res => res.data.data.user.id)
    logTest('Create Test Users', true)
    console.log(`   Created ${testUsers.length} test users`)
  } catch (error) {
    logTest('Create Test Users', false, error)
  }
  
  // Get user details
  if (testUsers.length > 0) {
    try {
      const response = await makeAuthRequest('GET', `/super-admin/users/${testUsers[0]}/details`)
      if (response.data.success) {
        logTest('Get User Details', true)
        console.log(`   User: ${response.data.data.email}`)
      } else {
        logTest('Get User Details', false, new Error(response.data.message))
      }
    } catch (error) {
      logTest('Get User Details', false, error)
    }
  }
  
  // Update user role
  if (testUsers.length > 0) {
    try {
      const response = await makeAuthRequest('PUT', `/super-admin/users/${testUsers[0]}/update-role`, {
        role: 'creator'
      })
      if (response.data.success) {
        logTest('Update User Role', true)
        console.log(`   Updated user to ${response.data.data.role}`)
      } else {
        logTest('Update User Role', false, new Error(response.data.message))
      }
    } catch (error) {
      logTest('Update User Role', false, error)
    }
  }
}

// Bulk Operations Tests
const testBulkOperations = async () => {
  console.log('\n🔄 Testing Bulk Operations...')
  
  if (testUsers.length < 2) {
    logTest('Bulk Operations', false, new Error('Not enough test users'))
    return
  }
  
  // Bulk update user roles
  try {
    const response = await makeAuthRequest('PUT', '/super-admin/users/bulk-update', {
      userIds: testUsers.slice(1, 3),
      role: 'admin'
    })
    if (response.data.success) {
      logTest('Bulk Update User Roles', true)
      console.log(`   Updated ${response.data.data.updatedCount} users`)
    } else {
      logTest('Bulk Update User Roles', false, new Error(response.data.message))
    }
  } catch (error) {
    logTest('Bulk Update User Roles', false, error)
  }
  
  // Bulk delete users (clean up test users)
  try {
    const response = await makeAuthRequest('DELETE', '/super-admin/users/bulk-delete', {
      userIds: testUsers
    })
    if (response.data.success) {
      logTest('Bulk Delete Users', true)
      console.log(`   Deleted ${response.data.data.deletedCount} test users`)
      testUsers = [] // Clear the array
    } else {
      logTest('Bulk Delete Users', false, new Error(response.data.message))
    }
  } catch (error) {
    logTest('Bulk Delete Users', false, error)
  }
}

// Admin Management Tests
const testAdminManagement = async () => {
  console.log('\n👨‍💼 Testing Admin Management...')
  
  // Create a test user for admin operations
  let testUserId = null
  try {
    const response = await axios.post(`${BASE_URL}/auth/signup-new`, {
      email: `test-admin-${Date.now()}@example.com`,
      password: 'testpass123',
      fullName: 'Test Admin User'
    })
    testUserId = response.data.data.user.id
    logTest('Create Test Admin User', true)
  } catch (error) {
    logTest('Create Test Admin User', false, error)
    return
  }
  
  // Get all admins
  try {
    const response = await makeAuthRequest('GET', '/super-admin/admins')
    if (response.data.success) {
      logTest('Get All Admins', true)
      console.log(`   Found ${response.data.data.length} admins`)
    } else {
      logTest('Get All Admins', false, new Error(response.data.message))
    }
  } catch (error) {
    logTest('Get All Admins', false, error)
  }
  
  // Promote user to admin
  try {
    const response = await makeAuthRequest('PUT', `/super-admin/admins/promote?id=${testUserId}`)
    if (response.data.success) {
      logTest('Promote to Admin', true)
      console.log(`   Promoted user to ${response.data.data.role}`)
    } else {
      logTest('Promote to Admin', false, new Error(response.data.message))
    }
  } catch (error) {
    logTest('Promote to Admin', false, error)
  }
  
  // Demote admin
  try {
    const response = await makeAuthRequest('PUT', `/super-admin/admins/demote?id=${testUserId}`)
    if (response.data.success) {
      logTest('Demote from Admin', true)
      console.log(`   Demoted user to ${response.data.data.role}`)
    } else {
      logTest('Demote from Admin', false, new Error(response.data.message))
    }
  } catch (error) {
    logTest('Demote from Admin', false, error)
  }
  
  // Clean up test user
  try {
    await makeAuthRequest('DELETE', `/super-admin/users/${testUserId}/delete`)
    logTest('Clean Up Test Admin User', true)
  } catch (error) {
    logTest('Clean Up Test Admin User', false, error)
  }
}

// Course Management Tests
const testCourseManagement = async () => {
  console.log('\n📚 Testing Course Management...')
  
  // Get all courses
  try {
    const response = await makeAuthRequest('GET', '/super-admin/courses')
    if (response.data.success) {
      logTest('Get All Courses', true)
      console.log(`   Found ${response.data.data.length} courses`)
      testCourses = response.data.data.map(course => course.id)
    } else {
      logTest('Get All Courses', false, new Error(response.data.message))
    }
  } catch (error) {
    logTest('Get All Courses', false, error)
  }
  
  // Test course deletion (only if no activity)
  if (testCourses.length > 0) {
    try {
      const response = await makeAuthRequest('DELETE', `/super-admin/courses/${testCourses[0]}/delete`)
      if (response.data.success) {
        logTest('Delete Course', true)
        console.log(`   Deleted course successfully`)
      } else {
        // Check if it's the expected "has activity" error
        if (response.status === 400 && response.data.message?.includes('activity')) {
          logTest('Delete Course (Protected)', true)
          console.log(`   Course protected from deletion (has activity)`)
        } else {
          logTest('Delete Course', false, new Error(response.data.message))
        }
      }
          } catch (error) {
        // Check if it's the expected "has activity" error
        if (error.response?.status === 400 && error.response?.data?.message?.includes('activity')) {
          logTest('Delete Course (Protected)', true)
          console.log(`   Course protected from deletion (has activity)`)
        } else if (error.response?.status === 400 && error.response?.data?.message?.includes('cannot be deleted')) {
          logTest('Delete Course (Protected)', true)
          console.log(`   Course protected from deletion (has activity)`)
        } else {
          logTest('Delete Course', false, error)
        }
      }
  }
}

// Analytics Tests
const testAnalytics = async () => {
  console.log('\n📊 Testing Analytics...')
  
  // System analytics
  try {
    const response = await makeAuthRequest('GET', '/super-admin/analytics')
    if (response.data.success) {
      logTest('Get System Analytics', true)
      console.log(`   Total users: ${response.data.data.overview.totalUsers}`)
      console.log(`   Total courses: ${response.data.data.overview.totalCourses}`)
      console.log(`   Total revenue: $${response.data.data.overview.totalRevenue}`)
    } else {
      logTest('Get System Analytics', false, new Error(response.data.message))
    }
  } catch (error) {
    logTest('Get System Analytics', false, error)
  }
  
  // Revenue analytics
  try {
    const response = await makeAuthRequest('GET', '/super-admin/revenue')
    if (response.data.success) {
      logTest('Get Revenue Analytics', true)
      console.log(`   Total revenue: $${response.data.data.totalRevenue}`)
      console.log(`   Successful payments: ${response.data.data.paymentCounts.successful}`)
    } else {
      logTest('Get Revenue Analytics', false, new Error(response.data.message))
    }
  } catch (error) {
    logTest('Get Revenue Analytics', false, error)
  }
  
  // Advanced analytics
  try {
    const response = await makeAuthRequest('GET', '/super-admin/analytics/advanced')
    if (response.data.success) {
      logTest('Get Advanced Analytics', true)
      console.log(`   User growth data available: ${response.data.data.userGrowth.length > 0}`)
      console.log(`   Course engagement data available: ${response.data.data.courseEngagement.length > 0}`)
    } else {
      logTest('Get Advanced Analytics', false, new Error(response.data.message))
    }
  } catch (error) {
    logTest('Get Advanced Analytics', false, error)
  }
  
  // System health
  try {
    const response = await makeAuthRequest('GET', '/super-admin/health')
    if (response.data.success) {
      logTest('Get System Health', true)
      console.log(`   System status: ${response.data.data.systemHealth.status}`)
      console.log(`   Uptime: ${response.data.data.systemHealth.uptime}`)
    } else {
      logTest('Get System Health', false, new Error(response.data.message))
    }
  } catch (error) {
    logTest('Get System Health', false, error)
  }
}

// Main test execution
const runAllTests = async () => {
  console.log('🚀 Starting Enhanced Super Admin Tests...')
  console.log('=' * 50)
  
  // Authenticate first
  const authSuccess = await authenticateSuperAdmin()
  if (!authSuccess) {
    console.log('❌ Authentication failed. Cannot proceed with tests.')
    return
  }
  
  // Run all test suites
  await testUserManagement()
  await testBulkOperations()
  await testAdminManagement()
  await testCourseManagement()
  await testAnalytics()
  
  // Print results
  console.log('\n' + '=' * 50)
  console.log('📋 Test Results Summary:')
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
  
  console.log('\n🎉 Enhanced Super Admin Tests Complete!')
}

// Run tests
runAllTests().catch(console.error) 