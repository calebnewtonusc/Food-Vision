#!/bin/bash
set -e

echo "=========================================="
echo "  Food Vision - Complete Deployment"
echo "=========================================="
echo ""
echo "This script will guide you through deploying:"
echo "  1. Backend API to HuggingFace Spaces"
echo "  2. Frontend to GitHub + Vercel"
echo "  3. Custom domain configuration (foodvis.in)"
echo ""
echo "Prerequisites:"
echo "  ✓ Git LFS installed (already done)"
echo "  ✓ Backend committed (already done)"
echo "  ✓ Frontend committed (already done)"
echo "  ✓ Model trained (97.20% accuracy)"
echo ""
echo "You'll need:"
echo "  • HuggingFace account + access token"
echo "  • GitHub account"
echo "  • Vercel account"
echo "  • GoDaddy access (for foodvis.in domain)"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

read -p "Ready to start? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}=========================================="
echo -e "Part 1: Backend Deployment"
echo -e "==========================================${NC}"
echo ""
echo "You need:"
echo "  • HuggingFace account: https://huggingface.co/join"
echo "  • Create a new Space:"
echo "    - Go to: https://huggingface.co/new-space"
echo "    - Name: foodvision-api"
echo "    - SDK: Docker"
echo "    - Hardware: CPU Basic (free)"
echo "    - Visibility: Public"
echo "  • Access token: https://huggingface.co/settings/tokens"
echo ""
read -p "Have you created the HuggingFace Space? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Please create the Space first, then run this script again."
    echo "Or run: ./deploy_backend.sh"
    exit 0
fi

# Run backend deployment
./deploy_backend.sh

echo ""
echo -e "${GREEN}✓ Backend deployment initiated${NC}"
echo ""
echo "Waiting for HuggingFace to build (5-10 minutes)..."
echo "You can check progress at: https://huggingface.co/spaces/YOUR_USERNAME/foodvision-api"
echo ""
read -p "Press Enter when backend is ready (health check passes)..."

echo ""
echo -e "${BLUE}=========================================="
echo -e "Part 2: Frontend Deployment"
echo -e "==========================================${NC}"
echo ""
echo "You need:"
echo "  • GitHub account: https://github.com/join"
echo "  • Create a new repository:"
echo "    - Go to: https://github.com/new"
echo "    - Name: foodvision-frontend"
echo "    - Visibility: Public"
echo "    - Don't initialize with README"
echo "  • Vercel account: https://vercel.com/signup"
echo ""
read -p "Have you created the GitHub repository? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Please create the repository first, then run this script again."
    echo "Or run: ./deploy_frontend.sh"
    exit 0
fi

# Run frontend deployment
./deploy_frontend.sh

echo ""
echo -e "${GREEN}=========================================="
echo -e "Deployment Complete!"
echo -e "==========================================${NC}"
echo ""
echo "What you've accomplished:"
echo "  ✓ Trained model with 97.20% accuracy"
echo "  ✓ Backend API deployed to HuggingFace Spaces"
echo "  ✓ Frontend code pushed to GitHub"
echo "  ✓ Ready for Vercel deployment"
echo ""
echo "Final steps:"
echo "  1. Deploy frontend on Vercel (5 minutes)"
echo "  2. Configure custom domain (15 minutes)"
echo "  3. Test end-to-end at https://foodvis.in"
echo ""
echo "Cost: ~$1/month (domain only, HF + Vercel free)"
echo ""
echo "Congratulations! 🎉"
echo ""
