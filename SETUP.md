# Setup Guide

## Database Setup

You'll need a PostgreSQL database to run this project. Here are your options:

### Option 1: Supabase (Recommended for Development)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Once created, go to Settings > Database
4. Copy the connection string
5. Update `apps/backend/.env`:
   ```
   DATABASE_URL="your-supabase-connection-string"
   ```

This is the easiest option and includes 500MB of free database storage.

### Option 2: Docker

If you have Docker installed:

```bash
cd ~/email-crm
docker-compose up -d
```

This starts PostgreSQL locally on port 5432.

### Option 3: Local PostgreSQL

Install PostgreSQL locally:
- **Mac (Homebrew)**: `brew install postgresql`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **Linux**: `sudo apt-get install postgresql`

Then update `apps/backend/.env` with your connection details.

## After Setting Up Database

1. **Push the schema**:
```bash
npm run db:push -w backend
```

2. **Start development**:
```bash
npm run dev
```

This starts both frontend (http://localhost:5173) and backend (http://localhost:3000).

## Next Steps

Once the database is running and the dev servers are up:

1. Create an account at http://localhost:5173/register
2. Create a client
3. Create a task
4. View the calendar

## Slack Integration (Optional)

To set up Slack notifications:

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create a new app
3. Set Bot Token Scopes: `chat:write`, `commands`
4. Get your Bot Token and Signing Secret
5. Update `apps/backend/.env` with these values
6. Configure your Slack channel in the app settings

For now, this is optional - the app works fine without Slack.
