#!/bin/bash
# ==============================================================================
# Enterprise MLOps Platform - Bootstrapping Script
# ==============================================================================
set -e

# Terminal Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================================${NC}"
echo -e "${CYAN}    🚀 BOOTSTRAPPING ENTERPRISE MLOPS PLATFORM SERVICES ${NC}"
echo -e "${CYAN}========================================================${NC}"

# Get absolute path of this project directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Step 1: Validate Docker runtime
if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}❌ Error: Docker daemon is not running. Please start Docker first.${NC}"
  exit 1
fi

# Step 2: Setup docker bridge network
echo -e "\n${BLUE}>>> [STEP 1/4] Configuring Docker Network 'mlops-net'...${NC}"
docker network create mlops-net 2>/dev/null || true

# Step 3: Stop old runs
echo -e "\n${BLUE}>>> [STEP 2/4] Cleaning existing containers...${NC}"
docker rm -f mlops-backend mlops-frontend 2>/dev/null || true

# Step 4: Build and run backend
echo -e "\n${BLUE}>>> [STEP 3/4] Building & Starting FastAPI MLOps Backend...${NC}"
docker build -t mlops-backend -f Dockerfile.backend .
docker run -d \
  --name mlops-backend \
  --network mlops-net \
  -p 8000:8000 \
  -e MLFLOW_TRACKING_URI=http://localhost:8000/api/mlflow \
  mlops-backend

# Step 5: Build and run frontend
echo -e "\n${BLUE}>>> [STEP 4/4] Building & Starting React/Nginx Frontend...${NC}"
docker build -t mlops-frontend -f Dockerfile.frontend .
docker run -d \
  --name mlops-frontend \
  --network mlops-net \
  -p 3000:3000 \
  mlops-frontend

# Step 6: Verify health check
echo -e "\n${YELLOW}⏳ Waiting for backend API to initialize...${NC}"
retries=10
while [ $retries -gt 0 ]; do
  if curl -s http://localhost:8000/health | grep -q "ONLINE"; then
    echo -e "${GREEN}✓ Backend service verified ONLINE!${NC}"
    break
  fi
  sleep 1.5
  retries=$((retries-1))
done

if [ $retries -eq 0 ]; then
  echo -e "${RED}⚠️  Warning: Backend did not report ready. Check logs with 'docker logs mlops-backend'${NC}"
fi

echo -e "\n${GREEN}========================================================${NC}"
echo -e "${GREEN}  🎉 Enterprise MLOps Control Plane is Bootstrapped!   ${NC}"
echo -e "${GREEN}========================================================${NC}"
echo -e "${CYAN}🖥️  React Dashboard:  http://localhost:3000${NC}"
echo -e "${CYAN}⚙️  FastAPI API Docs: http://localhost:8000/docs${NC}"
echo -e "${CYAN}🩺 Health Status:    http://localhost:8000/health${NC}"
echo -e "${GREEN}========================================================${NC}"
echo -e "To view runtime logs:  docker logs -f mlops-backend"
echo -e "To stop platform:      ./stop.sh"
echo -e "${GREEN}========================================================${NC}\n"
