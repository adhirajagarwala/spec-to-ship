# Spec to Ship

> A product execution workspace that turns raw notes into linked PRDs, engineering tasks, and release updates — without losing the thread.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Spec to Ship compresses the idea → spec → build → release workflow into one traceable system. Paste messy notes or a meeting transcript, get a structured PRD draft. Approve the PRD, get a task breakdown. Close the tasks, get a changelog draft — with every artifact linked back to the original problem.

---

## The Problem

Teams consistently lose momentum between idea, specification, implementation, and release. Notes pile up in Notion. Tickets drift from their original intent in Jira. Release notes get written from memory the night before launch. Nobody can trace why a decision was made three sprints ago.

Spec to Ship gives the entire build cycle one source of truth with visible traceability at every step.

---

## Features

- **Note-to-PRD generation** — paste raw notes, transcripts, or bullet points and get a structured PRD draft with assumptions and open questions surfaced
- **PRD-to-tasks extraction** — generate milestones, tasks, and dependency links directly from PRD sections
- **Traceability links** — every task links back to the PRD paragraph it came from; every PRD links back to the source notes
- **Release notes drafting** — generate a changelog from completed tasks, not from memory
- **Block-based editor** — all generated content is editable blocks, not locked output
- **Review and approval states** — draft → approved → in build → shipped
- **Public share links** — share a read-only polished spec with stakeholders or external collaborators
- **Open questions tracker** — unresolved questions are surfaced explicitly, not buried in prose

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Block editor | Custom block model (similar to Notion's editor architecture) |
| Backend API | tRPC, Prisma |
| Database | PostgreSQL 15 |
| Background jobs | BullMQ |
| AI layer | Pluggable provider (OpenAI / Anthropic) |

---

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (for BullMQ)

---

## Quick Start

```bash
# Clone
git clone https://github.com/your-org/spec-to-ship.git
cd spec-to-ship

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Fill in DATABASE_URL, AI_API_KEY, NEXTAUTH_SECRET

# Run migrations
npm run db:migrate

# Seed with example workspace (optional)
npm run db:seed

# Start
npm run dev
```

Open `http://localhost:3000`. Create a workspace, paste some notes, and generate your first PRD draft.

---

## Configuration

```env
# Database
DATABASE_URL=postgresql://localhost:5432/spec_to_ship

# Redis
REDIS_URL=redis://localhost:6379

# Auth (NextAuth)
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# AI provider
AI_PROVIDER=openai           # openai | anthropic
AI_API_KEY=

# Optional: public share link base URL
PUBLIC_SHARE_BASE_URL=http://localhost:3000/share
```

---

## How It Works

```
Raw notes
    ↓  [paste or import]
Source document (editable blocks)
    ↓  [Generate PRD]
PRD draft: goals, requirements, assumptions, open questions
    ↓  [Approve + Extract Tasks]
Milestones → Tasks → Dependencies  (each linked to source PRD section)
    ↓  [Work happens]
Tasks move through: To Do → In Progress → Done
    ↓  [Draft Release Notes]
Changelog: generated from completed task descriptions + linked PRD context
```

Every generated block shows its source. Every task shows the requirement that created it.

---

## Repository Structure

```
apps/
  web/
    app/                    # Next.js App Router pages
    components/
      editor/               # Block-based rich text editor
      prd/                  # PRD view and generation UI
      tasks/                # Task board and dependency graph
    server/
      routers/              # tRPC routers
      services/             # PRD generation, task extraction, release drafting
    prisma/
      schema.prisma
```

---

## MVP Scope

- Workspace, project, and document model
- PRD generator from raw notes
- Task extraction with dependency mapping
- Release notes draft generation
- Read-only public share link for polished specs

## Roadmap

- [ ] GitHub and Linear integration (sync tasks bidirectionally)
- [ ] Slack notifications on spec approval or status change
- [ ] Team collaboration with comments and @mentions
- [ ] Version history with diff view between PRD drafts
- [ ] Template library for common PRD structures

---

## Self-Hosting

Spec to Ship is fully self-hostable. Provide a Postgres database, Redis instance, and an AI API key. A `docker-compose.yml` for local deployment is included. See [docs/self-hosting.md](docs/self-hosting.md) for production deployment with Railway, Fly.io, or a VPS.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The block editor and the PRD generation prompt layer are the most active areas of development.

## License

[MIT](LICENSE)

## Local Prototype

This folder now includes a lightweight notes-to-PRD starter:

```bash
npm test
npm run dev
```

Implemented pieces:

- `src/generate.js`: note-to-plan transformation
- `src/server.js`: local generation API
- `web/`: simple browser UI
