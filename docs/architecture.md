# Hexagonal architecture (backend)

```
backend/src/
├── domain/                 # Enums and domain concepts
├── application/
│   ├── ports/              # Interfaces (adapters contract)
│   ├── use-cases/          # Business logic + ROP
│   └── result/             # Railway Oriented Programming helpers
├── infrastructure/         # Adapters (DB, Wompi — step 5)
│   └── persistence/
└── interfaces/             # Driving adapters (HTTP)
    └── http/
        ├── controllers/    # Thin controllers, no business logic
        └── dto/
```

Controllers call use cases only. Use cases depend on ports, not on TypeORM.
