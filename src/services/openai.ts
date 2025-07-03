import OpenAI from 'openai'

class OpenAIService {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  /**
   * Analyze code quality and provide feedback
   */
  async analyzeCode(code: string, problemDescription: string, language: string = 'javascript'): Promise<{
    score: number
    feedback: string
    suggestions: string[]
    timeComplexity: string
    spaceComplexity: string
    codeQuality: 'excellent' | 'good' | 'fair' | 'poor'
    issues: string[]
  }> {
    try {
      const prompt = `
You are an expert DSA tutor and code reviewer. Analyze the following code submission and provide detailed feedback.

Problem Description: ${problemDescription}
Programming Language: ${language}

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Please provide a comprehensive analysis including:
1. Overall score (0-100)
2. Detailed feedback explaining the solution
3. Specific suggestions for improvement
4. Time complexity analysis
5. Space complexity analysis
6. Code quality assessment (excellent/good/fair/poor)
7. Any issues or bugs found

Respond in JSON format:
{
  "score": number,
  "feedback": "detailed feedback",
  "suggestions": ["suggestion1", "suggestion2"],
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "codeQuality": "excellent|good|fair|poor",
  "issues": ["issue1", "issue2"]
}
`

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert DSA tutor and code reviewer. Provide detailed, constructive feedback in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      // Parse JSON response
      const analysis = JSON.parse(content)
      
      return {
        score: analysis.score || 0,
        feedback: analysis.feedback || '',
        suggestions: analysis.suggestions || [],
        timeComplexity: analysis.timeComplexity || 'Unknown',
        spaceComplexity: analysis.spaceComplexity || 'Unknown',
        codeQuality: analysis.codeQuality || 'fair',
        issues: analysis.issues || []
      }
    } catch (error) {
      console.error('OpenAI code analysis error:', error)
      throw new Error('Failed to analyze code')
    }
  }

  /**
   * Enhanced code analysis with detailed algorithm breakdown
   */
  async enhancedCodeAnalysis(code: string, problemDescription: string, language: string = 'javascript'): Promise<{
    basicAnalysis: {
      score: number
      feedback: string
      suggestions: string[]
      timeComplexity: string
      spaceComplexity: string
      codeQuality: 'excellent' | 'good' | 'fair' | 'poor'
      issues: string[]
    }
    algorithmAnalysis: {
      algorithmType: string
      approach: string
      efficiency: 'optimal' | 'suboptimal' | 'inefficient'
      alternativeApproaches: string[]
      optimizationOpportunities: string[]
    }
    codeStyleAnalysis: {
      readability: 'excellent' | 'good' | 'fair' | 'poor'
      maintainability: 'excellent' | 'good' | 'fair' | 'poor'
      namingConventions: string[]
      codeStructure: string[]
      styleIssues: string[]
    }
    securityAnalysis: {
      vulnerabilities: string[]
      bestPractices: string[]
      securityScore: number
    }
    performanceAnalysis: {
      bottlenecks: string[]
      optimizationTips: string[]
      memoryUsage: string
      executionEfficiency: string
    }
    learningInsights: {
      conceptsDemonstrated: string[]
      conceptsMissing: string[]
      difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
      nextLearningSteps: string[]
    }
  }> {
    try {
      const prompt = `
You are an expert DSA tutor and senior software engineer. Provide a comprehensive analysis of this code submission.

Problem Description: ${problemDescription}
Programming Language: ${language}

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Provide a detailed analysis covering:

1. BASIC ANALYSIS:
   - Overall score (0-100)
   - Detailed feedback
   - Suggestions for improvement
   - Time and space complexity
   - Code quality assessment
   - Issues found

2. ALGORITHM ANALYSIS:
   - Algorithm type and approach used
   - Efficiency assessment
   - Alternative approaches
   - Optimization opportunities

3. CODE STYLE ANALYSIS:
   - Readability assessment
   - Maintainability assessment
   - Naming conventions
   - Code structure
   - Style issues

4. SECURITY ANALYSIS:
   - Potential vulnerabilities
   - Security best practices
   - Security score (0-100)

5. PERFORMANCE ANALYSIS:
   - Performance bottlenecks
   - Optimization tips
   - Memory usage analysis
   - Execution efficiency

6. LEARNING INSIGHTS:
   - DSA concepts demonstrated
   - Missing concepts
   - Difficulty level assessment
   - Recommended next learning steps

Respond in JSON format with all these sections.
`

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert DSA tutor and senior software engineer. Provide comprehensive code analysis in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2500
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      const analysis = JSON.parse(content)
      
      return {
        basicAnalysis: {
          score: analysis.basicAnalysis?.score || 0,
          feedback: analysis.basicAnalysis?.feedback || '',
          suggestions: analysis.basicAnalysis?.suggestions || [],
          timeComplexity: analysis.basicAnalysis?.timeComplexity || 'Unknown',
          spaceComplexity: analysis.basicAnalysis?.spaceComplexity || 'Unknown',
          codeQuality: analysis.basicAnalysis?.codeQuality || 'fair',
          issues: analysis.basicAnalysis?.issues || []
        },
        algorithmAnalysis: {
          algorithmType: analysis.algorithmAnalysis?.algorithmType || 'Unknown',
          approach: analysis.algorithmAnalysis?.approach || '',
          efficiency: analysis.algorithmAnalysis?.efficiency || 'suboptimal',
          alternativeApproaches: analysis.algorithmAnalysis?.alternativeApproaches || [],
          optimizationOpportunities: analysis.algorithmAnalysis?.optimizationOpportunities || []
        },
        codeStyleAnalysis: {
          readability: analysis.codeStyleAnalysis?.readability || 'fair',
          maintainability: analysis.codeStyleAnalysis?.maintainability || 'fair',
          namingConventions: analysis.codeStyleAnalysis?.namingConventions || [],
          codeStructure: analysis.codeStyleAnalysis?.codeStructure || [],
          styleIssues: analysis.codeStyleAnalysis?.styleIssues || []
        },
        securityAnalysis: {
          vulnerabilities: analysis.securityAnalysis?.vulnerabilities || [],
          bestPractices: analysis.securityAnalysis?.bestPractices || [],
          securityScore: analysis.securityAnalysis?.securityScore || 50
        },
        performanceAnalysis: {
          bottlenecks: analysis.performanceAnalysis?.bottlenecks || [],
          optimizationTips: analysis.performanceAnalysis?.optimizationTips || [],
          memoryUsage: analysis.performanceAnalysis?.memoryUsage || 'Unknown',
          executionEfficiency: analysis.performanceAnalysis?.executionEfficiency || 'Unknown'
        },
        learningInsights: {
          conceptsDemonstrated: analysis.learningInsights?.conceptsDemonstrated || [],
          conceptsMissing: analysis.learningInsights?.conceptsMissing || [],
          difficultyLevel: analysis.learningInsights?.difficultyLevel || 'intermediate',
          nextLearningSteps: analysis.learningInsights?.nextLearningSteps || []
        }
      }
    } catch (error) {
      console.error('OpenAI enhanced code analysis error:', error)
      throw new Error('Failed to perform enhanced code analysis')
    }
  }

  /**
   * Compare multiple code solutions
   */
  async compareSolutions(solutions: Array<{
    code: string
    language: string
    approach: string
    userId: string
  }>, problemDescription: string): Promise<{
    comparison: Array<{
      userId: string
      approach: string
      strengths: string[]
      weaknesses: string[]
      efficiency: string
      readability: string
      score: number
    }>
    bestApproach: string
    insights: string[]
    recommendations: string[]
  }> {
    try {
      const solutionsText = solutions.map((sol, index) => `
Solution ${index + 1} (User: ${sol.userId}):
Approach: ${sol.approach}
Language: ${sol.language}
Code:
\`\`\`${sol.language}
${sol.code}
\`\`\`
`).join('\n')

      const prompt = `
You are an expert DSA tutor. Compare these different solutions to the same problem.

Problem: ${problemDescription}

${solutionsText}

Analyze each solution and provide:
1. Individual analysis for each solution
2. Comparison of approaches
3. Identification of the best approach
4. Insights about different problem-solving strategies
5. Recommendations for learning

Respond in JSON format with detailed comparison.
`

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert DSA tutor. Compare multiple solutions and provide insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      const comparison = JSON.parse(content)
      
      return {
        comparison: comparison.comparison || [],
        bestApproach: comparison.bestApproach || '',
        insights: comparison.insights || [],
        recommendations: comparison.recommendations || []
      }
    } catch (error) {
      console.error('OpenAI solution comparison error:', error)
      throw new Error('Failed to compare solutions')
    }
  }

  /**
   * Generate code optimization suggestions
   */
  async optimizeCode(code: string, problemDescription: string, language: string = 'javascript'): Promise<{
    originalCode: string
    optimizedCode: string
    optimizations: Array<{
      type: 'performance' | 'readability' | 'memory' | 'algorithm'
      description: string
      impact: 'high' | 'medium' | 'low'
      explanation: string
    }>
    performanceGains: {
      timeComplexity: string
      spaceComplexity: string
      estimatedImprovement: string
    }
    beforeAfterComparison: {
      linesOfCode: { before: number; after: number }
      complexity: { before: string; after: string }
      readability: { before: string; after: string }
    }
  }> {
    try {
      const prompt = `
You are an expert software engineer specializing in code optimization. Optimize this code while maintaining correctness.

Problem: ${problemDescription}
Language: ${language}

Original Code:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. Optimized version of the code
2. List of specific optimizations made
3. Performance gains achieved
4. Before/after comparison

Focus on:
- Algorithm efficiency
- Memory usage
- Code readability
- Best practices

Respond in JSON format with the optimized code and detailed analysis.
`

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert software engineer. Provide code optimizations with detailed explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      const optimization = JSON.parse(content)
      
      return {
        originalCode: code,
        optimizedCode: optimization.optimizedCode || code,
        optimizations: optimization.optimizations || [],
        performanceGains: optimization.performanceGains || {
          timeComplexity: 'Unknown',
          spaceComplexity: 'Unknown',
          estimatedImprovement: 'Unknown'
        },
        beforeAfterComparison: optimization.beforeAfterComparison || {
          linesOfCode: { before: 0, after: 0 },
          complexity: { before: 'Unknown', after: 'Unknown' },
          readability: { before: 'Unknown', after: 'Unknown' }
        }
      }
    } catch (error) {
      console.error('OpenAI code optimization error:', error)
      throw new Error('Failed to optimize code')
    }
  }

  /**
   * Generate learning path recommendations
   */
  async generateLearningPath(userProfile: {
    currentLevel: 'beginner' | 'intermediate' | 'advanced'
    strengths: string[]
    weaknesses: string[]
    completedTopics: string[]
    goals: string[]
  }): Promise<{
    currentLevel: string
    targetLevel: string
    roadmap: Array<{
      phase: string
      topics: string[]
      estimatedDuration: string
      difficulty: 'easy' | 'medium' | 'hard'
      resources: string[]
    }>
    immediateNextSteps: string[]
    longTermGoals: string[]
    practiceRecommendations: string[]
  }> {
    try {
      const prompt = `
You are an expert DSA tutor. Create a personalized learning path for this user.

User Profile:
- Current Level: ${userProfile.currentLevel}
- Strengths: ${userProfile.strengths.join(', ')}
- Weaknesses: ${userProfile.weaknesses.join(', ')}
- Completed Topics: ${userProfile.completedTopics.join(', ')}
- Goals: ${userProfile.goals.join(', ')}

Create a comprehensive learning roadmap that:
1. Addresses weaknesses while building on strengths
2. Provides a clear progression path
3. Includes specific topics and resources
4. Sets realistic timelines
5. Recommends practice strategies

Respond in JSON format with a detailed learning path.
`

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert DSA tutor. Create personalized learning paths.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1500
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      const learningPath = JSON.parse(content)
      
      return {
        currentLevel: learningPath.currentLevel || userProfile.currentLevel,
        targetLevel: learningPath.targetLevel || 'advanced',
        roadmap: learningPath.roadmap || [],
        immediateNextSteps: learningPath.immediateNextSteps || [],
        longTermGoals: learningPath.longTermGoals || [],
        practiceRecommendations: learningPath.practiceRecommendations || []
      }
    } catch (error) {
      console.error('OpenAI learning path generation error:', error)
      throw new Error('Failed to generate learning path')
    }
  }

  /**
   * Assess user's DSA skill level based on code submissions
   */
  async assessSkillLevel(codeSubmissions: Array<{
    code: string
    problemDescription: string
    result: 'pass' | 'fail'
    score?: number
  }>): Promise<{
    overallLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    confidenceScore: number
  }> {
    try {
      const submissionsText = codeSubmissions.map((sub, index) => `
Submission ${index + 1}:
Problem: ${sub.problemDescription}
Result: ${sub.result}
Score: ${sub.score || 'N/A'}
Code:
\`\`\`
${sub.code}
\`\`\`
`).join('\n')

      const prompt = `
You are an expert DSA tutor. Analyze the following code submissions to assess the user's current skill level.

${submissionsText}

Based on these submissions, please assess:
1. Overall skill level (beginner/intermediate/advanced/expert)
2. Key strengths demonstrated
3. Areas of weakness that need improvement
4. Specific recommendations for improvement
5. Confidence in this assessment (0-100)

Respond in JSON format:
{
  "overallLevel": "beginner|intermediate|advanced|expert",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["rec1", "rec2"],
  "confidenceScore": number
}
`

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert DSA tutor. Assess skill levels based on code submissions and provide constructive feedback.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      const assessment = JSON.parse(content)
      
      return {
        overallLevel: assessment.overallLevel || 'beginner',
        strengths: assessment.strengths || [],
        weaknesses: assessment.weaknesses || [],
        recommendations: assessment.recommendations || [],
        confidenceScore: assessment.confidenceScore || 50
      }
    } catch (error) {
      console.error('OpenAI skill assessment error:', error)
      throw new Error('Failed to assess skill level')
    }
  }

  /**
   * Generate personalized hints based on user's approach
   */
  async generateHint(userCode: string, problemDescription: string, userStuck: boolean = true): Promise<{
    hint: string
    hintLevel: 'subtle' | 'moderate' | 'explicit'
    nextStep: string
  }> {
    try {
      const prompt = `
You are an expert DSA tutor. The user is working on this problem and seems stuck. Provide a helpful hint.

Problem: ${problemDescription}

User's current code:
\`\`\`
${userCode}
\`\`\`

User is stuck: ${userStuck}

Provide a hint that:
1. Doesn't give away the complete solution
2. Guides the user in the right direction
3. Is appropriate for their current approach

Respond in JSON format:
{
  "hint": "helpful hint text",
  "hintLevel": "subtle|moderate|explicit",
  "nextStep": "suggested next step"
}
`

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert DSA tutor. Provide helpful hints without giving away complete solutions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 500
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      const hintData = JSON.parse(content)
      
      return {
        hint: hintData.hint || 'Try breaking down the problem into smaller steps.',
        hintLevel: hintData.hintLevel || 'moderate',
        nextStep: hintData.nextStep || 'Consider the problem constraints and edge cases.'
      }
    } catch (error) {
      console.error('OpenAI hint generation error:', error)
      throw new Error('Failed to generate hint')
    }
  }

  /**
   * Generate a new practice problem based on user's weaknesses
   */
  async generatePracticeProblem(
    userWeaknesses: string[],
    currentLevel: 'beginner' | 'intermediate' | 'advanced',
    topic: string
  ): Promise<{
    problem: string
    difficulty: 'easy' | 'medium' | 'hard'
    hints: string[]
    solution: string
    explanation: string
  }> {
    try {
      const prompt = `
You are an expert DSA tutor. Generate a practice problem tailored to the user's needs.

User's weaknesses: ${userWeaknesses.join(', ')}
Current level: ${currentLevel}
Topic: ${topic}

Generate a problem that:
1. Addresses the user's specific weaknesses
2. Is appropriate for their current level
3. Focuses on the specified topic
4. Includes helpful hints and a detailed solution

Respond in JSON format:
{
  "problem": "detailed problem description",
  "difficulty": "easy|medium|hard",
  "hints": ["hint1", "hint2", "hint3"],
  "solution": "complete solution code",
  "explanation": "detailed explanation of the solution"
}
`

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert DSA tutor. Generate personalized practice problems that target specific weaknesses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1500
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      const problemData = JSON.parse(content)
      
      return {
        problem: problemData.problem || 'Default problem description',
        difficulty: problemData.difficulty || 'medium',
        hints: problemData.hints || [],
        solution: problemData.solution || '// Solution code',
        explanation: problemData.explanation || 'Solution explanation'
      }
    } catch (error) {
      console.error('OpenAI problem generation error:', error)
      throw new Error('Failed to generate practice problem')
    }
  }
}

export default new OpenAIService() 