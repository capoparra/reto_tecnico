# Data model

## Entities

### Product
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| name | string | |
| description | text | |
| price_in_cents | integer | COP cents |
| stock_units | integer | decremented on successful payment |
| image_url | string | optional |
| created_at | timestamp | |

### Customer
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| full_name | string | |
| email | string | |
| phone | string | |
| created_at | timestamp | |

### Transaction
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| transaction_number | string | unique, human-readable |
| customer_id | UUID | FK |
| product_id | UUID | FK |
| status | enum | PENDING, APPROVED, DECLINED, ERROR |
| amount_product_cents | integer | |
| base_fee_cents | integer | always applied |
| delivery_fee_cents | integer | |
| total_amount_cents | integer | |
| wompi_transaction_id | string | nullable |
| payment_result_message | string | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

### Delivery
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| transaction_id | UUID | FK unique |
| customer_id | UUID | FK |
| product_id | UUID | FK assigned product |
| address_line | string | |
| city | string | |
| region | string | |
| postal_code | string | |
| country | string | default CO |
| status | enum | PENDING, ASSIGNED, SHIPPED |
| created_at | timestamp | |

## Relationships

- Customer 1—N Transaction
- Product 1—N Transaction
- Transaction 1—1 Delivery

## Fees (business rules)

- `BASE_FEE_CENTS`: fixed fee always added to summary
- `DELIVERY_FEE_CENTS`: fixed delivery fee in summary
