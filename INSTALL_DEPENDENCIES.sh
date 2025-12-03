#!/bin/bash
cd backend
npm install prompt-sync bcrypt mongoose cors express express-validator dotenv jsonwebtoken

sleep 2

cd ../frontend/
npm install react-scripts react-router-dom lucide-react xlsx date-fns

echo "Done installing dependencies"
