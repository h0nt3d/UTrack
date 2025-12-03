start cmd /k "cd backend && npm install prompt-sync bcrypt mongoose cors express express-validator dotenv jsonwebtoken"

timeout /t 2

start cmd /k "cd frontend && npm install react-scripts react-router-dom lucide-react xlsx date-fns"

echo Done installing dependencies
pause


