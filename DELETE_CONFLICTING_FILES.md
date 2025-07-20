# Files to Delete - Conflicting API Routes

The following files need to be deleted to resolve the build conflict between Pages Router and App Router:

## Files to Remove:
1. `src/pages/api/auth/login.ts` 
2. `src/pages/api/auth/login-new.ts`
3. `src/pages/api/ai/generate-curriculum-tree.ts`

## Reason:
These files are using the old Pages Router API structure (`src/pages/api/`) which conflicts with the new App Router API structure (`app/api/`) that we're using.

## Action Required:
Please manually delete these files from your file system:
- src/pages/api/auth/login.ts
- src/pages/api/auth/login-new.ts  
- src/pages/api/ai/generate-curriculum-tree.ts

Or you can run these commands in your terminal:
```bash
rm src/pages/api/auth/login.ts
rm src/pages/api/auth/login-new.ts
rm src/pages/api/ai/generate-curriculum-tree.ts
```

## After Deletion:
The build error should be resolved and the App Router API endpoints will work correctly:
- app/api/auth/login/route.ts (for nyota@dsatutor.com login)
- app/api/auth/login-new/route.ts 
- app/api/ai/generate-curriculum-tree/route.ts (for advanced curriculum)
