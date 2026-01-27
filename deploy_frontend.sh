#!/bin/bash
set -e

echo "======================================"
echo "Food Vision - Frontend Deployment"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if in correct directory
if [ ! -d "frontend" ]; then
    echo -e "${RED}Error: Run this script from the FoodVisionMini root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Enter your GitHub username${NC}"
read -p "GitHub username: " GH_USERNAME

if [ -z "$GH_USERNAME" ]; then
    echo -e "${RED}Error: Username cannot be empty${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Enter your HuggingFace username (for API URL)${NC}"
read -p "HuggingFace username: " HF_USERNAME

if [ -z "$HF_USERNAME" ]; then
    echo -e "${RED}Error: Username cannot be empty${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 3: Setting up remote repository${NC}"
cd frontend

# Remove any existing origin
git remote remove origin 2>/dev/null || true

# Add GitHub remote
GH_REPO="https://github.com/${GH_USERNAME}/foodvision-frontend.git"
git remote add origin $GH_REPO

echo -e "${GREEN}✓ Remote configured: $GH_REPO${NC}"
echo ""

echo -e "${YELLOW}Step 4: Pushing to GitHub${NC}"
echo "You may be prompted for your GitHub credentials"
echo ""
read -p "Press Enter when ready to push..."

# Push to main branch
git branch -M main
git push -u origin main

echo ""
echo -e "${GREEN}======================================"
echo -e "Frontend Pushed to GitHub!"
echo -e "======================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Go to: ${YELLOW}https://vercel.com/new${NC}"
echo ""
echo "2. Click 'Import' next to your foodvision-frontend repository"
echo ""
echo "3. Configure the project:"
echo "   - Framework Preset: Create React App"
echo "   - Build Command: npm run build"
echo "   - Output Directory: build"
echo ""
echo "4. Add Environment Variable:"
echo "   - Name:  ${YELLOW}REACT_APP_API_URL${NC}"
echo "   - Value: ${YELLOW}https://${HF_USERNAME}-foodvision-api.hf.space${NC}"
echo ""
echo "5. Click 'Deploy'"
echo ""
echo "6. Once deployed, configure custom domain:"
echo "   - In Vercel: Settings → Domains → Add foodvis.in"
echo "   - In GoDaddy: DNS Management → Add:"
echo "     * Type: A, Name: @, Value: 76.76.21.21"
echo "     * Type: CNAME, Name: www, Value: cname.vercel-dns.com"
echo ""
echo "7. Wait 5-60 minutes for DNS propagation"
echo ""
echo "8. Visit: ${YELLOW}https://foodvis.in${NC}"
echo ""
