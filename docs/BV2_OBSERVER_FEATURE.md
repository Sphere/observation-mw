# BV2 Observer Feature

## Overview

The BV2 Observer feature introduces a new observation type (`observer`) where the mentor and mentee are the same person (self-observer). Unlike the standard V1 flow, OTP verification is skipped entirely — the observer initializes the observation directly.

---

## How It Works

### V1 Flow (Standard OTP)
```
POST /v1/observation/observationOtpVerification
Body: { otp, mentor_id, mentee_id, solution_id }

1. Verify OTP via MSG-91
2. Get observation_id from ML Service
3. Update DB: otp_verification_status, observation_id, otp_verified_on
4. Return: { message, observation_id }
```

### V2 Flow (Observer - OTP Skipped)
```
POST /v1/observation/observationOtpVerification
Body: { mentee_id, solution_id, type: "observer" }

1. Detect type=observer → skip OTP
2. Get observation_id from ML Service  (same as V1)
3. Add entity to observation in ML Service (atomic)
4. Update DB: otp_verification_status, observation_id, otp_verified_on  (same as V1)
5. Return: { message, observation_id }
```

**Same endpoint, same Kong route — no new API onboarding required.**

---

## API Reference

### Initialize Observer Observation

**Endpoint:** `POST /v1/observation/observationOtpVerification`

**V2 Request Body:**
```json
{
    "mentee_id": "7e7dfbef-ca2c-4b72-9719-9c830a2105d3",
    "solution_id": "69943f02b4073b0008ed84e3",
    "type": "observer"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mentee_id` | string | Yes | ID of the observer (mentor_id === mentee_id) |
| `solution_id` | string | Yes | ID of the observation solution |
| `type` | string | Yes | Must be `"observer"` to trigger V2 flow |

**Response:**
```json
{
    "message": "OTP skipped successfully",
    "observation_id": "699c57a9-8f8c-4d24-b06c-..."
}
```

**V1 vs V2 Response Comparison:**

| Field | V1 | V2 |
|-------|----|----|
| `message` | `"OTP verification completed successfully"` | `"OTP skipped successfully"` |
| `observation_id` | `"699c57a9-..."` | `"699c57a9-..."` (same) |

---

### Get Observer Observation List

**Endpoint:** `GET /v1/scheduler/v1/getScheduledObservationList`

**Query Parameters:**
```
menteeId=<mentee_id>&type=observer
```

| Param | Required | Description |
|-------|----------|-------------|
| `menteeId` | Yes | ID of the observer |
| `type` | Yes | Must be `"observer"` to get V2 observer list |

**Response:**
```json
[
    {
        "sameDay": [
            {
                "mentoring_relationship_id": "f7568def-...",
                "mentor_id": "7e7dfbef-...",
                "mentee_id": "7e7dfbef-...",
                "mentor_name": "PRINCE KUMAR",
                "mentee_name": "PRINCE KUMAR",
                "mentoring_observations": [
                    {
                        "type": "observer",
                        "status": "active",
                        "observation_id": "",
                        "solution_id": "69943f02b4073b0008ed84e3",
                        "scheduled_on": "2026-05-13T10:37:48.349Z",
                        "attempted_count": 0,
                        "observationData": {
                            "solution_id": "69943f02b4073b0008ed84e3",
                            "solution_name": "EMERGENCY TRIAGE OF NEWBORN",
                            "competency_data": [...],
                            "duration": 3600
                        }
                    }
                ]
            }
        ]
    }
]
```

**Key differences from V1 list:**
- Returns **all active observer observations** regardless of `scheduled_on` date
- All results in `sameDay` bucket only (no `overdue`/`upcoming` split)
- Deduplicates by `solution_id` — keeps latest `scheduled_on` if scheduled multiple times

---

## Database Changes

No schema changes. Same fields updated as V1:

| Field | Value |
|-------|-------|
| `otp_verification_status` | `'verified'` |
| `observation_id` | fetched from ML Service |
| `otp_verified_on` | current timestamp |

---

## Files Changed

| File | Change |
|------|--------|
| `src/controllers/observationController.ts` | Added `type=observer` check in `observationOtpVerification`; added `initializeObservationForObserver` function |
| `src/controllers/observationSchedulerController.ts` | Added `getObserverObservationList` function; added `type=observer` early-return in `getScheduledObservationList` |
| `src/routes/observationRoute.ts` | Added `/initializeObservationForObserver` route (internal use) |

---

## Sample cURL

**Get observer list:**
```bash
curl --location 'http://localhost:3009/v1/scheduler/v1/getScheduledObservationList?menteeId=7e7dfbef-ca2c-4b72-9719-9c830a2105d3&type=observer' \
--header 'x-authenticated-user-token: <token>'
```

**Initialize observer observation:**
```bash
curl --location 'http://localhost:3009/v1/observation/observationOtpVerification' \
--header 'Content-Type: application/json' \
--header 'x-authenticated-user-token: <token>' \
--data '{
    "mentee_id": "7e7dfbef-ca2c-4b72-9719-9c830a2105d3",
    "solution_id": "69943f02b4073b0008ed84e3",
    "type": "observer"
}'
```
