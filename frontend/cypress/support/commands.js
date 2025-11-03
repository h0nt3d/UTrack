// This file includes re-usable commands used for simulating common workflows.

// Data
let instructorData;
let courseData;

const BASE_URL = 'http://localhost:5000/api';
const SPECIAL_TOKEN = 'test-token';

// Fixtures
beforeEach(() => {
    // Instructor
    cy.fixture('instructors').then((data) => {
        instructorData = data.instructor1;
    });

    // Course
    cy.fixture('courses').then((data) => {
        courseData = data.course1;
    });
});


/**
 * Instructor Sign-Up
 * 
 * A command for simulating the instructor sign-up process.
 */
Cypress.Commands.add('InstructorSignUp', () => {
    // Data
    if(!instructorData) {
        throw new Error("Fixture Data Error");
    }

    // Sign-Up Intercept
    cy.intercept('POST', `${BASE_URL}/auth/instructor-signup`, {
        statusCode: 200,
        body: {
            message: "User created successfully.",
            user: { email: instructorData.email },
            token: instructorData.authToken
        }
    }).as('mockSignup');

    // Landing Page
    cy.visit('http://localhost:3000', {
        onBeforeLoad(win) {
            win.process = { env: { REACT_APP_INSTRUCTOR_TOKEN: SPECIAL_TOKEN } }
        }
    });;

    // Sign-Up Page
    cy.get('[data-testid="landing-instructorSignUp"]').click();
    cy.url().should('include', '/instructor-signup');

    // Instructor Information
    cy.get('[data-testid="signup-firstName"]').type(instructorData.firstName);
    cy.get('[data-testid="signup-lastName"]').type(instructorData.lastName);
    cy.get('[data-testid="signup-personalToken"]').type(instructorData.personalToken);
    cy.get('[data-testid="signup-email"]').type(instructorData.email);
    cy.get('[data-testid="signup-password"]').type(instructorData.password);
    cy.get('[data-testid="signup-confirmPassword"]').type(instructorData.password);

    // Create Account
    cy.contains("Create Account").click();
    cy.wait(500);

    // Bypass Email Verification
    cy.window().then((win) => {
        win.document.querySelectorAll('.modal, [role="dialog"], .modal-backdrop').forEach(el => el.remove());

        win.localStorage.setItem('email', instructorData.email);
        win.localStorage.setItem('authToken', instructorData.authToken);
    });

    // Profile
    cy.visit('http://localhost:3000/profile', {
        onBeforeLoad(win) {
            win.localStorage.setItem('email', instructorData.email);
            win.localStorage.setItem('authToken', instructorData.authToken);
        }
    });

    // Profile Details
    cy.url().should('include', '/profile');
    cy.contains("My Courses").should('be.visible');

});

/**
 * Course Creation
 * 
 * A command for simulating the process of adding a course.
 * 
 * This command first utilizes the instructor sign-up command to then add a course.
 */
Cypress.Commands.add('CreateCourse', () => {
    // Data
    if(!instructorData || !courseData) {
        throw new Error("Fixture Data Error");
    }

    // Sign-Up
    cy.InstructorSignUp();

    // Re-Visit Page
    cy.visit('http://localhost:3000/profile', {
        onBeforeLoad(win) {
            win.localStorage.setItem('email', instructorData.email);
            win.localStorage.setItem('token', instructorData.personalToken);
            win.localStorage.setItem('authToken', instructorData.authToken);
        }
    });

    // Course Creation Intercept
    cy.intercept('POST', `${BASE_URL}/auth/createCourses`, {
        statusCode: 200,
        body: {
            course: { _id: '1', courseNumber: courseData.number, courseName: courseData.name }
        }
    }).as('mockCreateCourse');

    // Add Course View
    cy.contains('Add course').click();

    // Course Information
    cy.get('[data-testid="course-number"]').type(courseData.number);
    cy.get('[data-testid="course-name"]').type(courseData.name);
    cy.get('[data-testid="course-description"]').type(courseData.description);

    // Create
    cy.get('[data-testid="course-save"]').click();

    // Profile Details
    cy.url().should('include', '/profile');
    cy.contains("My Courses").should('be.visible');
    
    cy.wait('@mockCreateCourse');

    // Course Details
    cy.contains(`${courseData.number}: ${courseData.name}`).should('be.visible');
});