# Code Conventions

SkipPD follows the **[Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)**, documents code with **[TSDoc](https://tsdoc.org/)** comments, and lets **[Prettier](https://prettier.io/)** handle formatting automatically.

The rules below are the parts that matter most in this project. When a rule here and the Google guide disagree, this file wins.

---

## 1. Formatting: Prettier does it

- Don't format by hand. Run `npm run format` before committing.
- `npm run format:check` fails if a file is not formatted. CI will run it later.
- Settings live in `.prettierrc.json`: single quotes, no spaces inside `{braces}`, trailing commas, 90-character lines.

## 2. Every file starts with an overview

Each `.ts` / `.tsx` file opens with a `@fileoverview` comment that answers:
1. **What** is in this file?
2. **Why** does it exist, or why is it built this way?
3. Is it **temporary**? If so, which roadmap step replaces it?

```ts
/**
 * @fileoverview Catalog search, filter and sort logic.
 *
 * Kept as a pure function so it is easy to test. In Step 2 the same
 * filtering moves into database queries.
 */
```

## 3. Comments explain *why*, not *what*

- Every exported function, component, type and constant gets a `/** ... */` TSDoc comment. Editors show it on hover.
- Use `@param` only when a parameter's meaning is not obvious from its name.
- Inside functions, comment only non-obvious decisions:
  - Good: `// Stop the click from also opening the course via the cover.`
  - Bad: `// Call stopPropagation.`
- Mark temporary code with the step that removes it: `TEMPORARY: Step 4 ...`.

## 4. Naming

| Thing | Style | Example |
|---|---|---|
| Variables, functions | `lowerCamelCase` | `filterCourses`, `savedIds` |
| Components, types, interfaces | `UpperCamelCase` | `CourseCard`, `BookingRequest` |
| Module-level constants | `CONSTANT_CASE` | `MAX_IMAGE_BYTES`, `DEFAULT_FILTERS` |
| Component files | `UpperCamelCase.tsx` | `CourseCard.tsx` |
| Other files | `kebab-case.ts` | `filter-courses.ts` |
| Props interface | `<Component>Props` | `CourseCardProps` |
| React hooks | `useSomething` | `useSavedIds`, `useToast` |

- Use full words. Write `course`, not `c`, and `event`, not `e`. The one exception is the SVG colour shorthands `a`/`b`, which are documented in `CourseIllustration.tsx`.
- Units go in the name when there is no type for them: `TOAST_DURATION_MS`, `MAX_IMAGE_BYTES`.
- No magic numbers. Give the value a named constant with a comment.

## 5. Exports and imports

- **Named exports only**: `export function CourseCard`.
  - **Exception:** Next.js requires `export default` in route files such as `app/**/page.tsx` and `layout.tsx`.
- Use `import type {...}` when you import something only as a type.
- Import from `@/lib/...` and `@/components/...` across folders, and use `./File` inside the same folder.
- Export only what other files use.

## 6. TypeScript

- Use `const` by default, `let` only when the value is reassigned, and never `var`.
- Use declared functions (`function foo() {}`) for named functions, and arrow functions for callbacks.
- Parse numbers with `Number()` and check the result. Do not use unary `+` or `parseInt`.
- No `any`. Use `unknown` and narrow it.
- When a cast (`as X`) is needed, add a comment explaining why it is safe.
- Arrow callbacks that return nothing use a block body: `onClick={() => { doThing(); }}`.

## 7. React / Next.js

- Put **one component per file**. Small, closely related helpers may share a file, such as `Hero` and `TrustBar`.
- Keep page-level state (filters, open dialog) in `HomePage.tsx`. Child components receive data through props and report events through `onSomething` callbacks.
- Add `'use client'` only to files that need browser features (state, events, localStorage). Everything else stays a server component.
- Put styles in `globals.css` using class names. Avoid inline `style={{...}}`.

## 8. Docs to keep updated

- **`docs/CODEBASE.md`**: update it in the same PR whenever you add, move or delete a file or folder.
- **`SkipPD_v2.md`**: update it when a plan or decision changes.
- **`README.md`**: update it when setup or run commands change.

## 9. Git

- Branch names: `feature/<step-or-topic>`, `fix/<topic>`, `docs/<topic>`.
- Commit messages: [Conventional Commits](https://www.conventionalcommits.org/), for example `feat: add booking form`, `fix: ...`, `docs: ...`, `refactor: ...`, `chore: ...`.
- Before opening a PR, run `npm run format`, `npm run lint` and `npm run build`. All three must pass.
