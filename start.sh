#!/usr/bin/env bash

# Workzo Development Servers Starter
echo "=================================================="
echo "          Starting Workzo Platform                "
echo "=================================================="

# Start backend in background
echo "Starting Backend Server on port 5001..."
(cd backend && npm start) &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 2

# Start frontend
echo "Starting Frontend Server on port 5173..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "✔ Workzo is running!"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID" INT
wait
