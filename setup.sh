#!/bin/bash

echo "🚀 kaamSeKaam - Setup Script"
echo "============================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "\n${YELLOW}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js v18+${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Check MySQL
echo -e "\n${YELLOW}Checking MySQL installation...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL not found. Please install MySQL 8.0+${NC}"
    exit 1
fi
echo -e "${GREEN}✅ MySQL installed${NC}"

# Backend Setup
echo -e "\n${YELLOW}Setting up Backend...${NC}"
cd backend

if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please update backend/.env with your configuration${NC}"
fi

echo -e "${YELLOW}Installing backend dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend setup complete${NC}"
else
    echo -e "${RED}❌ Backend setup failed${NC}"
    exit 1
fi

cd ..

# Frontend Setup
echo -e "\n${YELLOW}Setting up Frontend...${NC}"
cd frontend

if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
fi

echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend setup complete${NC}"
else
    echo -e "${RED}❌ Frontend setup failed${NC}"
    exit 1
fi

cd ..

# Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Update backend/.env with your configuration"
echo -e "   - Database credentials"
echo -e "   - SMTP credentials (Gmail)"
echo -e "   - Admin credentials"
echo -e ""
echo -e "2. Run backend: cd backend && npm run dev"
echo -e "3. Run frontend: cd frontend && npm run dev"
echo -e ""
echo -e "4. Create database and seed data:"
echo -e "   cd backend && npm run seed"
echo -e ""
echo -e "5. Access the application:"
echo -e "   Frontend: http://localhost:5173"
echo -e "   Backend:  http://localhost:5000"
echo -e ""
echo -e "${YELLOW}Admin Login:${NC}"
echo -e "Email:    admin@kaamsekaaam.com"
echo -e "Password: Admin@12345"
echo -e ""
echo -e "${YELLOW}For Docker deployment:${NC}"
echo -e "docker-compose up --build"
