const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 DSATutor Comprehensive Test Suite')
console.log('=====================================\n')

const testResults = {
  timestamp: new Date().toISOString(),
  legacy: {},
  new: {},
  summary: {}
}

// Run legacy auth tests
console.log('📋 Phase 1: Legacy Authentication Tests')
console.log('----------------------------------------')
try {
  const legacyOutput = execSync('node scripts/test-auth.js', { 
    encoding: 'utf8',
    timeout: 30000 
  })
  console.log(legacyOutput)
  testResults.legacy = {
    status: 'completed',
    output: legacyOutput
  }
} catch (error) {
  console.log('❌ Legacy tests failed:', error.message)
  testResults.legacy = {
    status: 'failed',
    error: error.message
  }
}

console.log('\n📋 Phase 2: New Auth System Tests')
console.log('-----------------------------------')
try {
  const newOutput = execSync('node scripts/test-auth-new.js', { 
    encoding: 'utf8',
    timeout: 30000 
  })
  console.log(newOutput)
  testResults.new = {
    status: 'completed',
    output: newOutput
  }
} catch (error) {
  console.log('❌ New auth tests failed:', error.message)
  testResults.new = {
    status: 'failed',
    error: error.message
  }
}

// Run payment tests
console.log('\n📋 Payment Integration Tests')
console.log('-----------------------------')
try {
  const paymentOutput = execSync('node scripts/test-payments.js', { 
    encoding: 'utf8',
    timeout: 30000 
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
console.log(`Legacy Auth: ${testResults.legacy.status}`)
console.log(`New Auth: ${testResults.new.status}`)
console.log(`Payments: ${testResults.payments.status}`)

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