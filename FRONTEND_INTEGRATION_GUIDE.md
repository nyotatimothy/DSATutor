# Frontend Integration Guide for DSATutor

## 🎯 **Integration Strategy**

This guide explains how to integrate Vercel-generated frontend code with your existing Next.js backend.

## 📁 **Recommended Project Structure**

```
src/
├── pages/
│   ├── api/                    # ✅ Keep your existing API routes
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── ai/
│   │   └── ...
│   ├── _app.tsx               # ✅ Main app wrapper
│   ├── index.tsx              # 🆕 Landing page (Vercel-generated)
│   ├── dashboard.tsx          # 🆕 User dashboard (Vercel-generated)
│   ├── auth/
│   │   ├── login.tsx          # 🆕 Login page (Vercel-generated)
│   │   ├── signup.tsx         # 🆕 Signup page (Vercel-generated)
│   │   └── reset.tsx          # 🆕 Password reset (Vercel-generated)
│   ├── courses/
│   │   ├── index.tsx          # 🆕 Course listing (Vercel-generated)
│   │   ├── [id].tsx           # 🆕 Course detail (Vercel-generated)
│   │   └── [id]/practice.tsx  # 🆕 Practice interface (Vercel-generated)
│   ├── admin/
│   │   ├── dashboard.tsx      # 🆕 Admin dashboard (Vercel-generated)
│   │   ├── users.tsx          # 🆕 User management (Vercel-generated)
│   │   └── courses.tsx        # 🆕 Course management (Vercel-generated)
│   └── super-admin/
│       ├── dashboard.tsx      # 🆕 Super admin dashboard (Vercel-generated)
│       └── analytics.tsx      # 🆕 System analytics (Vercel-generated)
├── components/                # 🆕 Vercel-generated components
│   ├── ui/                    # Reusable UI components
│   ├── forms/                 # Form components
│   ├── layout/                # Layout components
│   └── features/              # Feature-specific components
├── hooks/                     # 🆕 Vercel-generated hooks
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── useLocalStorage.ts
├── lib/                       # 🆕 Vercel-generated utilities
│   ├── api.ts                 # API client
│   ├── auth.ts                # Authentication utilities
│   └── utils.ts               # General utilities
├── types/                     # 🆕 TypeScript type definitions
│   ├── api.ts                 # API response types
│   ├── user.ts                # User-related types
│   └── course.ts              # Course-related types
├── styles/                    # 🆕 Styling
│   ├── globals.css
│   └── components.css
└── ...                        # ✅ Keep existing backend files
```

## 🔧 **Integration Steps**

### **Step 1: Prepare Your Backend**

1. **Ensure API routes are working** (they already are!)
2. **Test all endpoints** using your existing test scripts
3. **Document any missing endpoints** that Vercel might need

### **Step 2: Generate Frontend with Vercel**

1. **Provide the API contracts** (`API_CONTRACTS.md`) to Vercel
2. **Specify your requirements**:
   ```
   "Create a modern, responsive frontend for DSATutor with:
   - User authentication (login/signup/reset)
   - Course browsing and enrollment
   - Interactive code practice interface
   - Progress tracking dashboard
   - Admin panel for course management
   - Super admin analytics dashboard
   - Modern UI with dark/light mode
   - Mobile-responsive design"
   ```

### **Step 3: Integrate Generated Code**

#### **Option A: Direct Integration (Recommended)**

1. **Copy Vercel-generated pages** to `src/pages/`
2. **Copy components** to `src/components/`
3. **Copy utilities** to `src/lib/`
4. **Update imports** to match your project structure

#### **Option B: Gradual Migration**

1. **Start with one feature** (e.g., authentication)
2. **Test thoroughly** before moving to next feature
3. **Keep existing pages** until new ones are ready

### **Step 4: Configure API Integration**

Create a centralized API client (`src/lib/api.ts`):

```typescript
// src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Auth endpoints
  async signup(email: string, password: string, name: string) {
    return this.request('/auth/signup-new', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login-new', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Course endpoints
  async getCourses() {
    return this.request('/courses');
  }

  async getCourse(id: string) {
    return this.request(`/courses/${id}`);
  }

  // AI endpoints
  async analyzeCode(code: string, problemDescription: string, language: string) {
    return this.request('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ code, problemDescription, language }),
    });
  }

  // ... add more methods as needed
}

export const apiClient = new ApiClient();
```

### **Step 5: Authentication Integration**

Create authentication utilities (`src/lib/auth.ts`):

```typescript
// src/lib/auth.ts
import { apiClient } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthService {
  private user: User | null = null;
  private token: string | null = null;

  async login(email: string, password: string): Promise<User> {
    const response = await apiClient.login(email, password);
    
    if (response.success) {
      this.user = response.data.user;
      this.token = response.data.token;
      
      // Store in localStorage
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
      
      // Set token in API client
      apiClient.setToken(this.token);
      
      return this.user;
    }
    
    throw new Error(response.message);
  }

  async signup(email: string, password: string, name: string): Promise<User> {
    const response = await apiClient.signup(email, password, name);
    
    if (response.success) {
      this.user = response.data.user;
      this.token = response.data.token;
      
      // Store in localStorage
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
      
      // Set token in API client
      apiClient.setToken(this.token);
      
      return this.user;
    }
    
    throw new Error(response.message);
  }

  logout() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    apiClient.setToken('');
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  // Initialize auth state from localStorage
  initialize() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      this.token = token;
      this.user = JSON.parse(userStr);
      apiClient.setToken(token);
    }
  }
}

export const authService = new AuthService();
```

### **Step 6: Environment Configuration**

Update your `.env.local`:

```bash
# Backend configuration (existing)
DATABASE_URL="your-database-url"
OPENAI_API_KEY="your-openai-key"
FIREBASE_CONFIG="your-firebase-config"
RESEND_API_KEY="your-resend-key"
PAYSTACK_SECRET_KEY="your-paystack-key"

# Frontend configuration (new)
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_APP_NAME="DSATutor"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### **Step 7: Update _app.tsx**

```typescript
// src/pages/_app.tsx
import { useEffect } from 'react';
import { authService } from '../lib/auth';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Initialize authentication state
    authService.initialize();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
```

## 🎨 **UI/UX Guidelines for Vercel**

### **Design System Requirements**

```
"Create a modern design system with:

1. Color Palette:
   - Primary: #667eea (Blue)
   - Secondary: #764ba2 (Purple)
   - Success: #28a745 (Green)
   - Warning: #ffc107 (Yellow)
   - Error: #dc3545 (Red)
   - Background: #f8f9fa (Light Gray)

2. Typography:
   - Font: Inter or system fonts
   - Headings: Bold, clear hierarchy
   - Body: Readable, 16px base

3. Components:
   - Buttons: Rounded corners, hover effects
   - Cards: Subtle shadows, rounded corners
   - Forms: Clean inputs, validation states
   - Navigation: Clear, accessible

4. Layout:
   - Responsive grid system
   - Consistent spacing (8px increments)
   - Mobile-first approach
   - Dark/light mode support"
```

### **Key Pages to Generate**

1. **Landing Page** (`/`) - Course overview, features, pricing
2. **Authentication** (`/auth/*`) - Login, signup, password reset
3. **Dashboard** (`/dashboard`) - User progress, enrolled courses
4. **Course Browser** (`/courses`) - Course listing with filters
5. **Course Detail** (`/courses/[id]`) - Course content, topics
6. **Practice Interface** (`/courses/[id]/practice`) - Code editor, AI analysis
7. **Admin Panel** (`/admin/*`) - Course management, user management
8. **Super Admin** (`/super-admin/*`) - System analytics, user management

## 🔄 **Testing Integration**

### **Step 1: Test Authentication Flow**

```typescript
// Test login flow
const testLogin = async () => {
  try {
    const user = await authService.login('test@example.com', 'TestPassword123!');
    console.log('Login successful:', user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### **Step 2: Test API Integration**

```typescript
// Test course fetching
const testCourses = async () => {
  try {
    const courses = await apiClient.getCourses();
    console.log('Courses:', courses);
  } catch (error) {
    console.error('Failed to fetch courses:', error);
  }
};
```

### **Step 3: Test AI Features**

```typescript
// Test code analysis
const testCodeAnalysis = async () => {
  try {
    const analysis = await apiClient.analyzeCode(
      'function twoSum(nums, target) { return [0, 1]; }',
      'Find two numbers that add up to target',
      'javascript'
    );
    console.log('Analysis:', analysis);
  } catch (error) {
    console.error('Analysis failed:', error);
  }
};
```

## 🚀 **Deployment Considerations**

### **Development**
- Use `npm run dev` for local development
- API routes run on same port as frontend
- Hot reloading works for both frontend and backend

### **Production**
- Deploy to Vercel (recommended)
- API routes become serverless functions
- Environment variables need to be set in Vercel dashboard
- Database connection works the same

### **Environment Variables in Vercel**
```bash
DATABASE_URL=your-production-db-url
OPENAI_API_KEY=your-openai-key
FIREBASE_CONFIG=your-firebase-config
RESEND_API_KEY=your-resend-key
PAYSTACK_SECRET_KEY=your-paystack-key
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api
```

## 🎯 **Next Steps**

1. **Generate frontend with Vercel** using the API contracts
2. **Follow the integration steps** above
3. **Test thoroughly** before deploying
4. **Iterate and improve** based on user feedback

## 📞 **Support**

If you encounter issues during integration:
1. Check the API contracts match your actual endpoints
2. Verify authentication flow works
3. Test API responses match expected format
4. Ensure environment variables are set correctly

The beauty of this approach is that your existing backend remains unchanged while you get a modern, responsive frontend that integrates seamlessly with your API! 