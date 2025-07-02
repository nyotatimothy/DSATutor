require('dotenv').config();
const { initializeApp } = require('firebase/app')
const { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} = require('firebase/auth')

console.log('🧪 Testing Firebase Configuration Directly...\n')

// Check environment variables
console.log('📋 Environment Variables Check:')
console.log('FIREBASE_API_KEY:', process.env.FIREBASE_API_KEY ? '✅ Set' : '❌ Missing')
console.log('FIREBASE_AUTH_DOMAIN:', process.env.FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing')
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing')
console.log('FIREBASE_APP_ID:', process.env.FIREBASE_APP_ID ? '✅ Set' : '❌ Missing')
console.log('FIREBASE_MESSAGING_SENDER_ID:', process.env.FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing')
console.log('')

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "ai-dsa-tutor.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
}

console.log('🔧 Firebase Config:')
console.log(JSON.stringify(firebaseConfig, null, 2))
console.log('')

async function testFirebase() {
  try {
    // 1. Test Firebase initialization
    console.log('1. Testing Firebase Initialization...')
    const app = initializeApp(firebaseConfig)
    console.log('✅ Firebase app initialized successfully')
    
    // 2. Test Auth initialization
    console.log('\n2. Testing Auth Initialization...')
    const auth = getAuth(app)
    console.log('✅ Firebase Auth initialized successfully')
    
    // 3. Test user creation
    console.log('\n3. Testing User Creation...')
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'test123456'
    
    console.log(`Creating user with email: ${testEmail}`)
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword)
    console.log('✅ User created successfully!')
    console.log('User ID:', userCredential.user.uid)
    console.log('User Email:', userCredential.user.email)
    
    // 4. Test user sign in
    console.log('\n4. Testing User Sign In...')
    const signInCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword)
    console.log('✅ User signed in successfully!')
    console.log('Signed in user ID:', signInCredential.user.uid)
    
    // 5. Test password reset
    console.log('\n5. Testing Password Reset...')
    await sendPasswordResetEmail(auth, testEmail)
    console.log('✅ Password reset email sent successfully!')
    
    console.log('\n🎉 All Firebase tests passed! Your configuration is working correctly.')
    
  } catch (error) {
    console.error('\n❌ Firebase Test Failed:')
    console.error('Error Code:', error.code)
    console.error('Error Message:', error.message)
    console.error('Full Error:', error)
    
    // Provide specific guidance based on error
    if (error.code === 'auth/configuration-not-found') {
      console.log('\n💡 Troubleshooting for auth/configuration-not-found:')
      console.log('1. Check if your Firebase project exists in the Firebase Console')
      console.log('2. Verify that Authentication is enabled in your Firebase project')
      console.log('3. Make sure Email/Password sign-in method is enabled')
      console.log('4. Check if your API key has any restrictions')
      console.log('5. Verify the project ID matches exactly')
    } else if (error.code === 'auth/invalid-api-key') {
      console.log('\n💡 Troubleshooting for auth/invalid-api-key:')
      console.log('1. Check if your API key is correct')
      console.log('2. Verify the API key is not restricted to specific domains')
      console.log('3. Make sure you\'re using the correct API key for your project')
    } else if (error.code === 'auth/network-request-failed') {
      console.log('\n💡 Troubleshooting for auth/network-request-failed:')
      console.log('1. Check your internet connection')
      console.log('2. Verify you can access Firebase services')
      console.log('3. Check if there are any firewall restrictions')
    }
  }
}

testFirebase() 