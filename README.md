# MyFlow

## Project Overview

MyFlow is a task management application built with React and TypeScript. It helps users organize their tasks using a Kanban board with three statuses: To Do, In Progress, and Done.

Each user has a personal account and can manage their own tasks.

## Features

- User registration and login
- Secure password hashing
- Session-based authentication
- Create, update, and delete tasks
- Change task status using a dropdown menu
- Separate tasks for each user
- Persistent data storage using SQLite

## Technologies

- React
- TypeScript
- Node.js
- Express
- SQLite with better-sqlite3
- Vitest
- CSS

## Installation and Setup

### Prerequisites

- Node.js
- npm

### 1. Clone the repository

```bash
git clone https://github.com/jessybcn/MyFlow.git
cd MyFlow
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Start the backend

From the `server` directory, run:

```bash
npx tsx index.ts
```

The backend runs at:

`http://localhost:3000`

### 5. Start the frontend

Open a second terminal in the project root directory and run:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Database

MyFlow uses SQLite to store users and tasks. The database is initialized automatically when the backend starts.

## Environment Variables

The backend supports the `SESSION_SECRET` environment variable for session security.

For local development, a development fallback is configured. For production, set a strong secret through the hosting provider's environment settings. Never commit secrets to the repository.

## Testing

Run the frontend tests from the project root:

```bash
npm run test -- --run
```

Run the frontend production build:

```bash
npm run build
```

Check the backend TypeScript code:

```bash
cd server
npx tsc --noEmit
```

## Deployment

## Deployment

The application has not been deployed yet.
## Future Improvements

- Deploy the application to a hosting platform.
- Add drag-and-drop functionality to the Kanban board.
- Improve task filtering and search.
- Add task due dates and priorities.
