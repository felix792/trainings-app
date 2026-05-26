# TactIQ — Project Reference

## What this is
A **football coaching PWA** (Progressive Web App). Plain HTML + vanilla JS + CSS — no framework, no npm, no build step. Firebase Auth (Google OAuth) + Firestore for backend. Deployed to **GitHub Pages** at `https://felix792.github.io/trainings-app/`.

GitHub repo: `felix792/trainings-app`

---

## Tech stack
| Layer | Choice |
|---|---|
| Frontend | Plain HTML / vanilla JS / CSS (no framework) |
| Auth | Firebase Auth — Google OAuth only |
| Database | Firestore + `localStorage` (localStorage is primary, synced to Firestore) |
| Hosting | GitHub Pages |
| PWA | Service worker (`sw.js`) — network-first strategy |
| Deploy | `deploy.ps1` — pushes files via GitHub REST API |

---

## File map

| File | Purpose |
|---|---|
| `index.html` | Home / team list (main entry point) |
| `team.html` + `team.js` | Individual team page |
| `settings.html` + `settings.js` | Settings page (head-coach only): invites, members, player permissions, coach system |
| `profile.html` + `profile.js` | User profile: photo, display name, email, sign out, team switch |
| `players.html` | Player list for a team |
| `player.html` + `player.js` | Individual player profile page |
| `cards.html` + `cards.js` | Player cards view |
| `blackbox.html` + `blackbox.js` | BlackBox — private coach notes section |
| `exercises.html` + `exercises.js` | Exercise library |
| `exercise.html` + `exercise.js` | Individual exercise |
| `plays.html` + `plays.js` | Tactical plays |
| `play.html` + `play.js` | Individual play |
| `stats.html` + `stats.js` | Game stats |
| `stat.html` + `stat.js` | Individual stat |
| `points.html` + `points.js` | Points / leaderboard |
| `db.js` | **Core** — auth flow, role system, Firestore sync, all exposed globals |
| `styles.css` | All CSS (one file, ~2200+ lines) |
| `sw.js` | Service worker — currently `tactiq-v17` |
| `deploy.ps1` | Deployment script — pushes files to GitHub via REST API |
| `firebase-config.js` | Firebase project config (do not edit) |
| `manifest.json` | PWA manifest |

---

## Role system (membership model)

Three roles exist:
| Role | Access |
|---|---|
| `head-coach` | Full access — edit team, manage settings/invites/permissions, see BlackBox |
| `assistant-coach` | Full team edit access — no settings/invite management |
| `player` | Read-only, restricted by head-coach's permission settings |

### Firestore data model

**`users/{uid}`**
```json
{
  "memberships": [
    { "teamId": "uuid", "teamName": "FC Tigers", "role": "head-coach", "ownerUid": "uid", "joinedAt": 1234567890 }
  ],
  "teams": "<JSON string — team data, head-coach only>",
  "playerPermissions": { "players": true, "exercises": true, ... },
  "coachSystem": "multi",
  "displayName": "Felix",
  "profilePhoto": "<base64 128×128 JPEG data URL>",
  "updatedAt": 1234567890
}
```

**`invites/{6-CHAR-CODE}`**
```json
{
  "ownerUid": "uid-of-head-coach",
  "teamId": "uuid",
  "teamName": "FC Tigers",
  "role": "assistant-coach | player",
  "label": "Max (striker)",
  "used": false,
  "usedBy": null,
  "usedByName": null,
  "createdAt": 1234567890
}
```

---

## Global state (window.*)

Set by `db.js` before `DB_READY` resolves:

| Global | Type | Description |
|---|---|---|
| `APP_ROLE` | `'head-coach' \| 'assistant-coach' \| 'player'` | Current user's role |
| `APP_OWNER_UID` | string | UID of the head-coach whose data we read |
| `APP_PERMISSIONS` | object | Player visibility settings (players only) |
| `APP_COACH_SYSTEM` | `'multi' \| 'simple'` | Badge label style |
| `APP_MEMBERSHIPS` | array | All memberships for the current user |
| `APP_COACH_UID` | alias | Read-only alias for `APP_OWNER_UID` (backward compat) |
| `DB_READY` | Promise | Resolves with `user` after auth + role setup |

---

## Exposed functions (window.*)

All defined in `db.js`:

| Function | Description |
|---|---|
| `savePlayerPermissions(perms)` | Save permission object to Firestore (head/asst coach only) |
| `saveCoachSystem(system)` | Save `'multi'` or `'simple'` coach system setting |
| `createInvite({ownerUid, teamId, teamName, role, label})` | Generate a 6-char invite code in Firestore |
| `getInvites(ownerUid)` | Fetch all invites for a head-coach |
| `deleteInvite(code)` | Revoke an invite code |
| `loadProfileData()` | Returns `{ displayName, email, photoURL }` for current user |
| `saveProfileData({ displayName, photo })` | Save profile name / base64 photo to Firestore |
| `showTeamSelector()` | Show the membership selector modal (multi-team users) |
| `signOut()` | Firebase sign-out |
| `getTeamCode()` | Returns `APP_OWNER_UID` |

---

## Auth / login flow

```
Sign in with Google
  ↓
Load users/{uid}
  ↓
Has profile.memberships?
  NO (or role but no memberships) → migrate OR show "Create Team / Join Team" welcome screen
  YES, 1 membership → auto-activate
  YES, 2+ memberships → show membership selector modal
```

**Backward-compat migration**: old accounts with `profile.role = 'coach'` → auto-migrated to `head-coach` membership. Old `role = 'player'` → `player` membership.

**Team switching**: sets `sessionStorage.tiq_active_mem` and navigates to `index.html`.

---

## CSS conventions
- All CSS in `styles.css` (single file, no modules)
- Prefix classes by page/feature: `sp-*` (settings page), `prof-*` (profile page), `perm-*` (permissions), `invite-*` (old drawer styles)
- Dark theme variables: `--bg`, `--surface`, `--border`, `--text`, `--text-muted`, `--green` (`#16a34a`)
- Mobile breakpoint: `@media (max-width: 640px)`

---

## Settings page sections

Accessed via the gear icon on `team.html` (head-coach only), URL: `settings.html?id=<teamId>`

| Section | `data-section` | What it does |
|---|---|---|
| Invite Members | `invite` | Generate 6-char invite codes (player or asst. coach) |
| Members | `members` | List users who joined via invite |
| Player Permissions | `permissions` | Toggle which app sections players can see |
| Coach System | `coachsystem` | Toggle between Simple (all "Coach") and Multi-tier (Head/Asst.) |

---

## Deployment

```powershell
# Run deploy.ps1 — prompts for GitHub PAT, pushes all listed files via REST API
.\deploy.ps1
```

Files pushed: `db.js`, `player.js`, `player.html`, `players.html`, `team.html`, `team.js`, `settings.html`, `settings.js`, `profile.html`, `profile.js`, `cards.html`, `cards.js`, `blackbox.html`, `blackbox.js`, `styles.css`, `sw.js`

After pushing, **GitHub Pages redeploys in ~1 minute**. Hard-refresh with Ctrl+Shift+R in incognito to bypass browser cache.

---

## Service worker cache

Version lives at the top of `sw.js` as `const CACHE = 'tactiq-vN'`. **Bump the version number every deploy** so users get fresh files. Current: `tactiq-v17`.

---

## Known quirks
- `localStorage` holds the team data JSON as a string under key `football_coach_teams`
- Sync to Firestore is debounced 1.5s after any localStorage write
- `assistant-coach` reads from the head-coach's Firestore doc but writes go to the same doc (no separate storage)
- Profile photos are stored as base64 JPEG data URLs (~3–8 KB) directly in Firestore — no Firebase Storage needed
- The `multiTeam` variable in `injectUserBadge` is no longer used for click routing (click always goes to `profile.html`)
