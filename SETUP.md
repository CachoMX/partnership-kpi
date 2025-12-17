# Setup Instructions

## 1. Run Database Schema in Supabase

1. Go to your Supabase project: https://tavxhyiuxzvvjylhedir.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy the entire contents of `supabase/schema.sql`
5. Paste it into the SQL editor
6. Click "Run" to execute the schema

This will create all the tables (users, closers, setters, calls) and set up the triggers for auto-updating stats.

## 2. Import CSV Data

After the schema is created, run the import script:

```bash
npm run import-csv
```

Or manually:

```bash
npx tsx scripts/import-csv.ts "c:/Users/uriel/Downloads/Tube Accelerator -  Data - Calendly Booked Calls.csv"
```

This will:
- Create all unique closers from the CSV
- Create all unique setters from the CSV
- Import all 6,190 call records
- Auto-calculate stats using database triggers

## 3. Verify the Import

Check in Supabase:
- Go to "Table Editor"
- Check `closers` table - should have records for Mason Wright, Mikkel Rand, Travis Xavier, Aamir Ashraff, etc.
- Check `setters` table - should have records for all setters
- Check `calls` table - should have ~6,190 records
- Stats should be auto-calculated

## 4. Run the Development Server

```bash
npm run dev
```

## 5. Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!
