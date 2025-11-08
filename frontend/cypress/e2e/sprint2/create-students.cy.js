/**
 * This file contains all cypress acceptance tests related to the Create Students epic.
 * 
 * System Flow:
 *   Sign-Up -> Profile -> Course Details -> Add Students
 * 
 * For these test cases, the add student file (src/components/AddStudent.jsx) was updated to include test IDs.
 * 
 * Note: These test cases will carry over to the next sprint.
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
const TEST_COURSE = {
    number: "SWE4103",
    name: "Software Quality and Project Management",
    description: "This course emphasizes software testing, verification, and validation, and project tracking, planning, and scheduling."
};

// Student
const TEST_STUDENT = {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@unb.ca"
}

// Tests
// **************************************************

describe("Create Students", () => {

    // Setup Environment
    beforeEach(() => {

        // Responses
        // **************************************************

        // Instructor Sign-Up
        cy.intercept('POST', 'http://localhost:5000/api/auth/instructor-signup', {
            statusCode: 200,
            body: {
                message: "User created successfully.",
                user: { email: TEST_INSTRUCTOR.email },
                token: TEST_TOKEN
            }
        }).as('mockSignup');

        // Create Course
        cy.intercept('POST', 'http://localhost:5000/api/auth/createCourses', {
            statusCode: 200,
            body: {
                course: { _id: '1', courseNumber: TEST_COURSE.number, courseName: TEST_COURSE.name }
            }
        }).as('mockCreateCourse');

        // Get Course Details
        cy.intercept('GET', 'http://localhost:5000/api/auth/get-course/SWE4103', {
            statusCode: 200,
            body: {
                courseNumber: TEST_COURSE.number,
                courseName: TEST_COURSE.name,
                description: TEST_COURSE.description,
                students: []
            }
        }).as('mockGetCourse');

        // System Flow
        // **************************************************

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

        // Add Courses View
        cy.contains('Add course').click();

        // Course Information
        cy.get('input[data-testid="course-number"]').type(TEST_COURSE.number);
        cy.get('input[data-testid="course-name"]').type(TEST_COURSE.name);
        cy.get('[data-testid="course-description"]').type(TEST_COURSE.description);

        // Create
        cy.get('[data-testid="course-save"]').click();
        cy.wait('@mockCreateCourse');

        // Visit Course
        cy.visit('http://localhost:3000/course/SWE4103', {
            // Simulate Instructor
            onBeforeLoad(win) {
                win.localStorage.setItem('email', TEST_INSTRUCTOR.email);
                win.localStorage.setItem('authToken', TEST_TOKEN);
            }
        });

        // cy.wait('@mockGetCourse');
        // Note: Only call in individual tests so that it can be re-used.
    });

    // Clean Storage
    after(() => {
        cy.clearLocalStorage();
    });

    // Add Student Page
    it("Displays the add students page.", () => {
        // Get Course
        cy.wait('@mockGetCourse');

        // Navigate
        cy.contains('Add Students').click();

        // Verify URL
        cy.url().should('include', '/course/SWE4103/add-students');

        // Confirm Fields
        cy.contains(`Add Students to ${TEST_COURSE.number}`).should('be.visible');
        cy.contains("Create New Student").should('be.visible');
    });

    // Add Student
    it("Adds a student to the course roster.", () => {
        // Student Creation Response
        cy.intercept('POST', 'http://localhost:5000/api/students/create', {
            statusCode: 200,
            body: {
                success: true,
                student: { firstName: TEST_STUDENT.firstName, lastName: TEST_STUDENT.lastName, email: TEST_STUDENT.email }
            }
        }).as('mockCreateStudent');
        
        // Add Student Response
        cy.intercept('POST', 'http://localhost:5000/api/students/course/SWE4103/add-student', {
            statusCode: 200,
            body: {
                success: true,
                students: [ { _id: "1", firstName: TEST_STUDENT.firstName, lastName: TEST_STUDENT.lastName, email: TEST_STUDENT.email } ]
            }
        }).as('mockAddStudent');

        // Get Course
        cy.wait('@mockGetCourse');

        // Navigate
        cy.contains('Add Students').click();

        // Student Information
        cy.get('input[data-testid="student-firstName"]').type(TEST_STUDENT.firstName);
        cy.get('input[data-testid="student-lastName"]').type(TEST_STUDENT.lastName);
        cy.get('input[data-testid="student-email"]').type(TEST_STUDENT.email);

        // Submit
        cy.get('button').contains("Add Student").click();

        cy.wait('@mockCreateStudent');
        cy.wait('@mockAddStudent');

        cy.contains(`${TEST_STUDENT.firstName} ${TEST_STUDENT.lastName} (${TEST_STUDENT.email})`).should('be.visible');
    });

    // Students Enrolled
    it("Displays the number of enrolled students after an update.", () => {
        // Add Student
        // **************************************************

        // Student Creation Response
        cy.intercept('POST', 'http://localhost:5000/api/students/create', {
            statusCode: 200,
            body: {
                success: true,
                student: { firstName: TEST_STUDENT.firstName, lastName: TEST_STUDENT.lastName, email: TEST_STUDENT.email }
            }
        }).as('mockCreateStudent');
        
        // Add Student Response
        cy.intercept('POST', 'http://localhost:5000/api/students/course/SWE4103/add-student', {
            statusCode: 200,
            body: {
                success: true,
                students: [ { _id: "1", firstName: TEST_STUDENT.firstName, lastName: TEST_STUDENT.lastName, email: TEST_STUDENT.email } ]
            }
        }).as('mockAddStudent');

        // Get Course
        cy.wait('@mockGetCourse');

        // Navigate
        cy.contains('Add Students').click();

        // Student Information
        cy.get('input[data-testid="student-firstName"]').type(TEST_STUDENT.firstName);
        cy.get('input[data-testid="student-lastName"]').type(TEST_STUDENT.lastName);
        cy.get('input[data-testid="student-email"]').type(TEST_STUDENT.email);

        // Submit
        cy.get('button').contains("Add Student").click();

        cy.wait('@mockCreateStudent');
        cy.wait('@mockAddStudent');

        cy.contains(`${TEST_STUDENT.firstName} ${TEST_STUDENT.lastName} (${TEST_STUDENT.email})`).should('be.visible');

        // View Course Page
        // **************************************************

        // Backend Response
        cy.intercept('GET', 'http://localhost:5000/api/auth/get-course/SWE4103', {
            statusCode: 200,
            body: {
                courseNumber: TEST_COURSE.number,
                courseName: TEST_COURSE.name,
                description: TEST_COURSE.description,
                students: [ { _id: "1", firstName: TEST_STUDENT.firstName, lastName: TEST_STUDENT.lastName, email: TEST_STUDENT.email } ]
            }
        }).as('mockUpdatedCourse');

        // Course Page
        cy.contains('Back').click();
        cy.wait('@mockUpdatedCourse');

        // Verify Enrollment
        cy.contains(/Students Enrolled: 1/i).should('be.visible');
    });

    // ****************************************************************************************************
    // Test Cases for Sprint 3
    // ****************************************************************************************************

    // Registers Student
    it("Adds a student to a course when the student account already exists.", () => {
        //
    });

    // Empty Fields Validation
    // All fields are listed as required in frontend. The form will not submit without them.
    // The backend also contains a safety check, just in case.
    it("Displays an error when adding a student without all required fields.", () => {
        //
    });

    // Duplicate Students
    // Currently, the error is only console logged. We could provide interactive feedback.
    it("Displays an error when a student is already enrolled in a course.", () => {
        //
    });

    // Invalid Student Email Validation
    // Currently, the there is only a check that the email is syntactically valid, not that it's a unb email.
    it("Displays an error when adding a student with an invalid email.", () => {
        //
    });    

    // Bulk Upload
    it("Adds a group of students given a csv or xlsx file.", () => {
        //
    });

    // Empty File
    it("Displays an error when giving an empty csv or xlsx file to the bulk upload.", () => {
        //
    });

    // Invalid File Type
    it("Displays an error when giving a non csv or xlsx file to the bulk upload.", () => {
        //
    });


});
