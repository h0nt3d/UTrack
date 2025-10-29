:: Start installing backend dependencies in a new terminal
start cmd /k "cd backend && npm install prompt-sync bcrypt mongoose cors express dotenv"

:: Wait for 2 seconds
timeout /t 2

:: Start installing frontend dependencies in a new terminal
start cmd /k "cd frontend && npm install react-scripts react-router-dom lucide-react xlsx"

:: Finish
echo Done starting backend and frontend installations
pause
