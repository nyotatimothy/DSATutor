import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      firebaseUid: 'dummy-uid-123',
      email: 'student@example.com',
      fullName: 'Test Student',
      transactions: {
        create: {
          pesapalTrackingId: 'TEST-TRACK-001',
          amount: 1500,
          currency: 'KES',
          status: 'pending',
        },
      },
      notifications: {
        create: {
          message: 'Welcome to DSATutor!',
          status: 'unread',
        },
      },
    },
  })

  console.log('Seeded user:', user.email)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect()) 