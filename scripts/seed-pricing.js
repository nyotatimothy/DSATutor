const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const DEFAULT_PLANS = [
  {
    name: "Free",
    description: "Get started with basic DSA concepts",
    price: 0,
    currency: "NGN",
    duration: 30,
    features: ["basic_courses", "limited_practice"],
    maxCourses: 2,
    maxAssessments: 5
  },
  {
    name: "Basic",
    description: "Perfect for beginners starting their DSA journey",
    price: 5000, // 50 NGN
    currency: "NGN",
    duration: 30,
    features: ["basic_courses", "intermediate_courses", "limited_assessments", "progress_tracking"],
    maxCourses: 10,
    maxAssessments: 20
  },
  {
    name: "Pro",
    description: "For serious learners and interview preparation",
    price: 15000, // 150 NGN
    currency: "NGN",
    duration: 30,
    features: ["all_courses", "unlimited_assessments", "ai_analysis", "priority_support", "advanced_topics"],
    maxCourses: null, // unlimited
    maxAssessments: null
  },
  {
    name: "Enterprise",
    description: "For teams, organizations, and comprehensive learning",
    price: 50000, // 500 NGN
    currency: "NGN",
    duration: 30,
    features: ["all_courses", "unlimited_assessments", "ai_analysis", "team_management", "priority_support", "custom_content", "white_label"],
    maxCourses: null,
    maxAssessments: null
  }
]

async function createSubscriptionPlans() {
  console.log('📋 Creating subscription plans...')
  
  for (const planData of DEFAULT_PLANS) {
    try {
      const plan = await prisma.subscriptionPlan.create({
        data: {
          name: planData.name,
          description: planData.description,
          price: planData.price,
          currency: planData.currency,
          duration: planData.duration,
          features: JSON.stringify(planData.features),
          maxCourses: planData.maxCourses,
          maxAssessments: planData.maxAssessments,
          isActive: true
        }
      })
      console.log(`✅ Created plan: ${plan.name} (${plan.price} ${plan.currency})`)
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`ℹ️  Plan ${planData.name} already exists`)
      } else {
        console.error(`❌ Failed to create plan ${planData.name}:`, error.message)
      }
    }
  }
}

async function updateCoursePricing() {
  console.log('\n📚 Updating course pricing...')
  
  try {
    // Get all courses
    const courses = await prisma.course.findMany()
    
    for (const course of courses) {
      // Set pricing based on course content
      let price = null
      let isPremium = false
      
      if (course.title.includes('Advanced') || course.title.includes('Problem Solving')) {
        price = 10000 // 100 NGN for advanced courses
        isPremium = true
      } else if (course.title.includes('Algorithms')) {
        price = 7500 // 75 NGN for algorithm courses
        isPremium = true
      } else {
        // Basic courses remain free
        price = null
        isPremium = false
      }
      
      await prisma.course.update({
        where: { id: course.id },
        data: { price, isPremium }
      })
      
      console.log(`✅ Updated ${course.title}: ${price ? `${price} NGN` : 'Free'} ${isPremium ? '(Premium)' : ''}`)
    }
  } catch (error) {
    console.error('❌ Failed to update course pricing:', error.message)
  }
}

async function createSampleSubscriptions() {
  console.log('\n👥 Creating sample subscriptions...')
  
  try {
    // Get some students and a plan
    const students = await prisma.user.findMany({
      where: { role: 'student' },
      take: 3
    })
    
    const proPlan = await prisma.subscriptionPlan.findFirst({
      where: { name: 'Pro' }
    })
    
    if (students.length > 0 && proPlan) {
      for (let i = 0; i < Math.min(students.length, 2); i++) {
        const student = students[i]
        
        // Check if student already has subscription
        const existingSubscription = await prisma.userSubscription.findFirst({
          where: { userId: student.id }
        })
        
        if (!existingSubscription) {
          const startDate = new Date()
          const endDate = new Date(startDate.getTime() + proPlan.duration * 24 * 60 * 60 * 1000)
          
          await prisma.userSubscription.create({
            data: {
              userId: student.id,
              planId: proPlan.id,
              startDate,
              endDate,
              nextBillingDate: endDate,
              autoRenew: true
            }
          })
          
          console.log(`✅ Created Pro subscription for ${student.fullName}`)
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to create sample subscriptions:', error.message)
  }
}

async function createSampleCourseAccess() {
  console.log('\n🔓 Creating sample course access...')
  
  try {
    // Get premium courses and some students
    const premiumCourses = await prisma.course.findMany({
      where: { isPremium: true },
      take: 2
    })
    
    const students = await prisma.user.findMany({
      where: { role: 'student' },
      take: 3
    })
    
    for (const course of premiumCourses) {
      for (let i = 0; i < Math.min(students.length, 2); i++) {
        const student = students[i]
        
        // Check if access already exists
        const existingAccess = await prisma.courseAccess.findUnique({
          where: {
            userId_courseId: {
              userId: student.id,
              courseId: course.id
            }
          }
        })
        
        if (!existingAccess) {
          await prisma.courseAccess.create({
            data: {
              userId: student.id,
              courseId: course.id,
              accessType: 'subscription',
              expiresAt: null // Permanent access
            }
          })
          
          console.log(`✅ Granted access to ${course.title} for ${student.fullName}`)
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to create sample course access:', error.message)
  }
}

async function main() {
  console.log('🌱 Starting Pricing System Seeding...')
  
  await createSubscriptionPlans()
  await updateCoursePricing()
  await createSampleSubscriptions()
  await createSampleCourseAccess()
  
  console.log('\n✅ Pricing system seeding completed!')
  
  // Summary
  const planCount = await prisma.subscriptionPlan.count()
  const subscriptionCount = await prisma.userSubscription.count()
  const courseAccessCount = await prisma.courseAccess.count()
  const premiumCourses = await prisma.course.count({ where: { isPremium: true } })
  const freeCourses = await prisma.course.count({ where: { isPremium: false } })
  
  console.log('\n📊 Pricing System Summary:')
  console.log(`📋 Subscription Plans: ${planCount}`)
  console.log(`👥 Active Subscriptions: ${subscriptionCount}`)
  console.log(`🔓 Course Access Records: ${courseAccessCount}`)
  console.log(`💎 Premium Courses: ${premiumCourses}`)
  console.log(`🆓 Free Courses: ${freeCourses}`)
  
  console.log('\n🎉 Your DSATutor platform now has a complete pricing system!')
}

main()
  .catch((e) => {
    console.error('❌ Pricing seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 