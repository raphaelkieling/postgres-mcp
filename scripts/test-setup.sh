#!/bin/bash

# Start PostgreSQL container
docker-compose -f docker-compose.test.yml up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker-compose -f docker-compose.test.yml exec -T postgres_test pg_isready -U test_user -d test_db; do
  sleep 1
done

# Initialize database with schema and seed data
echo "Initializing database..."
docker-compose -f docker-compose.test.yml exec -T postgres_test psql -U test_user -d test_db < db/init.test.sql

# Set DATABASE_URL for tests
export DATABASE_URL="postgres://test_user:test_password@localhost:5433/test_db"

# Check database tables in the database
docker-compose -f docker-compose.test.yml exec -T postgres_test psql -U test_user -d test_db -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"

sleep 3

# Set the .env
echo "DATABASE_URL=$DATABASE_URL" > .env

# Run tests
echo "Running tests..."
bun test

# Capture test exit code
TEST_EXIT_CODE=$?

# Clean up
echo "Cleaning up..."
docker-compose -f docker-compose.test.yml down

# Exit with test exit code
exit $TEST_EXIT_CODE 