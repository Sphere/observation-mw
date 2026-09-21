# Observation Middleware

Node.js/TypeScript middleware service for managing mentee observations, OTP verification, and observation scheduling in the Aastrika Sphere platform.

---

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **ORM:** Sequelize (PostgreSQL)
- **Auth:** Keycloak JWT
- **Databases:** PostgreSQL (observations), Cassandra (user data)
- **External Services:** ML Survey Service, ML Core Service, MSG-91 (OTP)

---

## Setup

### Prerequisites
- Node.js 16+
- PostgreSQL
- Cassandra
- Access to ML Survey Service and ML Core Service

### Install
```bash
yarn install
```

### Environment
Copy and configure environment variables:
```bash
cp .env.example .env
```

Key variables:
```
POSTGRES_HOST=
POSTGRES_DATABASE=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_PORT=

CASSANDRA_PORT=

ML_SURVEY_SERVICE_API_BASE=
ML_CORE_SERVICE_API_BASE=
LEARNER_SERVICE_API_BASE=
DECRYPTION_API_BASE=

SB_API_KEY=
INTERNAL_ACCESS_TOKEN=
KEYCLOAK_PUBLIC_KEY=
```

### Run
```bash
# Development
yarn dev

# Production
yarn build && yarn start
```

---

## API Overview

All routes are prefixed with `/v1`.

### Observation Routes (`/v1/observation/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/observationOtpVerification` | Verify OTP (V1) or initialize observer (V2 with `type=observer`) |
| POST | `/getobservationDetails` | Get observation questions/checklist |
| POST | `/addEntityToObservation` | Associate mentee with observation |
| POST | `/submitObservation` | Submit observation answers |
| POST | `/verifyobservationLink` | Verify observation solution link |
| POST | `/getObservationSubmissionResult` | Get submission score/result |
| POST | `/updateSubmissionandCompetency` | Update submission and passbook |
| GET | `/getSolutionsList` | Get available solutions |
| GET | `/getMentorAssignedSolutionsList` | Get solutions assigned to mentor |
| GET | `/menteeConsolidatedObservationAttempts` | Get all attempts for a mentee |
| GET | `/menteeConsolidatedObservationAttemptsV2` | Get attempts grouped by mentee/solution |

### Scheduler Routes (`/v1/scheduler/v1/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/observation/schedule` | Schedule observations for mentees |
| GET | `/getScheduledObservationList` | Get scheduled observations (V1: date-filtered, V2: `type=observer` returns all) |

### OTP Routes (`/v1/otp/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sendOtp` | Send OTP to mentee phone |
| GET | `/verifyOtp` | Verify OTP entered by mentee |
| GET | `/retry` | Resend OTP |

### Mentor Routes (`/v1/mentor/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/getAllMenteeForMentor` | Get all mentees for a mentor |
| GET | `/getObservationForMentee` | Get observations for a specific mentee |
| POST | `/getMentorMenteeDetailsFiltered` | Get filtered mentor-mentee details |
| GET | `/mentorObservationFilteredCount` | Get observation count with filters |

---

## Features

### V1 — Standard OTP Observation Flow
Mentor sends OTP to mentee → mentee verifies → observation session begins.

### V2 — Observer Flow (No OTP)
Observer (mentor_id === mentee_id) initializes observation directly without OTP.
Uses `type=observer` parameter on existing endpoints — no new Kong routes required.

See [docs/BV2_OBSERVER_FEATURE.md](docs/BV2_OBSERVER_FEATURE.md) for full details.

---

## Project Structure

```
src/
├── controllers/
│   ├── observationController.ts       # Core observation logic
│   ├── observationSchedulerController.ts  # Scheduling logic
│   ├── otpController.ts               # OTP send/verify
│   └── mentorController.ts            # Mentor APIs
├── models/
│   ├── mentoringObservationModel.ts   # observation_mw DB model
│   ├── mentoringRelationshipModel.ts  # mentor-mentee relationship
│   └── observationMetaModel.ts        # solution metadata
├── routes/
│   ├── index.ts                       # Route registration
│   ├── observationRoute.ts
│   ├── observationSchedulerRoute.ts
│   ├── otpRoute.ts
│   └── mentorRoute.ts
└── utils/
    ├── logger.ts
    ├── userSearch.ts                  # Cassandra user lookup
    └── requestValidator.ts
docs/
└── BV2_OBSERVER_FEATURE.md           # V2 observer feature documentation
```
