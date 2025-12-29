-- Complete Database Setup Script
-- Run this as postgres superuser: psql -U postgres -f setup_all.sql
-- Or connect first: psql -U postgres, then: \i setup_all.sql

-- ============================================
-- STEP 1: Create Database and User
-- ============================================
-- Drop database if exists (optional - remove if you want to keep existing data)
-- DROP DATABASE IF EXISTS zimpharmhub;

CREATE DATABASE zimpharmhub;

-- Create user (skip if user already exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'zimpharmuser') THEN
    CREATE USER zimpharmuser WITH PASSWORD 'password123';
  END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE zimpharmhub TO zimpharmuser;

-- Connect to the database
\c zimpharmhub

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO zimpharmuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO zimpharmuser;

-- ============================================
-- STEP 2: Enable Extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 3: Create All Tables
-- (Copy all table creation code from create_tables.sql here)
-- ============================================

-- Continue with rest of create_tables.sql content...

