// Script to create user nyota@dsatutor.com with assessment data
// This would typically be run in your database setup

const userData = {
  email: "nyota@dsatutor.com",
  password: "user", // Would be hashed in real implementation
  name: "Nyota",
  assessmentCompleted: true,
  createdAt: new Date(),
  profile: {
    experience: "advanced",
    goals: ["interview_prep", "skill_improvement"],
    timeCommitment: "1-2 hours daily",
    preferredLanguages: ["javascript", "python"]
  }
};

const assessmentData = {
  email: "nyota@dsatutor.com",
  completedAt: new Date(),
  level: "advanced",
  score: 92,
  correctAnswers: 7,
  totalQuestions: 8,
  timeSpent: 720, // 12 minutes
  strengths: [
    "Dynamic Programming",
    "Graph Algorithms", 
    "Tree Traversal",
    "Advanced Data Structures"
  ],
  weaknesses: [
    "System Design",
    "Bit Manipulation"
  ],
  categoryPerformance: {
    "Arrays & Hashing": 95,
    "Two Pointers": 90,
    "Stack": 85,
    "Binary Search": 100,
    "Sliding Window": 90,
    "Linked Lists": 95,
    "Trees": 100,
    "Tries": 85,
    "Heap / Priority Queue": 90,
    "Backtracking": 95,
    "Graphs": 100,
    "Dynamic Programming": 100,
    "Greedy": 85,
    "Intervals": 90,
    "Math & Geometry": 80
  },
  recommendedPath: "advanced_track",
  estimatedCompletionTime: "4-6 weeks"
};

console.log("User Data:", JSON.stringify(userData, null, 2));
console.log("Assessment Data:", JSON.stringify(assessmentData, null, 2));
