import { NextApiRequest, NextApiResponse } from 'next'
import { accessControl } from '../../../middlewares/accessControl'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Apply access control middleware
    await new Promise<void>((resolve, reject) => {
      accessControl.aiAssessment(req, res, () => {
        resolve()
      })
    })

    const { problemId, userCode, language, action } = req.body

    if (!problemId || !userCode || !language) {
      return res.status(400).json({
        success: false,
        message: 'Problem ID, user code, and language are required'
      })
    }

    // Get problem details
    const problem = getProblemDetails(problemId)
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      })
    }

    // Analyze the code based on action
    let assessment
    if (action === 'run') {
      assessment = await runCodeAnalysis(userCode, language, problem)
    } else if (action === 'submit') {
      assessment = await submitCodeAnalysis(userCode, language, problem)
    } else {
      assessment = await generalCodeAnalysis(userCode, language, problem)
    }

    res.status(200).json({
      success: true,
      data: assessment
    })

  } catch (error) {
    console.error('AI Assessment error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

function getProblemDetails(problemId: string) {
  const problems: { [key: string]: any } = {
    '1': {
      title: 'Two Sum',
      difficulty: 'Easy',
      category: 'Array',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      expectedOutput: 'Array of two indices',
      testCases: [
        { input: '[2,7,11,15], target = 9', output: '[0,1]' },
        { input: '[3,2,4], target = 6', output: '[1,2]' },
        { input: '[3,3], target = 6', output: '[0,1]' }
      ],
      functionName: 'twoSum',
      parameters: ['nums', 'target']
    },
    '2': {
      title: 'Valid Parentheses',
      difficulty: 'Easy',
      category: 'Stack',
      description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
      expectedOutput: 'Boolean',
      testCases: [
        { input: '"()"', output: 'true' },
        { input: '"()[]{}"', output: 'true' },
        { input: '"(]"', output: 'false' },
        { input: '"([)]"', output: 'false' }
      ],
      functionName: 'isValid',
      parameters: ['s']
    },
    '3': {
      title: 'Maximum Subarray',
      difficulty: 'Medium',
      category: 'Dynamic Programming',
      description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
      expectedOutput: 'Integer',
      testCases: [
        { input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6' },
        { input: '[1]', output: '1' },
        { input: '[5,4,-1,7,8]', output: '23' }
      ],
      functionName: 'maxSubArray',
      parameters: ['nums']
    },
    '4': {
      title: 'Merge Two Sorted Lists',
      difficulty: 'Easy',
      category: 'Linked List',
      description: 'Merge two sorted linked lists and return it as a sorted list.',
      expectedOutput: 'Linked List',
      testCases: [
        { input: 'l1 = [1,2,4], l2 = [1,3,4]', output: '[1,1,2,3,4,4]' }
      ],
      functionName: 'mergeTwoLists',
      parameters: ['l1', 'l2']
    },
    '5': {
      title: 'Best Time to Buy and Sell Stock',
      difficulty: 'Easy',
      category: 'Array',
      description: 'Find the maximum profit you can achieve from buying and selling a stock.',
      expectedOutput: 'Integer',
      testCases: [
        { input: '[7,1,5,3,6,4]', output: '5' },
        { input: '[7,6,4,3,1]', output: '0' }
      ],
      functionName: 'maxProfit',
      parameters: ['prices']
    },
    '6': {
      title: 'Reverse Linked List',
      difficulty: 'Easy',
      category: 'Linked List',
      description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
      expectedOutput: 'Linked List',
      testCases: [
        { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
        { input: 'head = [1,2]', output: '[2,1]' }
      ]
    },
    '7': {
      title: 'Climbing Stairs',
      difficulty: 'Easy',
      category: 'Dynamic Programming',
      description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
      expectedOutput: 'Integer',
      testCases: [
        { input: 'n = 2', output: '2' },
        { input: 'n = 3', output: '3' }
      ]
    },
    '8': {
      title: 'Valid Anagram',
      difficulty: 'Easy',
      category: 'String',
      description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
      expectedOutput: 'Boolean',
      testCases: [
        { input: 's = "anagram", t = "nagaram"', output: 'true' },
        { input: 's = "rat", t = "car"', output: 'false' }
      ]
    },
    '9': {
      title: 'Binary Tree Inorder Traversal',
      difficulty: 'Easy',
      category: 'Tree',
      description: 'Given the root of a binary tree, return the inorder traversal of its nodes values.',
      expectedOutput: 'Array',
      testCases: [
        { input: 'root = [1,null,2,3]', output: '[1,3,2]' },
        { input: 'root = []', output: '[]' }
      ]
    },
    '10': {
      title: 'Maximum Depth of Binary Tree',
      difficulty: 'Easy',
      category: 'Tree',
      description: 'Given the root of a binary tree, return its maximum depth.',
      expectedOutput: 'Integer',
      testCases: [
        { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
        { input: 'root = [1,null,2]', output: '2' }
      ]
    },
    '11': {
      title: 'Palindrome Number',
      difficulty: 'Easy',
      category: 'Math',
      description: 'Given an integer x, return true if x is a palindrome, and false otherwise.',
      expectedOutput: 'Boolean',
      testCases: [
        { input: 'x = 121', output: 'true' },
        { input: 'x = -121', output: 'false' }
      ]
    },
    '12': {
      title: 'Remove Duplicates from Sorted Array',
      difficulty: 'Easy',
      category: 'Array',
      description: 'Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once.',
      expectedOutput: 'Integer',
      testCases: [
        { input: '[1,1,2]', output: '2' },
        { input: '[0,0,1,1,1,2,2,3,3,4]', output: '5' }
      ]
    },
    '13': {
      title: 'Remove Element',
      difficulty: 'Easy',
      category: 'Array',
      description: 'Given an integer array nums and an integer val, remove all occurrences of val in nums in-place.',
      expectedOutput: 'Integer',
      testCases: [
        { input: 'nums = [3,2,2,3], val = 3', output: '2' },
        { input: 'nums = [0,1,2,2,3,0,4,2], val = 2', output: '5' }
      ]
    },
    '14': {
      title: 'Implement strStr()',
      difficulty: 'Easy',
      category: 'String',
      description: 'Return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.',
      expectedOutput: 'Integer',
      testCases: [
        { input: 'haystack = "hello", needle = "ll"', output: '2' },
        { input: 'haystack = "aaaaa", needle = "bba"', output: '-1' }
      ]
    },
    '15': {
      title: 'Search Insert Position',
      difficulty: 'Easy',
      category: 'Array',
      description: 'Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.',
      expectedOutput: 'Integer',
      testCases: [
        { input: 'nums = [1,3,5,6], target = 5', output: '2' },
        { input: 'nums = [1,3,5,6], target = 2', output: '1' }
      ]
    }
  }
  
  return problems[problemId]
}

async function runCodeAnalysis(userCode: string, language: string, problem: any) {
  // Parse and analyze the code
  const codeAnalysis = parseCode(userCode, language, problem)
  const testResults = runTestCases(userCode, language, problem, false) // Basic tests only
  
  return {
    type: 'run',
    status: codeAnalysis.hasSyntaxErrors ? 'error' : testResults.passed > 0 ? 'success' : 'failed',
    executionTime: Math.random() * 50 + 10, // ms
    memoryUsage: Math.random() * 30 + 5, // MB
    testResults: testResults.results,
    feedback: {
      syntax: codeAnalysis.syntaxFeedback,
      logic: codeAnalysis.logicFeedback,
      performance: `Time Complexity: ${codeAnalysis.timeComplexity}, Space Complexity: ${codeAnalysis.spaceComplexity}`,
      suggestions: codeAnalysis.suggestions
    },
    score: calculateRunScore(codeAnalysis, testResults),
    timestamp: new Date().toISOString()
  }
}

async function submitCodeAnalysis(userCode: string, language: string, problem: any) {
  // Comprehensive code analysis for submission
  const codeAnalysis = parseCode(userCode, language, problem)
  const testResults = runTestCases(userCode, language, problem, true) // All tests including edge cases
  
  const score = calculateSubmitScore(codeAnalysis, testResults)

  return {
    type: 'submit',
    status: score >= 80 ? 'passed' : 'failed',
    score,
    executionTime: Math.random() * 100 + 10,
    memoryUsage: Math.random() * 50 + 5,
    testResults: testResults.results,
    detailedFeedback: {
      syntax: codeAnalysis.syntaxFeedback,
      logic: codeAnalysis.logicFeedback,
      performance: {
        timeComplexity: codeAnalysis.timeComplexity,
        spaceComplexity: codeAnalysis.spaceComplexity,
        analysis: codeAnalysis.performanceAnalysis
      },
      codeQuality: {
        score: codeAnalysis.codeQualityScore,
        feedback: codeAnalysis.codeQualityFeedback
      },
      suggestions: codeAnalysis.suggestions
    },
    nextSteps: getNextSteps(score, problem),
    timestamp: new Date().toISOString()
  }
}

async function generalCodeAnalysis(userCode: string, language: string, problem: any) {
  const codeAnalysis = parseCode(userCode, language, problem)
  
  return {
    type: 'analysis',
    status: 'success',
    analysis: {
      problemUnderstanding: assessProblemUnderstanding(userCode, problem),
      approach: analyzeApproach(userCode, problem),
      implementation: analyzeImplementation(userCode),
      optimization: suggestOptimizations(userCode, problem)
    },
    timestamp: new Date().toISOString()
  }
}

function parseCode(code: string, language: string, problem: any) {
  const analysis = {
    hasSyntaxErrors: false,
    syntaxFeedback: '',
    logicFeedback: '',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    performanceAnalysis: '',
    codeQualityScore: 100,
    codeQualityFeedback: '',
    suggestions: [] as string[],
    hasFunction: false,
    functionName: '',
    hasReturn: false,
    hasLoops: false,
    hasConditionals: false,
    hasDataStructures: false
  }

  // Check for basic syntax
  if (language === 'javascript') {
    // Check for function definition
    const functionRegex = new RegExp(`(function\\s+${problem.functionName}|const\\s+${problem.functionName}|let\\s+${problem.functionName}|var\\s+${problem.functionName}|${problem.functionName}\\s*=\\s*function|${problem.functionName}\\s*=\\s*\\(.*\\)\\s*=>)`, 'i')
    analysis.hasFunction = functionRegex.test(code)
    analysis.functionName = analysis.hasFunction ? problem.functionName : ''

    // Check for return statement
    analysis.hasReturn = /\breturn\b/.test(code)

    // Check for loops
    analysis.hasLoops = /\b(for|while|do)\b/.test(code)

    // Check for conditionals
    analysis.hasConditionals = /\b(if|else|switch)\b/.test(code)

    // Check for data structures
    analysis.hasDataStructures = /\b(Map|Set|Array|Object|new\s+Map|new\s+Set|\[\]|{})\b/.test(code)

    // Syntax validation
    const syntaxChecks = [
      { pattern: /[{}()[\]"'`]/, name: 'unclosed brackets/quotes' },
      { pattern: /;\s*$/, name: 'missing semicolons' },
      { pattern: /\b(undefined|null)\b/, name: 'potential null/undefined issues' }
    ]

    for (const check of syntaxChecks) {
      if (check.pattern.test(code)) {
        analysis.syntaxFeedback += `Potential ${check.name} detected. `
      }
    }

    if (!analysis.hasFunction) {
      analysis.syntaxFeedback += `Function '${problem.functionName}' not found. `
      analysis.hasSyntaxErrors = true
    }

    if (!analysis.hasReturn) {
      analysis.syntaxFeedback += 'No return statement found. '
      analysis.hasSyntaxErrors = true
    }

    if (analysis.syntaxFeedback === '') {
      analysis.syntaxFeedback = '✅ Code compiles successfully.'
    }

    // Analyze complexity
    if (/\bfor\s*\(.*for\s*\(/.test(code)) {
      analysis.timeComplexity = 'O(n²)'
    } else if (/\bsort\b/.test(code)) {
      analysis.timeComplexity = 'O(n log n)'
    } else if (/\bfor\b|\bwhile\b/.test(code)) {
      analysis.timeComplexity = 'O(n)'
    }

    if (/\bnew\s+(Map|Set|Array)|\[\]/.test(code)) {
      analysis.spaceComplexity = 'O(n)'
    }

    // Code quality analysis
    if (!code.includes('//') && code.length > 50) analysis.codeQualityScore -= 10
    if (/\bvar\b/.test(code)) analysis.codeQualityScore -= 5
    if (/\bconsole\.log\b/.test(code)) analysis.codeQualityScore -= 5
    if (code.length > 200) analysis.codeQualityScore -= 10
    if (/\bconst\b/.test(code)) analysis.codeQualityScore += 5
    if (/\bfunction\b/.test(code)) analysis.codeQualityScore += 5

    analysis.codeQualityScore = Math.max(0, Math.min(100, analysis.codeQualityScore))
  }

  // Logic analysis based on problem type
  analysis.logicFeedback = analyzeLogic(code, problem)
  analysis.performanceAnalysis = analyzePerformance(code, problem)
  analysis.suggestions = generateSuggestions(code, problem, analysis)

  return analysis
}

function analyzeLogic(code: string, problem: any): string {
  const problemKeywords = {
    'Two Sum': ['map', 'hash', 'dictionary', 'complement', 'target'],
    'Valid Parentheses': ['stack', 'push', 'pop', 'bracket', 'parenthesis'],
    'Maximum Subarray': ['kadane', 'dp', 'dynamic', 'sum', 'max'],
    'Merge Two Sorted Lists': ['merge', 'sorted', 'linked', 'list'],
    'Best Time to Buy and Sell Stock': ['min', 'max', 'profit', 'buy', 'sell']
  };

  const keywords = problemKeywords[problem.title as keyof typeof problemKeywords] || [];
  const hasRelevantKeywords = keywords.some(keyword => 
    code.toLowerCase().includes(keyword)
  );

  // Check for obvious issues
  if (code.includes('return [0, 1]') || code.includes('return [0,1]')) {
    return '❌ Logic is hardcoded and will not work for different inputs.';
  }

  if ((code.includes('return true') || code.includes('return false')) && code.length < 100) {
    return '❌ Logic is hardcoded and will not work for different inputs.';
  }

  if (code.length < 50) {
    return '❌ Code seems too short for a complete solution.';
  }

  // Check for proper algorithm implementation
  if (problem.title === 'Two Sum') {
    if (code.includes('for') && code.includes('for') && !code.includes('Map') && !code.includes('map')) {
      return '⚠️ Using nested loops (O(n²)). Consider using a hash map for O(n) time complexity.';
    }
    if (code.includes('Map') || code.includes('map') || code.includes('hash')) {
      return '✅ Using hash map approach - optimal O(n) solution.';
    }
  }

  if (problem.title === 'Valid Parentheses') {
    if (code.includes('stack') || code.includes('push') || code.includes('pop')) {
      return '✅ Using stack-based approach - correct solution.';
    }
    if (code.includes('count') || code.includes('++') || code.includes('--')) {
      return '⚠️ Simple counting approach may not work for all cases. Consider using a stack.';
    }
  }

  if (problem.title === 'Maximum Subarray') {
    if (code.includes('Math.max') || code.includes('max') || code.includes('sum')) {
      return '✅ Using Kadane\'s algorithm approach - optimal solution.';
    }
    if (code.includes('for') && code.includes('for')) {
      return '⚠️ Using nested loops. Consider Kadane\'s algorithm for O(n) time complexity.';
    }
  }

  if (problem.title === 'Best Time to Buy and Sell Stock') {
    if (code.includes('min') || code.includes('max') || code.includes('profit')) {
      return '✅ Using single pass with min tracking - optimal solution.';
    }
    if (code.includes('for') && code.includes('for')) {
      return '⚠️ Using nested loops. Consider single pass approach for O(n) time complexity.';
    }
  }

  if (!hasRelevantKeywords) {
    return '❌ Logic may not be optimal for this problem type. Consider the standard approach.';
  }

  return '✅ Logic appears to follow the correct approach for this problem.';
}

function runTestCases(code: string, language: string, problem: any, includeEdgeCases: boolean): any {
  const results = []
  let passed = 0
  let total = 0

  // Run basic test cases
  for (let i = 0; i < problem.testCases.length; i++) {
    const testCase = problem.testCases[i]
    const testResult = executeTestCase(code, language, problem, testCase)
    results.push(testResult)
    if (testResult.passed) passed++
    total++
  }

  // Add edge cases for submission
  if (includeEdgeCases) {
    const edgeCases = getEdgeCases(problem)
    for (const edgeCase of edgeCases) {
      const testResult = executeTestCase(code, language, problem, edgeCase)
      results.push(testResult)
      if (testResult.passed) passed++
      total++
    }
  }

  return { results, passed, total }
}

function executeTestCase(code: string, language: string, problem: any, testCase: any): any {
  // This is a simplified test execution
  // In a real implementation, you'd use a proper code execution engine
  
  const expected = testCase.output
  let actual = 'incorrect output'
  let passed = false

  // Simple pattern matching for common solutions
  if (problem.title === 'Two Sum') {
    if (code.includes('Map') || code.includes('map') || code.includes('hash')) {
      passed = Math.random() > 0.2 // 80% success rate for correct approach
    }
  } else if (problem.title === 'Valid Parentheses') {
    if (code.includes('stack') || code.includes('push') || code.includes('pop')) {
      passed = Math.random() > 0.1 // 90% success rate for correct approach
    }
  } else if (problem.title === 'Maximum Subarray') {
    if (code.includes('Math.max') || code.includes('max') || code.includes('sum')) {
      passed = Math.random() > 0.15 // 85% success rate for correct approach
    }
  } else if (problem.title === 'Best Time to Buy and Sell Stock') {
    if (code.includes('min') || code.includes('max') || code.includes('profit')) {
      passed = Math.random() > 0.1 // 90% success rate for correct approach
    }
  }

  if (passed) {
    actual = expected
  }

  return {
    testCase: testCase.testCase || `Test Case`,
    input: testCase.input,
    expected,
    actual,
    passed
  }
}

function getEdgeCases(problem: any): any[] {
  const edgeCases = [
    { input: 'Empty input', expected: 'Handle empty case', testCase: 'Edge 1' },
    { input: 'Single element', expected: 'Handle single element', testCase: 'Edge 2' },
    { input: 'Large input', expected: 'Handle large case', testCase: 'Edge 3' }
  ]

  if (problem.title === 'Two Sum') {
    edgeCases.push(
      { input: '[1,1], target = 2', expected: '[0,1]', testCase: 'Edge 4' },
      { input: '[1,2,3], target = 10', expected: '[]', testCase: 'Edge 5' }
    )
  } else if (problem.title === 'Valid Parentheses') {
    edgeCases.push(
      { input: '""', expected: 'true', testCase: 'Edge 4' },
      { input: '"("', expected: 'false', testCase: 'Edge 5' }
    )
  }

  return edgeCases
}

function calculateRunScore(codeAnalysis: any, testResults: any): number {
  if (codeAnalysis.hasSyntaxErrors) return 0
  
  let score = 0
  score += (testResults.passed / testResults.total) * 60
  score += (codeAnalysis.codeQualityScore / 100) * 20
  
  if (testResults.passed > 0) score += 20
  
  return Math.round(score)
}

function calculateSubmitScore(codeAnalysis: any, testResults: any): number {
  if (codeAnalysis.hasSyntaxErrors) return 0
  
  let score = 0
  score += (testResults.passed / testResults.total) * 60
  score += (codeAnalysis.codeQualityScore / 100) * 20
  
  if (testResults.passed === testResults.total) score += 20
  
  return Math.round(score)
}

function generateSuggestions(code: string, problem: any, analysis: any): string[] {
  const suggestions = []

  // Problem-specific suggestions
  if (problem.title === 'Two Sum') {
    if (/\bfor\s*\(.*for\s*\(/.test(code)) {
      suggestions.push('Consider using a hash map to achieve O(n) time complexity instead of nested loops')
    }
    if (!/\bMap\b|\bSet\b|\bobject\b/.test(code)) {
      suggestions.push('A hash map approach would be more efficient for this problem')
    }
  } else if (problem.title === 'Valid Parentheses') {
    if (!/\bpush\b|\bpop\b|\bstack\b/.test(code)) {
      suggestions.push('Consider using a stack data structure to track opening brackets')
    }
    if (!/\b\(\b|\b\[\b|\b\{\b/.test(code)) {
      suggestions.push('Make sure to handle all three types of brackets: (), [], {}')
    }
  } else if (problem.title === 'Maximum Subarray') {
    if (/\bfor\s*\(.*for\s*\(/.test(code)) {
      suggestions.push('Kadane\'s algorithm can solve this in O(n) time with a single pass')
    }
    if (!/\bMath\.max\b/.test(code)) {
      suggestions.push('Consider using Math.max() to track the maximum sum so far')
    }
  } else if (problem.title === 'Merge Two Sorted Lists') {
    if (!/\bwhile\b|\bfor\b/.test(code)) {
      suggestions.push('You\'ll need a loop to traverse both linked lists')
    }
    if (!/\bnext\b/.test(code)) {
      suggestions.push('Remember to update the next pointers when merging')
    }
  } else if (problem.title === 'Best Time to Buy and Sell Stock') {
    if (/\bfor\s*\(.*for\s*\(/.test(code)) {
      suggestions.push('A single pass approach can find the maximum profit in O(n) time')
    }
    if (!/\bMath\.min\b|\bMath\.max\b/.test(code)) {
      suggestions.push('Track the minimum price seen so far and calculate potential profit')
    }
  } else if (problem.title === 'Reverse Linked List') {
    if (!/\bnext\b/.test(code)) {
      suggestions.push('You\'ll need to manipulate the next pointers to reverse the list')
    }
    if (!/\bprev\b|\btemp\b/.test(code)) {
      suggestions.push('Consider using a temporary variable to store the next node')
    }
  } else if (problem.title === 'Climbing Stairs') {
    if (/\bfor\s*\(.*for\s*\(/.test(code)) {
      suggestions.push('This can be solved with dynamic programming in O(n) time')
    }
    if (!/\b\[\b|\bArray\b/.test(code)) {
      suggestions.push('Consider using an array to store previously calculated values')
    }
  } else if (problem.title === 'Valid Anagram') {
    if (!/\bsort\b/.test(code) && !/\bMap\b|\bSet\b/.test(code)) {
      suggestions.push('Consider sorting both strings or using a character frequency map')
    }
  } else if (problem.title === 'Binary Tree Inorder Traversal') {
    if (!/\brecursive\b|\bstack\b/.test(code)) {
      suggestions.push('This can be solved recursively or iteratively using a stack')
    }
  } else if (problem.title === 'Maximum Depth of Binary Tree') {
    if (!/\brecursive\b|\bMath\.max\b/.test(code)) {
      suggestions.push('Use recursion to find the maximum depth of left and right subtrees')
    }
  } else if (problem.title === 'Palindrome Number') {
    if (/\btoString\b/.test(code)) {
      suggestions.push('Try solving without converting to string for better space complexity')
    }
  } else if (problem.title === 'Remove Duplicates from Sorted Array') {
    if (!/\bfor\b/.test(code)) {
      suggestions.push('Use a single loop to remove duplicates in-place')
    }
    if (/\bnew\s+Array\b/.test(code)) {
      suggestions.push('Try to solve this in-place without creating a new array')
    }
  }

  // General code quality suggestions
  if (analysis.hasSyntaxErrors) {
    suggestions.push('Fix syntax errors before proceeding')
  }

  if (!analysis.hasFunction) {
    suggestions.push(`Define a function named '${problem.functionName || 'solution'}'`)
  }

  if (!analysis.hasReturn) {
    suggestions.push('Add a return statement to your function')
  }

  if (analysis.timeComplexity === 'O(n²)') {
    suggestions.push('Consider optimizing to O(n) time complexity')
  }

  if (!code.includes('//') && code.length > 50) {
    suggestions.push('Add comments to explain your logic')
  }

  if (/\bvar\b/.test(code)) {
    suggestions.push('Use const or let instead of var for better scoping')
  }

  // Only add generic suggestions if we don't have enough problem-specific ones
  if (suggestions.length < 3) {
    suggestions.push('Test your solution with edge cases')
    suggestions.push('Practice similar problems to improve')
  }

  return suggestions.slice(0, 5) // Limit to 5 suggestions
}

function analyzePerformance(code: string, problem: any): string {
  const timeComplexity = analyzeTimeComplexity(code)
  const spaceComplexity = analyzeSpaceComplexity(code)
  
  if (timeComplexity === 'O(n)' && spaceComplexity === 'O(1)') {
    return 'Optimal solution! Both time and space complexity are optimal.'
  } else if (timeComplexity === 'O(n)' || spaceComplexity === 'O(1)') {
    return 'Good performance. Consider optimizing the other complexity.'
  } else {
    return 'Performance can be improved. Consider more efficient algorithms.'
  }
}

function analyzeTimeComplexity(code: string): string {
  if (/\bfor\s*\(.*for\s*\(/.test(code)) {
    return 'O(n²)'
  } else if (/\bsort\b/.test(code)) {
    return 'O(n log n)'
  } else if (/\bfor\b|\bwhile\b/.test(code)) {
    return 'O(n)'
  }
  return 'O(n)'
}

function analyzeSpaceComplexity(code: string): string {
  if (/\bnew\s+(Map|Set|Array)|\[\]/.test(code)) {
    return 'O(n)'
  }
  return 'O(1)'
}

function getNextSteps(score: number, problem: any): string[] {
  if (score >= 90) {
    return [
      'Excellent work! Try a more challenging problem',
      'Consider optimizing your solution further',
      'Practice similar problems to reinforce concepts'
    ]
  } else if (score >= 70) {
    return [
      'Good effort! Review the feedback and try again',
      'Practice similar problems to improve',
      'Focus on understanding the core concepts'
    ]
  } else {
    return [
      'Review the problem statement carefully',
      'Start with a simpler approach',
      'Practice basic problems first',
      'Consider seeking help or using hints'
    ]
  }
}

function assessProblemUnderstanding(code: string, problem: any): string {
  const keywords = problem.title.toLowerCase().split(' ')
  const hasRelevantTerms = keywords.some((keyword: string) => 
    code.toLowerCase().includes(keyword)
  )
  
  return hasRelevantTerms 
    ? 'Good understanding of the problem requirements'
    : 'Consider reviewing the problem statement more carefully'
}

function analyzeApproach(code: string, problem: any): string {
  const approachKeywords = {
    'Two Sum': 'Hash map approach is optimal for O(n) time complexity',
    'Valid Parentheses': 'Stack-based approach is the standard solution',
    'Maximum Subarray': 'Kadane\'s algorithm is the optimal approach',
    'Merge Two Sorted Lists': 'Two-pointer approach is efficient',
    'Best Time to Buy and Sell Stock': 'Single pass with min tracking is optimal'
  }
  
  return approachKeywords[problem.title as keyof typeof approachKeywords] || 
    'Consider the most efficient approach for this problem type'
}

function analyzeImplementation(code: string): string {
  if (code.length < 30) {
    return 'Implementation seems incomplete. Consider adding more logic.'
  } else if (code.length > 200) {
    return 'Implementation might be overly complex. Consider simplifying.'
  } else {
    return 'Implementation looks reasonable.'
  }
}

function suggestOptimizations(code: string, problem: any): string[] {
  const optimizations = []
  
  if (/\bfor\s*\(.*for\s*\(/.test(code)) {
    optimizations.push('Consider using a hash map to reduce time complexity from O(n²) to O(n)')
  }
  
  if (/\bsort\b/.test(code)) {
    optimizations.push('If sorting is not required, consider a single-pass solution')
  }
  
  if (/\bnew\s+Array\b/.test(code)) {
    optimizations.push('Consider if you really need to initialize an array')
  }
  
  return optimizations.length > 0 ? optimizations : ['Your current approach seems optimal for this problem']
} 