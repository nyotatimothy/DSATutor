const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 DSATutor Comprehensive Test Suite')
console.log('=====================================\n')

const testResults = {
  timestamp: new Date().toISOString(),
  auth: {},
  courses: {},
  progress: {},
  attempts: {},
  payments: {},
  summary: {}
}

// Run Auth API tests
console.log('📋 Phase 1: Authentication API Tests')
console.log('--------------------------------------')
try {
  const authOutput = execSync('node scripts/test-auth-new.js', { 
    encoding: 'utf8',
    timeout: 60000 
  })
  console.log(authOutput)
  testResults.auth = {
    status: 'completed',
    output: authOutput
  }
} catch (error) {
  console.log('❌ Auth tests failed:', error.message)
  testResults.auth = {
    status: 'failed',
    error: error.message
  }
}

// Run Courses & Topics API tests
console.log('\n📋 Phase 2: Courses & Topics API Tests')
console.log('----------------------------------------')
try {
  const coursesOutput = execSync('node scripts/test-courses-topics.js', { 
    encoding: 'utf8',
    timeout: 60000 
  })
  console.log(coursesOutput)
  testResults.courses = {
    status: 'completed',
    output: coursesOutput
  }
} catch (error) {
  console.log('❌ Courses & Topics tests failed:', error.message)
  testResults.courses = {
    status: 'failed',
    error: error.message
  }
}

// Run Progress API tests
console.log('\n📋 Phase 3: Progress API Tests')
console.log('-------------------------------')
try {
  const progressOutput = execSync('node scripts/test-progress.js', { 
    encoding: 'utf8',
    timeout: 60000 
  })
  console.log(progressOutput)
  testResults.progress = {
    status: 'completed',
    output: progressOutput
  }
} catch (error) {
  console.log('❌ Progress tests failed:', error.message)
  testResults.progress = {
    status: 'failed',
    error: error.message
  }
}

// Run Attempts API tests
console.log('\n📋 Phase 4: Attempts API Tests')
console.log('-------------------------------')
try {
  const attemptsOutput = execSync('node scripts/test-attempts.js', { 
    encoding: 'utf8',
    timeout: 60000 
  })
  console.log(attemptsOutput)
  testResults.attempts = {
    status: 'completed',
    output: attemptsOutput
  }
} catch (error) {
  console.log('❌ Attempts tests failed:', error.message)
  testResults.attempts = {
    status: 'failed',
    error: error.message
  }
}

// Run Payment API tests
console.log('\n📋 Phase 5: Payment API Tests')
console.log('------------------------------')
try {
  const paymentOutput = execSync('node scripts/test-payments.js', { 
    encoding: 'utf8',
    timeout: 60000 
  })
  console.log(paymentOutput)
  testResults.payments = {
    status: 'completed',
    output: paymentOutput
  }
} catch (error) {
  console.log('❌ Payment tests failed:', error.message)
  testResults.payments = {
    status: 'failed',
    error: error.message
  }
}

// Generate summary
console.log('\n📊 Test Summary')
console.log('===============')
console.log(`Timestamp: ${testResults.timestamp}`)
console.log(`Auth API: ${testResults.auth.status}`)
console.log(`Courses & Topics API: ${testResults.courses.status}`)
console.log(`Progress API: ${testResults.progress.status}`)
console.log(`Attempts API: ${testResults.attempts.status}`)
console.log(`Payment API: ${testResults.payments.status}`)

// Calculate overall success rate
const totalTests = Object.keys(testResults).filter(key => key !== 'timestamp' && key !== 'summary').length
const passedTests = Object.values(testResults).filter(result => result.status === 'completed').length
const successRate = ((passedTests / totalTests) * 100).toFixed(1)

console.log(`\n🎯 Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`)

// Save results to file
const resultsPath = path.join(__dirname, '..', 'test-results.json')
fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2))
console.log(`\n💾 Test results saved to: ${resultsPath}`)

// Update report timestamp
const reportPath = path.join(__dirname, '..', 'public', 'report.html')
if (fs.existsSync(reportPath)) {
  let reportContent = fs.readFileSync(reportPath, 'utf8')
  reportContent = reportContent.replace(
    /Generated on <span id="current-time">.*?<\/span>/,
    `Generated on <span id="current-time">${new Date().toLocaleString()}</span>`
  )
  fs.writeFileSync(reportPath, reportContent)
  console.log('📄 Report timestamp updated')
}

console.log('\n🎉 All tests completed!')
console.log('📖 View detailed report at: http://localhost:3000/report.html') 