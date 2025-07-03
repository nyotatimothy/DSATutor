const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api'
let authToken = ''
let userId = ''

// Test data
const testCode = `
function twoSum(nums, target) {
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
`

const testCode2 = `
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}
`

const testCode3 = `
function twoSum(nums, target) {
  const seen = {};
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (complement in seen) {
      return [seen[complement], i];
    }
    seen[nums[i]] = i;
  }
  
  return [];
}
`

const problemDescription = 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.'

console.log('🧠 Starting Enhanced Analysis Features Test Suite...')
console.log('📧 Test User Email: test-enhanced-' + Date.now() + '@example.com')
console.log('🔑 Test Password: TestPassword123!')
console.log('💻 Test Code: function twoSum(nums, target) { ... }')
console.log('📝 Test Problem: Given an array of integers nums and an integer target...\n')

async function createTestUser() {
  try {
    const email = `test-enhanced-${Date.now()}@example.com`
    const response = await axios.post(`${BASE_URL}/auth/signup-new`, {
      email,
      password: 'TestPassword123!',
      name: 'Enhanced Analysis Test User'
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

async function loginWithExistingUser() {
  try {
    console.log('🔐 Logging in with existing user...')
    
    // Try to login with an existing user from seed data
    const response = await axios.post(`${BASE_URL}/auth/login-new`, {
      email: 'student@example.com',
      password: 'TestPassword123!'
    })

    if (response.data.success) {
      authToken = response.data.data.token
      userId = response.data.data.user.id
      console.log('✅ Login with existing user successful')
      return true
    } else {
      console.log('❌ Login with existing user failed:', response.data.message)
      return false
    }
  } catch (error) {
    console.log('❌ Login with existing user error:', error.response?.data?.message || error.message)
    return false
  }
}

async function login() {
  try {
    console.log('🔐 Creating and logging in as test user...')
    
    // Create a new test user
    const user = await createTestUser()
    userId = user.id
    
    // Login with the created user
    const response = await axios.post(`${BASE_URL}/auth/login-new`, {
      email: user.email,
      password: 'TestPassword123!'
    })

    if (response.data.success) {
      authToken = response.data.data.token
      console.log('✅ Login successful')
      return true
    } else {
      console.log('❌ Login failed:', response.data.message)
      return false
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data?.message || error.message)
    return false
  }
}

async function testEnhancedCodeAnalysis() {
  try {
    console.log('\n🧠 Testing Enhanced Code Analysis...')
    
    const response = await axios.post(`${BASE_URL}/ai/enhanced-analyze`, {
      code: testCode,
      problemDescription,
      language: 'javascript'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    if (response.data.success) {
      console.log('✅ Enhanced analysis successful')
      const analysis = response.data.data.analysis
      
      console.log(`📊 Basic Analysis Score: ${analysis.basicAnalysis.score}`)
      console.log(`🔍 Algorithm Type: ${analysis.algorithmAnalysis.algorithmType}`)
      console.log(`⚡ Efficiency: ${analysis.algorithmAnalysis.efficiency}`)
      console.log(`📖 Readability: ${analysis.codeStyleAnalysis.readability}`)
      console.log(`🔒 Security Score: ${analysis.securityAnalysis.securityScore}`)
      console.log(`🎯 Difficulty Level: ${analysis.learningInsights.difficultyLevel}`)
      
      return response.data.data.attempt.id
    } else {
      console.log('❌ Enhanced analysis failed:', response.data.message)
      return null
    }
  } catch (error) {
    console.log('❌ Enhanced analysis error:', error.response?.data?.message || error.message)
    return null
  }
}

async function testSolutionComparison() {
  try {
    console.log('\n🔄 Testing Solution Comparison...')
    
    // First, create multiple attempts with different solutions
    const attempts = []
    
    for (let i = 0; i < 3; i++) {
      const codes = [testCode, testCode2, testCode3]
      const response = await axios.post(`${BASE_URL}/ai/analyze`, {
        code: codes[i],
        problemDescription,
        language: 'javascript'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      
      if (response.data.success) {
        attempts.push(response.data.data.attempt.id)
      }
    }
    
    if (attempts.length >= 2) {
      const comparisonResponse = await axios.post(`${BASE_URL}/ai/compare-solutions`, {
        problemDescription,
        solutionIds: attempts
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      })

      if (comparisonResponse.data.success) {
        console.log('✅ Solution comparison successful')
        const comparison = comparisonResponse.data.data.comparison
        
        console.log(`🏆 Best Approach: ${comparisonResponse.data.data.comparison.bestApproach}`)
        console.log(`💡 Insights: ${comparisonResponse.data.data.comparison.insights.length} insights provided`)
        console.log(`📋 Recommendations: ${comparisonResponse.data.data.comparison.recommendations.length} recommendations`)
        
        return true
      } else {
        console.log('❌ Solution comparison failed:', comparisonResponse.data.message)
        return false
      }
    } else {
      console.log('❌ Not enough attempts created for comparison')
      return false
    }
  } catch (error) {
    console.log('❌ Solution comparison error:', error.response?.data?.message || error.message)
    return false
  }
}

async function testCodeOptimization() {
  try {
    console.log('\n⚡ Testing Code Optimization...')
    
    const response = await axios.post(`${BASE_URL}/ai/optimize-code`, {
      code: testCode2, // Use the less efficient version
      problemDescription,
      language: 'javascript'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    if (response.data.success) {
      console.log('✅ Code optimization successful')
      const optimization = response.data.data
      
      console.log(`🔧 Optimizations: ${optimization.optimizations.length} optimizations suggested`)
      console.log(`📈 Performance Gains: ${optimization.performanceGains.estimatedImprovement}`)
      console.log(`📊 Before/After: ${optimization.beforeAfterComparison.linesOfCode.before} → ${optimization.beforeAfterComparison.linesOfCode.after} lines`)
      
      return true
    } else {
      console.log('❌ Code optimization failed:', response.data.message)
      return false
    }
  } catch (error) {
    console.log('❌ Code optimization error:', error.response?.data?.message || error.message)
    return false
  }
}

async function testLearningPathGeneration() {
  try {
    console.log('\n🗺️ Testing Learning Path Generation...')
    
    const response = await axios.post(`${BASE_URL}/ai/learning-path`, {
      goals: ['Master advanced algorithms', 'Improve problem-solving skills', 'Prepare for technical interviews']
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    if (response.data.success) {
      console.log('✅ Learning path generation successful')
      const learningPath = response.data.data.learningPath
      
      console.log(`🎯 Current Level: ${learningPath.currentLevel}`)
      console.log(`🎯 Target Level: ${learningPath.targetLevel}`)
      console.log(`📋 Roadmap Phases: ${learningPath.roadmap.length} phases`)
      console.log(`🚀 Next Steps: ${learningPath.immediateNextSteps.length} immediate steps`)
      console.log(`🎯 Long-term Goals: ${learningPath.longTermGoals.length} goals`)
      
      return true
    } else {
      console.log('❌ Learning path generation failed:', response.data.message)
      return false
    }
  } catch (error) {
    console.log('❌ Learning path generation error:', error.response?.data?.message || error.message)
    return false
  }
}

async function testLearningPathHistory() {
  try {
    console.log('\n📚 Testing Learning Path History...')
    
    const response = await axios.get(`${BASE_URL}/ai/learning-path-history`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    if (response.data.success) {
      console.log('✅ Learning path history retrieval successful')
      const learningPaths = response.data.data
      
      console.log(`📖 Learning Paths Found: ${learningPaths.length}`)
      if (learningPaths.length > 0) {
        console.log(`📅 Latest Path Created: ${new Date(learningPaths[0].createdAt).toLocaleDateString()}`)
      }
      
      return true
    } else {
      console.log('❌ Learning path history failed:', response.data.message)
      return false
    }
  } catch (error) {
    console.log('❌ Learning path history error:', error.response?.data?.message || error.message)
    return false
  }
}

async function testSkillAssessment() {
  try {
    console.log('\n📊 Testing Skill Assessment...')
    
    const response = await axios.post(`${BASE_URL}/ai/assess`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    if (response.data.success) {
      console.log('✅ Skill assessment successful')
      const assessment = response.data.data.assessment
      
      console.log(`🎯 Overall Level: ${assessment.overallLevel}`)
      console.log(`💪 Strengths: ${assessment.strengths.length} identified`)
      console.log(`🔧 Weaknesses: ${assessment.weaknesses.length} identified`)
      console.log(`📋 Recommendations: ${assessment.recommendations.length} provided`)
      console.log(`🎯 Confidence Score: ${assessment.confidenceScore}%`)
      
      return true
    } else {
      console.log('❌ Skill assessment failed:', response.data.message)
      return false
    }
  } catch (error) {
    console.log('❌ Skill assessment error:', error.response?.data?.message || error.message)
    return false
  }
}

async function testHintGeneration() {
  try {
    console.log('\n💡 Testing Hint Generation...')
    
    const response = await axios.post(`${BASE_URL}/ai/hint`, {
      userCode: 'function twoSum(nums, target) {\n  // I\'m stuck here\n}',
      problemDescription,
      userStuck: true
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    if (response.data.success) {
      console.log('✅ Hint generation successful')
      const hint = response.data.data
      
      console.log(`💡 Hint Level: ${hint.hintLevel}`)
      console.log(`📝 Hint: ${hint.hint.substring(0, 100)}...`)
      console.log(`➡️ Next Step: ${hint.nextStep.substring(0, 100)}...`)
      
      return true
    } else {
      console.log('❌ Hint generation failed:', response.data.message)
      return false
    }
  } catch (error) {
    console.log('❌ Hint generation error:', error.response?.data?.message || error.message)
    return false
  }
}

async function testPracticeProblemGeneration() {
  try {
    console.log('\n🎯 Testing Practice Problem Generation...')
    
    const response = await axios.post(`${BASE_URL}/ai/generate-problem`, {
      userWeaknesses: ['Dynamic Programming', 'Graph Algorithms'],
      currentLevel: 'intermediate',
      topic: 'Arrays and Strings'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    if (response.data.success) {
      console.log('✅ Practice problem generation successful')
      const problem = response.data.data
      
      console.log(`📝 Problem Difficulty: ${problem.difficulty}`)
      console.log(`💡 Hints Available: ${problem.hints.length}`)
      console.log(`📖 Problem: ${problem.problem.substring(0, 100)}...`)
      
      return true
    } else {
      console.log('❌ Practice problem generation failed:', response.data.message)
      return false
    }
  } catch (error) {
    console.log('❌ Practice problem generation error:', error.response?.data?.message || error.message)
    return false
  }
}

async function runAllTests() {
  console.log('🚀 Starting Enhanced Analysis Features Test Suite...')
  
  const results = {
    login: false,
    enhancedAnalysis: false,
    solutionComparison: false,
    codeOptimization: false,
    learningPath: false,
    learningPathHistory: false,
    skillAssessment: false,
    hintGeneration: false,
    practiceProblem: false
  }

  // Test login - try existing user first, then create new user
  results.login = await loginWithExistingUser()
  if (!results.login) {
    console.log('🔄 Trying to create new test user...')
    results.login = await login()
  }
  
  if (!results.login) {
    console.log('❌ Cannot proceed without authentication')
    return results
  }

  // Run all tests
  results.enhancedAnalysis = await testEnhancedCodeAnalysis()
  results.solutionComparison = await testSolutionComparison()
  results.codeOptimization = await testCodeOptimization()
  results.learningPath = await testLearningPathGeneration()
  results.learningPathHistory = await testLearningPathHistory()
  results.skillAssessment = await testSkillAssessment()
  results.hintGeneration = await testHintGeneration()
  results.practiceProblem = await testPracticeProblemGeneration()

  // Summary
  console.log('\n📊 Test Results Summary:')
  console.log('=' * 50)
  
  const passed = Object.values(results).filter(Boolean).length
  const total = Object.keys(results).length
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} ${test}`)
  })
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed (${((passed/total)*100).toFixed(1)}%)`)
  
  return results
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(results => {
      process.exit(Object.values(results).every(Boolean) ? 0 : 1)
    })
    .catch(error => {
      console.error('❌ Test suite error:', error)
      process.exit(1)
    })
}

module.exports = { runAllTests } 