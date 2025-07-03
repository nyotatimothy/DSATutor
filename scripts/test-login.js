const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'

// Test different credential combinations
const testCredentials = [
  {
    email: 'superadmin@example.com',
    password: 'TestPassword123!',
    description: 'Seed script credentials'
  },
  {
    email: 'superadmin@dsatutor.com',
    password: 'superadmin123',
    description: 'Original test credentials'
  },
  {
    email: 'superadmin@example.com',
    password: 'superadmin123',
    description: 'Mixed credentials'
  },
  {
    email: 'admin@example.com',
    password: 'admin123',
    description: 'Regular admin credentials'
  }
]

const testLogin = async (credentials) => {
  try {
    console.log(`\n🔐 Testing: ${credentials.description}`)
    console.log(`   Email: ${credentials.email}`)
    console.log(`   Password: ${credentials.password}`)
    
    const response = await axios.post(`${BASE_URL}/auth/login-new`, {
      email: credentials.email,
      password: credentials.password
    })
    
    if (response.data.success) {
      console.log(`   ✅ SUCCESS! Token: ${response.data.data.token.substring(0, 20)}...`)
      console.log(`   User: ${response.data.data.user.fullName} (${response.data.data.user.role})`)
      return { success: true, token: response.data.data.token, user: response.data.data.user }
    } else {
      console.log(`   ❌ Failed: ${response.data.message}`)
      return { success: false, error: response.data.message }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`)
    return { success: false, error: error.response?.data?.message || error.message }
  }
}

const main = async () => {
  console.log('🔍 Testing Super Admin Login Credentials...')
  console.log('=' * 60)
  
  for (const credentials of testCredentials) {
    const result = await testLogin(credentials)
    if (result.success) {
      console.log('\n🎉 Found working credentials!')
      console.log(`Email: ${credentials.email}`)
      console.log(`Password: ${credentials.password}`)
      console.log(`Role: ${result.user.role}`)
      return
    }
  }
  
  console.log('\n❌ No working credentials found.')
  console.log('\n💡 Suggestions:')
  console.log('1. Check the seed script to see what credentials were actually created')
  console.log('2. Try creating a new super admin user manually')
  console.log('3. Check Firebase Console to see if the user exists')
}

main().catch(console.error) 