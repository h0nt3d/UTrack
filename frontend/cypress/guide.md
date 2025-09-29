# Getting Started with Cypress

## Installing Cypress

To use Cypress, first ensure that your dependencies are up to date:

 - ```cd frontend``` 
 - ```npm install```

*Note:* This may take some time to install the first time you run Cypress.

## Writing Tests

Cypress tests should be written inside the ```cypress/e2e/``` folder. Test files should have the file extension ```.cy.js```. For example, ```example-spec.cy.js```.

## Cypress Test Runner

To launch the Cypress Test Runner, use the following command:

 - ```npx cypress open```

When the runner opens:

 - Choose **E2E Testing**. (for acceptance/end-to-end tests)
 - Select a browser.
 - Pick a test file to run it.

