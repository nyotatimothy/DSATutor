const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Conversion rate: 1 USD = ~1500 NGN (approximate)
const NGN_TO_USD_RATE = 1 / 1500

async function convertSubscriptionPlans() {
  console.log('🔄 Converting subscription plans from NGN to USD...')
  
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { currency: 'NGN' }
    })
    
    for (const plan of plans) {
      const usdPrice = Math.round(plan.price * NGN_TO_USD_RATE * 100) // Convert to cents
      
      await prisma.subscriptionPlan.update({
        where: { id: plan.id },
        data: {
          price: usdPrice,
          currency: 'USD'
        }
      })
      
      console.log(`✅ Converted ${plan.name}: ${plan.price} NGN → ${usdPrice} cents USD`)
    }
  } catch (error) {
    console.error('❌ Failed to convert subscription plans:', error.message)
  }
}

async function convertPayments() {
  console.log('\n🔄 Converting payments from NGN to USD...')
  
  try {
    const payments = await prisma.payment.findMany({
      where: { currency: 'NGN' }
    })
    
    for (const payment of payments) {
      const usdAmount = Math.round(payment.amount * NGN_TO_USD_RATE * 100) // Convert to cents
      
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          amount: usdAmount,
          currency: 'USD'
        }
      })
      
      console.log(`✅ Converted payment ${payment.reference}: ${payment.amount} NGN → ${usdAmount} cents USD`)
    }
  } catch (error) {
    console.error('❌ Failed to convert payments:', error.message)
  }
}

async function updateCoursePricing() {
  console.log('\n🔄 Updating course pricing to USD...')
  
  try {
    const courses = await prisma.course.findMany()
    
    for (const course of courses) {
      let price = null
      let isPremium = false
      
      if (course.title.includes('Advanced') || course.title.includes('Problem Solving')) {
        price = 1999 // $19.99 USD
        isPremium = true
      } else if (course.title.includes('Algorithms')) {
        price = 1499 // $14.99 USD
        isPremium = true
      } else {
        price = null
        isPremium = false
      }
      
      await prisma.course.update({
        where: { id: course.id },
        data: { price, isPremium }
      })
      
      console.log(`✅ Updated ${course.title}: ${price ? `$${(price/100).toFixed(2)} USD` : 'Free'} ${isPremium ? '(Premium)' : ''}`)
    }
  } catch (error) {
    console.error('❌ Failed to update course pricing:', error.message)
  }
}

async function main() {
  console.log('🌱 Starting Currency Conversion to USD...')
  
  await convertSubscriptionPlans()
  await convertPayments()
  await updateCoursePricing()
  
  console.log('\n✅ Currency conversion completed!')
  
  // Summary
  const planCount = await prisma.subscriptionPlan.count({ where: { currency: 'USD' } })
  const paymentCount = await prisma.payment.count({ where: { currency: 'USD' } })
  const premiumCourses = await prisma.course.count({ where: { isPremium: true } })
  
  console.log('\n📊 Currency Conversion Summary:')
  console.log(`📋 USD Subscription Plans: ${planCount}`)
  console.log(`💳 USD Payments: ${paymentCount}`)
  console.log(`💎 Premium Courses: ${premiumCourses}`)
  
  console.log('\n🎉 All currency has been converted to USD!')
}

main()
  .catch((e) => {
    console.error('❌ Currency conversion failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 