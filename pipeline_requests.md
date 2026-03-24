# Pipeline Execution Requests

Use these two requests to run the end-to-end pipeline.

## Step 1: Start Preprocessing
This submits the first job and automatically stages the configuration for the second job.

```bash
curl -X POST http://localhost:8000/api/submit-preprocessing/ \
  -H "Content-Type: application/json" \
  -d '{
    "s3_rna_bam": "s3://epicode-neoantigen/pragnakalp_preprocessing_input/rna_bam/",
    "s3_deg_bam": "s3://epicode-neoantigen/pragnakalp_preprocessing_input/deg/rna/gsc_dmso/",
    "s3_deg_jr": "s3://epicode-neoantigen/pragnakalp_preprocessing_input/deg/rna/gsc_jr/",
    "s3_gtex": "s3://epicode-neoantigen/pragnakalp_preprocessing_input/deg/gtex/",
    "s3_gencode": "s3://epicode-neoantigen/pragnakalp_preprocessing_input/deg/gencode/",
    
    "s3_output_bucket": "s3://epicode-neoantigen/pragnakalp_preprocessing_output/results/",
    "s3_hla_output": "s3://epicode-neoantigen/pragnakalp_preprocessing_output/hla_output/",
    "s3_rna_bam_output": "s3://epicode-neoantigen/pragnakalp_preprocessing_output/rna_bam_output/",
    "s3_deg_bam_consolidated": "s3://epicode-neoantigen/pragnakalp_preprocessing_output/deg_bam_consolidated/",
    "s3_logs_bucket": "s3://epicode-neoantigen/pragnakalp_preprocessing_output/logs_1/"
  }'
```

**Response Example:**
```json
{
    "message": "Preprocessing Job Submitted",
    "jobId": "87654321-...",
    "jobName": "epicode-preprocessing-single-20260217-140000"
}
```

---

## Step 2: Start Neoantigen Discovery
Run this **after Step 1 completes**. It picks up the paths automatically from the database.
Use the `jobName` from Step 1 response, but prefixed with `neo-`.

```bash
curl -X POST http://localhost:8000/api/submit-neoantigen/ \
  -H "Content-Type: application/json" \
  -d '{
    "run_name": "neo-epicode-preprocessing-single-20260217-140000"
  }'
```

**Response Example:**
```json
{
    "message": "Neoantigen Job Submitted",
    "jobId": "12345678-...",
    "runName": "neo-epicode-preprocessing-single-20260217-140000"
}
```

---

## Live HLA Dashboard Endpoint Samples (2026-03-24)

Base URL used:

```bash
NGROK_BASE="https://patriotic-reena-choregraphically.ngrok-free.dev"
```

### Auth (JWT access token)

```bash
EMAIL="pragnakalp.dev56@gmail.com"
PASS="Mansi@1234"
TOKEN="$(curl -s -X POST "${NGROK_BASE}/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASS}\"}" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["tokens"]["access"])')"
```

### 1) Sync Active Jobs

Request:

```bash
curl -s -X POST "${NGROK_BASE}/api/sync-active-jobs/" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json"
```

Live response:

```json
{
  "message": "Successfully synced 2 active jobs with AWS Batch.",
  "synced_count": 2
}
```

### 2) Pipeline Status (includes HLA block)

Request:

```bash
PREP_JOB_ID="0c8406ee-0fbd-42e1-861a-0ecd0f7912b8"
curl -s -X GET "${NGROK_BASE}/api/pipeline-status/${PREP_JOB_ID}/" \
  -H "Authorization: Bearer ${TOKEN}"
```

Live response sample:

```json
{
  "pipeline_id": 54,
  "stage1": {
    "id": 54,
    "batch_id": "0c8406ee-0fbd-42e1-861a-0ecd0f7912b8",
    "status": "PENDING",
    "type": "Preprocessing"
  },
  "stage1_hla": {
    "id": 1,
    "batch_id": "3dfa5df8-319d-4dbb-a4b7-2b8a1e145895",
    "status": "RUNNING",
    "type": "ArcasHLA",
    "s3_input_prefix": "s3://epicode-neoantigen/pragnakalp_preprocessing_input/deg/rna/gsc_dmso/",
    "s3_output_prefix": "s3://epicode-neoantigen/pragnakalp_preprocessing_output/jobs/newmerged_20260324-053035/hla_output/",
    "s3_effective_output_prefix": "s3://epicode-neoantigen/pragnakalp_preprocessing_output/jobs/newmerged_20260324-053035/hla_output/3dfa5df8-319d-4dbb-a4b7-2b8a1e145895/",
    "threads": 12,
    "file_count": 4,
    "failure_reason": null
  },
  "stage2": {
    "id": 72,
    "batch_id": "pending-pre-0c8406ee-0fbd-42e1-861a-0ecd0f7912b8",
    "status": "PENDING_PREPROCESSING",
    "type": "Neoantigen"
  }
}
```

### 3) Preprocessing List (contains linked HLA details)

Request:

```bash
curl -s -X GET "${NGROK_BASE}/api/submit-preprocessing/" \
  -H "Authorization: Bearer ${TOKEN}"
```

Live top-row sample:

```json
{
  "id": 54,
  "linked_neoantigen_status": "PENDING_PREPROCESSING",
  "linked_neoantigen_id": 72,
  "linked_neoantigen_failure_reason": null,
  "linked_arcas_hla": {
    "id": 1,
    "batch_job_id": "3dfa5df8-319d-4dbb-a4b7-2b8a1e145895",
    "job_name": "arcas-epicode-preprocessing-newmerged_20260324-053035",
    "s3_input_prefix": "s3://epicode-neoantigen/pragnakalp_preprocessing_input/deg/rna/gsc_dmso/",
    "s3_output_prefix": "s3://epicode-neoantigen/pragnakalp_preprocessing_output/jobs/newmerged_20260324-053035/hla_output/",
    "s3_effective_output_prefix": "s3://epicode-neoantigen/pragnakalp_preprocessing_output/jobs/newmerged_20260324-053035/hla_output/3dfa5df8-319d-4dbb-a4b7-2b8a1e145895/",
    "threads": 12,
    "file_count": 4,
    "job_queue": "dhyanesh-test-queue",
    "job_definition": "dhyanesh-test-job",
    "status": "RUNNING",
    "failure_reason": null
  },
  "job_id": "0c8406ee-0fbd-42e1-861a-0ecd0f7912b8",
  "job_name": "epicode-preprocessing-newmerged_20260324-053035",
  "job_type": "ARRAY",
  "s3_hla_output": "s3://epicode-neoantigen/pragnakalp_preprocessing_output/jobs/newmerged_20260324-053035/hla_output/",
  "file_count": 4,
  "status": "PENDING"
}
```

---

## HLA Dashboard APIs (Input/Output/Logs/Config)

Use these endpoints in UI to display arcasHLA status, paths, and configuration.

### 1) List preprocessing jobs with linked HLA

`GET /api/submit-preprocessing/`

- Use for dashboard table.
- HLA details are in `linked_arcas_hla`.

Expected item (trimmed):

```json
{
  "id": 54,
  "job_id": "0c8406ee-0fbd-42e1-861a-0ecd0f7912b8",
  "status": "PENDING",
  "s3_rna_bam": "s3://.../rna_bam/",
  "s3_hla_output": "s3://.../hla_output/",
  "s3_logs_bucket": "s3://.../logs/",
  "linked_arcas_hla": {
    "id": 1,
    "batch_job_id": "3dfa5df8-319d-4dbb-a4b7-2b8a1e145895",
    "job_name": "arcas-epicode-preprocessing-newmerged_20260324-053035",
    "status": "RUNNING",
    "s3_input_prefix": "s3://.../samples_5/",
    "s3_output_prefix": "s3://.../dhyanesh-test/",
    "s3_effective_output_prefix": "s3://.../dhyanesh-test/3dfa5df8-.../",
    "threads": 12,
    "file_count": 5,
    "job_queue": "dhyanesh-test-queue",
    "job_definition": "dhyanesh-test-job",
    "failure_reason": null
  }
}
```

### 2) Preprocessing detail with linked HLA

`GET /api/submit-preprocessing/<preprocessing_id>/`

- Use for job detail drawer/page.
- Returns same `linked_arcas_hla` structure for that job.

### 3) Pipeline status (best for progress cards)

`GET /api/pipeline-status/<job_id>/`

- `job_id` can be preprocessing Batch ID or arcasHLA Batch ID.
- HLA status block is `stage1_hla`.

Expected response (trimmed):

```json
{
  "pipeline_id": 54,
  "stage1": {
    "id": 54,
    "batch_id": "0c8406ee-0fbd-42e1-861a-0ecd0f7912b8",
    "status": "PENDING",
    "type": "Preprocessing"
  },
  "stage1_hla": {
    "id": 1,
    "batch_id": "3dfa5df8-319d-4dbb-a4b7-2b8a1e145895",
    "status": "RUNNING",
    "type": "ArcasHLA",
    "s3_input_prefix": "s3://.../samples_5/",
    "s3_output_prefix": "s3://.../dhyanesh-test/",
    "s3_effective_output_prefix": "s3://.../dhyanesh-test/3dfa5df8-.../",
    "threads": 12,
    "file_count": 5,
    "failure_reason": null
  },
  "stage2": {
    "id": 72,
    "batch_id": "pending-pre-0c8406ee-...",
    "status": "PENDING_PREPROCESSING",
    "type": "Neoantigen"
  }
}
```

### 4) Sync active jobs before refresh

`POST /api/sync-active-jobs/`

Expected:

```json
{
  "message": "Successfully synced 2 active jobs with AWS Batch.",
  "synced_count": 2
}
```

### 5) Standalone HLA submit (if UI supports "Run HLA only")

`POST /api/submit-arcas-hla/`

Request:

```json
{
  "s3_input_prefix": "s3://epicode-neoantigen/pragnakalp_preprocessing_input/samples_5/",
  "s3_output_prefix": "s3://epicode-preprocessing-output/dhyanesh-test/",
  "threads": 12,
  "job_name": "arcas-hla-samples_10"
}
```

Expected response:

```json
{
  "message": "Job submitted successfully",
  "jobId": "4bc5b9ae-71a4-48d6-994c-126c36af22ca",
  "threads": 12,
  "fileCount": 5,
  "s3_input_prefix": "s3://.../samples_5/",
  "s3_output_prefix": "s3://.../dhyanesh-test/",
  "s3_effective_output_prefix": "s3://.../dhyanesh-test/4bc5b9ae-.../",
  "arcasHla": {
    "batch_job_id": "4bc5b9ae-71a4-48d6-994c-126c36af22ca",
    "status": "SUBMITTED",
    "s3_input_prefix": "s3://.../samples_5/",
    "s3_output_prefix": "s3://.../dhyanesh-test/",
    "s3_effective_output_prefix": "s3://.../dhyanesh-test/4bc5b9ae-.../",
    "threads": 12,
    "file_count": 5,
    "job_queue": "dhyanesh-test-queue",
    "job_definition": "dhyanesh-test-job",
    "failure_reason": null
  }
}
```

### UI field mapping

- Input path: `linked_arcas_hla.s3_input_prefix` or `stage1_hla.s3_input_prefix`
- Output path (base): `linked_arcas_hla.s3_output_prefix`
- Output path (actual job folder): `linked_arcas_hla.s3_effective_output_prefix`
- Logs/artifacts folder: `s3_effective_output_prefix` (contains `*.genotype.log`, `*.genotype.json`, etc.)
- Config: `threads`, `file_count`, `job_queue`, `job_definition`, `job_name`, `batch_job_id`
- Progress: `status`, `failure_reason`, `created_at`, `updated_at`
