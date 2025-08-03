# Supabase Setup Guide

This guide will help you set up Supabase for the Keto + IF app backend.

## Prerequisites

1. Node.js (v18 or higher)
2. npm or yarn
3. Supabase CLI (optional but recommended)

## Setup Steps

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - Name: `keto-if-app`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
6. Click "Create new project"

### 2. Get Your Project Credentials

1. Go to your project dashboard
2. Click on "Settings" in the sidebar
3. Click on "API" in the settings menu
4. Copy the following values:
   - Project URL
   - Project API keys (anon/public key)

### 3. Configure Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example`)
2. Add your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Database Schema

#### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the sidebar
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the migration

#### Option B: Using Supabase CLI (Recommended for development)

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Initialize Supabase in your project:
```bash
supabase init
```

4. Link to your remote project:
```bash
supabase link --project-ref your-project-id
```

5. Push the migration:
```bash
supabase db push
```

### 5. Enable Authentication

1. Go to "Authentication" in your Supabase dashboard
2. Click on "Settings"
3. Configure the following:
   - Site URL: `http://localhost:19006` (for development)
   - Redirect URLs: Add your app's redirect URLs
   - Enable email confirmations (optional for development)

### 6. Set Up Row Level Security (RLS)

The migration script automatically sets up RLS policies, but you can verify:

1. Go to "Authentication" > "Policies"
2. You should see policies for:
   - `profiles` table
   - `macro_targets` table
   - `food_entries` table
   - `fasting_sessions` table

### 7. Test the Connection

1. In your app, toggle Supabase mode:
```typescript
// In your component or during app initialization
useUserStore.getState().toggleSupabase(true);
```

2. Try registering a new user
3. Check the Supabase dashboard to see if the user was created

## Database Schema Overview

### Tables

1. **profiles** - User profile information
   - Links to `auth.users` via foreign key
   - Stores personal info, goals, preferences, subscription
   - JSONB fields for flexible data structure

2. **macro_targets** - User's calculated macro targets
   - One-to-one relationship with profiles
   - Automatically calculated based on user data

3. **food_entries** - User's food logging data
   - Many-to-one relationship with profiles
   - Stores macro information as JSONB

4. **fasting_sessions** - User's fasting session data
   - Many-to-one relationship with profiles
   - Tracks fasting protocols and stages

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Automatic profile creation on user registration
- JWT-based authentication

## Development vs Production

### Development
- Use local Supabase instance with `supabase start`
- Test with local database
- Use development environment variables

### Production
- Use hosted Supabase project
- Configure production environment variables
- Set up proper backup and monitoring

## Troubleshooting

### Common Issues

1. **Connection Error**
   - Check your environment variables
   - Verify project URL and API key
   - Ensure network connectivity

2. **Authentication Issues**
   - Check RLS policies
   - Verify user creation trigger
   - Check authentication settings

3. **Database Errors**
   - Verify migration was applied correctly
   - Check table permissions
   - Review error logs in Supabase dashboard

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## Migration from Mock Auth

To migrate from the current mock authentication system:

1. Set up Supabase as described above
2. Toggle Supabase mode: `useUserStore.getState().toggleSupabase(true)`
3. Test all authentication flows
4. Once verified, remove the mock auth service
5. Update tests to use Supabase test utilities

## Next Steps

After setting up Supabase:

1. Implement real-time subscriptions for live data updates
2. Set up Supabase Storage for file uploads
3. Create Edge Functions for complex business logic
4. Set up monitoring and analytics
5. Configure backup and disaster recovery