const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'

// Generate unique email with timestamp
const timestamp = Date.now()
const testEmail = `test-${timestamp}@example.com`
const testPassword = 'test123'
const testFullName = 'Test User'

async function testAuth() {
  console.log('🧪 Testing Authentication Endpoints...\n')

  try {
    // 1. Test Sign Up
    console.log('1. Testing Sign Up...')
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, {
      email: testEmail,
      password: testPassword,
      fullName: testFullName
    })
    
    if (signupResponse.data.success) {
      console.log('✅ Sign Up Success:', JSON.stringify(signupResponse.data, null, 2))
    } else {
      console.log('❌ Test Failed:', signupResponse.data)
      return // Stop if signup fails
    }

    // 2. Test Login
    console.log('\n2. Testing Login...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    })
    
    if (loginResponse.data.success) {
      console.log('✅ Login Success:', JSON.stringify(loginResponse.data, null, 2))
    } else {
      console.log('❌ Test Failed:', loginResponse.data)
      return // Stop if login fails
    }

    // 3. Test Password Reset
    console.log('\n3. Testing Password Reset...')
    const resetResponse = await axios.post(`${BASE_URL}/auth/reset`, {
      email: testEmail
    })
    
    if (resetResponse.data.success) {
      console.log('✅ Password Reset Success:', JSON.stringify(resetResponse.data, null, 2))
    } else {
      console.log('❌ Test Failed:', resetResponse.data)
    }

  } catch (error) {
    console.error('❌ Test Error:', error.response?.data || error.message)
  }
}

testAuth() 