#!/bin/bash

echo "🚀 Starting Tiko Development Environment"

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Please run this script from the TeamManager root directory"
    exit 1
fi

# Install root dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

echo "✅ Setup complete!"
echo ""
echo "Starting both development servers concurrently..."
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API will be available at: http://localhost:8000"
echo "API health check: http://localhost:8000/health"
echo ""

# Start both servers using concurrently
npm run dev