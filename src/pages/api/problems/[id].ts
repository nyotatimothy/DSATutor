import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Problem ID is required' })
    }

    // Mock data for demo purposes
    const mockProblems: { [key: string]: any } = {
      '1': {
        id: 1,
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "Easy",
        category: "Arrays",
        examples: [
          {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
          }
        ],
        constraints: [
          "2 <= nums.length <= 10^4",
          "-10^9 <= nums[i] <= 10^9",
          "-10^9 <= target <= 10^9",
          "Only one valid answer exists."
        ],
        starterCode: {
          javascript: `function twoSum(nums, target) {
    // Your code here
    return [];
}`,
          python: `def twoSum(nums, target):
    # Your code here
    pass`,
          java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[0];
    }
}`,
          cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};`,
          csharp: `public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        // Your code here
        return new int[0];
    }
}`
        }
      },
      '2': {
        id: 2,
        title: "Valid Parentheses",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        difficulty: "Easy",
        category: "Stack",
        examples: [
          {
            input: 's = "()"',
            output: "true",
            explanation: "The string contains valid parentheses."
          }
        ],
        constraints: [
          "1 <= s.length <= 10^4",
          "s consists of parentheses only '()[]{}'"
        ],
        starterCode: {
          javascript: `function isValid(s) {
    // Your code here
    return false;
}`,
          python: `def isValid(s):
    # Your code here
    pass`,
          java: `class Solution {
    public boolean isValid(String s) {
        // Your code here
        return false;
    }
}`,
          cpp: `class Solution {
public:
    bool isValid(string s) {
        // Your code here
        return false;
    }
};`,
          csharp: `public class Solution {
    public bool IsValid(string s) {
        // Your code here
        return false;
    }
}`
        }
      },
      '3': {
        id: 3,
        title: "Reverse a Linked List",
        description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        difficulty: "Medium",
        category: "Linked Lists",
        examples: [
          {
            input: "head = [1,2,3,4,5]",
            output: "[5,4,3,2,1]",
            explanation: "The linked list is reversed by changing the direction of all pointers."
          }
        ],
        constraints: [
          "The number of nodes in the list is in the range [0, 5000]",
          "-5000 <= Node.val <= 5000"
        ],
        starterCode: {
          javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {
    // Your code here
};`,
          python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # Your code here
        pass`,
          java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode reverseList(ListNode head) {
        // Your code here
    }
}`,
          cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Your code here
    }
};`,
          csharp: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     public int val;
 *     public ListNode next;
 *     public ListNode(int val=0, ListNode next=null) {
 *         this.val = val;
 *         this.next = next;
 *     }
 * }
 */
public class Solution {
    public ListNode ReverseList(ListNode head) {
        // Your code here
    }
}`
        }
      },
      '4': {
        id: 4,
        title: "Maximum Subarray",
        description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
        difficulty: "Medium",
        category: "Arrays",
        examples: [
          {
            input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
            output: "6",
            explanation: "The subarray [4,-1,2,1] has the largest sum 6."
          }
        ],
        constraints: [
          "1 <= nums.length <= 10^5",
          "-10^4 <= nums[i] <= 10^4"
        ],
        starterCode: {
          javascript: `function maxSubArray(nums) {
    // Your code here
    return 0;
}`,
          python: `def maxSubArray(nums):
    # Your code here
    pass`,
          java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Your code here
        return 0;
    }
}`,
          cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Your code here
        return 0;
    }
};`,
          csharp: `public class Solution {
    public int MaxSubArray(int[] nums) {
        // Your code here
        return 0;
    }
}`
        }
      },
      '5': {
        id: 5,
        title: "Longest Substring Without Repeating Characters",
        description: "Given a string s, find the length of the longest substring without repeating characters.",
        difficulty: "Medium",
        category: "Strings",
        examples: [
          {
            input: 's = "abcabcbb"',
            output: "3",
            explanation: "The answer is 'abc', with the length of 3."
          }
        ],
        constraints: [
          "0 <= s.length <= 5 * 10^4",
          "s consists of English letters, digits, symbols and spaces."
        ],
        starterCode: {
          javascript: `function lengthOfLongestSubstring(s) {
    // Your code here
    return 0;
}`,
          python: `def lengthOfLongestSubstring(s):
    # Your code here
    pass`,
          java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Your code here
        return 0;
    }
}`,
          cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Your code here
        return 0;
    }
};`,
          csharp: `public class Solution {
    public int LengthOfLongestSubstring(string s) {
        // Your code here
        return 0;
    }
}`
        }
      },
      '6': {
        id: 6,
        title: "Merge Two Sorted Lists",
        description: "Merge two sorted linked lists and return it as a sorted list.",
        difficulty: "Easy",
        category: "Linked Lists",
        examples: [
          {
            input: "l1 = [1,2,4], l2 = [1,3,4]",
            output: "[1,1,2,3,4,4]",
            explanation: "Merge the two sorted lists into one sorted list."
          }
        ],
        constraints: [
          "The number of nodes in both lists is in the range [0, 50]",
          "-100 <= Node.val <= 100",
          "Both l1 and l2 are sorted in non-decreasing order."
        ],
        starterCode: {
          javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function(list1, list2) {
    // Your code here
};`,
          python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        # Your code here
        pass`,
          java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Your code here
    }
}`,
          cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        // Your code here
    }
};`,
          csharp: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     public int val;
 *     public ListNode next;
 *     public ListNode(int val=0, ListNode next=null) {
 *         this.val = val;
 *         this.next = next;
 *     }
 * }
 */
public class Solution {
    public ListNode MergeTwoLists(ListNode list1, ListNode list2) {
        // Your code here
    }
}`
        }
      },
      '7': {
        id: 7,
        title: "Container With Most Water",
        description: "Given n non-negative integers height where each represents a point at coordinate (i, height[i]), find two lines that together with the x-axis forms a container that would hold the greatest amount of water.",
        difficulty: "Medium",
        category: "Arrays",
        examples: [
          {
            input: "height = [1,8,6,2,5,4,8,3,7]",
            output: "49",
            explanation: "The maximum area is obtained by choosing height[1] = 8 and height[8] = 7."
          }
        ],
        constraints: [
          "n == height.length",
          "2 <= n <= 10^5",
          "0 <= height[i] <= 10^4"
        ],
        starterCode: {
          javascript: `function maxArea(height) {
    // Your code here
    return 0;
}`,
          python: `def maxArea(height):
    # Your code here
    pass`,
          java: `class Solution {
    public int maxArea(int[] height) {
        // Your code here
        return 0;
    }
}`,
          cpp: `class Solution {
public:
    int maxArea(vector<int>& height) {
        // Your code here
        return 0;
    }
};`,
          csharp: `public class Solution {
    public int MaxArea(int[] height) {
        // Your code here
        return 0;
    }
}`
        }
      },
      '8': {
        id: 8,
        title: "Implement Stack using Queues",
        description: "Implement a last-in-first-out (LIFO) stack using only two queues. The implemented stack should support all the functions of a normal stack (push, top, pop, and empty).",
        difficulty: "Medium",
        category: "Stacks & Queues",
        examples: [
          {
            input: '["MyStack", "push", "push", "top", "pop", "empty"]\n[[], [1], [2], [], [], []]',
            output: "[null, null, null, 2, 2, false]",
            explanation: "Implement stack operations using queues."
          }
        ],
        constraints: [
          "1 <= x <= 9",
          "At most 100 calls will be made to push, pop, top, and empty.",
          "All the calls to pop and top are valid."
        ],
        starterCode: {
          javascript: `var MyStack = function() {
    // Your code here
};

/** 
 * @param {number} x
 * @return {void}
 */
MyStack.prototype.push = function(x) {
    // Your code here
};

/**
 * @return {number}
 */
MyStack.prototype.pop = function() {
    // Your code here
};

/**
 * @return {number}
 */
MyStack.prototype.top = function() {
    // Your code here
};

/**
 * @return {boolean}
 */
MyStack.prototype.empty = function() {
    // Your code here
};`,
          python: `class MyStack:
    def __init__(self):
        # Your code here
        pass
    
    def push(self, x: int) -> None:
        # Your code here
        pass
    
    def pop(self) -> int:
        # Your code here
        pass
    
    def top(self) -> int:
        # Your code here
        pass
    
    def empty(self) -> bool:
        # Your code here
        pass`,
          java: `class MyStack {
    // Your code here
    
    public MyStack() {
        // Your code here
    }
    
    public void push(int x) {
        // Your code here
    }
    
    public int pop() {
        // Your code here
        return 0;
    }
    
    public int top() {
        // Your code here
        return 0;
    }
    
    public boolean empty() {
        // Your code here
        return false;
    }
}`,
          cpp: `class MyStack {
public:
    MyStack() {
        // Your code here
    }
    
    void push(int x) {
        // Your code here
    }
    
    int pop() {
        // Your code here
        return 0;
    }
    
    int top() {
        // Your code here
        return 0;
    }
    
    bool empty() {
        // Your code here
        return false;
    }
};`,
          csharp: `public class MyStack {
    // Your code here
    
    public MyStack() {
        // Your code here
    }
    
    public void Push(int x) {
        // Your code here
    }
    
    public int Pop() {
        // Your code here
        return 0;
    }
    
    public int Top() {
        // Your code here
        return 0;
    }
    
    public bool Empty() {
        // Your code here
        return false;
    }
}`
        }
      },
      '9': {
        id: 9,
        title: "Binary Tree Inorder Traversal",
        description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
        difficulty: "Easy",
        category: "Trees",
        examples: [
          {
            input: "root = [1,null,2,3]",
            output: "[1,3,2]",
            explanation: "Inorder traversal: left -> root -> right"
          }
        ],
        constraints: [
          "The number of nodes in the tree is in the range [0, 100]",
          "-100 <= Node.val <= 100"
        ],
        starterCode: {
          javascript: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var inorderTraversal = function(root) {
    // Your code here
    return [];
};`,
          python: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        # Your code here
        pass`,
          java: `/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        // Your code here
        return new ArrayList<>();
    }
}`,
          cpp: `/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {
        // Your code here
        return {};
    }
};`,
          csharp: `/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     public int val;
 *     public TreeNode left;
 *     public TreeNode right;
 *     public TreeNode(int val=0, TreeNode left=null, TreeNode right=null) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
public class Solution {
    public IList<int> InorderTraversal(TreeNode root) {
        // Your code here
        return new List<int>();
    }
}`
        }
      },
      '10': {
        id: 10,
        title: "Maximum Depth of Binary Tree",
        description: "Given the root of a binary tree, return its maximum depth.",
        difficulty: "Easy",
        category: "Trees",
        examples: [
          {
            input: "root = [3,9,20,null,null,15,7]",
            output: "3",
            explanation: "The maximum depth is 3."
          }
        ],
        constraints: [
          "The number of nodes in the tree is in the range [0, 10^4]",
          "-100 <= Node.val <= 100"
        ],
        starterCode: {
          javascript: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number}
 */
var maxDepth = function(root) {
    // Your code here
    return 0;
};`,
          python: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        # Your code here
        pass`,
          java: `/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    public int maxDepth(TreeNode root) {
        // Your code here
        return 0;
    }
}`,
          cpp: `/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    int maxDepth(TreeNode* root) {
        // Your code here
        return 0;
    }
};`,
          csharp: `/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     public int val;
 *     public TreeNode left;
 *     public TreeNode right;
 *     public TreeNode(int val=0, TreeNode left=null, TreeNode right=null) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
public class Solution {
    public int MaxDepth(TreeNode root) {
        // Your code here
        return 0;
    }
}`
        }
      },
      '11': {
        id: 11,
        title: "Number of Islands",
        description: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
        difficulty: "Medium",
        category: "Graphs",
        examples: [
          {
            input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
            output: "1",
            explanation: "There is one island in the grid."
          }
        ],
        constraints: [
          "m == grid.length",
          "n == grid[i].length",
          "1 <= m, n <= 300",
          "grid[i][j] is '0' or '1'."
        ],
        starterCode: {
          javascript: `function numIslands(grid) {
    // Your code here
    return 0;
}`,
          python: `def numIslands(grid):
    # Your code here
    pass`,
          java: `class Solution {
    public int numIslands(char[][] grid) {
        // Your code here
        return 0;
    }
}`,
          cpp: `class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        // Your code here
        return 0;
    }
};`,
          csharp: `public class Solution {
    public int NumIslands(char[][] grid) {
        // Your code here
        return 0;
    }
}`
        }
      },
      '12': {
        id: 12,
        title: "Climbing Stairs",
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        difficulty: "Easy",
        category: "Dynamic Programming",
        examples: [
          {
            input: "n = 3",
            output: "3",
            explanation: "There are three ways to climb to the top: 1 + 1 + 1, 1 + 2, 2 + 1"
          }
        ],
        constraints: [
          "1 <= n <= 45"
        ],
        starterCode: {
          javascript: `function climbStairs(n) {
    // Your code here
    return 0;
}`,
          python: `def climbStairs(n):
    # Your code here
    pass`,
          java: `class Solution {
    public int climbStairs(int n) {
        // Your code here
        return 0;
    }
}`,
          cpp: `class Solution {
public:
    int climbStairs(int n) {
        // Your code here
        return 0;
    }
};`,
          csharp: `public class Solution {
    public int ClimbStairs(int n) {
        // Your code here
        return 0;
    }
}`
        }
      },
      '13': {
        id: 13,
        title: "House Robber",
        description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.",
        difficulty: "Medium",
        category: "Dynamic Programming",
        examples: [
          {
            input: "nums = [1,2,3,1]",
            output: "4",
            explanation: "Rob house 1 (money = 1) and then rob house 3 (money = 3). Total amount you can rob = 1 + 3 = 4."
          }
        ],
        constraints: [
          "1 <= nums.length <= 100",
          "0 <= nums[i] <= 400"
        ],
        starterCode: {
          javascript: `function rob(nums) {
    // Your code here
    return 0;
}`,
          python: `def rob(nums):
    # Your code here
    pass`,
          java: `class Solution {
    public int rob(int[] nums) {
        // Your code here
        return 0;
    }
}`,
          cpp: `class Solution {
public:
    int rob(vector<int>& nums) {
        // Your code here
        return 0;
    }
};`,
          csharp: `public class Solution {
    public int Rob(int[] nums) {
        // Your code here
        return 0;
    }
}`
        }
      },
      '14': {
        id: 14,
        title: "Binary Search",
        description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.",
        difficulty: "Easy",
        category: "Sorting & Searching",
        examples: [
          {
            input: "nums = [-1,0,3,5,9,12], target = 9",
            output: "4",
            explanation: "9 exists in nums and its index is 4"
          }
        ],
        constraints: [
          "1 <= nums.length <= 10^4",
          "-10^4 < nums[i], target < 10^4",
          "All the integers in nums are unique.",
          "nums is sorted in ascending order."
        ],
        starterCode: {
          javascript: `function search(nums, target) {
    // Your code here
    return -1;
}`,
          python: `def search(nums, target):
    # Your code here
    pass`,
          java: `class Solution {
    public int search(int[] nums, int target) {
        // Your code here
        return -1;
    }
}`,
          cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        // Your code here
        return -1;
    }
};`,
          csharp: `public class Solution {
    public int Search(int[] nums, int target) {
        // Your code here
        return -1;
    }
}`
        }
      },
      '15': {
        id: 15,
        title: "Single Number",
        description: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.",
        difficulty: "Easy",
        category: "Bit Manipulation",
        examples: [
          {
            input: "nums = [2,2,1]",
            output: "1",
            explanation: "1 appears only once in the array."
          }
        ],
        constraints: [
          "1 <= nums.length <= 3 * 10^4",
          "-3 * 10^4 <= nums[i] <= 3 * 10^4",
          "Each element in the array appears twice except for one element which appears only once."
        ],
        starterCode: {
          javascript: `function singleNumber(nums) {
    // Your code here
    return 0;
}`,
          python: `def singleNumber(nums):
    # Your code here
    pass`,
          java: `class Solution {
    public int singleNumber(int[] nums) {
        // Your code here
        return 0;
    }
}`,
          cpp: `class Solution {
public:
    int singleNumber(vector<int>& nums) {
        // Your code here
        return 0;
    }
};`,
          csharp: `public class Solution {
    public int SingleNumber(int[] nums) {
        // Your code here
        return 0;
    }
}`
        }
      }
    };

    const problem = mockProblems[id];
    if (problem) {
      return res.status(200).json(problem);
    }

    return res.status(404).json({ message: 'Problem not found' });
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 