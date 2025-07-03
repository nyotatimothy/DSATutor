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

const testCourseDelete = async () => {
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
  
  // Get courses
  console.log('\n📚 Testing course deletion...')
  try {
    const coursesResponse = await makeAuthRequest('GET', '/super-admin/courses')
    if (coursesResponse.data.success && coursesResponse.data.data.length > 0) {
      const courseId = coursesResponse.data.data[0].id
      console.log(`Testing with course ID: ${courseId}`)
      console.log(`Course title: ${coursesResponse.data.data[0].title}`)
      
      const deleteResponse = await makeAuthRequest('DELETE', `/super-admin/courses/${courseId}/delete`)
      console.log('Delete response:', deleteResponse.data)
    }
  } catch (error) {
    console.log('Delete error status:', error.response?.status)
    console.log('Delete error data:', error.response?.data)
  }
}

testCourseDelete().catch(console.error) 