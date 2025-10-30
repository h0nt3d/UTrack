/**
 * This file contains acceptance tests for managing courses.
 * 
 * For these test cases, the course modal file (src/subcomponents/CourseModal.jsx) was updated to include test IDs.
 * 
 * Note: All tests pass. (10/22)
 */

// Test Data
// **************************************************

// Instructor
const TEST_INSTRUCTOR = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@unb.ca",
    password: "password123"
};

// Token
const TEST_TOKEN = "token1";

// Course
const TEST_COURSE  = {
    number: "SWE4103",
    name: "Software Quality and Project Management",
    description: "This course emphasizes software testing, verification, and validation, and project tracking, planning, and scheduling."
};

// Tests
// **************************************************

describe("Manage Courses", () => {
    
    // Instructor Sign-Up
    beforeEach(() => {
        // Mock Response
        cy.intercept('POST', 'http://localhost:5000/api/auth/instructor-signup', {
            statusCode: 200,
            body: {
                message: "User created successfully.",
                user: { email: TEST_INSTRUCTOR.email },
                token: TEST_TOKEN
            }
        }).as('mockSignup');

        // Sign-Up Page
        cy.visit('http://localhost:3000/signup');

        // Instructor Information
        cy.get('input[data-testid="signup-firstName"]').type(TEST_INSTRUCTOR.firstName);
        cy.get('input[data-testid="signup-lastName"]').type(TEST_INSTRUCTOR.lastName);
        cy.get('input[data-testid="signup-email"]').type(TEST_INSTRUCTOR.email);
        cy.get('input[data-testid="signup-password"]').type(TEST_INSTRUCTOR.password);
        cy.get('input[data-testid="signup-confirmPassword"]').type(TEST_INSTRUCTOR.password);

        // Create Account
        cy.get('button').contains("Create Account").click();
        cy.wait('@mockSignup');

        // Storage
        cy.window().then(win => {
            win.localStorage.setItem('email', TEST_INSTRUCTOR.email);
            win.localStorage.setItem('authToken', TEST_TOKEN);
        });

        // Visit Profile
        cy.visit('http://localhost:3000/profile', {
            // Simulate Instructor
            onBeforeLoad(win) {
                win.localStorage.setItem('email', TEST_INSTRUCTOR.email);
                win.localStorage.setItem('authToken', TEST_TOKEN);
            }
        });
    });

    // Clean Storage (Test Again)
    after(() => {
        cy.clearLocalStorage();
    });

    // Courses Page
    it("Displays active courses and an add course button.", () => {
        // Page Details

        // URL
        cy.url().should('include', '/profile');

        // Header (My Courses)
        cy.contains("My Courses").should('be.visible');
        
        // Add Courses Button
        cy.contains('button', 'Add course').should('be.visible');
    });

    // Add Course
    it("Adds a course when given a course code, name, and description.", () => {
        // Backend Response
        cy.intercept('POST', 'http://localhost:5000/api/auth/createCourses', {
            statusCode: 200,
            body: {
                course: { _id: '1', courseNumber: TEST_COURSE.number, courseName: TEST_COURSE.name }
            }
        }).as('mockCreateCourse');

        // Add Courses View
        cy.contains('Add course').click();

        // Course Information
        cy.get('input[data-testid="course-number"]').type(TEST_COURSE.number);
        cy.get('input[data-testid="course-name"]').type(TEST_COURSE.name);
        cy.get('[data-testid="course-description"]').type(TEST_COURSE.description);

        // Create
        cy.get('[data-testid="course-save"]').click();

        cy.wait('@mockCreateCourse');
        cy.contains(`${TEST_COURSE.number}: ${TEST_COURSE.name}`).should('be.visible');

    });

    // Empty Fields
    it("Displays an error when an instructor attempts to create a course with missing fields.", () => {
        // Backend Response
        cy.intercept('POST', 'http://localhost:5000/api/auth/createCourses', {
            statusCode: 400,
            body: { message: "courseNumber required, courseName required" }
        }).as('missingFields');

        // Add Courses View
        cy.contains('Add course').click();

        // Correct View
        cy.get('[data-testid="course-number"]').should('be.visible');
        cy.get('[data-testid="course-name"]').should('be.visible');
        cy.get('[data-testid="course-description"]').should('be.visible');

        // Submit
        cy.get('[data-testid="course-save"]').click();
        cy.wait('@missingFields');

        // Error Validation
        cy.on('window:alert', (alertText) => {
            expect(alertText).to.match(/courseNumber required, courseName required/i);
        });

    });

    // Duplicate Course
    it("Displays an error when an instructor attempts to create a duplicate course.", () => {
        // Add Course
        // **************************************************

        // Backend Response
        cy.intercept('POST', 'http://localhost:5000/api/auth/createCourses', {
            statusCode: 200,
            body: {
                course: { _id: '1', courseNumber: TEST_COURSE.number, courseName: TEST_COURSE.name }
            }
        }).as('mockCreateCourse');

        // Add Courses View
        cy.contains('Add course').click();

        // Course Information
        cy.get('input[data-testid="course-number"]').type(TEST_COURSE.number);
        cy.get('input[data-testid="course-name"]').type(TEST_COURSE.name);
        cy.get('[data-testid="course-description"]').type(TEST_COURSE.description);

        // Create
        cy.get('[data-testid="course-save"]').click();
        cy.wait('@mockCreateCourse');

        cy.contains(`${TEST_COURSE.number}: ${TEST_COURSE.name}`).should('be.visible');

        // Test Duplicate
        // **************************************************

        // Backend Response
        cy.intercept('POST', 'http://localhost:5000/api/auth/createCourses', {
            statusCode: 409,
            body: { message: "courseNumber already exists" }
        }).as('duplicateCourse');

        // Add Courses View
        cy.contains('Add course').click();

        // Correct View
        cy.get('[data-testid="course-number"]').should('be.visible');
        cy.get('[data-testid="course-name"]').should('be.visible');
        cy.get('[data-testid="course-description"]').should('be.visible');

        // Course Information
        cy.get('input[data-testid="course-number"]').type(TEST_COURSE.number);
        cy.get('input[data-testid="course-name"]').type(TEST_COURSE.name);
        cy.get('[data-testid="course-description"]').type(TEST_COURSE.description);

        // Submit
        cy.get('[data-testid="course-save"]').click();
        cy.wait('@duplicateCourse');

        // Error Validation
        cy.on('window:alert', (alertText) => {
            expect(alertText).to.match(/courseNumber already exists/i);
        });
    });

    // Cancel Adding Course
    it("Closes the add course view when the cancel button is clicked.", () => {
        // Response
        cy.intercept('POST', 'http://localhost:5000/api/auth/createCourses').as('createCourseAttempt');

        // Add Courses View
        cy.contains('Add course').click();

        // Correct View
        cy.get('[data-testid="course-number"]').should('be.visible');
        cy.get('[data-testid="course-name"]').should('be.visible');
        cy.get('[data-testid="course-description"]').should('be.visible');

        // Begin Entering Information
        cy.get('input[data-testid="course-number"]').type(TEST_COURSE.number);

        // Cancel
        cy.get('[data-testid="course-cancel"]').click();

        // No Data
        cy.get('[data-testid="course-number"]').should('not.exist');

        // No Request
        cy.wait(500);
        cy.get('@createCourseAttempt.all').should('have.length', 0);
    });

    // Course Details
    it("Displays the landing page for a specific course.", () => {
        // Add Course
        // **************************************************

        // Backend Response
        cy.intercept('POST', 'http://localhost:5000/api/auth/createCourses', {
            statusCode: 200,
            body: {
                course: { _id: '1', courseNumber: TEST_COURSE.number, courseName: TEST_COURSE.name }
            }
        }).as('mockCreateCourse');

        // Add Courses View
        cy.contains('Add course').click();

        // Course Information
        cy.get('input[data-testid="course-number"]').type(TEST_COURSE.number);
        cy.get('input[data-testid="course-name"]').type(TEST_COURSE.name);
        cy.get('[data-testid="course-description"]').type(TEST_COURSE.description);

        // Create
        cy.get('[data-testid="course-save"]').click();
        cy.wait('@mockCreateCourse');

        cy.contains(`${TEST_COURSE.number}: ${TEST_COURSE.name}`).should('be.visible');

        // Test Details
        // **************************************************
        cy.intercept('GET', 'http://localhost:5000/api/auth/get-course/SWE4103', {
            statusCode: 200,
            body: {
                courseNumber: TEST_COURSE.number,
                courseName: TEST_COURSE.name,
                description: TEST_COURSE.description,
                students: []
            }
        }).as('mockGetCourse');

        // Visit Course
        cy.visit('http://localhost:3000/course/SWE4103', {
            // Simulate Instructor
            onBeforeLoad(win) {
                win.localStorage.setItem('email', TEST_INSTRUCTOR.email);
                win.localStorage.setItem('authToken', TEST_TOKEN);
            }
        });

        cy.wait('@mockGetCourse');

        // View Details
        cy.contains(TEST_COURSE.number).should('be.visible');
        cy.contains(TEST_COURSE.name).should('be.visible');
        cy.contains(TEST_COURSE.description).should('be.visible');
    });

});