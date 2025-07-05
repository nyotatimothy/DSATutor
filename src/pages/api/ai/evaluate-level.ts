import { NextApiRequest, NextApiResponse } from 'next'

interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: string;
}

const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: '1',
    question: 'What is the time complexity of accessing an element in an array?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctAnswer: 0,
    category: 'Arrays',
    difficulty: 'Easy'
  },
  {
    id: '2',
    question: 'Which data structure follows LIFO (Last In, First Out) principle?',
    options: ['Queue', 'Stack', 'Linked List', 'Tree'],
    correctAnswer: 1,
    category: 'Data Structures',
    difficulty: 'Easy'
  },
  {
    id: '3',
    question: 'What is the time complexity of binary search?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctAnswer: 2,
    category: 'Searching',
    difficulty: 'Easy'
  },
  {
    id: '4',
    question: 'Which sorting algorithm has the best average-case time complexity?',
    options: ['Bubble Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort'],
    correctAnswer: 1,
    category: 'Sorting',
    difficulty: 'Medium'
  },
  {
    id: '5',
    question: 'What is the space complexity of a recursive function that calls itself n times?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctAnswer: 1,
    category: 'Recursion',
    difficulty: 'Medium'
  },
  {
    id: '6',
    question: 'Which algorithm is used to find the shortest path in a weighted graph?',
    options: ['BFS', 'DFS', 'Dijkstra\'s', 'Binary Search'],
    correctAnswer: 2,
    category: 'Graphs',
    difficulty: 'Medium'
  },
  {
    id: '7',
    question: 'What is the time complexity of the optimal solution for the Fibonacci sequence using dynamic programming?',
    options: ['O(1)', 'O(n)', 'O(2^n)', 'O(log n)'],
    correctAnswer: 1,
    category: 'Dynamic Programming',
    difficulty: 'Hard'
  },
  {
    id: '8',
    question: 'Which data structure is best for implementing a priority queue?',
    options: ['Array', 'Linked List', 'Heap', 'Stack'],
    correctAnswer: 2,
    category: 'Data Structures',
    difficulty: 'Medium'
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { 
      userId, 
      answers, 
      timeSpent, 
      problemAttempts, 
      previousExperience,
      preferredLanguage 
    } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      })
    }

    // Process actual answers and calculate real score
    const questionResults = answers.map((answer: any) => {
      const question = assessmentQuestions.find(q => q.id === answer.questionId);
      const isCorrect = answer.selectedAnswer === question?.correctAnswer;
      
      return {
        questionId: answer.questionId,
        question: question?.question || '',
        userAnswer: answer.selectedAnswer,
        correctAnswer: question?.correctAnswer || 0,
        userAnswerText: question?.options[answer.selectedAnswer] || '',
        correctAnswerText: question?.options[question?.correctAnswer || 0] || '',
        isCorrect,
        category: question?.category || '',
        difficulty: question?.difficulty || '',
        explanation: getExplanation(question?.id || '', isCorrect, answer.selectedAnswer)
      };
    });

    const correctAnswers = questionResults.filter(result => result.isCorrect).length;
    const totalQuestions = assessmentQuestions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Calculate performance by category
    const categoryPerformance = calculateCategoryPerformance(questionResults);
    
    // Determine level based on actual performance
    const level = determineLevel(score, categoryPerformance, timeSpent);
    
    // Generate strengths and weaknesses based on actual performance
    const { strengths, weaknesses } = analyzePerformance(questionResults, categoryPerformance);
    
    // Create personalized curriculum based on actual results
    const curriculum = generateCurriculum(level, weaknesses, previousExperience);
    
    // Generate specific recommendations based on mistakes
    const recommendations = generateRecommendations(questionResults, level, weaknesses);

    const evaluation = {
      level,
      score,
      correctAnswers,
      totalQuestions,
      timeSpent,
      categoryPerformance,
      strengths,
      weaknesses,
      confidence: calculateConfidence(score, timeSpent),
      estimatedExperience: estimateExperience(score, previousExperience),
      recommendedStartingPoint: getRecommendedStartingPoint(weaknesses, level),
      questionResults // Include detailed results for review
    };

    res.status(200).json({
      success: true,
      data: {
        evaluation,
        curriculum,
        recommendations
      }
    })

  } catch (error) {
    console.error('Level evaluation error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

function getExplanation(questionId: string, isCorrect: boolean, userAnswer: number): string {
  const explanations: { [key: string]: string } = {
    '1': 'Array access is O(1) because you can directly access any element using its index without traversing the array.',
    '2': 'A Stack follows LIFO (Last In, First Out) - the last element pushed is the first one popped.',
    '3': 'Binary search is O(log n) because it divides the search space in half with each iteration.',
    '4': 'Quick Sort has O(n log n) average-case time complexity, making it one of the most efficient sorting algorithms.',
    '5': 'Recursive functions use O(n) space due to the call stack storing n function calls.',
    '6': 'Dijkstra\'s algorithm is specifically designed to find the shortest path in weighted graphs.',
    '7': 'Dynamic programming solution for Fibonacci is O(n) time and O(1) space using iteration.',
    '8': 'Heap provides O(log n) insertion and O(1) extraction for priority queue operations.'
  };
  
  return explanations[questionId] || 'No explanation available.';
}

function calculateCategoryPerformance(questionResults: any[]) {
  const categories: { [key: string]: { correct: number; total: number; percentage: number } } = {};
  
  questionResults.forEach((result: any) => {
    if (!categories[result.category]) {
      categories[result.category] = { correct: 0, total: 0, percentage: 0 };
    }
    categories[result.category].total++;
    if (result.isCorrect) {
      categories[result.category].correct++;
    }
  });
  
  // Calculate percentages
  Object.keys(categories).forEach(category => {
    categories[category].percentage = Math.round((categories[category].correct / categories[category].total) * 100);
  });
  
  return categories;
}

function determineLevel(score: number, categoryPerformance: any, timeSpent: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  // Consider score, time spent, and category performance
  const avgCategoryScore = Object.values(categoryPerformance).reduce((sum: any, cat: any) => sum + (cat as any).percentage, 0) / Object.keys(categoryPerformance).length;
  const timeEfficiency = timeSpent < 300 ? 1.2 : timeSpent < 600 ? 1.0 : 0.8; // Bonus for speed
  
  const adjustedScore = score * timeEfficiency;
  
  if (adjustedScore >= 90 && avgCategoryScore >= 85) return 'expert';
  if (adjustedScore >= 75 && avgCategoryScore >= 70) return 'advanced';
  if (adjustedScore >= 50 && avgCategoryScore >= 50) return 'intermediate';
  return 'beginner';
}

function analyzePerformance(questionResults: any[], categoryPerformance: any) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Analyze by category
  Object.entries(categoryPerformance).forEach(([category, data]: [string, any]) => {
    if (data.percentage >= 80) {
      strengths.push(`${category} (${data.percentage}% correct)`);
    } else if (data.percentage <= 50) {
      weaknesses.push(`${category} (${data.percentage}% correct)`);
    }
  });
  
  // Analyze by difficulty
  const easyQuestions = questionResults.filter(q => q.difficulty === 'Easy');
  const mediumQuestions = questionResults.filter(q => q.difficulty === 'Medium');
  const hardQuestions = questionResults.filter(q => q.difficulty === 'Hard');
  
  const easyScore = easyQuestions.length > 0 ? easyQuestions.filter(q => q.isCorrect).length / easyQuestions.length * 100 : 0;
  const mediumScore = mediumQuestions.length > 0 ? mediumQuestions.filter(q => q.isCorrect).length / mediumQuestions.length * 100 : 0;
  const hardScore = hardQuestions.length > 0 ? hardQuestions.filter(q => q.isCorrect).length / hardQuestions.length * 100 : 0;
  
  if (easyScore >= 80) strengths.push('Basic concepts');
  if (easyScore <= 50) weaknesses.push('Basic concepts need review');
  
  if (mediumScore >= 70) strengths.push('Intermediate problem solving');
  if (mediumScore <= 40) weaknesses.push('Intermediate algorithms');
  
  if (hardScore >= 60) strengths.push('Advanced concepts');
  if (hardScore <= 30) weaknesses.push('Advanced algorithms');
  
  return { strengths, weaknesses };
}

function generateCurriculum(level: string, weaknesses: string[], previousExperience: string) {
  const topics = [];
  let order = 1;
  
  // Add topics based on weaknesses
  if (weaknesses.some(w => w.includes('Basic concepts'))) {
    topics.push({
      id: '1',
      title: 'Arrays and Basic Data Structures',
      order: order++,
      difficulty: 'Easy',
      estimatedTime: 60,
      prerequisites: []
    });
  }
  
  if (weaknesses.some(w => w.includes('Intermediate algorithms'))) {
    topics.push({
      id: '2',
      title: 'Sorting and Searching Algorithms',
      order: order++,
      difficulty: 'Medium',
      estimatedTime: 90,
      prerequisites: ['1']
    });
  }
  
  if (weaknesses.some(w => w.includes('Advanced algorithms'))) {
    topics.push({
      id: '3',
      title: 'Dynamic Programming Fundamentals',
      order: order++,
      difficulty: 'Hard',
      estimatedTime: 120,
      prerequisites: ['2']
    });
  }
  
  // Add level-appropriate topics
  if (level === 'beginner') {
    topics.push({
      id: '4',
      title: 'Linked Lists and Stacks',
      order: order++,
      difficulty: 'Easy',
      estimatedTime: 75,
      prerequisites: ['1']
    });
  } else if (level === 'intermediate') {
    topics.push({
      id: '5',
      title: 'Graphs and Graph Traversal',
      order: order++,
      difficulty: 'Medium',
      estimatedTime: 100,
      prerequisites: ['2']
    });
  } else if (level === 'advanced' || level === 'expert') {
    topics.push({
      id: '6',
      title: 'Advanced Graph Algorithms',
      order: order++,
      difficulty: 'Hard',
      estimatedTime: 150,
      prerequisites: ['5']
    });
  }
  
  // Generate personalized message and approach
  const { message, approach } = generatePersonalizedMessage(level, weaknesses, previousExperience);
  
  return {
    level,
    topics,
    estimatedDuration: `${Math.ceil(topics.reduce((sum, t) => sum + t.estimatedTime, 0) / 60)} weeks`,
    milestones: [
      'Master fundamental data structures',
      'Implement efficient algorithms',
      'Solve complex problem patterns',
      'Complete interview-style problems'
    ],
    message,
    approach
  };
}

function generatePersonalizedMessage(level: string, weaknesses: string[], previousExperience: string) {
  if (level === 'expert') {
    return {
      message: "🎯 Excellent work! You've demonstrated exceptional technical prowess. Now we need to challenge you with advanced algorithmic patterns to help your knowledge stick and push you to the next level.",
      approach: "We'll focus on advanced optimization techniques, complex algorithmic patterns, and competitive programming strategies. Each concept builds upon your solid foundation, creating a sophisticated understanding of algorithm design."
    };
  } else if (level === 'advanced') {
    return {
      message: "🚀 Impressive foundation! You're ready to tackle more sophisticated algorithmic challenges. Let's build upon your strengths and systematically address any gaps.",
      approach: "We'll create a progressive learning path that reinforces your strong areas while introducing advanced concepts. Each topic is carefully sequenced to build confidence and mastery."
    };
  } else if (level === 'intermediate') {
    return {
      message: "📈 Great progress! You have a solid foundation and we're going to help you bridge the gap to advanced concepts. Let's strengthen your core skills and introduce new challenges.",
      approach: "We'll use a building-block approach, starting with reinforcing fundamentals and gradually introducing more complex concepts. Each step is designed to build confidence and competence."
    };
  } else {
    return {
      message: "🌱 Welcome to your DSA journey! Don't worry about where you are now - we're going to get you there, very soon. Every expert was once a beginner.",
      approach: "We'll start with the absolute fundamentals and build your knowledge brick by brick. Each concept is carefully explained and practiced until you're comfortable before moving to the next."
    };
  }
}

function generateRecommendations(questionResults: any[], level: string, weaknesses: string[]) {
  const recommendations = [];
  
  // Add specific recommendations based on mistakes
  const incorrectQuestions = questionResults.filter(q => !q.isCorrect);
  if (incorrectQuestions.length > 0) {
    recommendations.push(`Review ${incorrectQuestions.length} incorrect answers to understand your mistakes`);
  }
  
  // Add level-specific recommendations
  if (level === 'beginner') {
    recommendations.push('Focus on mastering basic data structures before moving to algorithms');
    recommendations.push('Practice implementing simple solutions before optimizing');
  } else if (level === 'intermediate') {
    recommendations.push('Work on time and space complexity analysis');
    recommendations.push('Practice pattern recognition in problem solving');
  } else if (level === 'advanced') {
    recommendations.push('Focus on advanced algorithm patterns and optimization');
    recommendations.push('Practice solving problems under time constraints');
  }
  
  // Add weakness-specific recommendations
  if (weaknesses.some(w => w.includes('Basic concepts'))) {
    recommendations.push('Strengthen your foundation with array and string manipulation');
  }
  if (weaknesses.some(w => w.includes('Intermediate algorithms'))) {
    recommendations.push('Practice sorting, searching, and basic graph algorithms');
  }
  if (weaknesses.some(w => w.includes('Advanced algorithms'))) {
    recommendations.push('Study dynamic programming and advanced graph algorithms');
  }
  
  return recommendations;
}

function calculateConfidence(score: number, timeSpent: number): number {
  // Higher score and reasonable time = higher confidence
  const timeBonus = timeSpent < 600 ? 10 : timeSpent < 900 ? 5 : 0;
  return Math.min(95, score + timeBonus);
}

function estimateExperience(score: number, previousExperience: string): string {
  if (score >= 90) return '2+ years of focused practice';
  if (score >= 75) return '1-2 years of regular practice';
  if (score >= 50) return '6 months - 1 year of practice';
  return '0-6 months of practice';
}

function getRecommendedStartingPoint(weaknesses: string[], level: string): string {
  if (weaknesses.some(w => w.includes('Basic concepts'))) {
    return 'Arrays and basic data structures';
  }
  if (weaknesses.some(w => w.includes('Intermediate algorithms'))) {
    return 'Sorting and searching algorithms';
  }
  if (weaknesses.some(w => w.includes('Advanced algorithms'))) {
    return 'Dynamic programming fundamentals';
  }
  
  return level === 'beginner' ? 'Basic data structures' : 
         level === 'intermediate' ? 'Intermediate algorithms' : 
         'Advanced algorithm patterns';
}
