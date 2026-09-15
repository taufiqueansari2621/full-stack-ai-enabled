# Unit 01: Local Learning System and Functional Workspaces

## Goal

Turn Forge from a visual prototype into a usable local-first learning environment. Learner activity must survive refreshes and every primary navigation item must provide a complete action loop.

## Design

- Preserve the existing Forge visual language and responsive shell.
- Use localStorage through one versioned, defensive repository hook.
- Clearly identify saved state and provide feedback after meaningful actions.
- Practice, knowledge, progress, mentor, projects, reviews, lesson completion, search, and interview controls must produce visible results.

## Implementation

### Durable learner state

- Store XP, completed lessons, practice attempts, completed reviews, notes, mistakes, project tasks, interview results, and activity dates.
- Parse persisted data defensively and recover with defaults when corrupted.
- Expose narrow actions; feature components do not write storage directly.

### Practice environment

- Provide multiple challenge types with answer submission, correctness feedback, explanations, hints, reset, and next challenge.
- Persist attempts and award XP once per successful challenge.

### Knowledge workspace

- Create, filter, and delete notes and mistakes.
- Persist entries with timestamps and related topics.

### Projects

- Open a project workspace, show milestones, and toggle tasks.
- Persist project completion and calculate progress from tasks.

### Reviews and lessons

- Persist review completion and lesson completion.
- Reflect activity in progress analytics.

### Interview

- Score submitted answers with a transparent local rubric and save sessions.
- Show actionable feedback before moving forward.

### Global controls

- Implement search with keyboard shortcut and navigable results.
- Add useful notification/settings surfaces or remove inert controls.
- Ensure every visible button performs an action.

## Dependencies

- Existing React/Vite application only.

## Verify when done

- [ ] Learning state survives reload.
- [ ] Practice answer, hint, reset, and next challenge work.
- [ ] Notes and mistakes can be created and removed.
- [ ] Project task progress persists.
- [ ] Review and lesson completion persist.
- [ ] Interview answers receive feedback and sessions persist.
- [ ] Search and top-bar controls work.
- [ ] No obvious inert buttons remain.
- [ ] No browser console errors.
- [ ] Responsive at mobile and desktop.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

