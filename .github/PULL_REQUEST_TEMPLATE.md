# Pull Request

## Summary

Describe what changed and why.

- 
- 

## Type of Change

Select all that apply.

- [ ] Bug fix
- [ ] New feature
- [ ] UI/UX update
- [ ] Refactor
- [ ] Documentation
- [ ] Build, tooling, or dependency change
- [ ] Tests only

## Related Issues

Link any related issues, tickets, specs, or discussions.

- Closes #
- Related to #

## User Impact

Describe what users will notice, including any behavior changes, visual changes, or API/provider changes.


## Implementation Notes

Call out important technical decisions, tradeoffs, migrations, or areas reviewers should inspect closely.


## Screenshots or Recordings

Include before/after screenshots or recordings for UI changes.

| Before | After |
| ------ | ----- |
|        |       |

## Test Plan

List the verification steps you ran and the expected result.

- [ ] `npm run lint` passes
- [ ] `npm run build` passes (TypeScript clean, all routes compile)
- [ ] Manually tested the affected workflow in `npm run dev`
- [ ] Verified light and dark theme + density toggles, if UI changed
- [ ] Verified affected SQL against Pagila (`npm run db:psql`) — queries use parameterized `$1, $2, …` arguments
- [ ] Confirmed server actions call `revalidatePath` for the routes they mutate
- [ ] Added or updated automated tests, if applicable

Commands run:

```sh

```

## Next.js 16 Checklist

This repo is on Next.js 16 — APIs differ from earlier versions (see `AGENTS.md`).

- [ ] Consulted `node_modules/next/dist/docs/` before adding any new route/handler/action
- [ ] `params` and `searchParams` are awaited (they are `Promise`s in Next 16)
- [ ] `cookies()` and `headers()` are awaited
- [ ] No new runtime dependencies added without discussion


