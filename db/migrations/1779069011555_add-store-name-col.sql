-- Up Migration
ALTER TABLE public.store ADD COLUMN name text;

-- Down Migration
ALTER TABLE public.store DROP COLUMN name;