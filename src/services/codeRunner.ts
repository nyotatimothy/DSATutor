import { prisma } from '../lib/prisma'
import { spawn } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

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
  private static readonly TIMEOUT_MS = 10000 // 10 seconds timeout for compiled languages
  private static readonly SUPPORTED_LANGUAGES = [
    'javascript', 'python', 'java', 'cpp', 'csharp', 'go', 'rust', 'typescript', 'ruby'
  ]

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

      if (!this.SUPPORTED_LANGUAGES.includes(language)) {
        throw new Error(`Unsupported language: ${language}. Supported languages: ${this.SUPPORTED_LANGUAGES.join(', ')}`)
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
    switch (language) {
      case 'javascript':
        return this.runJavaScriptTestCase(code, testCase)
      case 'python':
        return this.runPythonTestCase(code, testCase)
      case 'java':
        return this.runJavaTestCase(code, testCase)
      case 'cpp':
        return this.runCppTestCase(code, testCase)
      case 'csharp':
        return this.runCSharpTestCase(code, testCase)
      case 'go':
        return this.runGoTestCase(code, testCase)
      case 'rust':
        return this.runRustTestCase(code, testCase)
      case 'typescript':
        return this.runTypeScriptTestCase(code, testCase)
      case 'ruby':
        return this.runRubyTestCase(code, testCase)
      default:
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

  private static async runJavaTestCase(
    code: string,
    testCase: { input: string; expected: string }
  ): Promise<TestResult> {
    try {
      const tempDir = tmpdir()
      const className = 'Solution'
      const javaFile = join(tempDir, `${className}.java`)
      
      // Wrap code in a class with main method
      const wrappedCode = `
import java.util.*;

public class ${className} {
    ${code}
    
    public static void main(String[] args) {
        // Parse input and execute
        Object input = ${testCase.input};
        Object result = null;
        
        try {
            // Try to call solution method
            java.lang.reflect.Method solutionMethod = ${className}.class.getMethod("solution", Object.class);
            result = solutionMethod.invoke(null, input);
        } catch (Exception e) {
            // Try to call main method
            try {
                java.lang.reflect.Method mainMethod = ${className}.class.getMethod("main", Object.class);
                result = mainMethod.invoke(null, input);
            } catch (Exception e2) {
                result = "Error: No solution method found";
            }
        }
        
        System.out.println(result != null ? result.toString() : "null");
    }
}
      `
      
      writeFileSync(javaFile, wrappedCode)
      
      return new Promise((resolve) => {
        // Compile Java code
        const compileProcess = spawn('javac', [javaFile])
        
        compileProcess.on('close', (compileCode: number) => {
          if (compileCode !== 0) {
            unlinkSync(javaFile)
            resolve({
              passed: false,
              input: testCase.input,
              expected: testCase.expected,
              actual: 'Error',
              error: 'Java compilation failed'
            })
            return
          }
          
          // Run compiled Java code
          const runProcess = spawn('java', ['-cp', tempDir, className])
          
          let output = ''
          let error = ''
          
          runProcess.stdout.on('data', (data: Buffer) => {
            output += data.toString()
          })
          
          runProcess.stderr.on('data', (data: Buffer) => {
            error += data.toString()
          })
          
          runProcess.on('close', (runCode: number) => {
            // Clean up
            try {
              unlinkSync(javaFile)
              unlinkSync(join(tempDir, `${className}.class`))
            } catch (e) {
              // Ignore cleanup errors
            }
            
            if (runCode !== 0) {
              resolve({
                passed: false,
                input: testCase.input,
                expected: testCase.expected,
                actual: 'Error',
                error: error || 'Java execution failed'
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
            runProcess.kill()
            resolve({
              passed: false,
              input: testCase.input,
              expected: testCase.expected,
              actual: 'Error',
              error: 'Execution timeout'
            })
          }, this.TIMEOUT_MS)
        })
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

  private static async runCppTestCase(
    code: string,
    testCase: { input: string; expected: string }
  ): Promise<TestResult> {
    try {
      const tempDir = tmpdir()
      const cppFile = join(tempDir, 'solution.cpp')
      const exeFile = join(tempDir, 'solution')
      
      // Wrap code in a complete C++ program
      const wrappedCode = `
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <set>
#include <algorithm>
#include <sstream>

${code}

int main() {
    // Parse input and execute
    auto input = ${testCase.input};
    auto result = solution(input);
    std::cout << result << std::endl;
    return 0;
}
      `
      
      writeFileSync(cppFile, wrappedCode)
      
      return new Promise((resolve) => {
        // Compile C++ code
        const compileProcess = spawn('g++', ['-std=c++17', '-o', exeFile, cppFile])
        
        compileProcess.on('close', (compileCode: number) => {
          if (compileCode !== 0) {
            try {
              unlinkSync(cppFile)
            } catch (e) {
              // Ignore cleanup errors
            }
            resolve({
              passed: false,
              input: testCase.input,
              expected: testCase.expected,
              actual: 'Error',
              error: 'C++ compilation failed'
            })
            return
          }
          
          // Run compiled C++ code
          const runProcess = spawn(exeFile)
          
          let output = ''
          let error = ''
          
          runProcess.stdout.on('data', (data: Buffer) => {
            output += data.toString()
          })
          
          runProcess.stderr.on('data', (data: Buffer) => {
            error += data.toString()
          })
          
          runProcess.on('close', (runCode: number) => {
            // Clean up
            try {
              unlinkSync(cppFile)
              unlinkSync(exeFile)
            } catch (e) {
              // Ignore cleanup errors
            }
            
            if (runCode !== 0) {
              resolve({
                passed: false,
                input: testCase.input,
                expected: testCase.expected,
                actual: 'Error',
                error: error || 'C++ execution failed'
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
            runProcess.kill()
            resolve({
              passed: false,
              input: testCase.input,
              expected: testCase.expected,
              actual: 'Error',
              error: 'Execution timeout'
            })
          }, this.TIMEOUT_MS)
        })
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

  private static async runCSharpTestCase(
    code: string,
    testCase: { input: string; expected: string }
  ): Promise<TestResult> {
    try {
      const tempDir = tmpdir()
      const csFile = join(tempDir, 'Program.cs')
      const projectFile = join(tempDir, 'Program.csproj')
      
      // Create project file
      const projectContent = `
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net6.0</TargetFramework>
  </PropertyGroup>
</Project>
      `
      
      // Wrap code in a complete C# program
      const wrappedCode = `
using System;
using System.Collections.Generic;
using System.Linq;

${code}

class Program {
    static void Main(string[] args) {
        // Parse input and execute
        var input = ${testCase.input};
        var result = Solution(input);
        Console.WriteLine(result);
    }
}
      `
      
      writeFileSync(projectFile, projectContent)
      writeFileSync(csFile, wrappedCode)
      
      return new Promise((resolve) => {
        // Run C# code
        const runProcess = spawn('dotnet', ['run', '--project', tempDir])
        
        let output = ''
        let error = ''
        
        runProcess.stdout.on('data', (data: Buffer) => {
          output += data.toString()
        })
        
        runProcess.stderr.on('data', (data: Buffer) => {
          error += data.toString()
        })
        
        runProcess.on('close', (runCode: number) => {
          // Clean up
          try {
            unlinkSync(csFile)
            unlinkSync(projectFile)
          } catch (e) {
            // Ignore cleanup errors
          }
          
          if (runCode !== 0) {
            resolve({
              passed: false,
              input: testCase.input,
              expected: testCase.expected,
              actual: 'Error',
              error: error || 'C# execution failed'
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
          runProcess.kill()
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

  private static async runGoTestCase(
    code: string,
    testCase: { input: string; expected: string }
  ): Promise<TestResult> {
    try {
      const tempDir = tmpdir()
      const goFile = join(tempDir, 'main.go')
      
      // Wrap code in a complete Go program
      const wrappedCode = `
package main

import (
    "fmt"
    "reflect"
)

${code}

func main() {
    // Parse input and execute
    input := ${testCase.input}
    result := solution(input)
    fmt.Println(result)
}
      `
      
      writeFileSync(goFile, wrappedCode)
      
      return new Promise((resolve) => {
        // Run Go code
        const runProcess = spawn('go', ['run', goFile])
        
        let output = ''
        let error = ''
        
        runProcess.stdout.on('data', (data: Buffer) => {
          output += data.toString()
        })
        
        runProcess.stderr.on('data', (data: Buffer) => {
          error += data.toString()
        })
        
        runProcess.on('close', (runCode: number) => {
          // Clean up
          try {
            unlinkSync(goFile)
          } catch (e) {
            // Ignore cleanup errors
          }
          
          if (runCode !== 0) {
            resolve({
              passed: false,
              input: testCase.input,
              expected: testCase.expected,
              actual: 'Error',
              error: error || 'Go execution failed'
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
          runProcess.kill()
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

  private static async runRustTestCase(
    code: string,
    testCase: { input: string; expected: string }
  ): Promise<TestResult> {
    try {
      const tempDir = tmpdir()
      const rustFile = join(tempDir, 'main.rs')
      
      // Wrap code in a complete Rust program
      const wrappedCode = `
${code}

fn main() {
    // Parse input and execute
    let input = ${testCase.input};
    let result = solution(input);
    println!("{}", result);
}
      `
      
      writeFileSync(rustFile, wrappedCode)
      
      return new Promise((resolve) => {
        // Run Rust code
        const runProcess = spawn('rustc', ['-o', join(tempDir, 'main'), rustFile])
        
        runProcess.on('close', (compileCode: number) => {
          if (compileCode !== 0) {
            try {
              unlinkSync(rustFile)
            } catch (e) {
              // Ignore cleanup errors
            }
            resolve({
              passed: false,
              input: testCase.input,
              expected: testCase.expected,
              actual: 'Error',
              error: 'Rust compilation failed'
            })
            return
          }
          
          // Run compiled Rust code
          const execProcess = spawn(join(tempDir, 'main'))
          
          let output = ''
          let error = ''
          
          execProcess.stdout.on('data', (data: Buffer) => {
            output += data.toString()
          })
          
          execProcess.stderr.on('data', (data: Buffer) => {
            error += data.toString()
          })
          
          execProcess.on('close', (runCode: number) => {
            // Clean up
            try {
              unlinkSync(rustFile)
              unlinkSync(join(tempDir, 'main'))
            } catch (e) {
              // Ignore cleanup errors
            }
            
            if (runCode !== 0) {
              resolve({
                passed: false,
                input: testCase.input,
                expected: testCase.expected,
                actual: 'Error',
                error: error || 'Rust execution failed'
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
            execProcess.kill()
            resolve({
              passed: false,
              input: testCase.input,
              expected: testCase.expected,
              actual: 'Error',
              error: 'Execution timeout'
            })
          }, this.TIMEOUT_MS)
        })
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

  private static async runTypeScriptTestCase(
    code: string,
    testCase: { input: string; expected: string }
  ): Promise<TestResult> {
    try {
      const tempDir = tmpdir()
      const tsFile = join(tempDir, 'solution.ts')
      
      // Wrap code in a complete TypeScript program
      const wrappedCode = `
${code}

// Parse input and execute
const input = ${testCase.input};
const result = solution(input);
console.log(result);
      `
      
      writeFileSync(tsFile, wrappedCode)
      
      return new Promise((resolve) => {
        // Run TypeScript code
        const runProcess = spawn('npx', ['ts-node', tsFile])
        
        let output = ''
        let error = ''
        
        runProcess.stdout.on('data', (data: Buffer) => {
          output += data.toString()
        })
        
        runProcess.stderr.on('data', (data: Buffer) => {
          error += data.toString()
        })
        
        runProcess.on('close', (runCode: number) => {
          // Clean up
          try {
            unlinkSync(tsFile)
          } catch (e) {
            // Ignore cleanup errors
          }
          
          if (runCode !== 0) {
            resolve({
              passed: false,
              input: testCase.input,
              expected: testCase.expected,
              actual: 'Error',
              error: error || 'TypeScript execution failed'
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
          runProcess.kill()
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

  private static async runRubyTestCase(
    code: string,
    testCase: { input: string; expected: string }
  ): Promise<TestResult> {
    try {
      return new Promise((resolve) => {
        // Wrap code in a complete Ruby program
        const wrappedCode = `
${code}

# Parse input and execute
input = ${testCase.input}
result = solution(input)
puts result
        `
        
        const rubyProcess = spawn('ruby', ['-e', wrappedCode])
        
        let output = ''
        let error = ''
        
        rubyProcess.stdout.on('data', (data: Buffer) => {
          output += data.toString()
        })
        
        rubyProcess.stderr.on('data', (data: Buffer) => {
          error += data.toString()
        })
        
        rubyProcess.on('close', (code: number) => {
          if (code !== 0) {
            resolve({
              passed: false,
              input: testCase.input,
              expected: testCase.expected,
              actual: 'Error',
              error: error || 'Ruby execution failed'
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
          rubyProcess.kill()
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