#!/bin/bash
set -e

echo "======================================"
echo "Food Vision - Backend Deployment"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if in correct directory
if [ ! -d "backend" ]; then
    echo -e "${RED}Error: Run this script from the FoodVisionMini root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Enter your HuggingFace username${NC}"
read -p "HuggingFace username: " HF_USERNAME

if [ -z "$HF_USERNAME" ]; then
    echo -e "${RED}Error: Username cannot be empty${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Setting up remote repository${NC}"
cd backend

# Remove any existing origin
git remote remove origin 2>/dev/null || true

# Add HuggingFace Spaces remote
HF_REPO="https://huggingface.co/spaces/${HF_USERNAME}/foodvision-api"
git remote add origin $HF_REPO

echo -e "${GREEN}✓ Remote configured: $HF_REPO${NC}"
echo ""

echo -e "${YELLOW}Step 3: Pushing to HuggingFace Spaces${NC}"
echo "You may be prompted for your HuggingFace credentials:"
echo "  Username: $HF_USERNAME"
echo "  Password: Use your HuggingFace Access Token (not your password!)"
echo ""
echo "Get your token from: https://huggingface.co/settings/tokens"
echo ""
read -p "Press Enter when ready to push..."

# Push to main branch
git push -u origin main

echo ""
echo -e "${GREEN}======================================"
echo -e "Backend Deployment Complete!"
echo -e "======================================${NC}"
echo ""
echo "Your API will be available at:"
echo "  ${YELLOW}https://${HF_USERNAME}-foodvision-api.hf.space${NC}"
echo ""
echo "Next steps:"
echo "  1. Wait 5-10 minutes for HuggingFace to build the Docker container"
echo "  2. Test your API:"
echo "     curl https://${HF_USERNAME}-foodvision-api.hf.space/health"
echo "  3. Run ./deploy_frontend.sh to deploy the frontend"
echo ""
