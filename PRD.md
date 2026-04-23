# PRD: Spec to Ship

**Status:** Draft  
**Last Updated:** 2026-04-20  
**Estimated MVP:** 8 weeks, 1–2 engineers

---

## Product Summary

Spec to Ship is a workflow platform that turns ambiguous ideas into executable product plans. It helps teams move from raw notes and meeting transcripts to PRDs, tasks, milestones, and release communication — without losing traceability between the original problem and what actually shipped.

---

## Problem Statement

Most product execution breaks in the handoff layer:

- Brainstorms live in one tool, specs in another, tickets in a third
- PRDs become stale within days of being approved and are never updated
- Engineering tasks drift from their original intent with no audit trail
- Release notes are assembled the night before launch from memory or Slack threads
- Stakeholders can't trace how a feature's scope evolved or why decisions changed

Teams need one workflow that preserves continuity across the entire build cycle, from messy idea to shipped changelog.

---

## Goals

| Goal | Target | Measurement |
|---|---|---|
| Shorten idea-to-spec time | From avg ~3 hours → < 45 min | Time from workspace creation to approved PRD |
| Improve task-to-requirement traceability | > 90% of tasks linked to a source PRD block | Traceability coverage query |
| Reduce release note prep time | 70% reduction | Self-reported time, measured in onboarding survey |
| Generated content acceptance rate | > 60% of AI-generated blocks kept without edit | Blocks kept ÷ total generated |
| User retention | 50% of workspaces active at 14 days | Active workspace rate |

---

## Non-Goals

- Replacing Jira, GitHub Issues, or Linear entirely on day one (integration > replacement)
- Becoming a general-purpose documentation platform like Notion
- Fully automating product management decisions or writing PRDs without human review
- Real-time collaborative editing (multiplayer) in MVP

---

## Target Users

- Startup founders managing product without a dedicated PM
- Product managers at early-stage or growth-stage companies
- Engineering leads who own their own roadmap
- Design-engineering hybrid teams (3–12 people)

---

## User Personas

### Jamie — Founder/PM Hybrid
Runs weekly "what are we building next" sessions from notes and voice memos. Wastes an hour every time structuring them into something engineering can act on. Wants that hour back.

### Marcus — Engineering Lead
Gets handed vague specs with no task breakdown. Has to interpret requirements and often builds the wrong thing. Wants requirements linked to tasks so he can trace scope changes.

### Priya — PM at Growth Stage Company
Writes the PRD, then writes the Jira tickets, then writes the release notes. Three separate documents, no links between them, all done manually. Wants one system.

---

## Core Use Cases

### Use Case 1: Notes to PRD

**Trigger:** User creates a new project and pastes raw notes, bullet points, or a meeting transcript.

**Flow:**
1. User creates a project in a workspace.
2. User creates a "Source" document and pastes or types raw input.
3. User clicks "Generate PRD."
4. System sends source content to AI with a structured PRD prompt.
5. PRD draft created as a new document with named sections:
   - Problem Statement
   - Goals (with placeholder metrics)
   - Non-Goals
   - Target Users
   - Requirements (functional)
   - Open Questions
   - Assumptions
6. Each generated block tagged with `source_ref` pointing to the relevant source paragraph.
7. User edits sections, resolves open questions, and approves.
8. Document status moves to `approved`.

**Acceptance Criteria:**
- Generation must complete within 15 seconds for source input up to 5,000 characters.
- Every generated PRD section must be an individually editable block.
- Every generated block must store a `source_ref` linking it to the originating source block.
- Open Questions section must list at least 3 unresolved questions identified in the source, or be empty with a visible "none detected" state.
- No section may be locked; the user must be able to delete, rewrite, or reorder any section.
- Generated output must be presented in the same editor as all other documents — not in a modal or preview pane.

---

### Use Case 2: PRD to Task Extraction

**Trigger:** User clicks "Extract Tasks" on an approved PRD document.

**Flow:**
1. System reads the approved PRD.
2. AI identifies discrete work items from the Requirements section.
3. Tasks created with: title, description, estimated complexity (S/M/L), linked PRD block reference.
4. Dependencies inferred where mentioned explicitly ("before X can happen, Y must be done").
5. Tasks grouped into milestones based on logical phases detected in the PRD.
6. Task board view rendered with milestone groupings.

**Acceptance Criteria:**
- Each extracted task must store a `prd_block_id` FK to the requirement it came from.
- Clicking a task must show the originating PRD paragraph inline (traceability view).
- Extracted dependencies must be editable; the system's inferred dependencies are a starting point, not final.
- Users must be able to add tasks manually that are also linked to a PRD block.
- Tasks must have statuses: `todo`, `in_progress`, `done`, `cancelled`.
- Milestones must have statuses: `planned`, `in_progress`, `complete`.

---

### Use Case 3: Release Notes Draft

**Trigger:** User clicks "Draft Release Notes" after marking a milestone as complete.

**Flow:**
1. System collects all `done` tasks in the milestone.
2. For each task: reads its description and linked PRD section.
3. Generates a release notes document grouped by: new features, improvements, bug fixes (inferred from task descriptions).
4. Each release note entry links back to the task and original PRD requirement.
5. User reviews, edits, and approves.
6. Approved release notes can be exported as Markdown or shared via a public link.

**Acceptance Criteria:**
- Release notes must only include tasks with status `done` at the time of generation.
- Generated entries must be grouped into at minimum: Features, Improvements, Fixes.
- Every entry must include a link to its source task.
- User must be able to reorder entries, merge entries, and delete any entry.
- Export must produce a clean Markdown file with no internal IDs or metadata visible.

---

### Use Case 4: Public Spec Sharing

**Trigger:** User clicks "Share" on any document and enables public link.

**Flow:**
1. A `share_token` is generated for the document.
2. Public URL: `/share/<token>` renders a read-only view.
3. Internal metadata (source refs, approval history, open questions) are hidden in the public view.
4. Share can be revoked at any time (token invalidated).

**Acceptance Criteria:**
- Public view must render document content only — no editor controls, no workspace chrome.
- Revoking a share must make the URL return 404 within 30 seconds.
- Public links must not require authentication.
- Internal blocks marked `internal: true` must not appear in the public view.

---

## API Endpoints

```
# Workspaces
GET   /api/workspaces
POST  /api/workspaces
GET   /api/workspaces/:id
DELETE /api/workspaces/:id

# Projects
GET   /api/workspaces/:wid/projects
POST  /api/workspaces/:wid/projects
GET   /api/projects/:id
PUT   /api/projects/:id
DELETE /api/projects/:id

# Documents
GET   /api/projects/:pid/documents
POST  /api/projects/:pid/documents
GET   /api/documents/:id
PUT   /api/documents/:id           # Updates metadata (title, status)
DELETE /api/documents/:id

# Blocks
GET   /api/documents/:did/blocks
POST  /api/documents/:did/blocks
PUT   /api/blocks/:id
DELETE /api/blocks/:id
POST  /api/blocks/:id/reorder      # Body: { after_block_id }

# Generation
POST  /api/documents/:did/generate-prd    # Body: { source_doc_id }
POST  /api/documents/:did/extract-tasks   # Requires document type=prd, status=approved
POST  /api/projects/:pid/draft-release-notes  # Body: { milestone_id }

# Tasks
GET   /api/projects/:pid/tasks
POST  /api/projects/:pid/tasks
PUT   /api/tasks/:id               # Update status, description, complexity
DELETE /api/tasks/:id

# Milestones
GET   /api/projects/:pid/milestones
POST  /api/projects/:pid/milestones
PUT   /api/milestones/:id

# Sharing
POST  /api/documents/:id/share     # Create or refresh share token
DELETE /api/documents/:id/share    # Revoke share
GET   /share/:token                # Public (unauthenticated) read-only view
```

All `/api/*` routes require a session token (NextAuth JWT in cookie). `GET /share/:token` is unauthenticated.

---

## Data Model

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  name          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE workspaces (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  owner_id      UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'archived')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('source', 'prd', 'release_notes', 'other')),
  title         TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'approved', 'in_build', 'shipped')),
  share_token   TEXT UNIQUE,
  generated_from UUID REFERENCES documents(id),  -- source doc that seeded this PRD
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE document_blocks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN (
                  'heading', 'paragraph', 'bullet_list', 'task_list',
                  'open_question', 'assumption', 'callout'
                )),
  content       JSONB NOT NULL,         -- { text, children, marks, etc. }
  source_ref    UUID REFERENCES document_blocks(id),  -- traceability link to source block
  internal      BOOLEAN NOT NULL DEFAULT false,
  position      INT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_blocks_document_position ON document_blocks (document_id, position);

CREATE TABLE milestones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'planned'
                  CHECK (status IN ('planned', 'in_progress', 'complete')),
  position      INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id  UUID REFERENCES milestones(id),
  prd_block_id  UUID REFERENCES document_blocks(id),  -- traceability link to requirement
  title         TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'todo'
                  CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
  complexity    TEXT CHECK (complexity IN ('S', 'M', 'L', 'XL')),
  position      INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tasks_project_status ON tasks (project_id, status);

CREATE TABLE task_dependencies (
  task_id       UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, depends_on_id)
);
```

---

## Block Content Schema (JSONB)

Each `document_blocks.content` field follows:

```json
{
  "text": "Plain text representation",
  "children": [
    { "text": "segment", "bold": true }
  ],
  "checked": false,       // task_list blocks only
  "level": 2             // heading blocks only (1-3)
}
```

---

## Generation Layer: Prompt Strategy

### Notes → PRD

System prompt instructs the model to produce sections in order with explicit XML-tag delimiters (`<section name="problem_statement">...</section>`) so the backend can parse sections into discrete blocks with correct types.

Response parsed server-side: each `<section>` tag maps to a `heading` block followed by `paragraph` blocks. Open questions extracted from the source are tagged `<open_question>`.

### PRD → Tasks

System prompt asks the model to output a JSON array:
```json
[
  {
    "title": "...",
    "description": "...",
    "complexity": "M",
    "source_text": "...",   // exact quote from PRD requirement block
    "milestone": "...",
    "depends_on": []
  }
]
```

Source text used to fuzzy-match back to the originating `document_block.id` for traceability.

### Tasks → Release Notes

System prompt: summarize task descriptions grouped by type (feature / improvement / fix), inferred from task titles and PRD context. Output as structured JSON array.

---

## Auth and Security

- **Auth provider:** NextAuth.js with email/password + optional GitHub OAuth
- **Session:** JWT stored in HTTP-only cookie, 30-day expiry
- **Authorization:** All data access scoped to `workspace_id` through the authenticated user; users can only access workspaces they own or have been invited to
- **Public share:** Share tokens are UUIDs (128-bit entropy); no auth required; revocable instantly
- **AI calls:** User's AI provider API key stored encrypted in DB (AES-256); not transmitted to client

---

## Success Metrics

| Metric | Baseline | Target | Measurement |
|---|---|---|---|
| Time from notes to approved PRD | ~3 hours (estimated) | < 45 min | Timestamp: workspace created → doc status=approved |
| Task traceability coverage | 0% | > 90% of tasks have prd_block_id | DB query |
| Generated block acceptance | — | > 60% kept unedited | Blocks with no edits ÷ total generated |
| Release note prep time | — | 70% reduction | Onboarding survey at day 14 |
| Workspace retention at 14 days | — | > 50% | Active workspace count |

---

## Risks and Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Users distrust generated requirements if provenance is unclear | High | Source ref links on every block; always editable-first |
| Over-generated tasks create noise | Medium | User controls task extraction; can delete bulk |
| Existing tool habits hard to replace | Medium | Export to Markdown + JSON; Linear/GitHub integration in roadmap |
| AI generation latency feels slow | Medium | Streaming response rendering; progress indicator |
| Block editor complexity is high to build | High | Use established pattern (ProseMirror or Tiptap); do not build editor from scratch |

---

## Third-Party Dependencies

| Service | Purpose | Notes |
|---|---|---|
| Next.js + tRPC + Prisma | Full-stack framework | Well-documented, type-safe |
| Tiptap (ProseMirror) | Block editor | MIT licensed; extensible; avoids building editor from scratch |
| NextAuth.js | Auth | Handles sessions, OAuth, JWT |
| OpenAI / Anthropic | PRD generation, task extraction, release notes | ~$0.01–0.05 per generation at GPT-4o-mini / claude-haiku |
| BullMQ + Redis | Async generation jobs | Redis Cloud free tier covers MVP |
| PostgreSQL | Primary datastore | Railway / Supabase free tier for MVP |
| Resend | Email auth tokens | Free tier covers MVP |

---

## Sprint Breakdown (8 weeks, 1–2 engineers)

**Sprint 1 (Weeks 1–2):** Data Model + Auth
- PostgreSQL schema + Prisma setup
- NextAuth email + GitHub OAuth
- Workspace, project, document CRUD APIs
- Basic document list UI

**Sprint 2 (Weeks 3–4):** Block Editor + Source Documents
- Tiptap-based block editor (heading, paragraph, bullet, open question blocks)
- Source document creation and editing
- Block reorder, add, delete

**Sprint 3 (Weeks 5–6):** Generation Flows
- Notes → PRD generation (streaming response rendering)
- PRD → task extraction with traceability links
- Task board view with milestone groupings

**Sprint 4 (Weeks 7–8):** Release Notes + Share + Polish
- Release notes draft generation from completed tasks
- Public share link (read-only view, revocable)
- Document status workflow (draft → approved → in build → shipped)
- Markdown export
- End-to-end tests + private beta

---

## Testing Requirements

- **Unit:** PRD section parser (section XML tags → block types); task extraction JSON parser; source_ref fuzzy matcher
- **Integration:** Notes → PRD → tasks pipeline with mocked AI responses
- **E2E:** Create workspace → paste notes → generate PRD → extract tasks → mark milestone complete → draft release notes
- **Share link:** Revocation takes effect within 30 seconds; internal blocks excluded from public view
- **Auth:** Session expiry enforced; users cannot access other workspaces via direct ID guessing (IDOR test)
- **Performance:** PRD generation responds with first streamed token within 3 seconds; full PRD within 15 seconds

---

## Open-Source Strategy

- Core platform under MIT license
- Paid hosted tier for teams wanting SSO, team invites, and AI usage included
- Public templates for common PRD structures (B2B SaaS, consumer app, API product, internal tool)
