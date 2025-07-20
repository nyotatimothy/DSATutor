# Remove App Router Files to Fix Build Conflict

Since we're working with the existing Pages Router system, we need to remove the App Router API files we created:

## Files to Delete:
1. `app/api/auth/login/route.ts`
2. `app/api/auth/login-new/route.ts` 
3. `app/api/ai/generate-curriculum-tree/route.ts`

## Commands to Run:
```bash
rm -rf app/api/auth/login/route.ts
rm -rf app/api/auth/login-new/route.ts
rm -rf app/api/ai/generate-curriculum-tree/route.ts
```

## What Will Work After Deletion:
- ✅ `src/pages/api/auth/login.ts` (updated with nyota@dsatutor.com user)
- ✅ `src/pages/api/ai/generate-curriculum-tree.ts` (updated with advanced curriculum)
- ✅ Login with nyota@dsatutor.com / user
- ✅ Advanced curriculum for proficient users

## Test After Deletion:
1. Delete the App Router files listed above
2. Restart your dev server
3. Login with nyota@dsatutor.com / user
4. Navigate to /curriculum to see advanced topics
