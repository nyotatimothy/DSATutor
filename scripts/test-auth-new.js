const axios = require('axios')
require('dotenv').config()

const BASE_URL = 'http://localhost:3000/api'
const TEST_EMAIL = `test-${Date.now()}@example.com`
const TEST_PASSWORD = 'TestPassword123!'
const TEST_FULL_NAME = 'Test User'

let authToken = null
let testUserId = null

const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
}

function logTest(name, success, details = '') {
  testResults.total++
  if (success) {
    testResults.passed++
    console.log(`✅ ${name}`)
  } else {
    testResults.failed++
    console.log(`❌ ${name}: ${details}`)
  }
  testResults.details.push({ name, success, details })
}

async function testSignup() {
  try {
    console.log('\n🧪 Testing User Signup...')
    
    const response = await axios.post(`${BASE_URL}/auth/signup-new`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      fullName: TEST_FULL_NAME
    })

    const success = response.status === 201 && 
                   response.data.success && 
                   response.data.data.user &&
                   response.data.data.token

    if (success) {
      authToken = response.data.data.token
      testUserId = response.data.data.user.id
      logTest('User Signup', true, `User created with ID: ${testUserId}`)
    } else {
      logTest('User Signup', false, `Status: ${response.status}, Success: ${response.data.success}`)
    }
  } catch (error) {
    logTest('User Signup', false, error.response?.data?.message || error.message)
  }
}

async function testSignupDuplicate() {
  try {
    console.log('\n🧪 Testing Duplicate Signup...')
    
    const response = await axios.post(`${BASE_URL}/auth/signup-new`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      fullName: TEST_FULL_NAME
    })

    logTest('Duplicate Signup', false, 'Should have failed but succeeded')
  } catch (error) {
    const success = error.response?.status === 409 && 
                   error.response?.data?.error === 'User already exists'
    logTest('Duplicate Signup', success, error.response?.data?.message || error.message)
  }
}

async function testLogin() {
  try {
    console.log('\n🧪 Testing User Login...')
    
    const response = await axios.post(`${BASE_URL}/auth/login-new`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })

    const success = response.status === 200 && 
                   response.data.success && 
                   response.data.data.user &&
                   response.data.data.token

    if (success) {
      authToken = response.data.data.token
      logTest('User Login', true, 'Login successful')
    } else {
      logTest('User Login', false, `Status: ${response.status}, Success: ${response.data.success}`)
    }
  } catch (error) {
    logTest('User Login', false, error.response?.data?.message || error.message)
  }
}

async function testLoginInvalidCredentials() {
  try {
    console.log('\n🧪 Testing Invalid Login...')
    
    const response = await axios.post(`${BASE_URL}/auth/login-new`, {
      email: TEST_EMAIL,
      password: 'WrongPassword123!'
    })

    logTest('Invalid Login', false, 'Should have failed but succeeded')
  } catch (error) {
    const success = error.response?.status === 401 && 
                   error.response?.data?.error === 'Invalid credentials'
    logTest('Invalid Login', success, error.response?.data?.message || error.message)
  }
}

async function testGetProfile() {
  try {
    console.log('\n🧪 Testing Get Profile...')
    
    if (!authToken) {
      logTest('Get Profile', false, 'No auth token available')
      return
    }

    const response = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    const success = response.status === 200 && 
                   response.data.success && 
                   response.data.data.user

    logTest('Get Profile', success, success ? 'Profile retrieved' : `Status: ${response.status}`)
  } catch (error) {
    logTest('Get Profile', false, error.response?.data?.message || error.message)
  }
}

async function testGetProfileUnauthorized() {
  try {
    console.log('\n🧪 Testing Get Profile (Unauthorized)...')
    
    const response = await axios.get(`${BASE_URL}/auth/profile`)

    logTest('Get Profile Unauthorized', false, 'Should have failed but succeeded')
  } catch (error) {
    const success = error.response?.status === 401 && 
                   error.response?.data?.error === 'Access token required'
    logTest('Get Profile Unauthorized', success, error.response?.data?.message || error.message)
  }
}

async function testUpdateProfile() {
  try {
    console.log('\n🧪 Testing Update Profile...')
    
    if (!authToken) {
      logTest('Update Profile', false, 'No auth token available')
      return
    }

    const newFullName = 'Updated Test User'
    const response = await axios.put(`${BASE_URL}/auth/profile`, 
      { fullName: newFullName },
      { headers: { Authorization: `Bearer ${authToken}` } }
    )

    const success = response.status === 200 && 
                   response.data.success && 
                   response.data.data.user.fullName === newFullName

    logTest('Update Profile', success, success ? 'Profile updated' : `Status: ${response.status}`)
  } catch (error) {
    logTest('Update Profile', false, error.response?.data?.message || error.message)
  }
}

async function testResetPassword() {
  try {
    console.log('\n🧪 Testing Password Reset...')
    
    const response = await axios.post(`${BASE_URL}/auth/reset-new`, {
      email: TEST_EMAIL
    })

    const success = response.status === 200 && 
                   response.data.success

    logTest('Password Reset', success, success ? 'Reset email sent' : `Status: ${response.status}`)
  } catch (error) {
    logTest('Password Reset', false, error.response?.data?.message || error.message)
  }
}

async function testResetPasswordInvalidEmail() {
  try {
    console.log('\n🧪 Testing Password Reset (Invalid Email)...')
    
    const response = await axios.post(`${BASE_URL}/auth/reset-new`, {
      email: 'nonexistent@example.com'
    })

    logTest('Password Reset Invalid Email', false, 'Should have failed but succeeded')
  } catch (error) {
    const success = error.response?.status === 404 && 
                   error.response?.data?.error === 'User not found'
    logTest('Password Reset Invalid Email', success, error.response?.data?.message || error.message)
  }
}

async function testLogout() {
  try {
    console.log('\n🧪 Testing Logout...')
    
    if (!authToken) {
      logTest('Logout', false, 'No auth token available')
      return
    }

    const response = await axios.post(`${BASE_URL}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    const success = response.status === 200 && 
                   response.data.success

    logTest('Logout', success, success ? 'Logout successful' : `Status: ${response.status}`)
  } catch (error) {
    logTest('Logout', false, error.response?.data?.message || error.message)
  }
}

async function testInvalidMethods() {
  try {
    console.log('\n🧪 Testing Invalid HTTP Methods...')
    
    // Test GET on signup endpoint
    try {
      await axios.get(`${BASE_URL}/auth/signup-new`)
      logTest('Invalid Method - GET Signup', false, 'Should have failed but succeeded')
    } catch (error) {
      const success = error.response?.status === 405
      logTest('Invalid Method - GET Signup', success, error.response?.data?.message || error.message)
    }

    // Test PUT on login endpoint
    try {
      await axios.put(`${BASE_URL}/auth/login-new`, {})
      logTest('Invalid Method - PUT Login', false, 'Should have failed but succeeded')
    } catch (error) {
      const success = error.response?.status === 405
      logTest('Invalid Method - PUT Login', success, error.response?.data?.message || error.message)
    }

  } catch (error) {
    logTest('Invalid Methods Test', false, error.message)
  }
}

async function runAllTests() {
  console.log('🚀 Starting New Auth System Tests...')
  console.log(`📧 Test Email: ${TEST_EMAIL}`)
  console.log(`🔑 Test Password: ${TEST_PASSWORD}`)
  console.log(`👤 Test Name: ${TEST_FULL_NAME}`)

  await testSignup()
  await testSignupDuplicate()
  await testLogin()
  await testLoginInvalidCredentials()
  await testGetProfile()
  await testGetProfileUnauthorized()
  await testUpdateProfile()
  await testResetPassword()
  await testResetPasswordInvalidEmail()
  await testLogout()
  await testInvalidMethods()

  // Summary
  console.log('\n📊 Test Summary:')
  console.log(`Total Tests: ${testResults.total}`)
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`)

  return testResults
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(results => {
      console.log('\n🎉 Auth System Tests Completed!')
      process.exit(results.failed > 0 ? 1 : 0)
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error)
      process.exit(1)
    })
}

module.exports = { runAllTests, testResults } 