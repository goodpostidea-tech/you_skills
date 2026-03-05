# YouSkills

Visual Management for Local Skills.

[![npm version](https://img.shields.io/npm/v/you-skills.svg)](https://www.npmjs.com/package/you-skills)

YouSkills is a **visual manager for local AI skills**. It scans standard skill folders on your machine (Codex / Cursor / OpenClaw / custom paths) and shows them in a clean web UI, while staying **strictly read‑only** and **agent‑friendly**.

---

## Features

- **Local‑only visualization**
  - Scans standard skill roots (e.g. `~/.codex/skills`, `~/.cursor/skills`, `~/.openclaw/skills`, `~/.agents/skills`) and user‑specified paths.
  - Card view and list view with rich filters.

- **Strictly read‑only**
  - Never edits, renames or deletes any files inside your skill directories.
  - Only reads metadata / `SKILL.md` and stores its own cache under `~/.you-skills/`.

- **Classification with local cache**
  - Three schemes:
    - **Output‑centric skills** (`by_output`)
    - **Workflow‑centric skills** (`by_scenario`)
    - **Role‑centric skills** (`by_role`)
  - Leaf categories have Chinese + English labels and can be changed by the user.
  - All user changes are written to a local cache file, not to the skills themselves.

- **Themes**
  - 11 built‑in color themes (default light gray, matcha green, apricot, lavender, midnight tomato, sea‑salt teal, lotus pink, glacier dark, terracotta, lava black & gold, chalk blue).
  - Switch themes in the UI; the choice is persisted to `~/.you-skills/config.json`.

- **Internationalization**
  - First version ships with **Chinese + English**.
  - The landing / consent flow and navigation include a language toggle (`中 / EN`).

- **Agent‑friendly HTTP API**
  - Simple JSON endpoints like `/api/skills` and `/api/manifest` so agents can introspect the same local skills.

---

## Quick start

Requires **Node.js 18+**.

### Install via npm / npx

```bash
# One-off run (no global install)
npx you-skills

# Or install globally
npm install -g you-skills
you-skills
```

### Run from source

```bash
git clone <this-repo>
cd you_skills

npm install
npm run build
npm start    # opens http://localhost:12434
```

By default the app opens `http://localhost:12434` in your browser.

---

## Port & environment variables

- **Port**: `12434`
- **URL**: `http://localhost:12434`

Optional environment variables:

- `CODEX_HOME`: Codex home directory (defaults to `~/.codex`)
- `CURSOR_HOME`: Cursor home directory (defaults to `~/.cursor`)

If no skills are found under the default paths, the landing page asks you to enter or pick a custom root directory.

---

## API (for agents / integrations)

- `GET /api/skills?root=`
  - List skills under the default roots or a custom `root` path.
  - Response includes `path`, `name`, `description`, `category`, and more.

- `GET /api/skills/manifest` / `GET /api/manifest`
  - Returns a structured manifest, suitable for agents to load all available skills at once.

- `PATCH /api/skills/category`
  - Update the category for one skill.
  - Body example:
    ```json
    { "path": "/absolute/path/to/skill", "category": "Document skills" }
    ```
  - Writes to `~/.you-skills/category-cache.json` only.

- `GET /api/browse?path=`
  - List sub‑directories under a given path, used by the UI when picking a root directory.

- `GET /api/config`
  - Read current configuration: `classification_scheme_id`, `theme_id`, and scheme metadata.

- `PATCH /api/config`
  - Update configuration. Body example:
    ```jsonc
    {
      "classification_scheme_id": "by_output" | "by_scenario" | "by_role",
      "theme_id": "default" | "matcha" | "apricot" | ...
    }
    ```

---

## Classification & cache

- **Schemes**
  - `by_output` – Output‑centric skills.
  - `by_scenario` – Workflow‑centric skills.
  - `by_role` – Role‑centric skills.

- **Leaf categories** (examples)
  - Output‑centric: *File generation*, *Web & interface*, *Tools & integrations*, *Content & writing*.
  - Workflow‑centric: *Office documents*, *Design & visuals*, *Development & build*, *Knowledge & reference*.
  - Role‑centric: *Managers & ops*, *Designers*, *Developers & engineers*, *Data analysts*, *HR / Legal / Admin*, *Marketing & brand*.

- **Cache file**
  - `~/.you-skills/category-cache.json`
  - Maps absolute skill paths to the final category chosen by the system + the user.

At scan time the app:

1. Reads the cache first.
2. If there is no entry, infers a category from the skill’s `name` / `description` using regex‑based rules.
3. Writes the result back to the cache.
4. Allows the user to override the category from the UI; overrides also go into the cache.

---

## Development

```bash
# build server only (debug API)
npm run build:server

# build client only
npm run build:client

# during development: build server, then run Vite dev server for the client
npm run build:server && npm run dev:client

# run the built server in another terminal
node dist/server/index.js
```

---

## Security & privacy

- Reads from local skill directories **only**; there is no login, no telemetry and no remote upload.
- The app **never** writes to, renames or deletes any user skill files or directories.
- All persistent state lives under `~/.you-skills/`:
  - `config.json` – classification scheme + theme id.
  - `category-cache.json` – path → category cache for classification.

---

## Fun facts

- **Why port `12434`?**  
  It is a small easter egg: the number echoes the average monthly salary in Shanghai in 2025. Easy to remember, and a quiet nod to everyday developers.

- **Why `YouSkills`, not `YourSkills`?**  
  From an AI’s point of view, humans themselves are becoming collections of skills.  
  The name `YouSkills` is a hint that *you* and your skills are both first‑class citizens here — it's about **“you = skills”**, not just “your skills” as external objects.

