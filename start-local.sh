#!/bin/bash

# ─────────────────────────────────────────────
#  NexusBot — Local Startup Script
#  Runs backend (Java) + frontend (React)
# ─────────────────────────────────────────────

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║       NexusBot — Starting Up         ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── 1. Load backend environment variables ──
if [ -f "$BACKEND_DIR/.env" ]; then
  export $(grep -v '^#' "$BACKEND_DIR/.env" | xargs)
  echo "✅ Environment variables loaded"
else
  echo "❌ backend/.env not found. Aborting."
  exit 1
fi

# ── 2. Kill anything already on port 8080 ──
echo ""
EXISTING=$(lsof -ti:8080 2>/dev/null)
if [ -n "$EXISTING" ]; then
  echo "⚠️  Port 8080 in use (PID $EXISTING) — killing it..."
  kill -9 $EXISTING 2>/dev/null
  sleep 1
  echo "✅ Port 8080 is now free"
fi

# ── 3. Kill anything already on port 3000 ──
EXISTING3=$(lsof -ti:3000 2>/dev/null)
if [ -n "$EXISTING3" ]; then
  echo "⚠️  Port 3000 in use (PID $EXISTING3) — killing it..."
  kill -9 $EXISTING3 2>/dev/null
  sleep 1
  echo "✅ Port 3000 is now free"
fi

# ── 4. Build the backend ──
echo ""
echo "🔨 Building backend (Maven)..."
cd "$BACKEND_DIR"
mvn package -DskipTests -q
if [ $? -ne 0 ]; then
  echo "❌ Maven build failed. Fix the errors above and try again."
  exit 1
fi
echo "✅ Backend built successfully"

# ── 5. Start backend in background ──
echo ""
echo "🚀 Starting backend on http://localhost:8080 ..."
PORT=8080 java -jar "$BACKEND_DIR/target/chatbot-backend-1.0-SNAPSHOT-jar-with-dependencies.jar" &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo "   Waiting for backend to start..."
for i in {1..20}; do
  sleep 1
  if curl -s http://localhost:8080/test > /dev/null 2>&1; then
    echo "✅ Backend is up!"
    break
  fi
  if [ $i -eq 20 ]; then
    echo "❌ Backend did not start in time. Check logs above."
    kill $BACKEND_PID 2>/dev/null
    exit 1
  fi
done

# ── 6. Install frontend deps if needed ──
echo ""
echo "📦 Checking frontend dependencies..."
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
  echo "   Installing npm packages (first time, may take a minute)..."
  npm install --silent
fi
echo "✅ Frontend dependencies ready"

# ── 7. Start frontend ──
echo ""
echo "🚀 Starting frontend on http://localhost:3000 ..."
# Unset PORT so React doesn't inherit the backend's port 8080
unset PORT
PORT=3000 npm start &
FRONTEND_PID=$!

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  NexusBot is running!                    ║"
echo "║                                          ║"
echo "║  Frontend  →  http://localhost:3000      ║"
echo "║  Backend   →  http://localhost:8080      ║"
echo "║  DB Status →  http://localhost:8080/api/db-status  ║"
echo "║                                          ║"
echo "║  Press Ctrl+C to stop both servers       ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 8. Handle Ctrl+C cleanly ──
trap "echo ''; echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
