# AWS deployment (recommended)

## Architecture

| Component | Service |
|-----------|---------|
| Frontend SPA | S3 + CloudFront |
| Backend API | ECS Fargate or Elastic Beanstalk |
| Database | RDS PostgreSQL |

## Backend

1. Build Docker image from `backend/Dockerfile` (create if needed) or deploy to Elastic Beanstalk.
2. Set environment variables from `.env.example`.
3. Run migrations / enable `synchronize` only for dev.
4. Expose port 3000 behind ALB with HTTPS.

## Frontend

1. `cd frontend && npm run build`
2. Upload `dist/` to S3 bucket.
3. CloudFront origin → S3, default root `index.html`.
4. Set `VITE_API_URL=https://api.your-domain.com/api` at build time.

## CI suggestion

- GitHub Actions: test → build → deploy on `main`.
- Use branches + PRs per feature as required by the challenge.
