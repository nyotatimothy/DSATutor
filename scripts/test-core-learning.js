const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'
let authToken = null

// Test data
const testUser = {
  email: `test-core-${Date.now()}@example.com`,
  password: 'testpassword123'
}

const testCode = {
  javascript: `
function solution(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
  `,
  python: `
def solution(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
  `
}

async function login() {
  try {
    console.log('🔐 Logging in...')
    
    // First signup
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup-new`, {
      email: testUser.email,
      password: testUser.password,
      name: 'Test User'
    })
    
    if (signupResponse.data.success) {
      console.log('✅ User created')
    }
    
    // Then login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login-new`, {
      email: testUser.email,
      password: testUser.password
    })
    
    if (loginResponse.data.success) {
      authToken = loginResponse.data.data.token
      console.log('✅ Logged in successfully')
    } else {
      throw new Error('Login failed')
    }
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message)
    throw error
  }
}

async function testProblems() {
  console.log('\n📋 Testing Problems API...')
  
  try {
    // Test GET /api/problems
    const problemsResponse = await axios.get(`${BASE_URL}/problems`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    if (problemsResponse.data.success) {
      console.log('✅ GET /api/problems - Success')
      console.log(`   Found ${problemsResponse.data.data.length} problems`)
    } else {
      console.log('❌ GET /api/problems - Failed')
    }
    
    // Test filtering
    const filteredResponse = await axios.get(`${BASE_URL}/problems?difficulty=easy`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    if (filteredResponse.data.success) {
      console.log('✅ GET /api/problems?difficulty=easy - Success')
      console.log(`   Found ${filteredResponse.data.data.length} easy problems`)
    } else {
      console.log('❌ GET /api/problems?difficulty=easy - Failed')
    }
    
    // Test getting specific problem
    if (problemsResponse.data.data.length > 0) {
      const problemId = problemsResponse.data.data[0].id
      const problemResponse = await axios.get(`${BASE_URL}/problems/${problemId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      
      if (problemResponse.data.success) {
        console.log('✅ GET /api/problems/[id] - Success')
        console.log(`   Problem: ${problemResponse.data.data.title}`)
        console.log(`   Test cases: ${problemResponse.data.data.testCases.length}`)
      } else {
        console.log('❌ GET /api/problems/[id] - Failed')
      }
      
      return problemId
    }
    
  } catch (error) {
    console.error('❌ Problems test failed:', error.response?.data || error.message)
  }
}

async function testSubmissions(problemId) {
  console.log('\n💻 Testing Submissions API...')
  
  try {
    // Test JavaScript submission
    const jsSubmission = await axios.post(`${BASE_URL}/submissions`, {
      problemId,
      code: testCode.javascript,
      language: 'javascript'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    if (jsSubmission.data.success) {
      console.log('✅ JavaScript submission - Success')
      console.log(`   Result: ${jsSubmission.data.data.execution.result}`)
      console.log(`   Passed: ${jsSubmission.data.data.execution.passedCount}/${jsSubmission.data.data.execution.totalCount}`)
      console.log(`   Duration: ${jsSubmission.data.data.execution.durationMs}ms`)
    } else {
      console.log('❌ JavaScript submission - Failed')
    }
    
    // Test Python submission
    const pySubmission = await axios.post(`${BASE_URL}/submissions`, {
      problemId,
      code: testCode.python,
      language: 'python'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    if (pySubmission.data.success) {
      console.log('✅ Python submission - Success')
      console.log(`   Result: ${pySubmission.data.data.execution.result}`)
      console.log(`   Passed: ${pySubmission.data.data.execution.passedCount}/${pySubmission.data.data.execution.totalCount}`)
      console.log(`   Duration: ${pySubmission.data.data.execution.durationMs}ms`)
    } else {
      console.log('❌ Python submission - Failed')
    }
    
    // Test getting user submissions
    const submissionsResponse = await axios.get(`${BASE_URL}/submissions/${problemId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    if (submissionsResponse.data.success) {
      console.log('✅ GET /api/submissions/[problemId] - Success')
      console.log(`   Found ${submissionsResponse.data.data.length} submissions`)
    } else {
      console.log('❌ GET /api/submissions/[problemId] - Failed')
    }
    
  } catch (error) {
    console.error('❌ Submissions test failed:', error.response?.data || error.message)
  }
}

async function testInvalidSubmissions(problemId) {
  console.log('\n🚫 Testing Invalid Submissions...')
  
  try {
    // Test invalid language
    const invalidLangResponse = await axios.post(`${BASE_URL}/submissions`, {
      problemId,
      code: 'console.log("hello")',
      language: 'invalid'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    if (!invalidLangResponse.data.success) {
      console.log('✅ Invalid language rejected - Success')
    } else {
      console.log('❌ Invalid language should have been rejected')
    }
    
    // Test invalid code
    const invalidCodeResponse = await axios.post(`${BASE_URL}/submissions`, {
      problemId,
      code: 'invalid javascript code {',
      language: 'javascript'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    if (invalidCodeResponse.data.success) {
      console.log('✅ Invalid code handled gracefully - Success')
      console.log(`   Result: ${invalidCodeResponse.data.data.execution.result}`)
    } else {
      console.log('❌ Invalid code test failed')
    }
    
  } catch (error) {
    console.error('❌ Invalid submissions test failed:', error.response?.data || error.message)
  }
}

async function main() {
  console.log('🚀 Testing DSATutor Core Learning Features...')
  
  try {
    await login()
    const problemId = await testProblems()
    
    if (problemId) {
      await testSubmissions(problemId)
      await testInvalidSubmissions(problemId)
    }
    
    console.log('\n🎉 Core Learning Features Test Completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

main() 