# DSATutor - AI-Powered DSA Learning Platform

A full-stack, AI-powered adaptive learning platform for Data Structures & Algorithms preparation.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nyotatimothy/DSATutor.git
   cd DSATutor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # Firebase
   FIREBASE_API_KEY=AIzaSyAFPGWDIbKGCRMx5dkgdLbjFXxP9Nwi0ds
   FIREBASE_AUTH_DOMAIN=ai-dsa-tutor.firebaseapp.com
   FIREBASE_PROJECT_ID=ai-dsa-tutor
   FIREBASE_APP_ID=1:974630831870:web:449fd7d69fb75232e487af
   FIREBASE_MESSAGING_SENDER_ID=974630831870

   # Resend
   RESEND_API_KEY=re_FMM5AnsB_2JME3cmD3Yqb3xjkfxbLrkNm

   # Pesapal
   PESAPAL_CONSUMER_KEY=9fz9BofeqH0tRHdOWx/3vdagol/7FSXD
   PESAPAL_CONSUMER_SECRET=OoxLk94R1qAUHwvoakTfp8sECQI=
   PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3
   PESAPAL_CALLBACK_URL=https://yourdomain.com/payment/callback

   # Database
   DATABASE_URL="file:./dev.db"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🧪 Testing Integrations

### Test Authentication
```bash
node scripts/test-auth.js
```

### Test Payments
```bash
node scripts/test-payments.js
```

## 📁 Project Structure

```
dsatutor/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Database seeding
├── src/
│   ├── lib/
│   │   └── prisma.ts     # Prisma client
│   ├── services/
│   │   ├── firebase.ts   # Firebase auth service
│   │   ├── email.ts      # Resend email service
│   │   └── pesapal.ts    # Pesapal payment service
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/     # Auth API routes
│   │   │   └── payments/ # Payment API routes
│   │   └── payment/
│   │       └── callback.tsx # Payment callback page
│   └── utils/
│       └── validateEnv.ts # Environment validation
├── scripts/              # Test scripts
└── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/reset` - Password reset

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `GET /api/payments/status` - Check payment status
- `POST /api/payments/ipn` - IPN webhook handler

## 🛠️ Tech Stack

- **Frontend**: Next.js 14
- **Backend**: Node.js with Express (Next.js API routes)
- **Database**: SQLite (local) / PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: Firebase Auth
- **Email**: Resend
- **Payments**: Pesapal (MPESA/Cards)
- **Hosting**: Vercel (planned)

## 📝 Environment Variables

All required environment variables are documented in `.env.local.example`. Make sure to set up all variables before running the application.

## 🚀 Deployment

1. **Database**: Will be migrated to PostgreSQL on Railway
2. **Backend**: Will be deployed on Railway
3. **Frontend**: Will be deployed on Vercel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 