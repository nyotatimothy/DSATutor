const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const SAMPLE_PROBLEMS = [
  {
    title: "Two Sum",
    prompt: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "easy",
    testCases: [
      {
        input: "[2, 7, 11, 15], 9",
        expected: "[0, 1]",
        hidden: false
      },
      {
        input: "[3, 2, 4], 6",
        expected: "[1, 2]",
        hidden: false
      },
      {
        input: "[3, 3], 6",
        expected: "[0, 1]",
        hidden: true
      }
    ]
  },
  {
    title: "Valid Parentheses",
    prompt: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: 1) Open brackets must be closed by the same type of brackets. 2) Open brackets must be closed in the correct order.",
    difficulty: "easy",
    testCases: [
      {
        input: "'()'",
        expected: "true",
        hidden: false
      },
      {
        input: "'()[]{}'",
        expected: "true",
        hidden: false
      },
      {
        input: "'(]'",
        expected: "false",
        hidden: false
      },
      {
        input: "'([)]'",
        expected: "false",
        hidden: true
      }
    ]
  },
  {
    title: "Reverse String",
    prompt: "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
    difficulty: "easy",
    testCases: [
      {
        input: "['h', 'e', 'l', 'l', 'o']",
        expected: "['o', 'l', 'l', 'e', 'h']",
        hidden: false
      },
      {
        input: "['H', 'a', 'n', 'n', 'a', 'h']",
        expected: "['h', 'a', 'n', 'n', 'a', 'H']",
        hidden: false
      }
    ]
  },
  {
    title: "Maximum Subarray",
    prompt: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    difficulty: "medium",
    testCases: [
      {
        input: "[-2, 1, -3, 4, -1, 2, 1, -5, 4]",
        expected: "6",
        hidden: false
      },
      {
        input: "[1]",
        expected: "1",
        hidden: false
      },
      {
        input: "[5, 4, -1, 7, 8]",
        expected: "23",
        hidden: true
      }
    ]
  },
  {
    title: "Merge Two Sorted Lists",
    prompt: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
    difficulty: "easy",
    testCases: [
      {
        input: "[1, 2, 4], [1, 3, 4]",
        expected: "[1, 1, 2, 3, 4, 4]",
        hidden: false
      },
      {
        input: "[], []",
        expected: "[]",
        hidden: false
      },
      {
        input: "[], [0]",
        expected: "[0]",
        hidden: true
      }
    ]
  }
]

async function seedProblems() {
  console.log('🌱 Seeding sample problems...')

  try {
    // Get the first topic to associate problems with
    const topic = await prisma.topic.findFirst()
    
    if (!topic) {
      console.log('❌ No topics found. Please seed topics first.')
      return
    }

    for (const problemData of SAMPLE_PROBLEMS) {
      const problem = await prisma.problem.create({
        data: {
          title: problemData.title,
          prompt: problemData.prompt,
          difficulty: problemData.difficulty,
          topicId: topic.id,
          testCases: {
            create: problemData.testCases
          }
        },
        include: {
          testCases: true
        }
      })

      console.log(`✅ Created problem: ${problem.title} (${problem.difficulty})`)
      console.log(`   Test cases: ${problem.testCases.length}`)
    }

    console.log('\n🎉 Problems seeded successfully!')
    
    // Summary
    const problemCount = await prisma.problem.count()
    const testCaseCount = await prisma.testCase.count()
    
    console.log('\n📊 Summary:')
    console.log(`📋 Problems: ${problemCount}`)
    console.log(`🧪 Test Cases: ${testCaseCount}`)
    
  } catch (error) {
    console.error('❌ Error seeding problems:', error)
  }
}

seedProblems()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 