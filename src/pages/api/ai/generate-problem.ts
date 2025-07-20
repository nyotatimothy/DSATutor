import { NextApiRequest, NextApiResponse } from 'next'

interface ProblemRequest {
  topicId: string;
  subtopicTitle: string;
  problemTitle: string;
  difficulty: 'easy' | 'medium' | 'hard';
  userId: string;
}

interface GeneratedProblem {
  title: string;
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
  hints: string[];
  starterCode: {
    javascript: string;
    python: string;
    java: string;
  };
  solution: {
    approach: string;
    timeComplexity: string;
    spaceComplexity: string;
    code: string;
  };
  testCases: {
    input: string;
    expectedOutput: string;
    hidden: boolean;
  }[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { topicId, subtopicTitle, problemTitle, difficulty, userId }: ProblemRequest = req.body

    if (!topicId || !subtopicTitle || !problemTitle || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: topicId, subtopicTitle, problemTitle, difficulty'
      })
    }

    // Simulate AI problem generation delay
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Generate problem based on topic and difficulty
    const generatedProblem = generateProblemContent(topicId, subtopicTitle, problemTitle, difficulty)

    res.status(200).json({
      success: true,
      data: generatedProblem,
      message: 'Problem generated successfully'
    })

  } catch (error) {
    console.error('Problem generation error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

function generateProblemContent(
  topicId: string,
  subtopicTitle: string,
  problemTitle: string,
  difficulty: 'easy' | 'medium' | 'hard'
): GeneratedProblem {

  // Generate different problems based on topic
  if (topicId === 'advanced-graphs' && subtopicTitle.includes('Spanning')) {
    return {
      title: problemTitle,
      description: `
You are tasked with designing a network infrastructure system that connects all offices with minimum cable cost while ensuring redundancy for critical connections.

Given a list of offices and the cost to connect each pair of offices with cables, find the minimum cost to connect all offices such that:
1. All offices are connected (directly or indirectly)
2. Critical connections (marked with priority flag) have backup routes
3. The total cable cost is minimized

This is a real-world application of Minimum Spanning Tree with additional constraints for redundancy.
      `,
      constraints: [
        '1 ≤ n ≤ 1000 (number of offices)',
        '1 ≤ m ≤ 10000 (number of possible connections)',
        '1 ≤ cost ≤ 100000 (cost of each connection)',
        'At most 10 critical connections'
      ],
      examples: [
        {
          input: `
offices = 4
connections = [[0,1,10,true], [0,2,6,false], [0,3,5,false], [1,2,4,false], [1,3,15,true], [2,3,3,false]]
Format: [office1, office2, cost, isCritical]
          `,
          output: `
Total Cost: 19
Connections: [(0,3,5), (2,3,3), (1,2,4), (0,1,10), (1,3,15)]
Explanation: MST cost is 12, but we add redundant path for critical connections
          `,
          explanation: 'We build the MST first, then add redundant paths for critical connections to ensure reliability.'
        }
      ],
      hints: [
        'Start with Kruskal\'s or Prim\'s algorithm for basic MST',
        'Consider Union-Find for cycle detection',
        'For critical connections, ensure there are at least 2 disjoint paths',
        'Think about how to add minimal redundancy cost'
      ],
      starterCode: {
        javascript: `
function designNetworkInfrastructure(offices, connections) {
    // Your implementation here
    // Return: { totalCost: number, selectedConnections: number[][] }
    
    return { totalCost: 0, selectedConnections: [] };
}
        `,
        python: `
def design_network_infrastructure(offices, connections):
    """
    Design network infrastructure with redundancy
    
    Args:
        offices: int - number of offices
        connections: List[List[int]] - [office1, office2, cost, is_critical]
    
    Returns:
        dict: {"total_cost": int, "selected_connections": List[List[int]]}
    """
    # Your implementation here
    pass
        `,
        java: `
public class NetworkDesign {
    public static class Result {
        int totalCost;
        List<int[]> selectedConnections;
        
        Result(int cost, List<int[]> connections) {
            this.totalCost = cost;
            this.selectedConnections = connections;
        }
    }
    
    public static Result designNetworkInfrastructure(int offices, int[][] connections) {
        // Your implementation here
        return new Result(0, new ArrayList<>());
    }
}
        `
      },
      solution: {
        approach: `
1. Build MST using Kruskal's algorithm for basic connectivity
2. Identify critical connections and check if they're in MST
3. For critical connections not in MST, find alternative paths
4. Add redundant connections for critical links to ensure backup routes
5. Calculate total cost including redundancy overhead
        `,
        timeComplexity: 'O(M log M + M α(N)) where M is edges, N is nodes, α is inverse Ackermann',
        spaceComplexity: 'O(N + M) for Union-Find and edge storage',
        code: `
// JavaScript solution
function designNetworkInfrastructure(offices, connections) {
    // Implementation would use Union-Find and MST algorithms
    // with additional logic for critical connection redundancy
}
        `
      },
      testCases: [
        {
          input: '4\\n[[0,1,10,true], [0,2,6,false], [0,3,5,false], [1,2,4,false], [1,3,15,true], [2,3,3,false]]',
          expectedOutput: '19',
          hidden: false
        },
        {
          input: '5\\n[[0,1,2,false], [1,2,3,true], [2,3,1,false], [3,4,4,false], [0,4,10,false], [1,4,7,true]]',
          expectedOutput: '17',
          hidden: true
        }
      ]
    }
  }

  // Default problem template
  return {
    title: problemTitle,
    description: `
This is a dynamically generated problem for ${problemTitle} in the ${subtopicTitle} section.

The problem focuses on ${difficulty} level concepts and real-world applications of algorithms and data structures.

Problem Statement:
Given the constraints and requirements below, implement an efficient solution that demonstrates mastery of the underlying algorithmic concepts.
    `,
    constraints: [
      '1 ≤ n ≤ 1000',
      'Input values are within reasonable bounds',
      'Expected time complexity: O(n log n) or better',
      'Expected space complexity: O(n) or better'
    ],
    examples: [
      {
        input: 'Sample input based on problem context',
        output: 'Expected output',
        explanation: 'Step-by-step explanation of the solution approach'
      }
    ],
    hints: [
      'Consider the optimal substructure of the problem',
      'Think about which data structure would be most efficient',
      'Consider edge cases and boundary conditions',
      'Optimize for time complexity first, then space'
    ],
    starterCode: {
      javascript: `
function solve(input) {
    // Your implementation here
    return result;
}
      `,
      python: `
def solve(input_data):
    # Your implementation here
    pass
      `,
      java: `
public class Solution {
    public static String solve(String input) {
        // Your implementation here
        return "";
    }
}
      `
    },
    solution: {
      approach: 'The solution involves analyzing the problem constraints and applying appropriate algorithmic techniques.',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      code: '// Solution code would be provided after implementation'
    },
    testCases: [
      {
        input: 'test input 1',
        expectedOutput: 'expected output 1',
        hidden: false
      },
      {
        input: 'test input 2',
        expectedOutput: 'expected output 2',
        hidden: true
      }
    ]
  }
}
