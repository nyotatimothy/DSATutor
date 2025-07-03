import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create test users with different roles
  const student = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      fullName: "Test Student",
      role: "student",
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
      fullName: "Test Creator",
      role: "creator"
    }
  })

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      fullName: "Test Admin",
      role: "admin"
    }
  })

  // Add a super admin user
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {},
    create: {
      email: "superadmin@example.com",
      fullName: "Super Admin",
      role: "super_admin"
    }
  })

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
      position: 1,
      content: "# Arrays and Lists\n\nArrays are the most basic data structure...",
      courseId: course.id
    }
  })

  const topic2 = await prisma.topic.upsert({
    where: { id: "sample-topic-2" },
    update: {},
    create: {
      id: "sample-topic-2",
      title: "Stacks and Queues",
      position: 2,
      content: "# Stacks and Queues\n\nStacks follow LIFO (Last In, First Out)...",
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
      currency: "NGN",
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