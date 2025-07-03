const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test scripts to run
const testScripts = [
  'scripts/test-auth-new.js',
  'scripts/test-courses-topics.js', 
  'scripts/test-progress.js',
  'scripts/test-attempts.js',
  'scripts/test-payments.js',
  'scripts/test-super-admin-enhanced-v2.js'
];

// HTML template for the report
const htmlTemplate = (results) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DSATutor Test Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .summary {
            background: #f8f9fa;
            padding: 30px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .summary-card h3 {
            font-size: 2rem;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .summary-card p {
            color: #6c757d;
            font-weight: 500;
        }
        
        .content {
            padding: 40px;
        }
        
        .phase {
            margin-bottom: 40px;
            border: 1px solid #e9ecef;
            border-radius: 15px;
            overflow: hidden;
        }
        
        .phase-header {
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .phase-header h2 {
            color: #495057;
            font-size: 1.5rem;
            margin-bottom: 5px;
        }
        
        .phase-header .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status.success {
            background: #d4edda;
            color: #155724;
        }
        
        .status.failed {
            background: #f8d7da;
            color: #721c24;
        }
        
        .phase-content {
            padding: 20px;
        }
        
        .test-result {
            margin-bottom: 15px;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid;
        }
        
        .test-result.success {
            background: #f8fff9;
            border-left-color: #28a745;
        }
        
        .test-result.failed {
            background: #fff8f8;
            border-left-color: #dc3545;
        }
        
        .test-result .test-name {
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .test-result .test-details {
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        .endpoints {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .endpoints h4 {
            margin-bottom: 15px;
            color: #495057;
        }
        
        .endpoint {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9rem;
        }
        
        .method {
            background: #667eea;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-right: 10px;
            min-width: 50px;
            text-align: center;
        }
        
        .timestamp {
            text-align: center;
            padding: 20px;
            color: #6c757d;
            font-size: 0.9rem;
            border-top: 1px solid #e9ecef;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            transition: width 0.3s ease;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .summary-grid {
                grid-template-columns: 1fr;
            }
            
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 DSATutor Test Report</h1>
            <p>Comprehensive API Testing Results</p>
        </div>
        
        <div class="summary">
            <h2>📊 Overall Summary</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>${results.totalTests}</h3>
                    <p>Total Tests</p>
                </div>
                <div class="summary-card">
                    <h3>${results.passedTests}</h3>
                    <p>Passed</p>
                </div>
                <div class="summary-card">
                    <h3>${results.failedTests}</h3>
                    <p>Failed</p>
                </div>
                <div class="summary-card">
                    <h3>${results.successRate}%</h3>
                    <p>Success Rate</p>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${results.successRate}%"></div>
            </div>
        </div>
        
        <div class="content">
            ${results.phases.map(phase => `
                <div class="phase">
                    <div class="phase-header">
                        <h2>${phase.title}</h2>
                        <span class="status ${phase.success ? 'success' : 'failed'}">
                            ${phase.success ? '✅ Passed' : '❌ Failed'}
                        </span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${phase.successRate}%"></div>
                        </div>
                        <p>${phase.passed}/${phase.total} tests passed (${phase.successRate}%)</p>
                    </div>
                    <div class="phase-content">
                        ${phase.tests.map(test => `
                            <div class="test-result ${test.passed ? 'success' : 'failed'}">
                                <div class="test-name">
                                    ${test.passed ? '✅' : '❌'} ${test.name}
                                </div>
                                ${test.details ? `<div class="test-details">${test.details}</div>` : ''}
                            </div>
                        `).join('')}
                        
                        ${phase.endpoints ? `
                            <div class="endpoints">
                                <h4>🔗 Available Endpoints</h4>
                                ${phase.endpoints.map(endpoint => `
                                    <div class="endpoint">
                                        <span class="method">${endpoint.method}</span>
                                        <span>${endpoint.path}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="timestamp">
            Generated on ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>
`;

// Parse test output to extract results
function parseTestOutput(output, phaseName) {
  const lines = output.split('\n');
  const tests = [];
  let passedCount = 0;
  let totalCount = 0;
  let successRate = 0;
  let endpoints = [];
  
  for (const line of lines) {
    if (line.includes('✅') || line.includes('❌')) {
      totalCount++;
      const testPassed = line.includes('✅');
      if (testPassed) passedCount++;
      
      const testName = line.replace(/[✅❌]/g, '').trim();
      tests.push({
        name: testName,
        passed: testPassed,
        details: null
      });
    }
    
    // Extract endpoints
    if (line.includes('GET') || line.includes('POST') || line.includes('PUT') || line.includes('DELETE')) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        endpoints.push({
          method: parts[0],
          path: parts[1]
        });
      }
    }
  }
  
  if (totalCount > 0) {
    successRate = Math.round((passedCount / totalCount) * 100);
  }
  
  return {
    title: phaseName,
    tests,
    passed: passedCount,
    total: totalCount,
    successRate,
    success: successRate === 100,
    endpoints: endpoints.length > 0 ? endpoints : null
  };
}

// Main execution
console.log('🚀 Running DSATutor Comprehensive Test Suite...\n');

const results = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  successRate: 0,
  phases: []
};

for (const script of testScripts) {
  try {
    console.log(`📋 Running ${script}...`);
    const output = execSync(`node ${script}`, { encoding: 'utf8' });
    
    const phaseName = script.replace('scripts/test-', '').replace('.js', '').replace('-', ' ').toUpperCase();
    const phaseResults = parseTestOutput(output, phaseName);
    
    results.phases.push(phaseResults);
    results.totalTests += phaseResults.total;
    results.passedTests += phaseResults.passed;
    
    console.log(`✅ ${phaseName}: ${phaseResults.passed}/${phaseResults.total} tests passed`);
  } catch (error) {
    console.error(`❌ Error running ${script}:`, error.message);
    
    results.phases.push({
      title: script.replace('scripts/test-', '').replace('.js', '').replace('-', ' ').toUpperCase(),
      tests: [{ name: 'Script execution failed', passed: false, details: error.message }],
      passed: 0,
      total: 1,
      successRate: 0,
      success: false
    });
    
    results.totalTests += 1;
    results.failedTests += 1;
  }
}

results.failedTests = results.totalTests - results.passedTests;
results.successRate = results.totalTests > 0 ? Math.round((results.passedTests / results.totalTests) * 100) : 0;

// Generate HTML report
const htmlReport = htmlTemplate(results);
fs.writeFileSync('public/report.html', htmlReport);

console.log('\n🎉 Test suite completed!');
console.log(`📊 Overall Results: ${results.passedTests}/${results.totalTests} tests passed (${results.successRate}%)`);
console.log('📄 Report generated: public/report.html'); 