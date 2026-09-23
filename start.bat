@echo off
echo ==========================================
echo   Stock Market Predictor - Starting...
echo ==========================================
echo.

echo Starting Backend (FastAPI)...
start "Backend" cmd /k "cd /d \"e:\d2d btech sem 5\ML\Project(1)\backend\" && python -m uvicorn main:app --host 127.0.0.1 --port 8000"

timeout /t 5 /nobreak >nul

echo Starting Frontend (React + Vite)...
start "Frontend" cmd /k "cd /d \"e:\d2d btech sem 5\ML\Project(1)\frontend\" && npm run dev -- --port 5173"

timeout /t 3 /nobreak >nul

echo.
echo ==========================================
echo   App is starting up!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo ==========================================
echo.
pause
