require('dotenv').config()
const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'
let authToken = ''
let testUserId = ''

// Test data
const testCode = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
`

const problemDescription = 'Write a function to calculate the nth Fibonacci number efficiently.'

console.log('🤖 Starting AI Integration Tests...')
console.log('📧 Test User Email: test-ai-' + Date.now() + '@example.com')
console.log('🔑 Test Password: TestPassword123!')
console.log('💻 Test Code: function fibonacci(n) { ... }')
console.log('📝 Test Problem: Write a function to calculate the nth Fibonacci number efficiently.\n')

async function createTestUser() {
  try {
    const email = `test-ai-${Date.now()}@example.com`
    const response = await axios.post(`${BASE_URL}/auth/signup-new`, {
      email,
      password: 'TestPassword123!',
      fullName: 'AI Test User'
    })
    
    if (response.data.success) {
      console.log('✅ Test user created')
      return response.data.data.user
    } else {
      throw new Error('Failed to create test user')
    }
  } catch (error) {
    console.error('❌ Failed to create test user:', error.response?.data || error.message)
    throw error
  }
}

async function loginUser(email) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login-new`, {
      email,
      password: 'TestPassword123!'
    })
    
    if (response.data.success) {
      console.log('✅ Test user logged in')
      return response.data.data.token
    } else {
      throw new Error('Failed to login user')
    }
  } catch (error) {
    console.error('❌ Failed to login user:', error.response?.data || error.message)
    throw error
  }
}

async function testAICodeAnalysis() {
  console.log('\n🧪 Testing AI Code Analysis...')
  
  try {
    const response = await axios.post(`${BASE_URL}/ai/analyze`, {
      code: testCode,
      problemDescription,
      language: 'javascript'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    if (response.data.success) {
      console.log('✅ AI Code Analysis successful')
      console.log(`   Score: ${response.data.data.analysis.score}/100`)
      console.log(`   Code Quality: ${response.data.data.analysis.codeQuality}`)
      console.log(`   Time Complexity: ${response.data.data.analysis.timeComplexity}`)
      console.log(`   Space Complexity: ${response.data.data.analysis.spaceComplexity}`)
      console.log(`   Issues Found: ${response.data.data.analysis.issues.length}`)
      console.log(`   Suggestions: ${response.data.data.analysis.suggestions.length}`)
      return true
    } else {
      console.log('❌ AI Code Analysis failed:', response.data.error)
      return false
    }
  } catch (error) {
    console.error('❌ AI Code Analysis error:', error.response?.data || error.message)
    return false
  }
}

async function testAISkillAssessment() {
  console.log('\n🧪 Testing AI Skill Assessment...')
  
  try {
    const response = await axios.post(`${BASE_URL}/ai/assess`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    if (response.data.success) {
      console.log('✅ AI Skill Assessment successful')
      console.log(`   Overall Level: ${response.data.data.assessment.overallLevel}`)
      console.log(`   Confidence Score: ${response.data.data.assessment.confidenceScore}%`)
      console.log(`   Strengths: ${response.data.data.assessment.strengths.length}`)
      console.log(`   Weaknesses: ${response.data.data.assessment.weaknesses.length}`)
      console.log(`   Recommendations: ${response.data.data.assessment.recommendations.length}`)
      return true
    } else {
      console.log('❌ AI Skill Assessment failed:', response.data.error)
      return false
    }
  } catch (error) {
    console.error('❌ AI Skill Assessment error:', error.response?.data || error.message)
    return false
  }
}

async function testAIHintGeneration() {
  console.log('\n🧪 Testing AI Hint Generation...')
  
  try {
    const response = await axios.post(`${BASE_URL}/ai/hint`, {
      userCode: 'function fib(n) { return n; }',
      problemDescription,
      userStuck: true
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    if (response.data.success) {
      console.log('✅ AI Hint Generation successful')
      console.log(`   Hint Level: ${response.data.data.hintLevel}`)
      console.log(`   Hint: ${response.data.data.hint.substring(0, 100)}...`)
      console.log(`   Next Step: ${response.data.data.nextStep.substring(0, 100)}...`)
      return true
    } else {
      console.log('❌ AI Hint Generation failed:', response.data.error)
      return false
    }
  } catch (error) {
    console.error('❌ AI Hint Generation error:', error.response?.data || error.message)
    return false
  }
}

async function testAIProblemGeneration() {
  console.log('\n🧪 Testing AI Problem Generation...')
  
  try {
    const response = await axios.post(`${BASE_URL}/ai/generate-problem`, {
      userWeaknesses: ['time complexity optimization', 'edge case handling'],
      currentLevel: 'intermediate',
      topic: 'dynamic programming'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    if (response.data.success) {
      console.log('✅ AI Problem Generation successful')
      console.log(`   Difficulty: ${response.data.data.difficulty}`)
      console.log(`   Problem: ${response.data.data.problem.substring(0, 100)}...`)
      console.log(`   Hints: ${response.data.data.hints.length}`)
      console.log(`   Solution Length: ${response.data.data.solution.length} chars`)
      return true
    } else {
      console.log('❌ AI Problem Generation failed:', response.data.error)
      return false
    }
  } catch (error) {
    console.error('❌ AI Problem Generation error:', error.response?.data || error.message)
    return false
  }
}

async function testAIAssessmentHistory() {
  console.log('\n🧪 Testing AI Assessment History...')
  
  try {
    const response = await axios.get(`${BASE_URL}/ai/assessments`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    if (response.data.success) {
      console.log('✅ AI Assessment History successful')
      console.log(`   Assessments Found: ${response.data.data.length}`)
      return true
    } else {
      console.log('❌ AI Assessment History failed:', response.data.error)
      return false
    }
  } catch (error) {
    console.error('❌ AI Assessment History error:', error.response?.data || error.message)
    return false
  }
}

async function testInvalidRequests() {
  console.log('\n🧪 Testing Invalid Requests...')
  
  let passed = 0
  let total = 0
  
  // Test without authentication
  try {
    await axios.post(`${BASE_URL}/ai/analyze`, {
      code: testCode,
      problemDescription
    })
    console.log('❌ Should have failed without auth')
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Unauthorized request properly rejected')
      passed++
    }
    total++
  }
  
  // Test missing required fields
  try {
    await axios.post(`${BASE_URL}/ai/analyze`, {
      code: testCode
      // Missing problemDescription
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    console.log('❌ Should have failed with missing fields')
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Missing fields properly rejected')
      passed++
    }
    total++
  }
  
  // Test invalid HTTP method
  try {
    await axios.get(`${BASE_URL}/ai/analyze`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    console.log('❌ Should have failed with invalid method')
  } catch (error) {
    if (error.response?.status === 405) {
      console.log('✅ Invalid method properly rejected')
      passed++
    }
    total++
  }
  
  return { passed, total }
}

async function runAllTests() {
  const results = {
    codeAnalysis: false,
    skillAssessment: false,
    hintGeneration: false,
    problemGeneration: false,
    assessmentHistory: false,
    validation: { passed: 0, total: 0 }
  }
  
  try {
    // Setup
    console.log('🔧 Setting up test data...')
    const user = await createTestUser()
    testUserId = user.id
    authToken = await loginUser(user.email)
    
    // Run tests
    results.codeAnalysis = await testAICodeAnalysis()
    results.skillAssessment = await testAISkillAssessment()
    results.hintGeneration = await testAIHintGeneration()
    results.problemGeneration = await testAIProblemGeneration()
    results.assessmentHistory = await testAIAssessmentHistory()
    results.validation = await testInvalidRequests()
    
    // Summary
    console.log('\n📊 AI Integration Test Summary')
    console.log('==============================')
    console.log(`Code Analysis: ${results.codeAnalysis ? '✅' : '❌'}`)
    console.log(`Skill Assessment: ${results.skillAssessment ? '✅' : '❌'}`)
    console.log(`Hint Generation: ${results.hintGeneration ? '✅' : '❌'}`)
    console.log(`Problem Generation: ${results.problemGeneration ? '✅' : '❌'}`)
    console.log(`Assessment History: ${results.assessmentHistory ? '✅' : '❌'}`)
    console.log(`Validation Tests: ${results.validation.passed}/${results.validation.total} passed`)
    
    const totalTests = 5 + results.validation.total
    const passedTests = [
      results.codeAnalysis,
      results.skillAssessment,
      results.hintGeneration,
      results.problemGeneration,
      results.assessmentHistory
    ].filter(Boolean).length + results.validation.passed
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1)
    console.log(`\n🎯 Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`)
    
    if (successRate >= 80) {
      console.log('\n🎉 AI Integration Tests Completed Successfully!')
    } else {
      console.log('\n⚠️  Some AI integration tests failed. Please check the implementation.')
    }
    
    return {
      success: successRate >= 80,
      results,
      successRate: parseFloat(successRate),
      passedTests,
      totalTests
    }
    
  } catch (error) {
    console.error('\n❌ Test setup failed:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// Run tests
runAllTests()
  .then(result => {
    // Save results to file
    const fs = require('fs')
    const resultsPath = './test-results.json'
    
    let existingResults = {}
    if (fs.existsSync(resultsPath)) {
      existingResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'))
    }
    
    existingResults.ai = {
      timestamp: new Date().toISOString(),
      ...result
    }
    
    fs.writeFileSync(resultsPath, JSON.stringify(existingResults, null, 2))
    console.log('\n💾 Test results saved to:', resultsPath)
    
    process.exit(result.success ? 0 : 1)
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error)
    process.exit(1)
  }) 