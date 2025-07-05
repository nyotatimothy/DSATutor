import { NextApiRequest, NextApiResponse } from 'next'

interface TopicContent {
  title: string
  explanation: string
  realWorldExamples: string[]
  diagrams: string[]
  codeExamples: string[]
  practiceProblems: string[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { topicId, topicTitle, level, userId } = req.body

    if (!userId || !topicId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and topic ID are required'
      })
    }

    // Generate topic content based on topic and level
    const content = generateTopicContent(topicId, topicTitle, level)

    res.status(200).json({
      success: true,
      data: {
        content
      }
    })

  } catch (error) {
    console.error('Topic content generation error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

function generateTopicContent(topicId: string, topicTitle: string, level: string): TopicContent {
  const contentMap: { [key: string]: TopicContent } = {
    'sliding-window': {
      title: 'Sliding Window',
      explanation: `The Sliding Window technique is a powerful algorithmic pattern that helps solve problems involving arrays or strings efficiently. Think of it like a camera lens that moves across a scene - you maintain a "window" of elements and slide it through your data to find the optimal solution.

The key insight is that instead of checking every possible subarray (which would be O(n²)), you maintain a window and adjust its size based on certain conditions. This reduces the time complexity to O(n) in most cases.

There are two main types of sliding windows:
1. Fixed-size window: The window size remains constant
2. Variable-size window: The window size changes based on conditions`,
      realWorldExamples: [
        'Finding the longest substring with at most k distinct characters (like finding the longest word with limited unique letters)',
        'Calculating the maximum sum of any contiguous subarray of size k (like finding the best k-day period for stock prices)',
        'Finding all anagrams of a pattern in a string (like finding all possible rearrangements of a word in a text)',
        'Minimum window substring (like finding the shortest advertisement that contains all required keywords)'
      ],
      diagrams: [
        'Visual representation showing how the window slides through an array with pointers',
        'Step-by-step animation of the sliding window process with color coding',
        'Comparison chart showing brute force vs sliding window approach efficiency',
        'Flow diagram showing when to expand vs contract the window'
      ],
      codeExamples: [
        `// Basic Sliding Window Template
function slidingWindow(arr, k) {
  let windowSum = 0;
  let maxSum = 0;
  
  // Initialize first window
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  maxSum = windowSum;
  
  // Slide the window
  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum - arr[i - k] + arr[i];
    maxSum = Math.max(maxSum, windowSum);
  }
  
  return maxSum;
}`,
        `// Variable Size Sliding Window
function longestSubstringKDistinct(str, k) {
  const charCount = new Map();
  let left = 0;
  let maxLength = 0;
  
  for (let right = 0; right < str.length; right++) {
    charCount.set(str[right], (charCount.get(str[right]) || 0) + 1);
    
    while (charCount.size > k) {
      charCount.set(str[left], charCount.get(str[left]) - 1);
      if (charCount.get(str[left]) === 0) {
        charCount.delete(str[left]);
      }
      left++;
    }
    
    maxLength = Math.max(maxLength, right - left + 1);
  }
  
  return maxLength;
}`,
        `// Advanced: Sliding Window with Hash Map
function minWindowSubstring(s, t) {
  const target = new Map();
  const window = new Map();
  
  for (const char of t) {
    target.set(char, (target.get(char) || 0) + 1);
  }
  
  let left = 0, right = 0;
  let minStart = 0, minLen = Infinity;
  let formed = 0, required = target.size;
  
  while (right < s.length) {
    const char = s[right];
    window.set(char, (window.get(char) || 0) + 1);
    
    if (target.has(char) && window.get(char) === target.get(char)) {
      formed++;
    }
    
    while (formed === required) {
      if (right - left + 1 < minLen) {
        minLen = right - left + 1;
        minStart = left;
      }
      
      const leftChar = s[left];
      window.set(leftChar, window.get(leftChar) - 1);
      
      if (target.has(leftChar) && window.get(leftChar) < target.get(leftChar)) {
        formed--;
      }
      left++;
    }
    right++;
  }
  
  return minLen === Infinity ? "" : s.substring(minStart, minStart + minLen);
}`
      ],
      practiceProblems: [
        'Maximum Sum Subarray of Size K',
        'Longest Substring with K Distinct Characters',
        'Minimum Window Substring',
        'Longest Repeating Character Replacement',
        'Permutation in String'
      ]
    },
    'two-pointers': {
      title: 'Two Pointers',
      explanation: `The Two Pointers technique is a fundamental algorithmic pattern that uses two pointers to traverse data structures efficiently. It's like having two people walking through a maze - they can move at different speeds, in different directions, or start from different positions.

This technique is particularly useful for:
- Array problems where you need to find pairs or triplets
- String problems involving palindromes or anagrams
- Linked list problems like cycle detection or finding the middle
- Problems where you need to compare elements from different positions

The key is to understand when and how to move each pointer based on the problem constraints.`,
      realWorldExamples: [
        'Finding pairs that sum to a target (like finding two products that cost exactly $100 together)',
        'Checking if a string is a palindrome (like verifying if a word reads the same forwards and backwards)',
        'Removing duplicates from a sorted array (like organizing a sorted list of names)',
        'Finding the middle element of a linked list (like finding the center point of a chain)'
      ],
      diagrams: [
        'Visual representation of two pointers moving through an array',
        'Animation showing how pointers converge or diverge based on conditions',
        'Comparison of different two-pointer strategies (opposite ends, same direction, different speeds)',
        'Flow chart showing decision points for pointer movement'
      ],
      codeExamples: [
        `// Two Pointers from Opposite Ends
function twoSumSorted(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left < right) {
    const sum = arr[left] + arr[right];
    
    if (sum === target) {
      return [left, right];
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  
  return [-1, -1];
}`,
        `// Two Pointers Moving in Same Direction
function removeDuplicates(arr) {
  if (arr.length <= 1) return arr.length;
  
  let writeIndex = 1;
  
  for (let readIndex = 1; readIndex < arr.length; readIndex++) {
    if (arr[readIndex] !== arr[readIndex - 1]) {
      arr[writeIndex] = arr[readIndex];
      writeIndex++;
    }
  }
  
  return writeIndex;
}`,
        `// Fast and Slow Pointers (Floyd's Cycle Detection)
function hasCycle(head) {
  if (!head || !head.next) return false;
  
  let slow = head;
  let fast = head.next;
  
  while (slow !== fast) {
    if (!fast || !fast.next) return false;
    slow = slow.next;
    fast = fast.next.next;
  }
  
  return true;
}`
      ],
      practiceProblems: [
        'Two Sum II - Input Array Is Sorted',
        'Remove Duplicates from Sorted Array',
        'Valid Palindrome',
        'Container With Most Water',
        'Linked List Cycle'
      ]
    },
    'fast-slow-pointers': {
      title: 'Fast and Slow Pointers',
      explanation: `The Fast and Slow Pointers technique (also known as Floyd's Cycle Detection) uses two pointers that move at different speeds through a data structure. It's like having a hare and a tortoise racing - the hare moves twice as fast as the tortoise.

This technique is incredibly useful for:
- Detecting cycles in linked lists
- Finding the middle element of a linked list
- Detecting cycles in arrays
- Finding the start of a cycle
- Determining if a number is happy

The key insight is that if there's a cycle, the fast pointer will eventually catch up to the slow pointer. If there's no cycle, the fast pointer will reach the end first.`,
      realWorldExamples: [
        'Detecting infinite loops in a program (like checking if a function will ever terminate)',
        'Finding the middle of a queue (like finding the person in the middle of a line)',
        'Detecting circular references in data structures (like finding if a chain of references loops back)',
        'Happy number detection (like checking if repeatedly squaring digits leads to 1)'
      ],
      diagrams: [
        'Animation showing fast and slow pointers in a linked list with cycle',
        'Visual representation of pointer positions over time',
        'Comparison of cycle vs no-cycle scenarios',
        'Step-by-step breakdown of finding cycle start point'
      ],
      codeExamples: [
        `// Basic Cycle Detection
function hasCycle(head) {
  if (!head || !head.next) return false;
  
  let slow = head;
  let fast = head.next;
  
  while (slow !== fast) {
    if (!fast || !fast.next) return false;
    slow = slow.next;
    fast = fast.next.next;
  }
  
  return true;
}`,
        `// Finding Middle Element
function findMiddle(head) {
  if (!head) return null;
  
  let slow = head;
  let fast = head;
  
  while (fast.next && fast.next.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  
  return slow;
}`,
        `// Finding Cycle Start Point
function detectCycle(head) {
  if (!head || !head.next) return null;
  
  let slow = head;
  let fast = head;
  
  // Find meeting point
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) break;
  }
  
  if (slow !== fast) return null;
  
  // Find cycle start
  slow = head;
  while (slow !== fast) {
    slow = slow.next;
    fast = fast.next;
  }
  
  return slow;
}`
      ],
      practiceProblems: [
        'Linked List Cycle',
        'Linked List Cycle II',
        'Middle of the Linked List',
        'Happy Number',
        'Find the Duplicate Number'
      ]
    }
  }

  // Return content for the specific topic, or generate a generic one
  const content = contentMap[topicId] || generateGenericContent(topicTitle, level)
  
  return content
}

function generateGenericContent(topicTitle: string, level: string): TopicContent {
  return {
    title: topicTitle,
    explanation: `${topicTitle} is an important algorithmic technique that helps solve complex problems efficiently. This pattern involves ${level === 'beginner' ? 'understanding fundamental concepts' : level === 'expert' ? 'mastering advanced optimization strategies' : 'building upon intermediate knowledge'} to achieve optimal solutions.

The key principles involve understanding the problem constraints, identifying the appropriate data structures, and implementing efficient algorithms that minimize time and space complexity.`,
    realWorldExamples: [
      'Real-world application 1 of this technique',
      'Practical use case 2 demonstrating the concept',
      'Industry example 3 showing implementation',
      'Common scenario 4 where this pattern is useful'
    ],
    diagrams: [
      'Visual representation of the concept',
      'Step-by-step process illustration',
      'Comparison of different approaches',
      'Flow diagram showing decision points'
    ],
    codeExamples: [
      `// Basic implementation of ${topicTitle}
function basicImplementation() {
  // Basic code example
  return "Basic implementation";
}`,
      `// Intermediate approach for ${topicTitle}
function intermediateApproach() {
  // Intermediate code example
  return "Intermediate approach";
}`,
      `// Advanced optimization of ${topicTitle}
function advancedOptimization() {
  // Advanced code example
  return "Advanced optimization";
}`
    ],
    practiceProblems: [
      `Basic ${topicTitle} Problem`,
      `Intermediate ${topicTitle} Challenge`,
      `Advanced ${topicTitle} Application`,
      `Complex ${topicTitle} Scenario`,
      `Expert ${topicTitle} Optimization`
    ]
  }
} 