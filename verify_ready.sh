#!/bin/bash

echo "=========================================="
echo "  Food Vision - Deployment Readiness Check"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

READY=true

echo "Checking prerequisites..."
echo ""

# Check 1: Git LFS
echo -n "Git LFS installed: "
if command -v git-lfs &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "  Run: brew install git-lfs"
    READY=false
fi

# Check 2: Backend model
echo -n "Backend model exists: "
if [ -f "backend/models/best_model.pth" ]; then
    SIZE=$(du -sh backend/models/best_model.pth | cut -f1)
    echo -e "${GREEN}✓${NC} ($SIZE)"
else
    echo -e "${RED}✗${NC}"
    echo "  Model not found at backend/models/best_model.pth"
    READY=false
fi

# Check 3: Backend git repo
echo -n "Backend git initialized: "
if [ -d "backend/.git" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "  Run: cd backend && git init"
    READY=false
fi

# Check 4: Backend committed
echo -n "Backend committed: "
cd backend
COMMITS=$(git rev-list --count HEAD 2>/dev/null)
if [ "$COMMITS" -gt 0 ] 2>/dev/null; then
    echo -e "${GREEN}✓${NC} ($COMMITS commit)"
else
    echo -e "${RED}✗${NC}"
    echo "  No commits found"
    READY=false
fi
cd ..

# Check 5: Frontend git repo
echo -n "Frontend git initialized: "
if [ -d "frontend/.git" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "  Run: cd frontend && git init"
    READY=false
fi

# Check 6: Frontend committed
echo -n "Frontend committed: "
cd frontend
COMMITS=$(git rev-list --count HEAD 2>/dev/null)
if [ "$COMMITS" -gt 0 ] 2>/dev/null; then
    echo -e "${GREEN}✓${NC} ($COMMITS commit)"
else
    echo -e "${RED}✗${NC}"
    echo "  No commits found"
    READY=false
fi
cd ..

# Check 7: Deployment scripts
echo -n "Deployment scripts: "
if [ -x "deploy.sh" ] && [ -x "deploy_backend.sh" ] && [ -x "deploy_frontend.sh" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "  Scripts not found or not executable"
    READY=false
fi

# Check 8: Documentation
echo -n "Documentation complete: "
if [ -f "START_HERE.md" ] && [ -f "COPY_PASTE_COMMANDS.md" ] && [ -f "READY_TO_DEPLOY.md" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    READY=false
fi

# Check 9: Training artifacts
echo -n "Model trained: "
if [ -f "artifacts/improved/best_model.pth" ]; then
    if [ -f "artifacts/improved/evaluation_summary.json" ]; then
        ACCURACY=$(grep -o '"accuracy": [0-9.]*' artifacts/improved/evaluation_summary.json | cut -d' ' -f2)
        echo -e "${GREEN}✓${NC} (${ACCURACY} accuracy)"
    else
        echo -e "${GREEN}✓${NC}"
    fi
else
    echo -e "${RED}✗${NC}"
    echo "  Model not trained yet"
    READY=false
fi

# Check 10: Git LFS tracking
echo -n "Git LFS tracking configured: "
if [ -f "backend/.gitattributes" ]; then
    if grep -q "*.pth" backend/.gitattributes; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠${NC} (.gitattributes exists but may not track .pth files)"
    fi
else
    echo -e "${RED}✗${NC}"
    echo "  Missing backend/.gitattributes"
    READY=false
fi

echo ""
echo "=========================================="
if [ "$READY" = true ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED!${NC}"
    echo "=========================================="
    echo ""
    echo "You're ready to deploy! Next steps:"
    echo ""
    echo "  1. Open: START_HERE.md"
    echo "  2. Or run: ./deploy.sh"
    echo ""
    echo "You're 25 minutes away from https://foodvis.in! 🚀"
else
    echo -e "${RED}✗ SOME CHECKS FAILED${NC}"
    echo "=========================================="
    echo ""
    echo "Please fix the issues above before deploying."
fi
echo ""
