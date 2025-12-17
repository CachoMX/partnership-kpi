# Closers KPI Dashboard

A comprehensive sales performance tracking system built with Next.js, Supabase, and Tailwind CSS. Track closers performance, monitor leaderboards, and manage call data efficiently.

## Features

- **📊 Performance Dashboard** - Real-time KPIs including booked calls, close rate, AOV, revenue, and commissions
- **🏆 Closers Leaderboard** - Rankings by cash collected, deals closed, and revenue
- **📈 Setters Leaderboard** - Track setter performance with show rates and close rates
- **➕ Call Entry Form** - Easy-to-use form for closers to log call data
- **🔄 Auto-calculated Stats** - Database triggers automatically update metrics
- **🎨 Dark Mode UI** - Beautiful, professional dark theme interface

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI + shadcn/ui
- **Language:** TypeScript
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Git

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd partnership-kpi
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Set up the Supabase database:

- Go to your Supabase project dashboard
- Navigate to SQL Editor
- Copy and paste the contents of `supabase/schema.sql`
- Run the query to create all tables, triggers, and policies

5. Import existing data (optional):

If you have existing CSV data:
```bash
npm run import-csv
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Database Schema

### Tables

- **`closers`** - Closer profiles and aggregate stats
- **`setters`** - Setter profiles and aggregate stats
- **`calls`** - Individual call records
- **`users`** - User authentication and roles

### Features

- Auto-updating statistics via PostgreSQL triggers
- Row Level Security (RLS) for data access control
- Automatic calculation of:
  - Close rates
  - Show rates
  - AOV (Average Order Value)
  - Cash collected per call
  - Commission totals

## Deployment to Vercel

1. Push your code to GitHub

2. Import the project in Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. Deploy!

The build command is configured in `vercel.json` to use `--legacy-peer-deps`.

## Usage

### Adding a Call

1. Click the "Add Call" button
2. Fill out the form with call details:
   - Lead information
   - Closer and setter names
   - Call result
   - Revenue and cash collected
3. Submit - stats will auto-update!

### Viewing Performance

- **Performance Tab** - See aggregate metrics across all closers
- **Closers Leaderboard** - View individual closer rankings
- **Setters Leaderboard** - Track setter performance

### Refreshing Data

Click the "Refresh" button to reload the latest data from Supabase.

## Project Structure

```
partnership-kpi/
├── app/
│   ├── api/          # API routes (calls, closers, setters)
│   ├── page.tsx      # Main dashboard
│   └── layout.tsx    # Root layout
├── components/
│   ├── add-call-form.tsx
│   ├── closers-performance-dashboard.tsx
│   ├── closers-leaderboard.tsx
│   ├── setters-leaderboard.tsx
│   └── ui/           # Reusable UI components
├── lib/
│   ├── supabase.ts   # Supabase client
│   └── database.types.ts  # TypeScript types
├── scripts/
│   └── import-csv.ts # CSV import script
├── supabase/
│   └── schema.sql    # Database schema
└── styles/
    └── globals.css   # Global styles
```

## Configuration

### Commission Rate

Default commission rate is 10%. You can modify this in:
- Database: `closers.commission_rate` column
- Import script: `scripts/import-csv.ts`

### Metrics Calculations

All metrics are calculated automatically via database triggers. See `supabase/schema.sql` for the trigger functions.

## Troubleshooting

### Build Errors

If you encounter peer dependency errors:
```bash
npm install --legacy-peer-deps
```

### Database Connection Issues

1. Verify your Supabase credentials in `.env.local`
2. Check that RLS policies are enabled
3. Ensure the SQL schema has been run

### Import Issues

If CSV import fails:
- Check the CSV file path
- Verify CSV format matches expected columns
- Check database connection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Supabase
