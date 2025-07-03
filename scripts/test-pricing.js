const axios = require('axios')

const BASE_URL = process.env.TEST_API_BASE_URL || 'http://localhost:3000/api'

// Test data
const TEST_PLANS = [
  {
    name: "Basic",
    description: "Perfect for beginners",
    price: 999, // $9.99 USD
    currency: "USD",
    duration: 30, // 30 days
    features: ["basic_courses", "limited_assessments"],
    maxCourses: 5,
    maxAssessments: 10
  },
  {
    name: "Pro",
    description: "For serious learners",
    price: 2499, // $24.99 USD
    currency: "USD",
    duration: 30,
    features: ["all_courses", "unlimited_assessments", "ai_analysis"],
    maxCourses: null, // unlimited
    maxAssessments: null
  },
  {
    name: "Enterprise",
    description: "For teams and organizations",
    price: 9999, // $99.99 USD
    currency: "USD",
    duration: 30,
    features: ["all_courses", "unlimited_assessments", "ai_analysis", "team_management", "priority_support"],
    maxCourses: null,
    maxAssessments: null
  }
]

let authToken = null
let superAdminToken = null
let testUserId = null
let testCourseId = null
let createdPlans = []

async function loginUser(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login-new`, {
      email,
      password
    })
    return response.data.data.token
  } catch (error) {
    console.error(`Failed to login ${email}:`, error.response?.data || error.message)
    return null
  }
}

async function createTestUser() {
  const email = `test-pricing-${Date.now()}@example.com`
  const password = 'TestPassword123!'
  const fullName = 'Test Pricing User'

  try {
    await axios.post(`${BASE_URL}/auth/signup-new`, {
      email,
      password,
      fullName
    })
    console.log('✅ Created test user for pricing tests')
    return { email, password }
  } catch (error) {
    console.error('Failed to create test user:', error.response?.data || error.message)
    return null
  }
}

async function testSubscriptionPlans() {
  console.log('\n📋 Testing Subscription Plans...')
  let passed = 0
  let total = 0

  try {
    // Test 1: Get subscription plans (public)
    total++
    const response = await axios.get(`${BASE_URL}/pricing/plans`)
    if (response.data.success && Array.isArray(response.data.data)) {
      console.log('✅ GET /pricing/plans - Success')
      passed++
    } else {
      console.log('❌ GET /pricing/plans - Failed')
    }
  } catch (error) {
    console.log('❌ GET /pricing/plans - Error:', error.response?.data || error.message)
  }

  try {
    // Test 2: Create subscription plan (super admin only)
    total++
    const planData = TEST_PLANS[0]
    const response = await axios.post(`${BASE_URL}/pricing/plans`, planData, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    })
    if (response.data.success && response.data.data.id) {
      createdPlans.push(response.data.data.id)
      console.log('✅ POST /pricing/plans - Success')
      passed++
    } else {
      console.log('❌ POST /pricing/plans - Failed')
    }
  } catch (error) {
    console.log('❌ POST /pricing/plans - Error:', error.response?.data || error.message)
  }

  try {
    // Test 3: Get specific subscription plan
    total++
    if (createdPlans.length > 0) {
      const response = await axios.get(`${BASE_URL}/pricing/plans/${createdPlans[0]}`)
      if (response.data.success && response.data.data.id) {
        console.log('✅ GET /pricing/plans/[id] - Success')
        passed++
      } else {
        console.log('❌ GET /pricing/plans/[id] - Failed')
      }
    } else {
      console.log('⚠️  GET /pricing/plans/[id] - Skipped (no plans created)')
    }
  } catch (error) {
    console.log('❌ GET /pricing/plans/[id] - Error:', error.response?.data || error.message)
  }

  return { passed, total }
}

async function testUserSubscriptions() {
  console.log('\n📋 Testing User Subscriptions...')
  let passed = 0
  let total = 0

  try {
    // Test 1: Get user subscription (should fail - no subscription)
    total++
    const response = await axios.get(`${BASE_URL}/pricing/subscriptions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    if (response.status === 404) {
      console.log('✅ GET /pricing/subscriptions - Correctly returns 404 for no subscription')
      passed++
    } else {
      console.log('❌ GET /pricing/subscriptions - Unexpected response')
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ GET /pricing/subscriptions - Correctly returns 404 for no subscription')
      passed++
    } else {
      console.log('❌ GET /pricing/subscriptions - Error:', error.response?.data || error.message)
    }
  }

  try {
    // Test 2: Subscribe user to a plan
    total++
    if (createdPlans.length > 0) {
      const response = await axios.post(`${BASE_URL}/pricing/subscriptions`, {
        planId: createdPlans[0]
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      if (response.data.success && response.data.data.id) {
        console.log('✅ POST /pricing/subscriptions - Success')
        passed++
      } else {
        console.log('❌ POST /pricing/subscriptions - Failed')
      }
    } else {
      console.log('⚠️  POST /pricing/subscriptions - Skipped (no plans available)')
    }
  } catch (error) {
    console.log('❌ POST /pricing/subscriptions - Error:', error.response?.data || error.message)
  }

  try {
    // Test 3: Get user subscription (should succeed now)
    total++
    const response = await axios.get(`${BASE_URL}/pricing/subscriptions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    if (response.data.success && response.data.data.id) {
      console.log('✅ GET /pricing/subscriptions - Success (after subscription)')
      passed++
    } else {
      console.log('❌ GET /pricing/subscriptions - Failed')
    }
  } catch (error) {
    console.log('❌ GET /pricing/subscriptions - Error:', error.response?.data || error.message)
  }

  try {
    // Test 4: Cancel subscription
    total++
    const response = await axios.delete(`${BASE_URL}/pricing/subscriptions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    if (response.data.success) {
      console.log('✅ DELETE /pricing/subscriptions - Success')
      passed++
    } else {
      console.log('❌ DELETE /pricing/subscriptions - Failed')
    }
  } catch (error) {
    console.log('❌ DELETE /pricing/subscriptions - Error:', error.response?.data || error.message)
  }

  return { passed, total }
}

async function testCourseAccess() {
  console.log('\n📋 Testing Course Access...')
  let passed = 0
  let total = 0

  try {
    // Test 1: Get user course access
    total++
    const response = await axios.get(`${BASE_URL}/pricing/course-access`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    if (response.data.success && Array.isArray(response.data.data)) {
      console.log('✅ GET /pricing/course-access - Success')
      passed++
    } else {
      console.log('❌ GET /pricing/course-access - Failed')
    }
  } catch (error) {
    console.log('❌ GET /pricing/course-access - Error:', error.response?.data || error.message)
  }

  try {
    // Test 2: Check course access for specific course
    total++
    if (testCourseId) {
      const response = await axios.get(`${BASE_URL}/pricing/course-access/check?courseId=${testCourseId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      if (response.data.success && response.data.data.hasOwnProperty('hasAccess')) {
        console.log('✅ GET /pricing/course-access/check - Success')
        passed++
      } else {
        console.log('❌ GET /pricing/course-access/check - Failed')
      }
    } else {
      console.log('⚠️  GET /pricing/course-access/check - Skipped (no test course)')
    }
  } catch (error) {
    console.log('❌ GET /pricing/course-access/check - Error:', error.response?.data || error.message)
  }

  try {
    // Test 3: Grant course access
    total++
    if (testCourseId) {
      const response = await axios.post(`${BASE_URL}/pricing/course-access`, {
        courseId: testCourseId,
        accessType: 'purchase'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      if (response.data.success && response.data.data.id) {
        console.log('✅ POST /pricing/course-access - Success')
        passed++
      } else {
        console.log('❌ POST /pricing/course-access - Failed')
      }
    } else {
      console.log('⚠️  POST /pricing/course-access - Skipped (no test course)')
    }
  } catch (error) {
    console.log('❌ POST /pricing/course-access - Error:', error.response?.data || error.message)
  }

  return { passed, total }
}

async function testPricingAnalytics() {
  console.log('\n📋 Testing Pricing Analytics...')
  let passed = 0
  let total = 0

  try {
    // Test 1: Get pricing analytics (super admin only)
    total++
    const response = await axios.get(`${BASE_URL}/pricing/analytics`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    })
    if (response.data.success && response.data.data) {
      console.log('✅ GET /pricing/analytics - Success')
      passed++
    } else {
      console.log('❌ GET /pricing/analytics - Failed')
    }
  } catch (error) {
    console.log('❌ GET /pricing/analytics - Error:', error.response?.data || error.message)
  }

  try {
    // Test 2: Try to access analytics as regular user (should fail)
    total++
    const response = await axios.get(`${BASE_URL}/pricing/analytics`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    console.log('❌ GET /pricing/analytics - Should have failed for regular user')
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ GET /pricing/analytics - Correctly denied access to regular user')
      passed++
    } else {
      console.log('❌ GET /pricing/analytics - Unexpected error for regular user:', error.response?.data || error.message)
    }
  }

  return { passed, total }
}

async function getTestCourse() {
  try {
    const response = await axios.get(`${BASE_URL}/courses`)
    if (response.data.success && response.data.data.length > 0) {
      return response.data.data[0].id
    }
  } catch (error) {
    console.error('Failed to get test course:', error.response?.data || error.message)
  }
  return null
}

async function main() {
  console.log('🚀 Running DSATutor Pricing System Tests...')

  // Setup
  console.log('\n🔧 Setting up test environment...')
  
  // Login as super admin
  superAdminToken = await loginUser('superadmin@example.com', 'TestPassword123!')
  if (!superAdminToken) {
    console.log('❌ Failed to login as super admin')
    return
  }
  console.log('✅ Logged in as super admin')

  // Create and login test user
  const testUser = await createTestUser()
  if (testUser) {
    authToken = await loginUser(testUser.email, testUser.password)
    if (authToken) {
      console.log('✅ Created and logged in test user')
    }
  }

  // Get test course
  testCourseId = await getTestCourse()
  if (testCourseId) {
    console.log('✅ Found test course')
  }

  // Run tests
  const results = []
  
  const plansResult = await testSubscriptionPlans()
  results.push({ name: 'SUBSCRIPTION PLANS', ...plansResult })
  
  const subscriptionsResult = await testUserSubscriptions()
  results.push({ name: 'USER SUBSCRIPTIONS', ...subscriptionsResult })
  
  const accessResult = await testCourseAccess()
  results.push({ name: 'COURSE ACCESS', ...accessResult })
  
  const analyticsResult = await testPricingAnalytics()
  results.push({ name: 'PRICING ANALYTICS', ...analyticsResult })

  // Summary
  console.log('\n🎉 Pricing System Tests Completed!')
  console.log('📊 Results:')
  
  let totalPassed = 0
  let totalTests = 0
  
  results.forEach(result => {
    console.log(`✅ ${result.name}: ${result.passed}/${result.total} tests passed`)
    totalPassed += result.passed
    totalTests += result.total
  })
  
  const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0
  console.log(`\n📈 Overall: ${totalPassed}/${totalTests} tests passed (${successRate}%)`)
  
  if (totalPassed === totalTests) {
    console.log('🎉 All pricing system tests passed!')
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.')
  }
}

main().catch(console.error) 