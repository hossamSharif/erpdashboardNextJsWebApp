#!/bin/bash

# Database setup script for Multi-Shop Accounting

set -e

echo "🚀 Setting up development database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop and remove existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down -v

# Start database services
echo "🐘 Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec multi-shop-postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "  Waiting for PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
until docker exec multi-shop-redis redis-cli ping > /dev/null 2>&1; do
    echo "  Waiting for Redis..."
    sleep 2
done

echo "✅ Redis is ready!"

echo "🎉 Database setup complete!"
echo ""
echo "📊 Database connection details:"
echo "  PostgreSQL: postgresql://postgres:postgres@localhost:5432/multi_shop_accounting"
echo "  Redis: redis://localhost:6379"
echo "  Adminer (DB UI): http://localhost:8080"
echo ""
echo "🔧 Next steps:"
echo "  1. Install dependencies: pnpm install"
echo "  2. Run Prisma migrations: pnpm db:migrate"
echo "  3. Start development: pnpm dev"