# Task Memory API

A local REST API for structured memories, tasks, events, contextual lookup, and reminder workflows. Built to explore a clear backend model for assistant-style and personal-productivity systems.

![Task Memory API architecture](https://raw.githubusercontent.com/Super-0/task-memory-api/main/docs/architecture.svg?v=3)

## Current status

**Working locally.** The API supports CRUD flows, contextual lookup, validation, and retry-safe reminder collection using Node.js, Express, Prisma, and SQLite. It is not a deployed service and does not include authentication, real-user notification delivery, or production observability.

## Problem and approach

This project explores a simple backend architecture for personal productivity and assistant-style workflows. It provides REST endpoints for structured records, lightweight search/relevance scoring, and a reminder job flow that can either log reminders or forward them to an external event system.

## What currently works

- REST API for memories, tasks, and events
- Query-based memory and context lookup
- Task status, due-date, and reminder support
- Event creation and validation with time-range checks
- Reminder dispatch job with duplicate-delivery protection
- SQLite storage via Prisma
- Modular route and utility structure

## Tech Stack

- Node.js
- Express
- Prisma ORM
- SQLite

## API Areas

### Memories
- create, list, update, delete
- simple relevance scoring for query lookups
- category, tag, and pinned fields

### Tasks
- create, list, update, delete
- due date and reminder support
- derived overdue flag in API responses

### Events
- create, list, update, delete
- start/end validation for event ranges

### Agent Context
- aggregate endpoint that returns relevant memories, open tasks, and upcoming events
- lightweight scoring to surface context for assistant-style use cases

### Reminder Jobs
- background-friendly reminder collection and dispatch flow
- duplicate reminder prevention via delivery records
- optional forwarding to a generic system-event command

## Project Structure

```text
task-memory-api/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── lib/
│   ├── routes/
│   ├── reset.js
│   ├── seed.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Server default:

```text
http://localhost:3001
```

## Example Endpoints

- `GET /health`
- `GET /memories?q=travel`
- `POST /tasks`
- `PATCH /tasks/:id`
- `GET /events`
- `GET /agent/context?q=interview`
- `POST /jobs/reminders/run`

## What This Project Demonstrates

- Backend API design with route separation
- Relational data modeling with Prisma
- Input validation and response shaping
- Lightweight search/scoring logic
- Job-style reminder processing
- Preparing a backend for assistant or productivity workflows

## Known limitations / production next steps

- **Local-first storage:** SQLite is intentional for simple setup; a hosted deployment would need managed persistence and migration/backup strategy.
- **No authentication:** endpoints are designed for local development, not public exposure.
- **No production notification service:** reminder dispatch is a workflow boundary, not a claim of delivered notifications.
- **No scale claim:** this is a portfolio backend API, not a multi-user production system.

The default configuration uses SQLite for simple, reproducible setup. Reminder dispatch can log reminders or forward them to a generic system-event flow depending on environment configuration.
