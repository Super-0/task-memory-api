# Task Memory API

A lightweight backend API for storing personal memories, tasks, and calendar-style events, with reminder dispatch support built on top of Express, Prisma, and SQLite.

## Overview

This project explores a simple backend architecture for personal productivity and assistant-style workflows. It provides REST endpoints for structured records, lightweight search/relevance scoring, and a reminder job flow that can either log reminders or forward them to an external event system.

## Features

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

## Notes

The default configuration uses SQLite for simplicity and easy local setup. Reminder dispatch can either log reminders or send them into a generic system-event flow or simply log them depending on environment configuration.
