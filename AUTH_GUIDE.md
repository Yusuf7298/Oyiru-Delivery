# Authentication System - Complete Guide

## Overview

The Oyru Delivery platform uses **Better Auth** - a modern, secure authentication system for Next.js applications. It provides email/password authentication with session management, built on top of a PostgreSQL database.

---

## How Authentication Works

### 1. **Authentication Flow Diagram**

```
User Browser                    Next.js Server              Database
    |                               |                           |
    | 1. Visit /sign-up            |                           |
    |------------------------------>|                           |
    |                               |                           |
    | 2. Submit email + password    |                           |
    |------------------------------>|                           |
    |                               | 3. Hash password          |
    |                               |                           |
    |                               | 4. Create user record     |
    |                               |------------------------->|
    |                               |                           |
    |                               | 5. Return user + session  |
    |<------------------------------|                           |
    |                               |                           |
    | 6. Set session cookie         |                           |
    |----(secure HttpOnly)----------|                           |
    |                               |                           |
    | 7. Redirect to homepage       |                           |
    |<------------------------------|                           |
```

### 2. **Session Management**

- **Duration**: 7 days
- **Refresh**: Every 24 hours of activity
- **Storage**: Secure HttpOnly cookies (cannot be accessed by JavaScript)
- **Cross-site**: Enabled in development for iframe preview, disabled in production for security

### 3. **Authentication Methods Available**

Currently enabled:
- ✓ Email + Password (sign up / sign in)

Can be added:
- OAuth (Google, GitHub, etc.)
- Magic Links
- Passkeys
- Multi-factor authentication

---

## Usage: How to Use Authentication

### Sign Up

**URL**: `http://localhost:3000/sign-up`

**Step-by-step**:
1. Enter your name
2. Enter your email address
3. Enter a password (minimum 8 characters)
4. Click "Create account"
5. Automatically redirected to homepage (logged in)

**Example**:
```
Name: John Doe
Email: john@example.com
Password: SecurePass123
```

### Sign In

**URL**: `http://localhost:3000/sign-in`

**Step-by-step**:
1. Enter your email address
2. Enter your password
3. Click "Sign in"
4. Automatically redirected to homepage (logged in)

### Sign Out

Currently available via:
- `signOut()` function in components (see code examples below)
- Will need to add a Sign Out button to the header

---

## Authentication in Code

### 1. **Client-Side Authentication (React Components)**

#### Sign In Example
```typescript
'use client'

import { authClient } from '@/lib/auth-client'

export function SignInButton() {
  const handleSignIn = async () => {
    const { error } = await authClient.signIn.email({
      email: 'user@example.com',
      password: 'password123',
    })
    
    if (error) {
      console.error('Sign in failed:', error.message)
    } else {
      console.log('Signed in successfully!')
    }
  }

  return <button onClick={handleSignIn}>Sign In</button>
}
```

#### Sign Up Example
```typescript
'use client'

import { authClient } from '@/lib/auth-client'

export function SignUpForm() {
  const handleSignUp = async () => {
    const { error } = await authClient.signUp.email({
      email: 'newuser@example.com',
      password: 'password123',
      name: 'John Doe',
    })
    
    if (error) {
      console.error('Sign up failed:', error.message)
    }
  }

  return <button onClick={handleSignUp}>Sign Up</button>
}
```

#### Check If User Is Logged In
```typescript
'use client'

import { authClient } from '@/lib/auth-client'
import { useEffect, useState } from 'react'

export function UserGreeting() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      setUser(data?.user)
      setLoading(false)
    })
  }, [])

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not logged in</div>
  
  return <div>Hello, {user.name}!</div>
}
```

#### Sign Out Example
```typescript
'use client'

import { authClient } from '@/lib/auth-client'

export function SignOutButton() {
  const handleSignOut = async () => {
    await authClient.signOut()
    window.location.href = '/'
  }

  return <button onClick={handleSignOut}>Sign Out</button>
}
```

### 2. **Server-Side Authentication (Server Actions & API Routes)**

#### Get Current User ID (Server Action)
```typescript
import { getUserId } from '@/lib/auth-utils'

export async function getOrdersForCurrentUser() {
  const userId = await getUserId() // Throws if not authenticated
  
  // Now you can use userId to fetch user-specific data
  const orders = await db.query
    .select()
    .from(productOrders)
    .where(eq(productOrders.customerId, userId))
  
  return orders
}
```

#### Get Full Session (Server Action)
```typescript
import { getSession } from '@/lib/auth-utils'

export async function checkAuth() {
  const session = await getSession()
  
  if (!session?.user) {
    throw new Error('User not authenticated')
  }
  
  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
  }
}
```

#### Protected API Route
```typescript
// app/api/my-orders/route.ts

import { getSession } from '@/lib/auth-utils'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getSession()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Fetch user's orders from database
  const orders = await db
    .select()
    .from(productOrders)
    .where(eq(productOrders.customerId, session.user.id))

  return NextResponse.json(orders)
}
```

---

## How It Works: Under the Hood

### 1. **User Registration**

When user signs up:
1. Client sends email, password, name to `/api/auth/[...all]`
2. Better Auth backend validates input
3. Password is **hashed** using bcrypt (not stored as plaintext!)
4. User record created in database
5. Session cookie issued to browser
6. User automatically logged in

**Password Security**: 
- Passwords are hashed, not encrypted
- Only hash is stored in database
- If database is compromised, passwords are still safe

### 2. **User Login**

When user signs in:
1. Client sends email + password
2. Server retrieves user from database
3. Compares submitted password hash with stored hash
4. If match: creates new session cookie
5. If no match: returns error

### 3. **Session Management**

- **Session Cookie**: Automatically stored by browser
- **HttpOnly**: JavaScript cannot read it (protects against XSS attacks)
- **Secure Flag**: Only sent over HTTPS in production
- **SameSite**: Prevents CSRF attacks
- **Duration**: Valid for 7 days, extends by 1 day with each activity

### 4. **Protected Routes**

To protect a page:

```typescript
// app/orders/page.tsx

import { getSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'

export default async function OrdersPage() {
  const session = await getSession()
  
  // If not logged in, redirect to sign-in
  if (!session?.user) {
    redirect('/sign-in')
  }

  // User is authenticated, show page content
  return (
    <div>
      <h1>Your Orders</h1>
      {/* Show user's orders */}
    </div>
  )
}
```

---

## Database Schema

### users table
```sql
CREATE TABLE "user" (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  emailVerified BOOLEAN DEFAULT FALSE,
  image TEXT,
  password TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
)
```

### sessions table
```sql
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  expiresAt TIMESTAMP NOT NULL,
  token TEXT,
  ipAddress TEXT,
  userAgent TEXT
)
```

---

## Testing Authentication

### Test Sign Up
```bash
# 1. Open browser
http://localhost:3000/sign-up

# 2. Fill form
Name: Test User
Email: test@example.com
Password: TestPass123

# 3. Submit - should redirect to homepage logged in
```

### Test Sign In
```bash
# 1. Open browser
http://localhost:3000/sign-in

# 2. Fill form
Email: test@example.com
Password: TestPass123

# 3. Submit - should redirect to homepage logged in
```

### Check Session via Browser Console
```javascript
// In browser console:
fetch('/api/auth/get-session', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

---

## Security Features

### ✓ Implemented
- Password hashing (bcrypt)
- Secure cookies (HttpOnly, Secure, SameSite)
- Session expiration (7 days)
- CSRF protection
- Input validation
- Email verification ready

### ⚠️ Not Yet Implemented
- Rate limiting on login attempts
- Email verification requirement
- Password reset flow
- Two-factor authentication
- OAuth / social login

### Quick Win Improvements
1. Add rate limiting to prevent brute force attacks
2. Send verification email on sign up
3. Add password reset flow
4. Add "Remember me" option

---

## Current Issues & Fixes

### Issue 1: Hotel Flow Auth Error
**Problem**: `redirect` is not a function in `/app/hotel/layout.tsx`

**Fix**: Update to use `redirect` from `next/navigation`
```typescript
import { redirect } from 'next/navigation'

export default async function HotelLayout() {
  const session = await getSession()
  if (!session?.user) {
    redirect('/sign-in')
  }
  // ...
}
```

---

## File Structure

```
/lib
  ├── auth.ts              # Better Auth config
  ├── auth-client.ts       # Client-side auth functions
  └── auth-utils.ts        # Server-side auth utilities

/app
  ├── sign-in/
  │   └── page.tsx         # Sign-in page
  ├── sign-up/
  │   └── page.tsx         # Sign-up page
  └── api/auth/
      └── [...all]/
          └── route.ts     # Better Auth handler

/components
  └── auth-form.tsx        # Reusable auth form
```

---

## Next Steps

1. **Add Sign Out Button**: Create a header component with user menu
2. **Protect Routes**: Add auth checks to admin, driver, hotel pages
3. **Role-Based Access**: Implement role system (customer, driver, admin, hotel)
4. **Password Reset**: Add email-based password reset
5. **Email Verification**: Send verification email after sign up

---

## Quick Reference

| Task | Code |
|------|------|
| Check if logged in (client) | `authClient.getSession()` |
| Check if logged in (server) | `getSession()` or `getUserId()` |
| Sign in (client) | `authClient.signIn.email({email, password})` |
| Sign up (client) | `authClient.signUp.email({email, password, name})` |
| Sign out (client) | `authClient.signOut()` |
| Protect page (server) | Redirect if no session |
| Protect API (server) | Check session and return 401 if missing |

---

**Questions?** Check `/lib/auth.ts`, `/lib/auth-utils.ts`, or the [Better Auth documentation](https://www.better-auth.com/).
