# Deployment Guide

## Step-by-Step Setup

### 1. Set Up Database Schema in Supabase

1. Go to your Supabase dashboard: https://tavxhyiuxzvvjylhedir.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Open the file `supabase/schema.sql` and copy all contents
5. Paste into the SQL editor
6. Click **RUN** to execute

This creates:
- `closers` table
- `setters` table
- `calls` table
- `users` table
- Automatic triggers for stats calculation
- Row Level Security policies

### 2. Import Your CSV Data

Run the import script to load your existing 6,190 call records:

```bash
npm run import-csv
```

This will:
- Extract unique closers and setters from the CSV
- Create records in the `closers` and `setters` tables
- Import all call data
- Auto-calculate all stats via database triggers

**Verify the import:**
1. Go to Supabase → Table Editor
2. Check `closers` table - should show Mason Wright, Mikkel Rand, Travis Xavier, etc.
3. Check `setters` table - should show all setters
4. Check `calls` table - should have ~6,190 records

### 3. Test Locally

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- ✅ Performance dashboard shows KPIs
- ✅ Closers leaderboard displays data
- ✅ Setters leaderboard displays data
- ✅ "Add Call" form works

### 4. Deploy to Vercel

#### Option A: Via Vercel Dashboard

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Closers KPI Dashboard"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables:**
   In the Vercel project settings, add:

   ```
   NEXT_PUBLIC_SUPABASE_URL = https://tavxhyiuxzvvjylhedir.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdnhoeWl1eHp2dmp5bGhlZGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODEwNTEsImV4cCI6MjA4MTU1NzA1MX0.oGh0R_kMu3Qz3V7cVC0GUNgZlYOrAdLyIbyGipxLoDQ
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdnhoeWl1eHp2dmp5bGhlZGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk4MTA1MSwiZXhwIjoyMDgxNTU3MDUxfQ.0k8JG0HdxBcnJd295TdnFTHxI58MfSym0tNRKIJv7fA
   ```

4. **Configure Build Settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Install Command: `npm install --legacy-peer-deps`
   - Output Directory: `.next` (default)

5. **Deploy!**
   - Click "Deploy"
   - Wait for build to complete
   - Your dashboard will be live!

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables when prompted
# Or add them in the Vercel dashboard
```

### 5. Post-Deployment

1. **Test the live site:**
   - Visit your Vercel URL (e.g., `your-project.vercel.app`)
   - Verify all dashboards load
   - Test adding a new call via the form

2. **Share with your team:**
   - Send the URL to closers and setters
   - Anyone can view dashboards
   - Closers can submit call data via the form

3. **Monitor:**
   - Check Vercel deployment logs for any errors
   - Monitor Supabase usage in the dashboard

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | https://xxx.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (safe for client) | eyJhbG... |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) | eyJhbG... |

## Troubleshooting

### Build fails with peer dependency errors
- Ensure `vercel.json` is configured correctly
- Set install command to `npm install --legacy-peer-deps`

### "Failed to fetch data" error
- Check environment variables are set correctly in Vercel
- Verify Supabase RLS policies allow public access
- Check API routes are deployed correctly

### Data not showing
- Verify CSV import completed successfully
- Check Supabase table editor to confirm data exists
- Check browser console for API errors

### Stats not updating after adding call
- Verify database triggers are created (check `supabase/schema.sql`)
- Manually run triggers if needed
- Check Supabase logs for errors

## Security Notes

⚠️ **Important:**
- The `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed in client-side code
- It's only used in API routes (server-side)
- The anon key is safe to expose as it respects RLS policies

## Updates and Maintenance

To update the deployed app:
```bash
git add .
git commit -m "Your changes"
git push
```

Vercel will automatically redeploy on push to main branch.

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

---

🎉 **You're all set!** Your Closers KPI Dashboard is now live and ready to track performance.
