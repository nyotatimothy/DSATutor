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