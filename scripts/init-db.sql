-- Initial database setup for Multi-Shop Accounting
-- This script is run when the PostgreSQL container is first created

-- Create database if it doesn't exist (not needed as it's created by environment variable)
-- CREATE DATABASE IF NOT EXISTS multi_shop_accounting;

-- Set timezone
SET timezone = 'UTC';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create initial schema placeholder
-- Note: Actual tables will be created by Prisma migrations
CREATE SCHEMA IF NOT EXISTS public;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE multi_shop_accounting TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;