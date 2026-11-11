# Backend audit for landing-page regression

Date: 2026-11-11. Repository: `D:/Coding/Python_Project/AquaDocs/dms-backend`.

## Coverage and source state

Indexed all 313 non-Git/non-target files and structurally scanned all 295 Java sources. [backend-inventory.json](backend-inventory.json) records file paths, sizes, SHA-256 and Java type declarations; it contains no configuration values or private-key content. Focused code review covered build/runtime configuration, all controller route declarations, auth/user DTOs, login/current-user/refresh service paths, security/CORS, initialization side effects, document authorization and ABAC boundaries. This is not a claim that every business branch was manually audited or executed.

Package counts: 23 controller files, 49 service files, 35 repositories, 51 entities/enums, 71 DTOs, 19 mappers, 15 config files, 25 common files, 4 AOP files, 2 security files and one application entrypoint. Git status was clean before and after compile. All 313 indexed source/input hashes remained unchanged. Generated `target/` is ignored.

## Architecture

- Maven wrapper 3.9.10, Spring Boot **3.5.4**, Java **21** as specified in pom.xml. README's Java 17/Spring Boot 3.3 description is older than the build configuration.
- REST controllers → services → Spring Data JPA repositories → PostgreSQL. MapStruct DTO mapping, Lombok, Jakarta validation.
- Stateless JWT resource-server security with RSA encoders/decoders; refresh-token service; method authorization and custom permission evaluator. Subject/resource/context checks and delegation/ABAC supplement role/permission checks.
- Organization, department, member, category and document/version/permission models; project roles/membership; Camunda BPMN deployment, workflow assignment, tasks; audit logs; product/service packages; invitations and email verification/reset.
- Document operations include metadata/filter/search, upload, versioning, retrieve/download, workflow approval, sharing/delegation and watermark/password utilities. These were inventoried, not live-tested in this screen-scoped task.
- Redis configuration/cache/refresh storage; Kafka configuration; SMTP/Thymeleaf templates; local uploads plus Azure storage configuration. Only dependencies reached by a tested flow should be treated as required for that flow; Kafka readiness was not established as a startup prerequisite.

## Frontend compatibility for the current screen

| Integration | Backend evidence | Current frontend |
| --- | --- | --- |
| Login | AuthController `POST /api/v1/auth/login`; LoginResponseDto `access_token`, `refresh_token` | AuthContext.login and tokenService use these exact fields. |
| Session bootstrap | UserController `GET /api/v1/users/me`; UserResponse snake_case identity/organization flags | AuthContext.fetchFullUserData initializes landing CTA state. |
| Refresh | `POST /api/v1/auth/refresh-token`, request `refresh_token`; rotated access/refresh pair | Existing Axios interceptor retries protected request with updated Bearer header. |
| Error response | GlobalExceptionHandler exposes `message`; bad credentials use HTTP 400 | Existing login reads `error.response.data.message`. |
| Protected navigation | API JWT requirement plus service/method authorization | Frontend ProtectedRoute gates `/home/*`; this is not backend permission enforcement. |
| Public contact form | No contact controller/submission endpoint found in route inventory | Existing form validates locally only; no new delivery endpoint invented. |
| CORS | CorsConfig allows `http://localhost:5173` | Use this browser origin for live integration, not `127.0.0.1:5173`. |

Banner capabilities do not define additional APIs. No frontend API URL, DTO contract, provider, token logic, permission logic or backend source was changed.

## Verified environment and build

- `java -version`: Java 21.0.5 available.
- `mvnw.cmd -B -DskipTests compile`: **exit 0**, compiled 295 sources; MapStruct unmapped-target warnings and a deprecated API notice remain. No application started and no configured database contacted by this build.
- No Java test files exist in this repository. Compile success is not a backend test result.
- `docker version --format '{{.Server.Version}}'`: **exit 1**, Docker Desktop Linux daemon pipe missing even outside sandbox. Docker client exists; daemon unavailable.
- Local socket checks: 5173 and 5432 open; 8080, 8081, 6379 and 9092 closed. PostgreSQL listening does not establish an isolated test database or a suitable account.
- Shipped backend `server.port=8081`, frontend Axios and refresh URL use 8080, Dockerfile/compose expose/map 8080. This mismatch is documented, not silently changed.
- JPA `ddl-auto=update`, Camunda schema updates, and DatabaseInitializer can write schema/seed data on startup. Both datasource URLs are configured to non-loopback endpoints. No isolated runtime profile or test database was supplied; default configuration was not used to start the app.
- Compose provides Redis + backend, but no PostgreSQL service. Redis hostname is a container service name; a host-only launch requires local overrides. No alternate docker application properties file was found.

Configuration secrets were not copied into this report, the browser fixtures or frontend source.

## What was actually regression-tested

Public navigation and validation run against the real frontend in Chrome. Four session scenarios use explicitly labelled intercepted browser fixtures based on the reviewed backend DTOs: successful `/users/me`, delayed bootstrap, expired token with/without refresh, and service failure fallback. All API requests in these fixture scenarios are intercepted; they never authenticate to a real backend. [auth-fixture-results.json](qa/refinement/auth-fixture-results.json) records 14 passed assertions.

Not verified: real login/token signature, Redis refresh persistence, database access, permission enforcement, successful upload/preview/search, SMTP delivery, workflow execution, or real backend loading/error/empty data. Those screens were not changed.

## Resume live verification

Provide a local isolated PostgreSQL database/schema and Redis, with an approved test account. Override runtime settings for the test environment; align backend to frontend port 8080 through runtime `server.port`, keep browser origin localhost:5173, and use test-only SMTP/storage. Verify initialization behavior before starting against that database. Start the backend and check `/users/me`, refresh and landing CTA using real credentials without recording tokens in artifacts. Keep upload/search/other-screen expansion outside the current UI change unless separately requested.
