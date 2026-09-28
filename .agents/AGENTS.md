# ReGive Agent Instructions

## Mandatory Context Loading

Before implementing, modifying, refactoring, or debugging any feature,
you MUST read the relevant project documentation first.

Always read:

1. docs/PROJECT_OVERVIEW.md
2. docs/FRONTEND_PLAN.md
3. docs/API_DOCUMENT.md
4. docs/BUSINESS_RULES.md
5. .agents/rules/01-project-rules.md
6. .agents/rules/02-frontend-rules.md

Do not start coding before understanding the existing architecture.

## Project Stack

Frontend:

- Next.js
- TypeScript
- Axios
- Ant Design
- Tailwind CSS

Backend:

- Express.js
- MongoDB

## Coding Rules

Before creating new code:

1. Search for existing implementation.
2. Reuse existing components/hooks/services/types.
3. Follow current project folder structure.
4. Do not introduce a new library unless necessary.
5. Do not modify unrelated files.
6. Keep strong TypeScript typing.
7. Do not use `any` unless absolutely necessary.

## Task Workflow

For every task:

1. Read documentation.
2. Inspect related existing code.
3. Identify impacted files.
4. Explain implementation plan.
5. Implement the smallest necessary changes.
6. Run lint/type-check/build if available.
7. Review the final diff.
