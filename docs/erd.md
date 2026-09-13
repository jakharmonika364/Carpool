# Entity Relationship Diagram — Month 1 Foundation

```mermaid
erDiagram
    USERS ||--o{ VEHICLES : owns
    USERS ||--o{ RIDES : drives
    USERS ||--o{ RIDE_REQUESTS : requests
    VEHICLES ||--o{ RIDES : "used for"
    RIDES ||--o{ RIDE_REQUESTS : receives

    USERS {
        uuid id PK
        varchar full_name
        varchar email UK
        varchar phone_number UK
        varchar password_hash
        enum role "student | admin"
        enum verification_status "pending | verified | suspended"
        varchar profile_image_key "nullable"
        timestamp created_at
        timestamp updated_at
    }

    VEHICLES {
        uuid id PK
        uuid owner_id FK
        varchar make
        varchar model
        varchar colour
        varchar registration_number
        integer seat_capacity
        timestamp created_at
        timestamp updated_at
    }

    RIDES {
        uuid id PK
        uuid driver_id FK
        uuid vehicle_id FK "nullable"
        varchar pickup_address
        geography pickup_point "Point, 4326"
        varchar destination_address
        geography destination_point "Point, 4326"
        timestamptz departure_at
        integer total_seats
        integer available_seats
        enum status "draft|published|full|active|completed|cancelled"
        text notes "nullable"
        timestamp created_at
        timestamp updated_at
    }

    RIDE_REQUESTS {
        uuid id PK
        uuid ride_id FK
        uuid rider_id FK
        enum status "pending|accepted|declined|cancelled|expired"
        timestamp requested_at
        timestamp responded_at "nullable"
    }
```

## Notes

- `vehicles`, `rides`, and `ride_requests` are created by migrations in Month 1 for future use;
  only `users` has application-level CRUD (registration, profile) in this phase.
- `rides.pickup_point` / `rides.destination_point` are indexed with PostGIS GIST indexes to
  support future "rides near me" queries.
- Check constraints on `rides` enforce `total_seats > 0`, `available_seats >= 0`, and
  `available_seats <= total_seats` at the database level.
