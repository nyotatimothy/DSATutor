require('dotenv').config()
const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'
let superAdminToken = ''
let testUserId = ''
let testAdminId = ''

console.log('👑 Starting Super Admin API Tests...')
console.log('📧 Super Admin Email: superadmin@example.com')
console.log('🔑 Super Admin Password: TestPassword123!')
console.log('')

async function createSuperAdminUser() {
  try {
    const email = 'superadmin@example.com'
    const password = 'TestPassword123!'
    const fullName = 'Super Admin'

    // Create super admin user
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup-new`, {
      email,
      password,
      fullName
    })

    if (signupResponse.data.success) {
      console.log('✅ Super admin user created')
      
      // Update role to super_admin
      const loginResponse = await axios.post(`${BASE_URL}/auth/login-new`, {
        email,
        password
      })

      if (loginResponse.data.success) {
        superAdminToken = loginResponse.data.token
        console.log('✅ Super admin logged in')
        return true
      }
    }
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      // User already exists, try to login
      try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login-new`, {
          email: 'superadmin@example.com',
          password: 'TestPassword123!'
        })

        if (loginResponse.data.success) {
          superAdminToken = loginResponse.data.token
          console.log('✅ Super admin logged in')
          return true
        }
      } catch (loginError) {
        console.error('❌ Failed to login super admin:', loginError.response?.data)
        return false
      }
    } else {
      console.error('❌ Failed to create super admin:', error.response?.data)
      return false
    }
  }
  return false
}

async function createTestUsers() {
  try {
    // Create test user
    const userResponse = await axios.post(`${BASE_URL}/auth/signup-new`, {
      email: `test-user-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      fullName: 'Test User'
    })

    if (userResponse.data.success) {
      testUserId = userResponse.data.user.id
      console.log('✅ Test user created')
    }

    // Create test admin
    const adminResponse = await axios.post(`${BASE_URL}/auth/signup-new`, {
      email: `test-admin-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      fullName: 'Test Admin'
    })

    if (adminResponse.data.success) {
      testAdminId = adminResponse.data.user.id
      console.log('✅ Test admin created')
    }

    return true
  } catch (error) {
    console.error('❌ Failed to create test users:', error.response?.data)
    return false
  }
}

async function testGetAllUsers() {
  try {
    console.log('\n🧪 Testing Get All Users...')
    const response = await axios.get(`${BASE_URL}/super-admin/users`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    })

    if (response.data.success) {
      console.log('✅ Get all users successful')
      console.log(`   Found ${response.data.data.length} users`)
      console.log(`   Total: ${response.data.pagination.total} users`)
      return true
    }
  } catch (error) {
    console.error('❌ Get all users failed:', error.response?.data)
    return false
  }
}

async function testGetUserDetails() {
  try {
    console.log('\n🧪 Testing Get User Details...')
    const response = await axios.get(`${BASE_URL}/super-admin/users/${testUserId}`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    })

    if (response.data.success) {
      console.log('✅ Get user details successful')
      console.log(`   User: ${response.data.data.email}`)
      console.log(`   Role: ${response.data.data.role}`)
      console.log(`   Payments: ${response.data.data._count.payments}`)
      console.log(`   Progress: ${response.data.data._count.progress}`)
      console.log(`   Attempts: ${response.data.data._count.attempts}`)
      return true
    }
  } catch (error) {
    console.error('❌ Get user details failed:', error.response?.data)
    return false
  }
}

async function testUpdateUserRole() {
  try {
    console.log('\n🧪 Testing Update User Role...')
    const response = await axios.put(`${BASE_URL}/super-admin/users/${testUserId}`, {
      role: 'creator'
    }, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    })

    if (response.data.success) {
      console.log('✅ Update user role successful')
      console.log(`   New role: ${response.data.data.role}`)
      return true
    }
  } catch (error) {
    console.error('❌ Update user role failed:', error.response?.data)
    return false
  }
}

async function testGetAllAdmins() {
  try {
    console.log('\n🧪 Testing Get All Admins...')
    const response = await axios.get(`${BASE_URL}/super-admin/admins`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    })

    if (response.data.success) {
      console.log('✅ Get all admins successful')
      console.log(`   Found ${response.data.data.length} admins`)
      console.log(`   Total: ${response.data.pagination.total} admins`)
      return true
    }
  } catch (error) {
    console.error('❌ Get all admins failed:', error.response?.data)
    return false
  }
}

async function testPromoteToAdmin() {
  try {
    console.log('\n🧪 Testing Promote to Admin...')
    const response = await axios.post(`${BASE_URL}/super-admin/admins/promote`, {
      id: testUserId
    }, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    })

    if (response.data.success) {
      console.log('✅ Promote to admin successful')
      console.log(`   New role: ${response.data.data.role}`)
      return true
    }
  } catch (error) {
    console.error('❌ Promote to admin failed:', error.response?.data)
    return false
  }
}

async function testDemoteFromAdmin() {
  try {
    console.log('\n🧪 Testing Demote from Admin...')
    const response = await axios.post(`${BASE_URL}/super-admin/admins/demote`, {
      id: testUserId
    }, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    })

    if (response.data.success) {
      console.log('✅ Demote from admin successful')
      console.log(`   New role: ${response.data.data.role}`)
      return true
    }
  } catch (error) {
    console.error('❌ Demote from admin failed:', error.response?.data)
    return false
  }
}

async function testSystemAnalytics() {
  try {
    console.log('\n🧪 Testing System Analytics...')
    const response = await axios.get(`${BASE_URL}/super-admin/analytics`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    })

    if (response.data.success) {
      console.log('✅ System analytics successful')
      const { overview } = response.data.data
      console.log(`   Total Users: ${overview.totalUsers}`)
      console.log(`   Total Admins: ${overview.totalAdmins}`)
      console.log(`   Total Courses: ${overview.totalCourses}`)
      console.log(`   Total Revenue: ${overview.totalRevenue}`)
      console.log(`   Payment Success Rate: ${overview.paymentSuccessRate}%`)
      return true
    }
  } catch (error) {
    console.error('❌ System analytics failed:', error.response?.data)
    return false
  }
}

async function testRevenueAnalytics() {
  try {
    console.log('\n🧪 Testing Revenue Analytics...')
    const response = await axios.get(`${BASE_URL}/super-admin/revenue?period=30`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    })

    if (response.data.success) {
      console.log('✅ Revenue analytics successful')
      const { totalRevenue, paymentCounts } = response.data.data
      console.log(`   Total Revenue: ${totalRevenue}`)
      console.log(`   Successful Payments: ${paymentCounts.successful}`)
      console.log(`   Failed Payments: ${paymentCounts.failed}`)
      console.log(`   Pending Payments: ${paymentCounts.pending}`)
      return true
    }
  } catch (error) {
    console.error('❌ Revenue analytics failed:', error.response?.data)
    return false
  }
}

async function testSystemHealth() {
  try {
    console.log('\n🧪 Testing System Health Report...')
    const response = await axios.get(`${BASE_URL}/super-admin/health`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    })

    if (response.data.success) {
      console.log('✅ System health report successful')
      const { systemMetrics, successRates, systemHealth } = response.data.data
      console.log(`   System Status: ${systemHealth.status}`)
      console.log(`   Uptime: ${systemHealth.uptime}`)
      console.log(`   Attempt Success Rate: ${successRates.attemptSuccessRate}%`)
      console.log(`   Payment Success Rate: ${successRates.paymentSuccessRate}%`)
      return true
    }
  } catch (error) {
    console.error('❌ System health report failed:', error.response?.data)
    return false
  }
}

async function testUnauthorizedAccess() {
  try {
    console.log('\n🧪 Testing Unauthorized Access...')
    
    // Test without token
    try {
      await axios.get(`${BASE_URL}/super-admin/users`)
      console.log('❌ Should have been unauthorized')
      return false
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Unauthorized access properly rejected (no token)')
      } else {
        console.log('❌ Unexpected error for unauthorized access')
        return false
      }
    }

    // Test with regular user token
    try {
      const userResponse = await axios.post(`${BASE_URL}/auth/signup-new`, {
        email: `regular-user-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        fullName: 'Regular User'
      })

      if (userResponse.data.success) {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login-new`, {
          email: `regular-user-${Date.now()}@example.com`,
          password: 'TestPassword123!'
        })

        if (loginResponse.data.success) {
          try {
            await axios.get(`${BASE_URL}/super-admin/users`, {
              headers: { Authorization: `Bearer ${loginResponse.data.token}` }
            })
            console.log('❌ Should have been forbidden')
            return false
          } catch (error) {
            if (error.response?.status === 403) {
              console.log('✅ Regular user access properly rejected')
              return true
            } else {
              console.log('❌ Unexpected error for regular user access')
              return false
            }
          }
        }
      }
    } catch (error) {
      console.log('❌ Error testing regular user access:', error.response?.data)
      return false
    }
  } catch (error) {
    console.error('❌ Unauthorized access test failed:', error.response?.data)
    return false
  }
}

async function runTests() {
  console.log('🔧 Setting up test environment...')
  
  // Setup super admin
  if (!(await createSuperAdminUser())) {
    console.log('❌ Failed to setup super admin')
    return
  }

  // Create test users
  if (!(await createTestUsers())) {
    console.log('❌ Failed to create test users')
    return
  }

  const tests = [
    { name: 'Get All Users', test: testGetAllUsers },
    { name: 'Get User Details', test: testGetUserDetails },
    { name: 'Update User Role', test: testUpdateUserRole },
    { name: 'Get All Admins', test: testGetAllAdmins },
    { name: 'Promote to Admin', test: testPromoteToAdmin },
    { name: 'Demote from Admin', test: testDemoteFromAdmin },
    { name: 'System Analytics', test: testSystemAnalytics },
    { name: 'Revenue Analytics', test: testRevenueAnalytics },
    { name: 'System Health Report', test: testSystemHealth },
    { name: 'Unauthorized Access', test: testUnauthorizedAccess }
  ]

  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      const result = await test.test()
      if (result) {
        passed++
      } else {
        failed++
      }
    } catch (error) {
      console.error(`❌ ${test.name} failed with error:`, error.message)
      failed++
    }
  }

  console.log('\n📊 Super Admin API Test Summary')
  console.log('===============================')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`)

  if (failed === 0) {
    console.log('\n🎉 All Super Admin API tests passed!')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.')
  }
}

runTests().catch(console.error) 