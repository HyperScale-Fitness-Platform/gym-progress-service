# Gym Progress Service

Gym Progress Service provides API operations for customer progress tracking, including:

- weight and body-fat measurements
- InBody scan results and nutrition logs
- trainer reviews of client progress

## Features

- Express API server
- MongoDB persistence via Mongoose
- Local Docker Compose support for database setup
- Unit and integration tests with Jest + Supertest (`mongodb-memory-server` for integration)
- Kubernetes manifests for app deployment and MongoDB StatefulSet
- Trainer-customer assignment projection, kept in sync via consumed events

## Prerequisites

- Node.js >= 20
- npm
- Docker and Docker Compose (for local database)

## Local development setup

1. Install packages:

```
npm install
```

2. Copy example env file:

```
cp .env.example .env
```

3. Update `.env` with your local database values.

### Recommended local `.env`

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/gym_progress
```

## Run MongoDB locally

Start the local database with Docker Compose:

```
docker compose up -d
```

Verify the database:

```
docker compose ps
```

View Mongo logs:

```
docker compose logs -f mongo
```

## Run the app

Start the service:

```
npm start
```

For development with hot reload:

```
npm run dev
```

The app base URL is:

```
http://localhost:3000/api/progress
```

## API reference

### Progress entry endpoints

- `POST /api/progress` — create a progress entry (customer, admin)
- `GET /api/progress` — list entries, filterable by `customer_id`, `from`, `to`, paginated (customer self, assigned trainer, admin)
- `GET /api/progress/:id` — retrieve one entry (owner, assigned trainer, admin)
- `PATCH /api/progress/:id` — partially update an entry (owner, admin)
- `DELETE /api/progress/:id` — delete an entry (owner, admin)
- `GET /api/progress/customers/:customerId/latest` — latest metrics for a customer (customer self, assigned trainer, admin)
- `GET /api/progress/customers/:customerId/summary` — trend/summary data for a date range (customer self, assigned trainer, admin)

### Trainer review endpoints

- `POST /api/progress/:id/reviews` — add a trainer review (assigned trainer, admin)
- `PATCH /api/progress/:id/reviews/:reviewId` — edit own review (review author, admin)
- `DELETE /api/progress/:id/reviews/:reviewId` — remove own review (review author, admin)

## Authorization model

Every request is authenticated via gateway headers (`user-id`, `user-role`) and authorized as follows:

| Role     | Access                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------- |
| customer | Full access to their own entries only (`customer_id` must match `user-id`)                        |
| trainer  | Read/review access limited to customers they are actively assigned to (see `trainer_assignments`) |
| admin    | Full access to all entries and reviews                                                            |

Trainer-customer assignments are stored locally in a `trainer_assignments` projection and kept up to date by consuming `trainer-assigned` / `trainer-unassigned` events from the assignment source of truth (see `src/events/consumers/trainerAssignment.consumer.js`). No broker client is wired in yet — see Notes.

## Testing

Run the full test suite:

```
npm test
```

Run tests in band for CI or local troubleshooting:

```
npm test -- --runInBand
```

Integration tests use `mongodb-memory-server`, so no external database is required to run them locally or in CI.

## Docker

Build the app image:

```
docker build -t gym-progress-service .
```

Run the container with a Mongo connection string:

```
docker run -p 3000:3000 \
  -e MONGO_URI="mongodb://mongo:27017/gym_progress" \
  gym-progress-service
```

## Kubernetes

Manifests are in `k8s/`.

### What is included

- `k8s/storageclass.yaml` — storage class for database volumes
- `k8s/mongo-service.yaml` — headless service for MongoDB
- `k8s/mongo-statefulset.yaml` — MongoDB StatefulSet with 1 replica
- `k8s/app-deployment.yaml` — app Deployment with 3 replicas
- `k8s/app-service.yaml` — ClusterIP service for the app

### Notes

- The app connects to Mongo using the DNS name `mongo` within the same namespace.
- Secrets are expected to be injected by your CD pipeline.
- The Mongo StatefulSet expects a secret named `mongo-secret` (`MONGO_ROOT_USERNAME`, `MONGO_ROOT_PASSWORD`).
- The app deployment expects `MONGO_URI` to be populated from a secret named `progress-mongo-secret`.

## Continuous Integration

The repository includes a `Jenkinsfile` for a Jenkins pipeline that can run locally.

### Jenkins setup

- Run a local Jenkins server with Docker available on the build agent.
- Add a Jenkins credential of type `Username with password` and set the ID to `dockerhub-creds`.
- Provide Docker Hub credentials at runtime or via Jenkins job configuration.
- Set the `DOCKER_IMAGE` build parameter to your target Docker Hub repository, for example:
  - `your-dockerhub-username/gym-progress-service`

### Pipeline steps

1. Checkout repository
2. Install dependencies with `npm ci`
3. Lint the code
4. Run tests
5. Build Docker image
6. Publish Docker image to Docker Hub (if `PUSH_IMAGE` is enabled)

### Notes

- The pipeline uses `docker login` with the `dockerhub-creds` credentials.
- If you do not want to push images, disable `PUSH_IMAGE`.
- This branch does not hardcode image repository names; use the parameter to provide the correct Docker Hub repo.

## Project structure highlights

- `src/app.js` — Express app definition for tests and runtime
- `src/index.js` — runtime entrypoint that starts the server
- `src/models/progressEntry.model.js` — Mongoose schema for progress entries and trainer reviews
- `src/models/trainerAssignment.model.js` — local projection of trainer-customer assignments
- `src/middleware/role.middleware.js` — role-based authorization
- `src/middleware/progressAccess.middleware.js` — ownership/assignment-based authorization
- `src/middleware/progressValidation.middleware.js` — request validation
- `src/controllers/progress.controller.js` — route handlers
- `src/routes/progress.routes.js` — API routes
- `src/events/consumers/trainerAssignment.consumer.js` — handlers for assignment events
- `tests/` — unit and integration tests

## Notes

- `./.env` should not be committed.
- Trainers currently have no access to unassigned customers; the assignment projection must be kept current for this to hold.
- No message-broker client is wired in yet — `trainerAssignment.consumer.js` exposes handlers ready to be subscribed once the event infrastructure and contract are chosen.
