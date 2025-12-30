-- Quick Database Setup for ZimPharmHub
-- Run this as postgres superuser: psql -U postgres -f quick_setup.sql

-- Step 1: Create database (drop if exists)
DROP DATABASE IF EXISTS zimpharmhub;
CREATE DATABASE zimpharmhub;

-- Step 2: Create user (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'zimpharmuser') THEN
    CREATE USER zimpharmuser WITH PASSWORD 'password123';
  END IF;
END
$$;

-- Step 3: Grant privileges
GRANT ALL PRIVILEGES ON DATABASE zimpharmhub TO zimpharmuser;

-- Step 4: Connect to database and set up
\c zimpharmhub

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO zimpharmuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO zimpharmuser;

-- Note: Tables will be created by running create_tables.sql separately
-- After this script, run: psql -U zimpharmuser -d zimpharmhub -f create_tables.sql


