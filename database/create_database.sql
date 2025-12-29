-- ZimPharmHub PostgreSQL Database Setup
-- Run this script as a PostgreSQL superuser (postgres)

-- Create database
CREATE DATABASE zimpharmhub;

-- Create user (optional - you can use existing postgres user)
CREATE USER zimpharmuser WITH PASSWORD 'password123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE zimpharmhub TO zimpharmuser;

-- Connect to the database (you'll need to run this separately)
-- \c zimpharmhub

-- Grant schema privileges
ALTER DATABASE zimpharmhub OWNER TO zimpharmuser;

