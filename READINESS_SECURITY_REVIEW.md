# PropertyAtlas — pre-sale technical and security review (2026-10-18)

Status: **not sale-ready**. Do not promote this branch to production without an independent review.

## Immediate blockers

1. **Administrative write authorization.** Audit every mutating `/api/*` route (property, transaction, tax, etc.) for a verified authenticated admin session and appropriate roles. The reviewed property create/update/delete handlers did not contain an authorization check. Treat this as a release blocker until a centralized guard is implemented and tested.
2. **API error disclosure.** Ensure all error responses use generic public messages; log details only server-side without credentials or personal information.
3. **Isolated build and tests.** In a disposable environment, install locked dependencies, generate the Prisma client, run lint/build, and test CRUD with a disposable database. Do not connect to a live production database.
4. **Demo and ownership.** Verify an accessible demo with sanitized sample data, attribution for images/fonts, package licenses, and code-transfer authority.
5. **Deployment.** Validate the standalone Next.js output, start command, database persistence and migrations in staging.

## Acceptance criteria

- Unauthenticated requests cannot create, modify, delete or settle records.
- Authorized admin can complete CRUD, with audit trail, on test data.
- Errors disclose no stack trace or connection information.
- Build and smoke tests pass; demo URL and commit are recorded.
- Rights and delivery package are approved before listing as available for purchase.

This file documents review findings; it does **not** claim these fixes or tests have been completed.
