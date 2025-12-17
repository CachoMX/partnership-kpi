# 🔐 Authentication & Role-Based Access Setup

## Overview

The system now has complete authentication with **3 user roles**:
- 👑 **Admin**: Full dashboard + user management
- 📞 **Closer**: Submit calls + view their own stats
- 📋 **Setter**: Submit calls + view their own stats

## Setup Steps

### 1. Enable Supabase Auth (if not already enabled)

The system uses Supabase Auth for user authentication. It's already configured!

### 2. Create Demo Users

Run this command to create demo accounts:

```bash
npm run create-demo-users
```

This creates:
- **Admin**: `admin@example.com` / `admin123`
- **Closer**: `closer@example.com` / `closer123`
- **Setter**: `setter@example.com` / `setter123`

### 3. Test the System

```bash
npm run dev
```

Open http://localhost:3000 - you'll be redirected to the login page!

## User Flows

### 🔐 Login Flow
1. Visit http://localhost:3000
2. Redirects to `/login`
3. Enter credentials
4. Redirects based on role:
   - Admin → `/dashboard` (full KPI dashboard)
   - Closer → `/dashboard/closer` (their stats only)
   - Setter → `/dashboard/setter` (their stats only)

### 👑 Admin Flow
**Path**: `/dashboard`

**Features**:
- View all KPIs and metrics
- See all closers and setters leaderboards
- **Add User** button (adds closers/setters/admins)
- **Add Call** button (admin can add calls for anyone)
- **Refresh** button
- **Sign Out** button

**Adding Users**:
1. Click "Add User" button in header
2. Fill in: Name, Email, Password, Role (closer/setter/admin)
3. Submit
4. New user is created in:
   - Supabase Auth (authentication)
   - `users` table (role management)
   - `closers` or `setters` table (if applicable)

### 📞 Closer Flow
**Path**: `/submit-call`

**Features**:
- Form to submit call details
- After submission → redirects to their personal dashboard
- Can only see their own performance stats

### 📋 Setter Flow
**Path**: `/submit-call`

**Features**:
- Form to submit call details (for calls they set)
- After submission → redirects to their personal dashboard
- Can only see their own booking stats

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Auto-redirects based on auth state |
| `/login` | Public | Login page |
| `/dashboard` | Admin only | Full KPI dashboard with user management |
| `/dashboard/closer` | Closers only | Closer's personal stats (TODO) |
| `/dashboard/setter` | Setters only | Setter's personal stats (TODO) |
| `/submit-call` | Closers & Setters | Call submission form |

## Database Schema

### Auth Flow
```
Supabase Auth → users table (role) → closers/setters table (stats)
```

### Tables Used
1. **Supabase Auth Users** - Authentication
2. **`users`** - Role management (admin/closer/setter)
3. **`closers`** - Closer profiles and stats
4. **`setters`** - Setter profiles and stats
5. **`calls`** - Call records

## Adding New Users (Manual via SQL)

If you want to add users manually via Supabase SQL Editor:

```sql
-- 1. Create auth user via Supabase dashboard (Auth > Users > Add User)

-- 2. Add to users table
INSERT INTO users (email, name, role)
VALUES ('newuser@example.com', 'New User', 'closer');

-- 3. If closer, add to closers table
INSERT INTO closers (name, email)
VALUES ('New User', 'newuser@example.com');

-- 3. If setter, add to setters table
INSERT INTO setters (name, email)
VALUES ('New User', 'newuser@example.com');
```

## Security Features

✅ **Protected Routes**: All dashboards check for authentication
✅ **Role-Based Access**: Users redirected based on their role
✅ **Auto-redirect**: Unauthorized access redirects to login
✅ **Row Level Security**: Supabase RLS policies protect data
✅ **Secure Passwords**: Supabase handles password hashing

## Next Steps (TODO)

1. **Create Closer Dashboard** (`/dashboard/closer`)
   - Show only their stats
   - Their calls history
   - Personal leaderboard ranking

2. **Create Setter Dashboard** (`/dashboard/setter`)
   - Show only their booking stats
   - Their booked calls
   - Personal performance metrics

3. **User Profile Page**
   - Edit profile
   - Change password
   - View personal stats

4. **User Management UI for Admin**
   - List all users
   - Edit user roles
   - Delete users
   - Reset passwords

## Testing

### Test Admin Access
```
Email: admin@example.com
Password: admin123
Expected: See full dashboard with "Add User" button
```

### Test Closer Access
```
Email: closer@example.com
Password: closer123
Expected: Redirect to closer dashboard (or submit-call page)
```

### Test Setter Access
```
Email: setter@example.com
Password: setter123
Expected: Redirect to setter dashboard (or submit-call page)
```

## Troubleshooting

**Issue**: Can't login
- Check `.env.local` has correct Supabase credentials
- Run `npm run create-demo-users` again
- Check Supabase Auth dashboard for user existence

**Issue**: "Not authorized" error
- Check user's role in `users` table
- Verify RLS policies are enabled

**Issue**: Users not in closers/setters tables
- Manually insert into appropriate table
- Or recreate user via "Add User" button

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

🎉 **You now have a complete auth system with role-based access!**

Admin can add users, closers and setters can submit calls, and everyone has appropriate access levels.
