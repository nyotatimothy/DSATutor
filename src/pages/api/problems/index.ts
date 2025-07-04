import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { difficulty, category, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Mock problems data
    const allProblems = [
      {
        id: 1,
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "Easy",
        category: "Arrays",
        solved: true,
        score: 85,
        timeSpent: 15
      },
      {
        id: 2,
        title: "Valid Parentheses",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        difficulty: "Easy",
        category: "Strings",
        solved: true,
        score: 92,
        timeSpent: 20
      },
      {
        id: 3,
        title: "Reverse a Linked List",
        description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        difficulty: "Medium",
        category: "Linked Lists",
        solved: false,
        score: null,
        timeSpent: null
      },
      {
        id: 4,
        title: "Maximum Subarray",
        description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
        difficulty: "Medium",
        category: "Arrays",
        solved: false,
        score: null,
        timeSpent: null
      },
      {
        id: 5,
        title: "Longest Substring Without Repeating Characters",
        description: "Given a string s, find the length of the longest substring without repeating characters.",
        difficulty: "Medium",
        category: "Strings",
        solved: false,
        score: null,
        timeSpent: null
      },
      {
        id: 6,
        title: "Merge Two Sorted Lists",
        description: "Merge two sorted linked lists and return it as a sorted list.",
        difficulty: "Easy",
        category: "Linked Lists",
        solved: true,
        score: 78,
        timeSpent: 25
      },
      {
        id: 7,
        title: "Container With Most Water",
        description: "Given n non-negative integers height where each represents a point at coordinate (i, height[i]), find two lines that together with the x-axis forms a container that would hold the greatest amount of water.",
        difficulty: "Medium",
        category: "Arrays",
        solved: false,
        score: null,
        timeSpent: null
      },
      {
        id: 8,
        title: "Implement Stack using Queues",
        description: "Implement a last-in-first-out (LIFO) stack using only two queues. The implemented stack should support all the functions of a normal stack (push, top, pop, and empty).",
        difficulty: "Medium",
        category: "Stacks & Queues",
        solved: false,
        score: null,
        timeSpent: null
      },
      {
        id: 9,
        title: "Binary Tree Inorder Traversal",
        description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
        difficulty: "Easy",
        category: "Trees",
        solved: false,
        score: null,
        timeSpent: null
      },
      {
        id: 10,
        title: "Maximum Depth of Binary Tree",
        description: "Given the root of a binary tree, return its maximum depth.",
        difficulty: "Easy",
        category: "Trees",
        solved: false,
        score: null,
        timeSpent: null
      },
      {
        id: 11,
        title: "Number of Islands",
        description: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
        difficulty: "Medium",
        category: "Graphs",
        solved: false,
        score: null,
        timeSpent: null
      },
      {
        id: 12,
        title: "Climbing Stairs",
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        difficulty: "Easy",
        category: "Dynamic Programming",
        solved: false,
        score: null,
        timeSpent: null
      },
      {
        id: 13,
        title: "House Robber",
        description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.",
        difficulty: "Medium",
        category: "Dynamic Programming",
        solved: false,
        score: null,
        timeSpent: null
      },
      {
        id: 14,
        title: "Binary Search",
        description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.",
        difficulty: "Easy",
        category: "Sorting & Searching",
        solved: false,
        score: null,
        timeSpent: null
      },
      {
        id: 15,
        title: "Single Number",
        description: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.",
        difficulty: "Easy",
        category: "Bit Manipulation",
        solved: false,
        score: null,
        timeSpent: null
      }
    ];

    // Filter problems based on query parameters
    let filteredProblems = allProblems;

    if (difficulty) {
      filteredProblems = filteredProblems.filter(problem => 
        problem.difficulty.toLowerCase() === difficulty.toString().toLowerCase()
      );
    }

    if (category) {
      filteredProblems = filteredProblems.filter(problem => 
        problem.category.toLowerCase() === category.toString().toLowerCase()
      );
    }

    // Apply pagination
    const total = filteredProblems.length;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProblems = filteredProblems.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: paginatedProblems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
} 