# Supabase

`migrations/` holds the SQL for the database. Apply it with the SQL editor or the Supabase CLI
(see the main README). The `profiles` table has Row Level Security: users can only read and update
their own row, and a trigger on `auth.users` creates the row at sign up.
