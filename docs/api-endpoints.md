# API Endpoints

Base URL: `http://localhost:3000/api`

## Stock (product)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | Product with description, price and stock units |

## Config

| Method | Path | Description |
|--------|------|-------------|
| GET | `/config/fees` | Base fee + delivery fee (for payment summary) |

## Customers

| Method | Path | Description |
|--------|------|-------------|
| POST | `/customers` | Create customer |
| GET | `/customers/:id` | Get customer by id |

## Transactions

| Method | Path | Description |
|--------|------|-------------|
| POST | `/transactions` | Create transaction `PENDING` + delivery + transaction number |
| GET | `/transactions/:id` | Get transaction by id |
| GET | `/transactions/by-number/:transactionNumber` | Get by transaction number |
| GET | `/transactions/:transactionId/delivery` | Delivery for transaction |
| POST | `/transactions/:id/pay` | Pay with card via Wompi Sandbox (tokenize + charge + finalize) |
| PATCH | `/transactions/:id/payment-result` | Finalize payment manually; on `APPROVED` updates stock and assigns delivery |
| GET | `/wompi/acceptance-tokens` | Wompi contract links for UI checkboxes |

## Deliveries

| Method | Path | Description |
|--------|------|-------------|
| GET | `/deliveries/:id` | Get delivery by id |

## Payment result body

```json
{
  "status": "APPROVED",
  "wompiTransactionId": "sandbox-id",
  "paymentResultMessage": "Optional message"
}
```

Allowed statuses: `APPROVED`, `DECLINED`, `ERROR`.
