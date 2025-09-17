#!/bin/bash

# Database reset script for Multi-Shop Accounting

set -e

echo "🔄 Resetting development database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop containers and remove volumes
echo "🧹 Stopping containers and removing data..."
docker-compose down -v

# Remove any orphaned containers
docker-compose rm -f

# Restart with fresh data
echo "🚀 Starting fresh database..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

echo "✅ Database reset complete!"
echo ""
echo "🔧 Don't forget to run migrations:"
echo "  pnpm db:migrate"