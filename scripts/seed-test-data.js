const { PrismaClient } = require('@prisma/client')
const axios = require('axios')

const prisma = new PrismaClient()
const BASE_URL = process.env.SEED_API_BASE_URL || 'http://localhost:3000/api'

// Test data for a comprehensive DSA learning platform
const COURSES = [
  {
    title: "Data Structures Fundamentals",
    description: "Master the core data structures used in programming and interviews",
    topics: [
      {
        title: "Arrays and Lists",
        content: `# Arrays and Lists

## Introduction
Arrays are the most fundamental data structure in programming. They store elements in contiguous memory locations.

## Key Concepts
- **Index-based access**: O(1) time complexity
- **Fixed size**: Traditional arrays have fixed size
- **Dynamic arrays**: Automatically resize (like JavaScript arrays)

## Common Operations
\`\`\`javascript
// Creating an array
const arr = [1, 2, 3, 4, 5];

// Accessing elements
console.log(arr[0]); // 1

// Modifying elements
arr[2] = 10;

// Array methods
arr.push(6);    // Add to end
arr.pop();      // Remove from end
arr.unshift(0); // Add to beginning
arr.shift();    // Remove from beginning
\`\`\`

## Practice Problems
1. Find the maximum element in an array
2. Reverse an array in-place
3. Remove duplicates from sorted array
4. Two Sum problem`,
        position: 1
      },
      {
        title: "Stacks and Queues",
        content: `# Stacks and Queues

## Stack (LIFO - Last In, First Out)
A stack is like a stack of plates - you can only add or remove from the top.

## Queue (FIFO - First In, First Out)
A queue is like a line of people - first person in is first person out.

## Implementation
\`\`\`javascript
// Stack implementation
class Stack {
  constructor() {
    this.items = [];
  }
  
  push(element) {
    this.items.push(element);
  }
  
  pop() {
    if (this.isEmpty()) return "Underflow";
    return this.items.pop();
  }
  
  peek() {
    return this.items[this.items.length - 1];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
}
\`\`\`

## Practice Problems
1. Valid Parentheses
2. Implement Stack using Queues
3. Sliding Window Maximum`,
        position: 2
      },
      {
        title: "Linked Lists",
        content: `# Linked Lists

## What is a Linked List?
A linked list is a linear data structure where elements are stored in nodes, and each node points to the next node.

## Types of Linked Lists
1. **Singly Linked List**: Each node points to the next node
2. **Doubly Linked List**: Each node points to both next and previous nodes
3. **Circular Linked List**: Last node points back to the first node

## Implementation
\`\`\`javascript
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }
  
  insertAtEnd(val) {
    const newNode = new ListNode(val);
    
    if (!this.head) {
      this.head = newNode;
      return;
    }
    
    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    current.next = newNode;
  }
  
  deleteNode(val) {
    if (!this.head) return;
    
    if (this.head.val === val) {
      this.head = this.head.next;
      return;
    }
    
    let current = this.head;
    while (current.next && current.next.val !== val) {
      current = current.next;
    }
    
    if (current.next) {
      current.next = current.next.next;
    }
  }
}
\`\`\`

## Practice Problems
1. Reverse a Linked List
2. Detect Cycle in Linked List
3. Merge Two Sorted Lists
4. Remove Nth Node From End`,
        position: 3
      }
    ]
  },
  {
    title: "Algorithms & Problem Solving",
    description: "Learn essential algorithms and problem-solving techniques for technical interviews",
    topics: [
      {
        title: "Sorting Algorithms",
        content: `# Sorting Algorithms

## Bubble Sort
Simple but inefficient sorting algorithm.

\`\`\`javascript
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}
\`\`\`

## Quick Sort
Efficient divide-and-conquer sorting algorithm.

\`\`\`javascript
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}
\`\`\`

## Time Complexity Comparison
| Algorithm | Best | Average | Worst | Space |
|-----------|------|---------|-------|-------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |`,
        position: 1
      },
      {
        title: "Searching Algorithms",
        content: `# Searching Algorithms

## Linear Search
Simple search that checks each element sequentially.

\`\`\`javascript
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}
\`\`\`

## Binary Search
Efficient search for sorted arrays.

\`\`\`javascript
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}
\`\`\`

## Practice Problems
1. Find First and Last Position of Element in Sorted Array
2. Search in Rotated Sorted Array
3. Median of Two Sorted Arrays`,
        position: 2
      }
    ]
  },
  {
    title: "Advanced Data Structures",
    description: "Master advanced data structures like trees, graphs, and heaps",
    topics: [
      {
        title: "Binary Trees",
        content: `# Binary Trees

## What is a Binary Tree?
A tree data structure where each node has at most two children.

## Types of Binary Trees
1. **Full Binary Tree**: Every node has 0 or 2 children
2. **Complete Binary Tree**: All levels are filled except possibly the last
3. **Perfect Binary Tree**: All internal nodes have 2 children
4. **Balanced Binary Tree**: Height difference between left and right subtrees is at most 1

## Implementation
\`\`\`javascript
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

class BinaryTree {
  constructor() {
    this.root = null;
  }
  
  insert(val) {
    if (!this.root) {
      this.root = new TreeNode(val);
      return;
    }
    
    this.insertNode(this.root, val);
  }
  
  insertNode(node, val) {
    if (val < node.val) {
      if (node.left === null) {
        node.left = new TreeNode(val);
      } else {
        this.insertNode(node.left, val);
      }
    } else {
      if (node.right === null) {
        node.right = new TreeNode(val);
      } else {
        this.insertNode(node.right, val);
      }
    }
  }
}
\`\`\`

## Tree Traversals
\`\`\`javascript
// Inorder: Left -> Root -> Right
function inorderTraversal(root) {
  if (!root) return [];
  return [...inorderTraversal(root.left), root.val, ...inorderTraversal(root.right)];
}

// Preorder: Root -> Left -> Right
function preorderTraversal(root) {
  if (!root) return [];
  return [root.val, ...preorderTraversal(root.left), ...preorderTraversal(root.right)];
}

// Postorder: Left -> Right -> Root
function postorderTraversal(root) {
  if (!root) return [];
  return [...postorderTraversal(root.left), ...postorderTraversal(root.right), root.val];
}
\`\`\`

## Practice Problems
1. Maximum Depth of Binary Tree
2. Validate Binary Search Tree
3. Binary Tree Level Order Traversal
4. Lowest Common Ancestor`,
        position: 1
      },
      {
        title: "Graphs",
        content: `# Graphs

## What is a Graph?
A graph is a collection of nodes (vertices) connected by edges.

## Types of Graphs
1. **Undirected Graph**: Edges have no direction
2. **Directed Graph**: Edges have direction
3. **Weighted Graph**: Edges have weights
4. **Unweighted Graph**: All edges have equal weight

## Graph Representation
\`\`\`javascript
// Adjacency List
class Graph {
  constructor() {
    this.adjacencyList = {};
  }
  
  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = [];
    }
  }
  
  addEdge(vertex1, vertex2) {
    this.adjacencyList[vertex1].push(vertex2);
    this.adjacencyList[vertex2].push(vertex1);
  }
  
  removeEdge(vertex1, vertex2) {
    this.adjacencyList[vertex1] = this.adjacencyList[vertex1]
      .filter(v => v !== vertex2);
    this.adjacencyList[vertex2] = this.adjacencyList[vertex2]
      .filter(v => v !== vertex1);
  }
}
\`\`\`

## Graph Traversal
\`\`\`javascript
// Depth First Search (DFS)
function dfs(graph, start, visited = new Set()) {
  visited.add(start);
  console.log(start);
  
  for (const neighbor of graph[start]) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited);
    }
  }
}

// Breadth First Search (BFS)
function bfs(graph, start) {
  const queue = [start];
  const visited = new Set([start]);
  
  while (queue.length > 0) {
    const vertex = queue.shift();
    console.log(vertex);
    
    for (const neighbor of graph[vertex]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}
\`\`\`

## Practice Problems
1. Number of Islands
2. Course Schedule
3. Clone Graph
4. Word Ladder`,
        position: 2
      }
    ]
  }
]

const USERS = [
  { email: "john.doe@example.com", fullName: "John Doe", role: "student" },
  { email: "jane.smith@example.com", fullName: "Jane Smith", role: "student" },
  { email: "mike.johnson@example.com", fullName: "Mike Johnson", role: "student" },
  { email: "sarah.wilson@example.com", fullName: "Sarah Wilson", role: "student" },
  { email: "david.brown@example.com", fullName: "David Brown", role: "student" },
  { email: "emma.davis@example.com", fullName: "Emma Davis", role: "student" },
  { email: "alex.chen@example.com", fullName: "Alex Chen", role: "creator" },
  { email: "maria.garcia@example.com", fullName: "Maria Garcia", role: "creator" },
  { email: "robert.taylor@example.com", fullName: "Robert Taylor", role: "admin" },
  { email: "lisa.anderson@example.com", fullName: "Lisa Anderson", role: "admin" }
]

async function createUser(userData) {
  try {
    // Create user via API to ensure Firebase Auth compatibility
    await axios.post(`${BASE_URL}/auth/signup-new`, {
      email: userData.email,
      password: "TestPassword123!",
      fullName: userData.fullName
    })
    console.log(`✅ Created user: ${userData.email}`)
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log(`ℹ️  User already exists: ${userData.email}`)
    } else {
      console.error(`❌ Failed to create user ${userData.email}:`, error.response?.data || error.message)
    }
  }

  // Update role in database
  const user = await prisma.user.update({
    where: { email: userData.email },
    data: { role: userData.role }
  })
  return user
}

async function createCourse(courseData, creatorId) {
  const course = await prisma.course.create({
    data: {
      title: courseData.title,
      description: courseData.description,
      createdBy: creatorId,
      isActive: true
    }
  })
  console.log(`✅ Created course: ${course.title}`)
  return course
}

async function createTopic(topicData, courseId) {
  const topic = await prisma.topic.create({
    data: {
      title: topicData.title,
      content: topicData.content,
      position: topicData.position,
      courseId: courseId
    }
  })
  console.log(`✅ Created topic: ${topic.title}`)
  return topic
}

async function createProgress(userId, topicId, status = "in_progress") {
  return await prisma.progress.create({
    data: {
      userId: userId,
      topicId: topicId,
      status: status
    }
  })
}

async function createAttempt(userId, topicId, result = "pass") {
  return await prisma.attempt.create({
    data: {
      userId: userId,
      topicId: topicId,
      code: `function solution() {
  // Sample solution code
  return "Hello World";
}`,
      result: result,
      timeTaken: Math.floor(Math.random() * 300) + 60
    }
  })
}

async function createPayment(userId, status = "successful") {
  return await prisma.payment.create({
    data: {
      userId: userId,
      reference: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.floor(Math.random() * 5000) + 1000,
      currency: "NGN",
      status: status,
      description: "Course subscription payment"
    }
  })
}

async function main() {
  console.log('🌱 Starting comprehensive test data seeding...')

  // Create users
  console.log('\n👥 Creating users...')
  const users = []
  for (const userData of USERS) {
    const user = await createUser(userData)
    users.push(user)
  }

  // Get creators and admins
  const creators = users.filter(u => u.role === 'creator')
  const students = users.filter(u => u.role === 'student')
  const admins = users.filter(u => u.role === 'admin')

  // Create courses and topics
  console.log('\n📚 Creating courses and topics...')
  const courses = []
  for (let i = 0; i < COURSES.length; i++) {
    const creator = creators[i % creators.length]
    const course = await createCourse(COURSES[i], creator.id)
    courses.push(course)

    // Create topics for this course
    for (const topicData of COURSES[i].topics) {
      const topic = await createTopic(topicData, course.id)
      
      // Create progress for some students
      for (let j = 0; j < students.length; j++) {
        const student = students[j]
        const status = Math.random() > 0.5 ? "complete" : "in_progress"
        await createProgress(student.id, topic.id, status)
        
        // Create attempts for completed topics
        if (status === "complete") {
          const result = Math.random() > 0.2 ? "pass" : "fail"
          await createAttempt(student.id, topic.id, result)
        }
      }
    }
  }

  // Create additional data
  console.log('\n📊 Creating additional data...')
  for (const student of students) {
    // Create payments
    const numPayments = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < numPayments; i++) {
      const status = Math.random() > 0.1 ? "successful" : "pending"
      await createPayment(student.id, status)
    }

    // Create notifications
    const numNotifications = Math.floor(Math.random() * 5) + 1
    for (let i = 0; i < numNotifications; i++) {
      await prisma.notification.create({
        data: {
          userId: student.id,
          message: `Welcome to DSATutor! This is notification #${i + 1} for ${student.fullName}.`,
          status: Math.random() > 0.3 ? "unread" : "read"
        }
      })
    }
  }

  console.log('\n✅ Comprehensive test data seeding completed!')
  
  const progressCount = await prisma.progress.count()
  const attemptsCount = await prisma.attempt.count()
  const paymentsCount = await prisma.payment.count()
  const notificationsCount = await prisma.notification.count()
  
  console.log(`📊 Created ${users.length} users`)
  console.log(`📚 Created ${courses.length} courses`)
  console.log(`📖 Created ${courses.reduce((acc, course) => acc + COURSES.find(c => c.title === course.title).topics.length, 0)} topics`)
  console.log(`📊 Created ${progressCount} progress records`)
  console.log(`🎯 Created ${attemptsCount} attempts`)
  console.log(`💳 Created ${paymentsCount} payments`)
  console.log(`🔔 Created ${notificationsCount} notifications`)
  
  console.log('\n🎉 Your DSATutor platform is now populated with realistic test data!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 