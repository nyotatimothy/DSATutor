import { prisma } from '../lib/prisma'

interface TestResult {
  passed: boolean
  input: string
  expected: string
  actual: string
  error?: string
}

interface CodeExecutionResult {
  result: 'pass' | 'fail'
  passedCount: number
  totalCount: number
  error?: string
  testResults: TestResult[]
  durationMs: number
}

export class CodeRunner {
  private static readonly TIMEOUT_MS = 5000 // 5 seconds timeout

  static async executeCode(
    code: string,
    language: string,
    problemId: string
  ): Promise<CodeExecutionResult> {
    const startTime = Date.now()

    try {
      // Get test cases for the problem
      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        include: { testCases: true }
      })

      if (!problem) {
        throw new Error('Problem not found')
      }

      if (language !== 'javascript' && language !== 'python') {
        throw new Error('Only JavaScript and Python are supported')
      }

      const testResults: TestResult[] = []

      // Execute code against each test case
      for (const testCase of problem.testCases) {
        try {
          const result = await this.runTestCase(code, language, testCase)
          testResults.push(result)
        } catch (error) {
          testResults.push({
            passed: false,
            input: testCase.input,
            expected: testCase.expected,
            actual: 'Error',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      const passedCount = testResults.filter(r => r.passed).length
      const totalCount = testResults.length
      const durationMs = Date.now() - startTime

      return {
        result: passedCount === totalCount ? 'pass' : 'fail',
        passedCount,
        totalCount,
        testResults,
        durationMs
      }
    } catch (error) {
      const durationMs = Date.now() - startTime
      return {
        result: 'fail',
        passedCount: 0,
        totalCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        testResults: [],
        durationMs
      }
    }
  }

  private static async runTestCase(
    code: string,
    language: string,
    testCase: { input: string; expected: string }
  ): Promise<TestResult> {
    if (language === 'javascript') {
      return this.runJavaScriptTestCase(code, testCase)
    } else if (language === 'python') {
      return this.runPythonTestCase(code, testCase)
    } else {
      throw new Error(`Unsupported language: ${language}`)
    }
  }

  private static runJavaScriptTestCase(
    code: string,
    testCase: { input: string; expected: string }
  ): TestResult {
    try {
      // For MVP, we'll use a simple eval approach
      // In production, use proper sandboxing
      const wrappedCode = `
        ${code}
        
        // Parse input and execute
        const input = ${testCase.input};
        const result = typeof solution === 'function' ? solution(input) : 
                      typeof main === 'function' ? main(input) : null;
        JSON.stringify(result);
      `

      const actual = eval(wrappedCode)
      const expected = testCase.expected

      return {
        passed: actual === expected,
        input: testCase.input,
        expected,
        actual: String(actual)
      }
    } catch (error) {
      return {
        passed: false,
        input: testCase.input,
        expected: testCase.expected,
        actual: 'Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private static async runPythonTestCase(
    code: string,
    testCase: { input: string; expected: string }
  ): Promise<TestResult> {
    // For MVP, we'll use a simple approach
    // In production, you'd want to use Docker containers for better security
    try {
      const { spawn } = require('child_process')
      
      return new Promise((resolve) => {
        const pythonProcess = spawn('python3', ['-c', code])
        
        let output = ''
        let error = ''
        
        pythonProcess.stdout.on('data', (data: Buffer) => {
          output += data.toString()
        })
        
        pythonProcess.stderr.on('data', (data: Buffer) => {
          error += data.toString()
        })
        
        pythonProcess.on('close', (code: number) => {
          if (code !== 0) {
            resolve({
              passed: false,
              input: testCase.input,
              expected: testCase.expected,
              actual: 'Error',
              error: error || 'Python execution failed'
            })
          } else {
            const actual = output.trim()
            resolve({
              passed: actual === testCase.expected,
              input: testCase.input,
              expected: testCase.expected,
              actual
            })
          }
        })
        
        // Timeout
        setTimeout(() => {
          pythonProcess.kill()
          resolve({
            passed: false,
            input: testCase.input,
            expected: testCase.expected,
            actual: 'Error',
            error: 'Execution timeout'
          })
        }, this.TIMEOUT_MS)
      })
    } catch (error) {
      return {
        passed: false,
        input: testCase.input,
        expected: testCase.expected,
        actual: 'Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
} 