# Cosmic Arcana — AI Service

The fortune-teller's mind. This service turns a question, a few tarot cards and a handful of context into a personal, fictional prediction.

## The idea

Cosmic Arcana is an AI-native fortune-telling experience.

A user asks a question — about a decision, a relationship, a career move, or simply what the coming week might bring — and an AI agent answers the way a digital fortune-teller would. It draws tarot cards, looks at what is happening in the sky, remembers previous readings, and weaves everything into a personal, entertaining prediction.

The predictions are **fictional and reflective** by design. They are an invitation to think, not a claim about the future. Real-world data such as NASA imagery or astronomical events is used as storytelling material — symbolism, themes, atmosphere — and is never presented as evidence that the future can be predicted. The product always keeps a visible line between what was *retrieved from the real world* and what was *imagined*.

The core loop:

```text
User question
    ↓
Prediction / tarot request
    ↓
AI agent
    ↓
Relevant tools and context
    ↓
Optional cosmic, historical or personal context
    ↓
AI interpretation
    ↓
Fictional prediction
    ↓
Saved reading
```

## How it is being built

Cosmic Arcana is also an experiment: how far can one software engineer push Claude Code as an engineering partner?

The project is **vibe-coded**. It is built through **Claude Code Remote Control** (a session on a development machine, driven from a smartphone) **and through Cursor**. After the hackathon, about **$190 of Cursor usage credits** remain. There is no fixed schedule and no desk required. Work happens wherever the engineer happens to be — in small pockets of free time (a commute, a queue, a quiet evening) and whenever there are tokens left that are worth spending. The roadmap is shaped as much by spontaneous ideas as by a plan. A feature often starts as a thought typed on a phone and ends as a reviewed commit.

That way of working shapes the engineering:

- **Claude implements, the engineer steers.** Most of the code is delegated; architecture, service boundaries and review stay in human hands.
- **Context lives in the repositories.** Any session must be able to pick up where the previous one stopped, so knowledge is kept in `CLAUDE.md` files, progress notes, conventions, skills and hooks — not in anyone's memory.
- **Small slices.** Tasks are cut small enough to plan, implement, review and commit from a phone screen.
- **Automated quality gates.** Tests, structured logging and consistent conventions catch what a small screen might miss.
- **Multi-repository by design.** Every service lives in its own repository, which makes cross-repository context sharing part of the experiment.
- **Deliberate context budgeting.** Short sessions reward tight prompts, focused tools and small outputs — the same discipline the product asks of its own AI agent.

## The system

Cosmic Arcana is split into independent services, each in its own repository:

| Service | Role |
| --- | --- |
| **cosmic-arcana-storefront** | Web application and BFF — everything the user sees, and the only API the browser talks to |
| **ai-service-api** *(this repository)* | The fortune-teller's mind — predictions, tarot readings and all AI-specific business logic |
| **nasa-service-api** | The window to the real sky — retrieves, normalizes and caches NASA and astronomical data |
| **mcp-service-api** | The AI agent's doorway — exposes application capabilities as MCP tools, with agent authentication and on-behalf-of access |

Around them sit a few parts that do not have their own repositories yet: a **CQRS command layer** that orchestrates use cases, a **Redis / BullMQ broker** that carries domain events, a **PostgreSQL read model** that stores readings, and a **PostgreSQL MCP server** that gives the agent restricted, user-scoped database access.

```text
User
  │
  ▼
Storefront (Next.js + BFF) ◄─────────────── queries ───────────────┐
  │                                                                │
  │ commands                                                       │
  ▼                                                                │
Command layer (NestJS CQRS)                                        │
  │                                                                │
  ├──► AI service ─────┐                                           │
  └──► NASA service ───┤                                           │
                       │ domain events                             │
                       ▼                                           │
             Broker (Redis / BullMQ) ──► Read model (PostgreSQL) ──┘


AI agent (Claude) ── MCP ──► MCP service ──┬──► Command layer
                                           └──► PostgreSQL MCP ──► cosmic_agent schema (RLS)
```

## What this service does

The AI service owns everything that is specifically about *interpretation*:

- **Predictions** — composes the final reading from the user's question, the drawn cards, optional cosmic context and, when relevant, the user's previous readings.
- **Tarot readings** — the deck, the spreads, drawing cards, upright and reversed meanings, and how cards relate to one another inside a spread.
- **Talking to Claude** — all communication with the model goes through the Anthropic SDK, and only through this service. Prompts, model choice, token budgets and response shaping live here.
- **AI-specific business rules** — the voice of a fortune-teller, the fictional and reflective framing, and a clear separation between what the cards "say" and which real-world data was used as inspiration.
- **Domain events** — when a reading is produced, the service publishes an event so the reading can be stored in the read model and appear in the user's history.

### How it is reached

The AI service is internal. It has no public API and is never called by the browser. The command layer asks it to do work over service-to-service messaging, and it announces results through domain events.

### What it has to handle well

AI calls are slow, costly and occasionally unreliable, so the service is designed to be a well-behaved citizen:

- a retried request must not produce a second reading or spend tokens twice;
- transient failures are retried with backoff instead of being surfaced immediately;
- every step of a reading carries the correlation id it was given, so a reading can be traced across services;
- the user's raw question is treated as sensitive — it is used to build the reading, never written to logs.

### What it does not do

It does not fetch NASA data (it receives it), it does not store readings for display (the read model does), and it does not expose tools to external agents (the MCP service does).
