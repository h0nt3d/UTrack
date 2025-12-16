# UTrack

UTrack is a system designed for instructors to simulate the productivity of students inside a project using three metric evaluations:
- Team Point Distribution: Team points given every member by each member of the team.
- Bus Factor: The calculated minimum number of team members that if removed will cause the project to fail.
- Joy Factor: The current satisfaction or happiness of a team member.

<img src="https://github.com/h0nt3d/UTrack/blob/main/images/Metrics1.png?raw=true" alt="image1" width="350" height="350"> <img src="https://github.com/h0nt3d/UTrack/blob/main/images/Metrics2.png?raw=true" alt="image1" width="350" height="350">

# Dependencies
### Backend:
- prompt-sync
- bcrypt
- mongoose
- cors
- express
- express-validator
- dotenv
- jsonwebtoken

### Frontend:
- react-scripts
- emailjs
- emotion/react
- emotion/styled
- mui/material
- react-login-page/page9
- testing-library/dom
- testing-library/jest-dom
- testing-library/react
- testing-library/user-event
- ajv
- chart.js
- chartjs-adapter-date-fns
- cookie
- date-fns
- lucide-react
- react
- react-chartjs-2
- react-dom
- react-router-dom
- react-scripts
- set-cookie-parser
- web-vitals
- xlsx

### Testing
- cypress

## Installing Dependencies
### Inside the UTrack directory
- For Windows, run <br>
`INSTALL_DEPENDENCIES.bat`
- For Linux and MacOS, run <br>
`INSTALL_DEPENDENCIES.sh`

# Running Cypress Tests
1. Navigate to the Frontend Folder
2. Install Dependencies - `npm install`
3. Run Cypress in Interactive Mode with `npx cypress open`
4. A window will appear. Select E2E Testing, choose your browser, and click on any test to run it.

## If Cypress fails to open or tests fail to run, try the following:
- Ensure you are inside the frontend folder
- Reinstall dependencies:
    `rm -rf node_modules`
    `npm install`
- Ensure you are using a supported Node version
- Restart your terminal / editor























