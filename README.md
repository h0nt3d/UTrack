![alt text](https://github.com/h0nt3d/UTrack/blob/main/images/uTrack.png?raw=true)

# Dependencies
### Backend:
- prompt-sync
- bcrypt
- mongoose
- cors
- express
- dotenv

### Frontend:
- cypress
- jest
- tailwind
- postcss
- autoprefixer
- react-router-dom
- xlsx

## Insatlling Dependencies
- For Windows, inside UTrack Folder, run <br>
`INSTALL_DEPENDENCIES.bat`
- For Linux and MacOS, run <br>
`INSTALL_DEPENDENCIES.sh`

## Launching React on port 3000
`npm start`

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











