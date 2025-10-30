// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
// ***********************************************

/**
 * A command for emulating the instructor sign-up process.
 * 
 * Note that the data must also be defined in the specific test file to re-use it at a later point in time.
 */
Cypress.Commands.add('InstructorSignUp', () => {
    // Data
    // ====================================================================================================

    const BASE_URL = 'http://localhost:5000/api'

    const TEST_INSTRUCTOR = {
        firstName: "John",
        lastName: "Doe",
        personalToken: "test-token",
        email: "john.doe@unb.ca",
        password: "password123"
    };

    const TEST_TOKEN = "token1"

    // System Flow
    // ====================================================================================================

    // Sign-Up Intercept
    cy.intercept('POST', `${BASE_URL}/auth/instructor-signup`, {
        statusCode: 200,
        body: {
            message: "User created successfully.",
            user: { email: TEST_INSTRUCTOR.email },
            token: TEST_TOKEN
        }
    }).as('mockSignup');

    // Landing Page
    cy.visit('http://localhost:3000');

    // Sign-Up Page
    cy.get('[data-testid="landing-instructorSignUp"]').click();
    cy.url().should('include', '/instructor-signup');

    // Instructor Information
    cy.get('[data-testid="signup-firstName"]').type(TEST_INSTRUCTOR.firstName);
    cy.get('[data-testid="signup-lastName"]').type(TEST_INSTRUCTOR.lastName);
    cy.get('[data-testid="signup-token"]').type(TEST_INSTRUCTOR.personalToken);
    cy.get('[data-testid="signup-email"]').type(TEST_INSTRUCTOR.email);
    cy.get('[data-testid="signup-password"]').type(TEST_INSTRUCTOR.password);
    cy.get('[data-testid="signup-confirmPassword"]').type(TEST_INSTRUCTOR.password);

    // Create Account
    cy.contains("Create Account").click();
    cy.wait(500);

    // Bypass Email Verification
    cy.window().then((win) => {
        win.document.querySelectorAll('.modal, [role="dialog"], .modal-backdrop').forEach(el => el.remove());

        win.localStorage.setItem('email', TEST_INSTRUCTOR.email);
        win.localStorage.setItem('authToken', TEST_TOKEN);
    });

    // Profile
    cy.visit('http://localhost:3000/profile', {
        onBeforeLoad(win) {
            win.localStorage.setItem('email', TEST_INSTRUCTOR.email);
            win.localStorage.setItem('authToken', TEST_TOKEN);
        }
    });

    // Profile Details
    cy.url().should('include', '/profile');
    cy.contains("My Courses").should('be.visible');

});

/**
 * A command for emulating the process to add a course.
 * 
 * This command first utilizes the instructor sign-up command to then add courses.
 */
Cypress.Commands.add('CreateCourse', () => {
    // Data
    // ====================================================================================================

    const BASE_URL = 'http://localhost:5000/api'

    const TEST_INSTRUCTOR = {
        firstName: "John",
        lastName: "Doe",
        personalToken: "test-token",
        email: "john.doe@unb.ca",
        password: "password123"
    };

    const TEST_TOKEN = "token1"

    const TEST_COURSE = {
        number: "SWE4103",
        name: "Software Quality and Project Management",
        description: "This course emphasizes software testing, verification, and validation, and project tracking, planning, and scheduling."
    };

    // System Flow
    // ====================================================================================================

    // Sign-Up
    cy.InstructorSignUp();

    // Re-Visit Page
    cy.visit('http://localhost:3000/profile', {
        onBeforeLoad(win) {
            win.localStorage.setItem('email', TEST_INSTRUCTOR.email);
            win.localStorage.setItem('authToken', TEST_TOKEN);
            win.localStorage.setItem('token', TEST_TOKEN);
        }
    });

    // Course Creation Intercept
    cy.intercept('POST', `${BASE_URL}/auth/createCourses`, {
        statusCode: 200,
        body: {
            course: { _id: '1', courseNumber: TEST_COURSE.number, courseName: TEST_COURSE.name }
        }
    }).as('mockCreateCourse');

    // Add Course View
    cy.contains('Add course').click();

    // Course Information
    cy.get('[data-testid="course-number"]').type(TEST_COURSE.number);
    cy.get('[data-testid="course-name"]').type(TEST_COURSE.name);
    cy.get('[data-testid="course-description"]').type(TEST_COURSE.description);

    // Create
    cy.get('[data-testid="course-save"]').click();

    // Profile Details
    cy.url().should('include', '/profile');
    cy.contains("My Courses").should('be.visible');
    
    cy.wait('@mockCreateCourse');

    // Course Details
    cy.contains(`${TEST_COURSE.number}: ${TEST_COURSE.name}`).should('be.visible');
});