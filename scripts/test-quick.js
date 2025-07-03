const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'
const SUPER_ADMIN_EMAIL = 'superadmin@example.com'
const SUPER_ADMIN_PASSWORD = 'TestPassword123!'

let authToken = null

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

const testQuick = async () => {
  console.log('🔐 Authenticating...')
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login-new`, {
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD
    })
    
    if (response.data.success) {
      authToken = response.data.data.token
      console.log('✅ Authenticated')
    } else {
      console.log('❌ Auth failed')
      return
    }
  } catch (error) {
    console.log('❌ Auth error:', error.response?.data || error.message)
    return
  }
  
  // Test user details
  console.log('\n👤 Testing user details...')
  try {
    const usersResponse = await makeAuthRequest('GET', '/super-admin/users')
    if (usersResponse.data.success && usersResponse.data.data.length > 0) {
      const userId = usersResponse.data.data[0].id
      console.log(`Testing with user ID: ${userId}`)
      
      const detailsResponse = await makeAuthRequest('GET', `/super-admin/users/${userId}/details`)
      console.log('User details response:', detailsResponse.data)
    }
  } catch (error) {
    console.log('User details error:', error.response?.data || error.message)
  }
  
  // Test promote/demote
  console.log('\n👨‍💼 Testing promote/demote...')
  try {
    const usersResponse = await makeAuthRequest('GET', '/super-admin/users')
    if (usersResponse.data.success && usersResponse.data.data.length > 0) {
      const studentUser = usersResponse.data.data.find(u => u.role === 'student')
      if (studentUser) {
        console.log(`Testing promote with user: ${studentUser.email} (${studentUser.role})`)
        
        const promoteResponse = await makeAuthRequest('PUT', `/super-admin/admins/promote?id=${studentUser.id}`)
        console.log('Promote response:', promoteResponse.data)
      } else {
        console.log('No student user found to test promote')
      }
    }
  } catch (error) {
    console.log('Promote error:', error.response?.data || error.message)
  }
}

testQuick().catch(console.error) 