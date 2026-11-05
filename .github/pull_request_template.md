## 📌 What changed?

<!-- A short summary of the change. One or two sentences. -->

## 🎯 Why?

<!-- 
- Link the related issue if any: Closes #123
- Explain the motivation (bug, feature request, refactor, tech debt)
-->

## 🧪 How to test?

<!-- 
Steps for the reviewer to verify locally. If not applicable, say "N/A — docs only".
-->

1.
2.
3.

## 📸 Screenshots / Demos

<!-- Required for UI changes (client, or GraphQL schema changes that affect client). Remove if not applicable. -->

| Before | After |
|--------|-------|
|        |       |

## ✅ Checklist

- [ ] Branch is up to date with `main`
- [ ] Follows the branch naming convention (`feat/...`, `fix/...`, `chore/...`)
- [ ] Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] ESLint passes (`npx eslint .` at root, `npm run lint` in `clients/web`)
- [ ] Types compile (`npm run build:all` or the affected `build:*` script)
- [ ] Tests added/updated (if applicable) and passing
- [ ] Screenshots added (if UI change)
- [ ] Documentation updated (README / README.server.md / CONTRIBUTING.md) if behavior or setup changed
- [ ] No `.env`, secrets, or API keys committed
- [ ] **Shared packages changed?** (`packages/contracts/`, `packages/services/`) → notified the other maintainer
- [ ] **DB changed?** → migration generated (`npm run db:generate`) and committed
- [ ] **GraphQL schema changed?** → `schema.graphql` updated and committed

## 🔗 Related

<!-- 
- Related PRs: #123
- Related issues: Closes #456
- Design references: Figma link (if UI)
-->

## ⚠️ Breaking Changes

<!-- 
Does this change require a DB migration, env var change, API change, or schema update that could break existing deployments? 
If yes, describe it. If no, write "None".
-->

None
