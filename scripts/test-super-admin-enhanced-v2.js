const axios = require('axios')
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

const BASE_URL = 'http://localhost:3000/api'
let superAdminToken = null

// Test results tracking
const testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    successRate: 0
  },
  details: {
    authentication: [],
    contentManagement: [],
    systemConfig: [],
    auditLogging: [],
    dataExport: [],
    performanceMonitoring: [],
    notifications: [],
    rateLimiting: [],
    databaseMaintenance: [],
    backups: []
  }
}

// Test data
const superAdminCredentials = {
  email: 'superadmin@dsatutor.com',
  password: 'SuperAdmin123!'
}

console.log('🚀 Starting Enhanced Super Admin API Tests...')
console.log(`📧 Super Admin Email: ${superAdminCredentials.email}`)
console.log('')

async function makeRequest(method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    if (data) {
      config.data = data
    }
    
    const response = await axios(config)
    return { success: true, data: response.data, status: response.status }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    }
  }
}

function recordTest(category, testName, passed, details = null) {
  const testResult = {
    name: testName,
    passed,
    timestamp: new Date().toISOString(),
    details
  }
  
  testResults.details[category].push(testResult)
  testResults.summary.totalTests++
  
  if (passed) {
    testResults.summary.passed++
  } else {
    testResults.summary.failed++
  }
  
  testResults.summary.successRate = (testResults.summary.passed / testResults.summary.totalTests) * 100
}

async function setupTestData() {
  console.log('🔧 Setting up test data...')
  
  // Login as super admin
  console.log('1. Logging in as super admin...')
  const loginResult = await makeRequest('POST', '/auth/login-new', superAdminCredentials)
  if (loginResult.success) {
    superAdminToken = loginResult.data.data.token
    console.log('✅ Super admin logged in')
    recordTest('authentication', 'Super Admin Login', true)
  } else {
    console.log('❌ Super admin login failed:', loginResult.error)
    recordTest('authentication', 'Super Admin Login', false, loginResult.error)
  }
  
  console.log('')
}

async function testContentManagement() {
  console.log('📚 Testing Content Management System...')
  
  // Test 1: Get content overview
  console.log('1. Getting content overview...')
  const contentOverviewResult = await makeRequest('GET', '/super-admin/content', null, superAdminToken)
  if (contentOverviewResult.success) {
    console.log('✅ Content overview retrieved successfully')
    const data = contentOverviewResult.data.data
    console.log(`   Total Courses: ${data.overview.totalCourses}`)
    console.log(`   Total Topics: ${data.overview.totalTopics}`)
    console.log(`   Total Attempts: ${data.overview.totalAttempts}`)
    recordTest('contentManagement', 'Get Content Overview', true, data.overview)
  } else {
    console.log('❌ Get content overview failed:', contentOverviewResult.error)
    recordTest('contentManagement', 'Get Content Overview', false, contentOverviewResult.error)
  }
  
  // Test 2: Bulk content operations
  console.log('2. Testing bulk content operations...')
  const bulkOperationsResult = await makeRequest('POST', '/super-admin/content', {
    operation: 'activate_courses',
    contentIds: ['test-course-id']
  }, superAdminToken)
  if (bulkOperationsResult.success) {
    console.log('✅ Bulk content operations successful')
    recordTest('contentManagement', 'Bulk Content Operations', true, bulkOperationsResult.data)
  } else {
    console.log('❌ Bulk content operations failed:', bulkOperationsResult.error)
    recordTest('contentManagement', 'Bulk Content Operations', false, bulkOperationsResult.error)
  }
  
  console.log('')
}

async function testSystemConfig() {
  console.log('⚙️  Testing System Configuration...')
  
  // Test 1: Get system config
  console.log('1. Getting system configuration...')
  const getConfigResult = await makeRequest('GET', '/super-admin/config', null, superAdminToken)
  if (getConfigResult.success) {
    console.log('✅ System config retrieved successfully')
    const config = getConfigResult.data.data
    console.log(`   AI Enabled: ${config.features.aiEnabled}`)
    console.log(`   Payments Enabled: ${config.features.paymentsEnabled}`)
    console.log(`   Email Enabled: ${config.features.emailEnabled}`)
    recordTest('systemConfig', 'Get System Config', true, config.features)
  } else {
    console.log('❌ Get system config failed:', getConfigResult.error)
    recordTest('systemConfig', 'Get System Config', false, getConfigResult.error)
  }
  
  // Test 2: Update system config
  console.log('2. Updating system configuration...')
  const updateConfigResult = await makeRequest('PUT', '/super-admin/config', {
    config: {
      features: {
        aiEnabled: true,
        paymentsEnabled: true,
        emailEnabled: true
      }
    }
  }, superAdminToken)
  if (updateConfigResult.success) {
    console.log('✅ System config updated successfully')
    recordTest('systemConfig', 'Update System Config', true)
  } else {
    console.log('❌ Update system config failed:', updateConfigResult.error)
    recordTest('systemConfig', 'Update System Config', false, updateConfigResult.error)
  }
  
  console.log('')
}

async function testAuditLogging() {
  console.log('📋 Testing Audit Logging...')
  
  // Test 1: Get audit logs
  console.log('1. Getting audit logs...')
  const auditLogsResult = await makeRequest('GET', '/super-admin/audit', null, superAdminToken)
  if (auditLogsResult.success) {
    console.log('✅ Audit logs retrieved successfully')
    const logs = auditLogsResult.data.data.logs
    console.log(`   Found ${logs.length} audit log entries`)
    recordTest('auditLogging', 'Get Audit Logs', true, { count: logs.length })
  } else {
    console.log('❌ Get audit logs failed:', auditLogsResult.error)
    recordTest('auditLogging', 'Get Audit Logs', false, auditLogsResult.error)
  }
  
  console.log('')
}

async function testDataExport() {
  console.log('📤 Testing Data Export...')
  
  // Test 1: Export data
  console.log('1. Exporting data...')
  const exportResult = await makeRequest('GET', '/super-admin/export?entities=users,courses', null, superAdminToken)
  if (exportResult.success) {
    console.log('✅ Data export successful')
    const metadata = exportResult.data.metadata
    console.log(`   Exported ${metadata.recordCount} records`)
    console.log(`   Entities: ${metadata.entities.join(', ')}`)
    recordTest('dataExport', 'Export Data', true, metadata)
  } else {
    console.log('❌ Data export failed:', exportResult.error)
    recordTest('dataExport', 'Export Data', false, exportResult.error)
  }
  
  console.log('')
}

async function testPerformanceMonitoring() {
  console.log('📊 Testing Performance Monitoring...')
  
  // Test 1: Get performance metrics
  console.log('1. Getting performance metrics...')
  const performanceResult = await makeRequest('GET', '/super-admin/performance?period=24h', null, superAdminToken)
  if (performanceResult.success) {
    console.log('✅ Performance metrics retrieved successfully')
    const metrics = performanceResult.data.data.metrics
    console.log(`   CPU Usage: ${metrics.system.cpuUsage.toFixed(1)}%`)
    console.log(`   Memory Usage: ${metrics.system.memoryUsage.toFixed(1)}%`)
    console.log(`   API Requests/min: ${metrics.api.requestsPerMinute}`)
    recordTest('performanceMonitoring', 'Get Performance Metrics', true, metrics.system)
  } else {
    console.log('❌ Get performance metrics failed:', performanceResult.error)
    recordTest('performanceMonitoring', 'Get Performance Metrics', false, performanceResult.error)
  }
  
  console.log('')
}

async function testNotifications() {
  console.log('🔔 Testing Notification Management...')
  
  // Test 1: Get system notifications
  console.log('1. Getting system notifications...')
  const getNotificationsResult = await makeRequest('GET', '/super-admin/notifications', null, superAdminToken)
  if (getNotificationsResult.success) {
    console.log('✅ System notifications retrieved successfully')
    const notifications = getNotificationsResult.data.data.notifications
    console.log(`   Found ${notifications.length} notifications`)
    recordTest('notifications', 'Get System Notifications', true, { count: notifications.length })
  } else {
    console.log('❌ Get system notifications failed:', getNotificationsResult.error)
    recordTest('notifications', 'Get System Notifications', false, getNotificationsResult.error)
  }
  
  // Test 2: Create system notification
  console.log('2. Creating system notification...')
  const createNotificationResult = await makeRequest('POST', '/super-admin/notifications', {
    type: 'SYSTEM_MAINTENANCE',
    title: 'Test Maintenance Notice',
    message: 'This is a test notification for system maintenance',
    priority: 'medium'
  }, superAdminToken)
  if (createNotificationResult.success) {
    console.log('✅ System notification created successfully')
    recordTest('notifications', 'Create System Notification', true, createNotificationResult.data.data)
  } else {
    console.log('❌ Create system notification failed:', createNotificationResult.error)
    recordTest('notifications', 'Create System Notification', false, createNotificationResult.error)
  }
  
  console.log('')
}

async function testRateLimiting() {
  console.log('🚦 Testing Rate Limiting Management...')
  
  // Test 1: Get rate limit config
  console.log('1. Getting rate limit configuration...')
  const rateLimitResult = await makeRequest('GET', '/super-admin/rate-limits', null, superAdminToken)
  if (rateLimitResult.success) {
    console.log('✅ Rate limit config retrieved successfully')
    const config = rateLimitResult.data.data
    console.log(`   Global requests/min: ${config.global.requestsPerMinute}`)
    console.log(`   Auth requests/min: ${config.endpoints.auth.requestsPerMinute}`)
    recordTest('rateLimiting', 'Get Rate Limit Config', true, config.global)
  } else {
    console.log('❌ Get rate limit config failed:', rateLimitResult.error)
    recordTest('rateLimiting', 'Get Rate Limit Config', false, rateLimitResult.error)
  }
  
  console.log('')
}

async function testDatabaseMaintenance() {
  console.log('🗄️  Testing Database Maintenance...')
  
  // Test 1: Get database health
  console.log('1. Getting database health...')
  const dbHealthResult = await makeRequest('GET', '/super-admin/database', null, superAdminToken)
  if (dbHealthResult.success) {
    console.log('✅ Database health retrieved successfully')
    const health = dbHealthResult.data.data
    console.log(`   Status: ${health.status}`)
    console.log(`   Response Time: ${health.responseTime}ms`)
    console.log(`   Users: ${health.tables.users}`)
    console.log(`   Courses: ${health.tables.courses}`)
    recordTest('databaseMaintenance', 'Get Database Health', true, health)
  } else {
    console.log('❌ Get database health failed:', dbHealthResult.error)
    recordTest('databaseMaintenance', 'Get Database Health', false, dbHealthResult.error)
  }
  
  // Test 2: Run database maintenance
  console.log('2. Running database maintenance...')
  const maintenanceResult = await makeRequest('POST', '/super-admin/database', {
    operation: 'analyze'
  }, superAdminToken)
  if (maintenanceResult.success) {
    console.log('✅ Database maintenance completed successfully')
    recordTest('databaseMaintenance', 'Run Database Maintenance', true, maintenanceResult.data)
  } else {
    console.log('❌ Database maintenance failed:', maintenanceResult.error)
    recordTest('databaseMaintenance', 'Run Database Maintenance', false, maintenanceResult.error)
  }
  
  console.log('')
}

async function testBackups() {
  console.log('💾 Testing System Backups...')
  
  // Test 1: Get backup history
  console.log('1. Getting backup history...')
  const backupHistoryResult = await makeRequest('GET', '/super-admin/backups', null, superAdminToken)
  if (backupHistoryResult.success) {
    console.log('✅ Backup history retrieved successfully')
    const backups = backupHistoryResult.data.data.backups
    console.log(`   Found ${backups.length} backups`)
    recordTest('backups', 'Get Backup History', true, { count: backups.length })
  } else {
    console.log('❌ Get backup history failed:', backupHistoryResult.error)
    recordTest('backups', 'Get Backup History', false, backupHistoryResult.error)
  }
  
  // Test 2: Create system backup
  console.log('2. Creating system backup...')
  const createBackupResult = await makeRequest('POST', '/super-admin/backups', {
    includeData: true,
    includeConfig: true
  }, superAdminToken)
  if (createBackupResult.success) {
    console.log('✅ System backup created successfully')
    const backup = createBackupResult.data.data
    console.log(`   Backup ID: ${backup.id}`)
    console.log(`   Size: ${backup.size}`)
    recordTest('backups', 'Create System Backup', true, backup)
  } else {
    console.log('❌ Create system backup failed:', createBackupResult.error)
    recordTest('backups', 'Create System Backup', false, createBackupResult.error)
  }
  
  console.log('')
}

function saveTestResults() {
  const resultsPath = path.join(__dirname, '..', 'test-results.json')
  fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2))
  console.log(`📊 Test results saved to: ${resultsPath}`)
}

async function runTests() {
  try {
    await setupTestData()
    await testContentManagement()
    await testSystemConfig()
    await testAuditLogging()
    await testDataExport()
    await testPerformanceMonitoring()
    await testNotifications()
    await testRateLimiting()
    await testDatabaseMaintenance()
    await testBackups()
    
    console.log('🎉 Enhanced Super Admin API Tests Completed!')
    console.log('')
    console.log('📊 Test Summary:')
    console.log(`Total Tests: ${testResults.summary.totalTests}`)
    console.log(`✅ Passed: ${testResults.summary.passed}`)
    console.log(`❌ Failed: ${testResults.summary.failed}`)
    console.log(`📈 Success Rate: ${testResults.summary.successRate.toFixed(1)}%`)
    console.log('')
    console.log('🔗 New Super Admin Endpoints:')
    console.log('   GET    /api/super-admin/content - Content overview')
    console.log('   POST   /api/super-admin/content - Bulk content operations')
    console.log('   GET    /api/super-admin/config - System configuration')
    console.log('   PUT    /api/super-admin/config - Update system config')
    console.log('   GET    /api/super-admin/audit - Audit logs')
    console.log('   GET    /api/super-admin/export - Data export')
    console.log('   GET    /api/super-admin/performance - Performance metrics')
    console.log('   GET    /api/super-admin/notifications - System notifications')
    console.log('   POST   /api/super-admin/notifications - Create notification')
    console.log('   GET    /api/super-admin/rate-limits - Rate limit config')
    console.log('   GET    /api/super-admin/database - Database health')
    console.log('   POST   /api/super-admin/database - Database maintenance')
    console.log('   GET    /api/super-admin/backups - Backup history')
    console.log('   POST   /api/super-admin/backups - Create backup')
    
    // Save test results
    saveTestResults()
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the tests
runTests() 