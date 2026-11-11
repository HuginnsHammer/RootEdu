# Database direction

PostgreSQL 16 is the system of record. Use UUID primary keys, foreign keys, normalized institutional relationships, deliberate indexes, constraints and timezone-aware timestamps. Schema changes must be versioned with migrations.

Relationship direction: Institution → Department → Programme → Unit → Cohort → Academic year / semester → student enrollment.

Resources reference academic scope and immutable content hashes. Authorization is evaluated server-side. Tenant context is set from authenticated identity inside each transaction. PostgreSQL row-level security is defense in depth and must be tested under the actual application role.

No production schema or RLS policies are claimed to exist yet.
