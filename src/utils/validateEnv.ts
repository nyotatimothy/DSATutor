export function validateEnv() {
  const requiredEnvVars = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_APP_ID',
    'FIREBASE_MESSAGING_SENDER_ID',
    'RESEND_API_KEY',
    'PESAPAL_CONSUMER_KEY',
    'PESAPAL_CONSUMER_SECRET',
    'PESAPAL_BASE_URL',
    'PESAPAL_CALLBACK_URL',
    'DATABASE_URL',
    'OPENAI_API_KEY'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }
} 
} 