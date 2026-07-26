@echo off
REM kaamSeKaam - Windows Setup Script

echo.
echo ================================
echo kaamSeKaam - Setup Script
echo ================================
echo.

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js not found. Please install Node.js v18+
    pause
    exit /b 1
)
echo Node.js is installed
node --version

REM Check npm
echo.
echo Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm not found
    pause
    exit /b 1
)
echo npm is installed
npm --version

REM Backend Setup
echo.
echo ================================
echo Setting up Backend...
echo ================================
cd backend

if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please update backend\.env with your configuration
)

echo Installing backend dependencies...
call npm install
if errorlevel 1 (
    echo Error: Backend setup failed
    pause
    exit /b 1
)
echo Backend setup complete

cd ..

REM Frontend Setup
echo.
echo ================================
echo Setting up Frontend...
echo ================================
cd frontend

if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
)

echo Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo Error: Frontend setup failed
    pause
    exit /b 1
)
echo Frontend setup complete

cd ..

REM Summary
echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next Steps:
echo 1. Update backend\.env with your configuration
echo    - Database credentials
echo    - SMTP credentials
echo    - Admin credentials
echo.
echo 2. Run backend: cd backend ^&^& npm run dev
echo 3. Run frontend: cd frontend ^&^& npm run dev
echo.
echo 4. Access the application:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo.
echo Admin Login:
echo Email:    admin@kaamsekaaam.com
echo Password: Admin@12345
echo.
pause
