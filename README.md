# Email CRM

A lightweight, client-facing project management hub for email marketing deliverables.

## Project Structure

```
email-crm/
├── apps/
│   ├── backend/    # Node.js + Express API
│   └── frontend/   # React + TypeScript UI
├── package.json    # Monorepo root
└── README.md
```

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL (local or cloud)

## Installation

1. **Install dependencies**:
```bash
npm install
```

This will install dependencies for both backend and frontend workspaces.

## Setup

### 1. Database Setup

Create a `.env` file in `apps/backend/`:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Update `DATABASE_URL` in `.env` with your PostgreSQL connection string:

```
DATABASE_URL="postgresql://user:password@localhost:5432/email_crm"
```

Then push the schema:

```bash
npm run db:push -w backend
```

### 2. JWT Secret

In `apps/backend/.env`, set a strong JWT secret:

```
JWT_SECRET="your-secure-random-string-here"
```

## Development

Start both backend and frontend with hot reload:

```bash
npm run dev
```

This will start:
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

## API Routes

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Clients (requires auth)
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create client
- `GET /api/clients/:id` - Get client details
- `PATCH /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Tasks (requires auth)
- `GET /api/tasks?clientId=...` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PATCH /api/tasks/:id` - Update task
- `POST /api/tasks/:id/comments` - Add comment
- `DELETE /api/tasks/:id` - Delete task

### Public Client View (no auth)
- `GET /api/public/clients/:publicKey` - Get client calendar
- `POST /api/public/clients/:publicKey/comments` - Add comment
- `POST /api/public/clients/:publicKey/tasks/:taskId/approve` - Approve task
- `POST /api/public/clients/:publicKey/tasks/:taskId/request-revisions` - Request revisions

### Slack Integration
- `POST /api/slack/events` - Slack webhook
- `POST /api/slack/actions` - Slack action handlers
- `POST /api/slack/workspace-connect` - Connect Slack workspace

## Build

```bash
npm run build
```

## Next Steps

- [ ] Set up PostgreSQL database
- [ ] Configure JWT secret
- [ ] Test auth flow
- [ ] Connect Slack workspace
- [ ] Deploy to production

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, React Router, React Query
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT
- **Integrations**: Slack API
