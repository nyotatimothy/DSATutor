import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Topic ID is required' });
    }

    // Mock topics data
    const mockTopics: { [key: string]: any } = {
      '1': {
        id: 1,
        title: "Introduction to Arrays",
        description: "Learn the fundamentals of arrays and their operations. This topic covers array creation, accessing elements, basic operations, and common array algorithms.",
        courseId: 1,
        order: 1,
        problemsCount: 5,
        completedProblems: 3,
        isCompleted: false,
        content: {
          overview: "Arrays are one of the most fundamental data structures in programming. They store elements in contiguous memory locations and provide fast access to elements using indices.",
          keyConcepts: [
            "Array declaration and initialization",
            "Accessing array elements",
            "Array traversal",
            "Basic array operations",
            "Time and space complexity"
          ],
          examples: [
            {
              title: "Creating an Array",
              code: "int[] numbers = {1, 2, 3, 4, 5};",
              explanation: "This creates an array of integers with 5 elements."
            },
            {
              title: "Accessing Elements",
              code: "int firstElement = numbers[0]; // Gets the first element",
              explanation: "Array indices start at 0, so the first element is at index 0."
            }
          ]
        },
        problems: [
          { id: 1, title: "Two Sum", difficulty: "Easy", solved: true },
          { id: 4, title: "Maximum Subarray", difficulty: "Medium", solved: false },
          { id: 7, title: "Container With Most Water", difficulty: "Medium", solved: false },
          { id: 14, title: "Binary Search", difficulty: "Easy", solved: false },
          { id: 15, title: "Single Number", difficulty: "Easy", solved: false }
        ]
      },
      '2': {
        id: 2,
        title: "Array Manipulation",
        description: "Advanced array operations and algorithms including sorting, searching, and optimization techniques.",
        courseId: 1,
        order: 2,
        problemsCount: 4,
        completedProblems: 2,
        isCompleted: false,
        content: {
          overview: "Advanced array manipulation involves complex algorithms for sorting, searching, and optimizing array operations.",
          keyConcepts: [
            "Sorting algorithms",
            "Search algorithms",
            "Array optimization",
            "Two-pointer technique",
            "Sliding window"
          ],
          examples: [
            {
              title: "Two-Pointer Technique",
              code: "// Example: Finding pairs that sum to target\nint left = 0, right = array.length - 1;",
              explanation: "Two pointers can efficiently solve many array problems."
            }
          ]
        },
        problems: [
          { id: 4, title: "Maximum Subarray", difficulty: "Medium", solved: false },
          { id: 5, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", solved: false },
          { id: 7, title: "Container With Most Water", difficulty: "Medium", solved: false },
          { id: 14, title: "Binary Search", difficulty: "Easy", solved: false }
        ]
      },
      '3': {
        id: 3,
        title: "String Fundamentals",
        description: "Basic string operations and manipulation techniques essential for programming.",
        courseId: 1,
        order: 3,
        problemsCount: 6,
        completedProblems: 4,
        isCompleted: false,
        content: {
          overview: "Strings are sequences of characters and are fundamental to text processing and manipulation.",
          keyConcepts: [
            "String creation and manipulation",
            "String traversal",
            "Character operations",
            "String comparison",
            "String algorithms"
          ],
          examples: [
            {
              title: "String Traversal",
              code: "for (char c : str.toCharArray()) {\n    // Process each character\n}",
              explanation: "Iterating through each character in a string."
            }
          ]
        },
        problems: [
          { id: 2, title: "Valid Parentheses", difficulty: "Easy", solved: true },
          { id: 5, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", solved: false },
          { id: 15, title: "Single Number", difficulty: "Easy", solved: false }
        ]
      },
      '4': {
        id: 4,
        title: "Linked Lists Basics",
        description: "Introduction to linked list data structure and its operations.",
        courseId: 1,
        order: 4,
        problemsCount: 3,
        completedProblems: 1,
        isCompleted: false,
        content: {
          overview: "Linked lists are linear data structures where elements are stored in nodes, and each node points to the next node.",
          keyConcepts: [
            "Node structure",
            "Linked list types",
            "Traversal",
            "Insertion and deletion",
            "Common algorithms"
          ],
          examples: [
            {
              title: "Node Definition",
              code: "class ListNode {\n    int val;\n    ListNode next;\n    ListNode(int x) { val = x; }\n}",
              explanation: "Basic structure of a linked list node."
            }
          ]
        },
        problems: [
          { id: 3, title: "Reverse a Linked List", difficulty: "Medium", solved: false },
          { id: 6, title: "Merge Two Sorted Lists", difficulty: "Easy", solved: true }
        ]
      },
      '5': {
        id: 5,
        title: "Stack and Queue Operations",
        description: "Understanding stack and queue data structures and their applications.",
        courseId: 1,
        order: 5,
        problemsCount: 4,
        completedProblems: 0,
        isCompleted: false,
        content: {
          overview: "Stacks and queues are fundamental data structures that follow specific ordering principles.",
          keyConcepts: [
            "Stack operations (LIFO)",
            "Queue operations (FIFO)",
            "Implementation",
            "Applications",
            "Problem-solving patterns"
          ],
          examples: [
            {
              title: "Stack Implementation",
              code: "Stack<Integer> stack = new Stack<>();\nstack.push(1);\nint top = stack.pop();",
              explanation: "Basic stack operations using Java's built-in Stack class."
            }
          ]
        },
        problems: [
          { id: 2, title: "Valid Parentheses", difficulty: "Easy", solved: true },
          { id: 8, title: "Implement Stack using Queues", difficulty: "Medium", solved: false }
        ]
      },
      '6': {
        id: 6,
        title: "Tree Data Structures",
        description: "Binary trees and tree traversal algorithms.",
        courseId: 1,
        order: 6,
        problemsCount: 5,
        completedProblems: 0,
        isCompleted: false,
        content: {
          overview: "Trees are hierarchical data structures with a root node and child nodes.",
          keyConcepts: [
            "Tree terminology",
            "Binary trees",
            "Tree traversal",
            "Tree construction",
            "Tree algorithms"
          ],
          examples: [
            {
              title: "Tree Node Definition",
              code: "class TreeNode {\n    int val;\n    TreeNode left, right;\n    TreeNode(int x) { val = x; }\n}",
              explanation: "Basic structure of a binary tree node."
            }
          ]
        },
        problems: [
          { id: 9, title: "Binary Tree Inorder Traversal", difficulty: "Easy", solved: false },
          { id: 10, title: "Maximum Depth of Binary Tree", difficulty: "Easy", solved: false }
        ]
      },
      '7': {
        id: 7,
        title: "Graph Fundamentals",
        description: "Introduction to graph data structures and basic graph algorithms.",
        courseId: 1,
        order: 7,
        problemsCount: 4,
        completedProblems: 0,
        isCompleted: false,
        content: {
          overview: "Graphs are data structures consisting of vertices and edges that connect them.",
          keyConcepts: [
            "Graph representation",
            "Graph traversal",
            "BFS and DFS",
            "Graph types",
            "Basic algorithms"
          ],
          examples: [
            {
              title: "Graph Representation",
              code: "List<List<Integer>> graph = new ArrayList<>();\n// Adjacency list representation",
              explanation: "Using adjacency list to represent a graph."
            }
          ]
        },
        problems: [
          { id: 11, title: "Number of Islands", difficulty: "Medium", solved: false }
        ]
      },
      '8': {
        id: 8,
        title: "Dynamic Programming Basics",
        description: "Introduction to dynamic programming concepts and problem-solving techniques.",
        courseId: 1,
        order: 8,
        problemsCount: 6,
        completedProblems: 0,
        isCompleted: false,
        content: {
          overview: "Dynamic programming is a method for solving complex problems by breaking them down into simpler subproblems.",
          keyConcepts: [
            "Memoization",
            "Tabulation",
            "Optimal substructure",
            "Overlapping subproblems",
            "Common patterns"
          ],
          examples: [
            {
              title: "Fibonacci with DP",
              code: "int[] dp = new int[n + 1];\ndp[0] = 0; dp[1] = 1;\nfor (int i = 2; i <= n; i++) {\n    dp[i] = dp[i-1] + dp[i-2];\n}",
              explanation: "Using dynamic programming to calculate Fibonacci numbers efficiently."
            }
          ]
        },
        problems: [
          { id: 12, title: "Climbing Stairs", difficulty: "Easy", solved: false },
          { id: 13, title: "House Robber", difficulty: "Medium", solved: false }
        ]
      }
    };

    const topic = mockTopics[id];
    if (topic) {
      return res.status(200).json({
        success: true,
        data: topic
      });
    }

    return res.status(404).json({ message: 'Topic not found' });
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 