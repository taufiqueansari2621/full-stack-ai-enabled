# Isolated managed D1 recovery drill

Exercise Cloudflare Time Travel on a newly created, unbound, synthetic-only
database. Never export, import, restore, delete or mutate production learner
data for a drill. Apply the current checked-in migrations, insert fictional
records, capture a bookmark, change only fictional data, restore the exact
scratch database and verify records, triggers, foreign keys and write recovery.

The script must reject the production name/UUID and any target not explicitly
named `forge-restore-drill-YYYYMMDD`. It requires an explicit matching target ID
and does not create/delete databases or modify Worker bindings automatically.
An explicit preloaded-schema mode checks migration object identity and zero
rows in every table before seeding. A dedicated binding-free config plus UUID
targeting avoids production binding-name ambiguity.
Commit reproducible verification and actual provider results. A synthetic
provider drill is not an export/import of real production records or a promise
that all incident recovery scenarios are solved. Cleanup requires an exact
target check; leaving a small unbound scratch database is preferable to unsafe
deletion. No paid service or production deployment is needed for this unit.
