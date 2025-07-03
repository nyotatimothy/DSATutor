import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()
const BASE_URL = process.env.SEED_API_BASE_URL || 'http://localhost:3000/api'

async function createSuperAdmin() {
  const email = 'superadmin@example.com'
  const password = 'TestPassword123!'
  const name = 'Super Admin'

  // Try to create via API
  try {
    await axios.post(`${BASE_URL}/auth/signup-new`, {
      email,
      password,
      name
    })
    console.log('✅ Super admin created via API')
  } catch (e: any) {
    if (e.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️  Super admin already exists in Firebase')
    } else {
      console.error('❌ Failed to create super admin via API:', e.response?.data || e.message)
    }
  }

  // Update role in DB
  const superAdmin = await prisma.user.update({
    where: { email },
    data: { role: 'super_admin' }
  })
  console.log('✅ Super admin role set in DB')
  return superAdmin
}

async function main() {
  // Create test users with different roles
  const student = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      name: "Test Student",
      role: "user",
      notifications: {
        create: {
          message: "Welcome to DSATutor! Your account has been created successfully.",
          status: "unread"
        }
      }
    }
  })

  const creator = await prisma.user.upsert({
    where: { email: "creator@example.com" },
    update: {},
    create: {
      email: "creator@example.com",
      name: "Test Creator",
      role: "admin"
    }
  })

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Test Admin",
      role: "admin"
    }
  })

  // Create super admin via API and update role
  const superAdmin = await createSuperAdmin()

  // Create a sample course
  const course = await prisma.course.upsert({
    where: { id: "sample-course-1" },
    update: {},
    create: {
      id: "sample-course-1",
      title: "Introduction to Data Structures",
      description: "Learn the fundamentals of data structures and algorithms",
      createdBy: creator.id
    }
  })

  // Create sample topics
  const topic1 = await prisma.topic.upsert({
    where: { id: "sample-topic-1" },
    update: {},
    create: {
      id: "sample-topic-1",
      title: "Arrays and Lists",
      description: "Learn about arrays and linked lists",
      order: 1,
      courseId: course.id
    }
  })

  const topic2 = await prisma.topic.upsert({
    where: { id: "sample-topic-2" },
    update: {},
    create: {
      id: "sample-topic-2",
      title: "Stacks and Queues",
      description: "Learn about stacks and queues",
      order: 2,
      courseId: course.id
    }
  })

  // Create sample progress for student
  await prisma.progress.upsert({
    where: { 
      userId_topicId: {
        userId: student.id,
        topicId: topic1.id
      }
    },
    update: {},
    create: {
      userId: student.id,
      topicId: topic1.id,
      status: "complete"
    }
  })

  // Create sample attempt
  await prisma.attempt.upsert({
    where: { id: "sample-attempt-1" },
    update: {},
    create: {
      id: "sample-attempt-1",
      userId: student.id,
      topicId: topic1.id,
      code: "function reverseArray(arr) { return arr.reverse(); }",
      result: "pass",
      timeTaken: 120
    }
  })

  // Create sample payment
  await prisma.payment.upsert({
    where: { reference: "TEST-REF-001" },
    update: {},
    create: {
      userId: student.id,
      reference: "TEST-REF-001",
      amount: 1500,
      currency: "USD",
      status: "success"
    }
  })

  console.log('Database seeded successfully!')
  console.log('Created users:', { student: student.email, creator: creator.email, admin: admin.email, superAdmin: superAdmin.email })
  console.log('Created course:', course.title)
  console.log('Created topics:', topic1.title, topic2.title)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 