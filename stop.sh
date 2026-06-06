#!/bin/bash
# ==============================================================================
# Enterprise MLOps Platform - Teardown Script
# ==============================================================================

# Terminal Colors
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${RED}========================================================${NC}"
echo -e "${RED}       Stopping MLOps platform Service Containers       ${NC}"
echo -e "${RED}========================================================${NC}"

# Stop and delete containers
docker rm -f mlops-backend mlops-frontend 2>/dev/null || true

# Delete network
docker network rm mlops-net 2>/dev/null || true

echo -e "${RED}✓ MLOps Platform containers stopped and networks deleted.${NC}"
echo -e "${RED}========================================================${NC}"
