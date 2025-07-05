import { NextApiRequest, NextApiResponse } from 'next'

const questionPool = [
  {
    id: '1',
    question: 'What is the time complexity of accessing an element in an array?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)']
  },
  {
    id: '2',
    question: 'Which data structure follows LIFO (Last In, First Out) principle?',
    options: ['Queue', 'Stack', 'Linked List', 'Tree']
  },
  {
    id: '3',
    question: 'What is the time complexity of binary search?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)']
  },
  {
    id: '4',
    question: 'Which sorting algorithm has the best average-case time complexity?',
    options: ['Bubble Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort']
  },
  {
    id: '5',
    question: 'What is the space complexity of a recursive function that calls itself n times?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)']
  },
  {
    id: '6',
    question: 'Which algorithm is used to find the shortest path in a weighted graph?',
    options: ['BFS', 'DFS', 'Dijkstra\'s', 'Binary Search']
  },
  {
    id: '7',
    question: 'What is the time complexity of the optimal solution for the Fibonacci sequence using dynamic programming?',
    options: ['O(1)', 'O(n)', 'O(2^n)', 'O(log n)']
  },
  {
    id: '8',
    question: 'Which data structure is best for implementing a priority queue?',
    options: ['Array', 'Linked List', 'Heap', 'Stack']
  },
  {
    id: '9',
    question: 'Which traversal method uses a queue for trees?',
    options: ['Preorder', 'Inorder', 'Postorder', 'Level Order']
  },
  {
    id: '10',
    question: 'Which data structure is used for DFS in a graph?',
    options: ['Queue', 'Stack', 'Heap', 'Priority Queue']
  },
  {
    id: '11',
    question: 'What is the best data structure for fast lookup of unique items?',
    options: ['Array', 'HashSet', 'Stack', 'Queue']
  },
  {
    id: '12',
    question: 'Which algorithm is used for finding minimum spanning tree?',
    options: ['Dijkstra\'s', 'Kruskal\'s', 'BFS', 'DFS']
  }
]

function getRandomQuestions(count: number) {
  const shuffled = questionPool.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }
  const count = parseInt((req.query.count as string) || '8')
  const questions = getRandomQuestions(count)
  res.status(200).json({ success: true, questions })
} 