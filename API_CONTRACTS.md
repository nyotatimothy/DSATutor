# DSATutor API Contracts for Frontend Development

## 🔐 Authentication Endpoints

### Sign Up
```typescript
POST /api/auth/signup-new
Content-Type: application/json

Request:
{
  "email": string,
  "password": string,
  "name": string
}

Response:
{
  "success": boolean,
  "data": {
    "user": {
      "id": string,
      "email": string,
      "name": string,
      "role": "user" | "admin" | "super_admin"
    },
    "token": string
  },
  "message": string
}
```

### Sign In
```typescript
POST /api/auth/login-new
Content-Type: application/json

Request:
{
  "email": string,
  "password": string
}

Response:
{
  "success": boolean,
  "data": {
    "user": {
      "id": string,
      "email": string,
      "name": string,
      "role": "user" | "admin" | "super_admin"
    },
    "token": string
  },
  "message": string
}
```

### Password Reset
```typescript
POST /api/auth/reset-new
Content-Type: application/json

Request:
{
  "email": string
}

Response:
{
  "success": boolean,
  "message": string
}
```

## 📚 Course Management

### Get All Courses
```typescript
GET /api/courses
Headers: Authorization: Bearer <token>

Response:
{
  "success": boolean,
  "data": [
    {
      "id": string,
      "title": string,
      "description": string,
      "createdBy": string,
      "createdAt": string,
      "updatedAt": string,
      "isActive": boolean
    }
  ]
}
```

### Get Course by ID
```typescript
GET /api/courses/[id]
Headers: Authorization: Bearer <token>

Response:
{
  "success": boolean,
  "data": {
    "id": string,
    "title": string,
    "description": string,
    "createdBy": string,
    "createdAt": string,
    "updatedAt": string,
    "isActive": boolean,
    "topics": [
      {
        "id": string,
        "title": string,
        "description": string,
        "order": number,
        "courseId": string
      }
    ]
  }
}
```

### Create Course (Admin Only)
```typescript
POST /api/courses
Headers: Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "title": string,
  "description": string
}

Response:
{
  "success": boolean,
  "data": {
    "id": string,
    "title": string,
    "description": string,
    "createdBy": string,
    "createdAt": string,
    "updatedAt": string
  }
}
```

## 🎯 Topic Management

### Get Topics for Course
```typescript
GET /api/topics?courseId=[courseId]
Headers: Authorization: Bearer <token>

Response:
{
  "success": boolean,
  "data": [
    {
      "id": string,
      "title": string,
      "description": string,
      "order": number,
      "courseId": string
    }
  ]
}
```

### Create Topic (Admin Only)
```typescript
POST /api/topics
Headers: Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "title": string,
  "description": string,
  "courseId": string,
  "order": number
}

Response:
{
  "success": boolean,
  "data": {
    "id": string,
    "title": string,
    "description": string,
    "order": number,
    "courseId": string
  }
}
```

## 📊 Progress Tracking

### Get User Progress
```typescript
GET /api/progress
Headers: Authorization: Bearer <token>

Response:
{
  "success": boolean,
  "data": [
    {
      "id": string,
      "userId": string,
      "topicId": string,
      "status": "not_started" | "in_progress" | "complete",
      "completedAt": string,
      "topic": {
        "id": string,
        "title": string,
        "description": string,
        "order": number,
        "courseId": string
      }
    }
  ]
}
```

### Update Progress
```typescript
POST /api/progress
Headers: Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "topicId": string,
  "status": "not_started" | "in_progress" | "complete"
}

Response:
{
  "success": boolean,
  "data": {
    "id": string,
    "userId": string,
    "topicId": string,
    "status": string,
    "completedAt": string
  }
}
```

## 🧠 AI-Powered Features

### Code Analysis
```typescript
POST /api/ai/analyze
Headers: Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "code": string,
  "problemDescription": string,
  "language": string
}

Response:
{
  "success": boolean,
  "data": {
    "analysis": {
      "score": number,
      "codeQuality": string,
      "timeComplexity": string,
      "spaceComplexity": string,
      "issues": string[],
      "suggestions": string[]
    },
    "attempt": {
      "id": string,
      "userId": string,
      "topicId": string,
      "code": string,
      "result": string,
      "timeTaken": number
    }
  }
}
```

### Enhanced Code Analysis
```typescript
POST /api/ai/enhanced-analyze
Headers: Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "code": string,
  "problemDescription": string,
  "language": string
}

Response:
{
  "success": boolean,
  "data": {
    "analysis": {
      "basicAnalysis": {
        "score": number,
        "codeQuality": string,
        "timeComplexity": string,
        "spaceComplexity": string
      },
      "algorithmAnalysis": {
        "algorithmType": string,
        "efficiency": string,
        "complexity": string
      },
      "codeStyleAnalysis": {
        "readability": string,
        "maintainability": string,
        "bestPractices": string[]
      },
      "securityAnalysis": {
        "securityScore": number,
        "vulnerabilities": string[],
        "recommendations": string[]
      },
      "learningInsights": {
        "difficultyLevel": string,
        "concepts": string[],
        "improvements": string[]
      }
    },
    "attempt": {
      "id": string,
      "userId": string,
      "topicId": string,
      "code": string,
      "result": string,
      "timeTaken": number
    }
  }
}
```

### Skill Assessment
```typescript
POST /api/ai/assess
Headers: Authorization: Bearer <token>

Response:
{
  "success": boolean,
  "data": {
    "assessment": {
      "overallLevel": "beginner" | "intermediate" | "advanced",
      "confidenceScore": number,
      "strengths": string[],
      "weaknesses": string[],
      "recommendations": string[]
    }
  }
}
```

### Hint Generation
```typescript
POST /api/ai/hint
Headers: Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "userCode": string,
  "problemDescription": string,
  "userStuck": boolean
}

Response:
{
  "success": boolean,
  "data": {
    "hintLevel": "basic" | "moderate" | "advanced",
    "hint": string,
    "nextStep": string
  }
}
```

### Learning Path Generation
```typescript
POST /api/ai/learning-path
Headers: Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "goals": string[]
}

Response:
{
  "success": boolean,
  "data": {
    "learningPath": {
      "currentLevel": string,
      "targetLevel": string,
      "roadmap": [
        {
          "phase": string,
          "topics": string[],
          "estimatedTime": string
        }
      ],
      "immediateNextSteps": string[],
      "longTermGoals": string[]
    }
  }
}
```

## 💳 Payment & Pricing

### Get Pricing Plans
```typescript
GET /api/pricing/plans

Response:
{
  "success": boolean,
  "data": [
    {
      "id": string,
      "name": string,
      "price": number,
      "currency": "USD",
      "features": string[],
      "duration": string
    }
  ]
}
```

### Check Course Access
```typescript
POST /api/pricing/course-access/check
Headers: Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "courseId": string
}

Response:
{
  "success": boolean,
  "data": {
    "hasAccess": boolean,
    "reason": string
  }
}
```

## 👑 Super Admin Features

### Get All Users (Super Admin Only)
```typescript
GET /api/super-admin/users
Headers: Authorization: Bearer <token>

Response:
{
  "success": boolean,
  "data": [
    {
      "id": string,
      "email": string,
      "name": string,
      "role": string,
      "createdAt": string,
      "lastLogin": string
    }
  ]
}
```

### Update User Role (Super Admin Only)
```typescript
PUT /api/super-admin/users/[id]/update-role
Headers: Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "role": "user" | "admin" | "super_admin"
}

Response:
{
  "success": boolean,
  "data": {
    "id": string,
    "email": string,
    "name": string,
    "role": string
  }
}
```

### System Analytics (Super Admin Only)
```typescript
GET /api/super-admin/analytics
Headers: Authorization: Bearer <token>

Response:
{
  "success": boolean,
  "data": {
    "totalUsers": number,
    "activeUsers": number,
    "totalCourses": number,
    "totalAttempts": number,
    "revenue": {
      "total": number,
      "currency": string,
      "monthly": number
    }
  }
}
```

## 🔧 Error Handling

All endpoints return consistent error responses:

```typescript
{
  "success": false,
  "message": string,
  "error": string (optional)
}
```

Common HTTP Status Codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## 🔐 Authentication

Most endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📝 Notes for Frontend Development

1. **Base URL**: All endpoints are relative to `/api`
2. **Content-Type**: Use `application/json` for POST/PUT requests
3. **Error Handling**: Always check the `success` field in responses
4. **Loading States**: Implement loading states for async operations
5. **Token Management**: Store and refresh JWT tokens appropriately
6. **Role-Based Access**: Check user roles for admin/super admin features 