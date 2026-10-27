# Owner-operated authentication recovery

This command is a temporary local recovery mechanism for the four account mappings confirmed during the read-only Neon inspection. It is not an HTTP endpoint and accepts no account IDs from a request or command-line argument.

## Safety and prerequisites

- Do not run `--apply` until the system owner has explicitly approved the production recovery operation.
- Verify a current Neon backup/restore point in the Neon dashboard first. The command cannot inspect Neon Console backup status.
- Configure `DATABASE_URL` through the existing backend environment. Its hostname and database path are the expected target; no separate recovery host/name variables are needed. The command compares that hostname and database name with the `pg` client's connection parameters, and independently verifies the database name with PostgreSQL `current_database()`. If the URL is missing, malformed, or the connected target cannot be verified, the check fails closed. No hostname, database URL, username, or connection string is printed.
- Configure `RECOVERY_ENVIRONMENT=production`, `RECOVERY_OWNER_APPROVED=YES`, and `RECOVERY_JWT_SECRET_ROTATED=YES` only for the explicitly approved recovery run.
- Set a new strong `JWT_SECRET` of at least 32 characters on every deployed API instance and restart those instances before recovery. The currently configured secret does not meet the minimum. Rotating it invalidates all outstanding JWTs, not just those for the four target accounts. The command checks the provided value's length but cannot verify that every deployed instance was updated.
- Existing accounts are fixed in the script as account IDs 1–4 with their inspected roles, employee IDs, and active status. The command aborts if the account/employee mapping, role, or status differs.
- `--check` is read-only. It derives the expected host/name from `DATABASE_URL`, verifies the `pg` connection host/database parameters and `current_database()`, required schema objects, and fixed account mappings; it does not fetch or display password values. Missing or mismatched target configuration fails the check.
- `--apply` requires all safety configuration, an exact interactive confirmation naming the target database, and an individually entered, confirmed, unique password for each account. Password input is hidden and is never accepted as a command-line argument or printed.
- New values are hashed with the existing bcrypt dependency at cost 12. A transaction updates only `login_auth.auth_password` and `login_auth.auth_must_change_password`, and writes non-secret `activity_logs` audit entries. The change-required flag is set so each user must choose their own new password after recovery.
- A transaction rollback protects against partial account resets. Successful completion reports account IDs only.
- Recovery audit rows intentionally use `actor_emp_id = NULL`: this owner-operated local command has no authenticated application user, so it must not invent an employee/operator ID. The event is still recorded as `auth.owner_recovery` against each fixed `login_auth.account_id`. The database schema permits a null audit actor.

The application uses stateless JWTs and has no server-side session store or per-account token version. Recovery therefore requires rotating the JWT secret and restarting all API instances to invalidate previously issued tokens. The recovery command never changes environment files or JWT configuration.

The production CLI entry point takes no injected dependencies. It reads `process.argv` and `process.env`, validates the production configuration before constructing the backend's configured database pool, and uses the built-in hidden TTY input. Additional JavaScript arguments to the entry point are rejected. The CLI does not switch behavior based on `NODE_ENV`.

Automated tests use a separate test-only runner which is available only in a test process. That runner creates its own in-memory mock database and accepts test inputs/failure scenarios, but does not accept a pool, database client, or input-provider function. Setting `NODE_ENV=test` does not make the production CLI use this runner or permit dependency injection into it.

## Preparation and verification

Run from the repository root:

```powershell
npm run auth:recovery --prefix backend -- --check
node --test backend/src/tests/recovery.test.js
node --test backend/src/tests/auth.test.js
```

For the recovery preflight, configure `DATABASE_URL` in the backend environment. The hostname and database name in that URL define the expected target. The `--check` command does not require `--apply`, owner-approval flags, a JWT rotation assertion, or password input. It performs only SELECT queries and exits before the recovery mutation path. Run this exact read-only command from the repository root:

```powershell
npm run auth:recovery --prefix backend -- --check
```

The recovery and authentication automated tests use an internally created mock database and in-memory test inputs. They verify safeguards, transaction rollback behavior in the mock, password-change gating, account status checks, role restrictions, and JWT-secret verification. The test-only recovery runner has no API for injecting a database pool or input provider. These tests do not connect to Neon or prove PostgreSQL transaction behavior.

No isolated test-database recovery has been performed. Production recovery, production login, rollback against a real database, audit insertion against the live schema, and deployment-wide JWT invalidation have **not** been tested. Do not treat passing mocked tests as evidence that those operational steps succeeded.

Before an owner-approved production recovery, verify each deployed API instance individually:

1. Inventory every running API instance, including autoscaled/standby instances and any worker that validates API JWTs.
2. Confirm the same newly generated JWT secret is configured through the deployment secret manager on every instance; do not print it or put it in command arguments.
3. Restart or redeploy every instance, then verify its health/readiness and confirm it uses the new secret through deployment configuration checks that do not reveal the value.
4. Verify an old, non-production test token is rejected by every instance and a newly issued test token is accepted. Do not use production user tokens for this check.
5. Confirm the Neon backup/restore point and approved database host/name in the Neon dashboard, then run the read-only `--check`.
6. Require the system owner's explicit approval immediately before running `--apply`; confirm the interactive target prompt names the approved database.

The application cannot verify that the Neon backup is restorable, that the owner approval was genuinely given, or that every API instance uses the rotated JWT secret. Those require independent operator/deployment checks. `RECOVERY_JWT_SECRET_ROTATED=YES` is an operator assertion, not an automated proof.

Only after separate owner approval and verification of the production backup, JWT rotation, and expected Neon target, the owner-operated command is:

```powershell
npm run auth:recovery --prefix backend -- --apply
```

Do not place passwords, database credentials, or JWT secrets in command arguments. The `--apply` command requires a local interactive terminal and will refuse to proceed unless its explicit owner, environment, database, and JWT-rotation safeguards are satisfied. It accepts only the four fixed account IDs and their inspected mappings; it is not a general account reset tool.
