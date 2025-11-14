<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# E-commerce App (GStudio)

Production-ready Express + React (Vite) application deployable on Google Cloud Run.

## Run Locally

**Prerequisites:** Node.js 20+, npm

1. Install dependencies:
   `npm install`
2. Set required environment variables (see below).
3. Run the app in development (Express + Vite middleware):
   `npm run dev`

## Required Environment Variables

| Name | Description |
|------|-------------|
| `DATABASE_URL` | Neon/Postgres connection string (required) |
| `SESSION_SECRET` | JWT signing secret for auth tokens (set a strong value in prod) |
| `PORT` | Port to listen on (Cloud Run injects 8080 automatically) |

Optional: Set `GCS_BUCKET` to enable Google Cloud Storage image uploads (see below). Remove any legacy Replit keys; they are no longer used.

## Production Build

This bundles the server with esbuild and builds the client:

```
npm run build
```

Start after build:

```
npm start
```

## Deploy to Google Cloud Run

### Option A: Manual Docker Build & Deploy

Authenticate and configure project:

```
gcloud auth login
gcloud config set project <YOUR_PROJECT_ID>
gcloud auth configure-docker
```

Build and push image:

```
docker build -t gcr.io/<YOUR_PROJECT_ID>/gstudio-app:latest .
docker push gcr.io/<YOUR_PROJECT_ID>/gstudio-app:latest
```

Deploy to Cloud Run (public, adjust region):

```
gcloud run deploy gstudio-app \
  --image gcr.io/<YOUR_PROJECT_ID>/gstudio-app:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars DATABASE_URL=<your_db_url>,SESSION_SECRET=<strong_secret>
```

### Option B: Cloud Build Automation

Use the provided `cloudbuild.yaml`:

```
gcloud builds submit --substitutions _DATABASE_URL=<your_db_url>,_SESSION_SECRET=<strong_secret>
```

This will build, push, and deploy automatically using the defaults in the file.

### Health Check & Verification

After deploy, verify:

```
curl https://<cloud-run-url>/api/health
```

Should return `{"status":"ok"}`.

### Notes

* Cloud Run sets `PORT=8080`; the app reads `process.env.PORT` in `server/index.ts`.
* Multi-stage Dockerfile keeps runtime image small (only prod deps + build artifacts).
* Ensure the `DATABASE_URL` points to a reachable Postgres (Neon serverless recommended).
* For secrets use: `gcloud secrets create ...` then `--set-secrets` flag instead of `--set-env-vars` for stricter security.

### Google Cloud Storage (Optional)

Set up a bucket and grant the Cloud Run service account `Storage Object Admin` (or fine-grained IAM). Then set:

```
GCS_BUCKET=<your-bucket-name>
```

When present, image uploads will store files in the bucket instead of local disk.

### Structured Logging (Optional)

Add:

```
ENABLE_GCP_LOGGING=true
```

This will emit JSON logs compatible with Cloud Logging.

### Future Improvements

* CI pipeline (GitHub Actions) invoking `gcloud builds submit`.
* OpenTelemetry tracing for API endpoints.
* Automated Drizzle migrations before deploy.
* CDN fronting Cloud Run (Cloud CDN + Load Balancer).
