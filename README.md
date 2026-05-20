# Product Checkout App

Full-stack onboarding app for product purchase with card payment (technical challenge).

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React SPA, Redux Toolkit, Jest, Vite |
| Backend | Nest.js, TypeScript, Hexagonal + ROP, Jest |
| Database | PostgreSQL |
| Payment | Wompi Sandbox API |
| Deploy | AWS (see [docs/deploy-aws.md](./docs/deploy-aws.md)) |

## Business flow (5 screens)

1. **Product** — stock, description, price, `Pay with credit card`
2. **Modal** — card (Luhn + VISA/MC detection) + customer + delivery + Wompi terms
3. **Backdrop summary** — product + base fee + delivery fee → Pay
4. **Result** — transaction status
5. **Product** — refreshed stock

Progress is persisted in `localStorage` (refresh-safe).

## Data model

[docs/data-model.md](./docs/data-model.md)

## API

- Swagger: `http://localhost:3000/api/docs`
- Endpoints: [docs/api-endpoints.md](./docs/api-endpoints.md)
- Postman: [docs/postman/checkout-api.postman_collection.json](./docs/postman/checkout-api.postman_collection.json)
- Wompi pay: `POST /api/transactions/:id/pay`

## Local development

```bash
# 1. Database
docker compose up -d

# 2. Backend
copy .env.example backend\.env
cd backend && npm install && npm run start:dev

# 3. Frontend (new terminal)
cd frontend && npm install && npm run dev
```

Open http://localhost:5173

### Sandbox card (Wompi)

- `4242424242424242` — VISA, approved in sandbox
- Exp: any future date, CVC: `123`

## Tests

```bash
cd backend && npm run test:cov
cd frontend && npm run test:cov
```

## Verify backend

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-backend.ps1
```

## Project structure

```
product-checkout-app/
├── backend/     # Nest.js API + Wompi adapter
├── frontend/    # React + Redux
├── docs/
├── scripts/
└── docker-compose.yml
```

## Progress

- [x] Paso 0–2: API, DB, customers, transactions, deliveries
- [x] Paso 3: Wompi Sandbox (`POST /transactions/:id/pay`)
- [x] Paso 4: Frontend React + Redux (5 screens)
- [x] Paso 5: Unit tests (run `test:cov` locally)
- [ ] AWS deploy URLs (configure in your account)

## Deployment

| Service | URL |
|---------|-----|
| Frontend | _configure S3 + CloudFront_ |
| Backend API | _configure ECS/RDS_ |

See [docs/deploy-aws.md](./docs/deploy-aws.md).
