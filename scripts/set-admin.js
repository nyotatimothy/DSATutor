require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setAdmin() {
  try {
    // Get the most recent user and set them as admin
    const user = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!user) {
      console.log('❌ No users found in database')
      return
    }

    console.log(`👤 Found user: ${user.email}`)
    console.log(`📧 Email: ${user.email}`)
    console.log(`👤 Name: ${user.fullName}`)
    console.log(`🔑 Current role: ${user.role}`)

    // Update user to admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    })

    console.log('✅ User updated to admin successfully')
    console.log(`🔑 New role: ${updatedUser.role}`)
    
  } catch (error) {
    console.error('❌ Error setting admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setAdmin() 