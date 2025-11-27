/**
 * This file contains all cypress acceptance tests for adding a single student to a course.
 * 
 * For these test cases, the add student file (src/components/AddStudent.jsx) was updated to include test IDs.
 * 
 * Note: To-Update - Single Student Upload Functionality
 */

// Data

let TEST_INSTRUCTOR;
let TEST_COURSE;
let TEST_STUDENT;

const BASE_URL = 'http://localhost:5000/api';
const SPECIAL_TOKEN = 'test-token';

// Test Suite
describe("Create Students", () => {

    // Environment
    // **************************************************
    before(() => {
        // Instructor
        cy.fixture('TEST_INSTRUCTOR').then((data) => {
            TEST_INSTRUCTOR = data;
        });

        // Course
        cy.fixture('TEST_COURSE').then((data) => {
            TEST_COURSE = data;
        });

        // Student
        cy.fixture('TEST_SINGLE_STUDENT').then((data) => {
            TEST_STUDENT = data;
        });
    });

    // Clean Storage
    after(() => {
        cy.clearLocalStorage();
    });

    // Tests
    // **************************************************

    // Add Student Page
    it("Displays the add students page.", () => {
        // Course Environment
        cy.CreateCourse();
        cy.contains(`${TEST_COURSE.number}: ${TEST_COURSE.name}`).click();
        cy.contains(TEST_COURSE.name).should('be.visible');

        // Navigate
        cy.contains('Add Student').click();

        // Verify URL
        cy.url().should('include', '/course/SWE4103/add-students');

        // Confirm Fields
        cy.contains(`Add Students to ${TEST_COURSE.number}`).should('be.visible');
        cy.contains("Add Student").should('be.visible');
    });

    // Add Student
    it("Adds a student to the course roster.", () => {
        // Course Environment
        cy.CreateCourse();
        cy.contains(`${TEST_COURSE.number}: ${TEST_COURSE.name}`).click();
        cy.contains(TEST_COURSE.name).should('be.visible');

        // Student Creation Response
        cy.intercept('POST', 'http://localhost:5000/api/students/create', {
            statusCode: 200,
            body: {
                student: { firstName: TEST_STUDENT.firstName, lastName: TEST_STUDENT.lastName, email: TEST_STUDENT.email }
            }
        }).as('mockCreateStudent');

        // Add Student Response
        cy.intercept('POST', 'http://localhost:5000/api/students/course/SWE4103/add-student', {
            statusCode: 200,
            body: {
                success: true,
                students: [{ _id: "1", firstName: TEST_STUDENT.firstName, lastName: TEST_STUDENT.lastName, email: TEST_STUDENT.email }]
            }
        }).as('mockAddStudent');

        // Navigate
        cy.contains('Add Student').click();

        // Student Information
        cy.get('[data-testid="email"]').type(TEST_STUDENT.email);

        // Submit
        cy.get('button').contains("Add Student").click();

        cy.wait('@mockCreateStudent');
        cy.wait('@mockAddStudent');

        cy.contains(`Student added successfully!`).should('be.visible');
    });

    // Students Enrolled
    it("Displays the number of enrolled students after an update.", () => {
        // Add Student
        cy.AddSingleStudent();

        // Verify Enrolled Student
        cy.contains(TEST_STUDENT.firstName).should('be.visible');
        cy.contains(TEST_STUDENT.lastName).should('be.visible');
        cy.contains(TEST_STUDENT.email).should('be.visible');
    });

    // Empty Fields Validation
    it("Displays an error when submitting the form without filling in an email.", () => {
        // Course Environment
        cy.CreateCourse();
        cy.contains(`${TEST_COURSE.number}: ${TEST_COURSE.name}`).click();
        cy.contains(TEST_COURSE.name).should('be.visible');
        cy.get('button').contains('Add Student').click();

        // Responses
        cy.intercept('POST', `${BASE_URL}/students/create`).as('mockCreateStudent');
        cy.intercept('POST', `${BASE_URL}/students/course/${TEST_COURSE.number}/add-student`).as('mockSubmission');

        // Empty Fields Submission
        cy.get('[data-testid="add-student-btn"]').click();

        // Required Field
        cy.get('[data-testid="email"]').should('have.prop', 'validity').then(v => {
            expect(v.valueMissing, 'valueMissing should be true').to.be.true;
            expect(v.valid, 'field should be invalid').to.be.false;
        });

        // Blocked Submission
        cy.get('@mockCreateStudent.all').should('have.length', 0);
        cy.get('@mockSubmission.all').should('have.length', 0);
    });

    // Invalid Student Email Validation
    it("Displays an error when adding a student with an invalid email.", () => {
        // Course Environment
        cy.CreateCourse();
        cy.contains(`${TEST_COURSE.number}: ${TEST_COURSE.name}`).click();
        cy.contains(TEST_COURSE.name).should('be.visible');
        cy.get('button').contains('Add Student').click();

        // Responses
        cy.intercept('POST', `${BASE_URL}/students/create`).as('mockCreateStudent');
        cy.intercept('POST', `${BASE_URL}/students/course/${TEST_COURSE.number}/add-student`).as('mockSubmission');

        // Invalid Email Submission
        cy.get('[data-testid=email]').clear().type('not-an-email');
        cy.get('[data-testid=add-student-btn]').click();

        // Invalid Email
        cy.get('[data-testid="email"]').should('have.prop', 'validity').then(v => {
            expect(v.typeMismatch, 'email format should be invalid').to.be.true;
            expect(v.valid, 'field should be overall invalid').to.be.false;
        });

        // Blocked Submission
        cy.get('@mockCreateStudent.all').should('have.length', 0);
        cy.get('@mockSubmission.all').should('have.length', 0);
    });

    // Duplicate Students
    it("Displays an error when a student is already enrolled in a course.", () => {
        // Add Student
        cy.AddSingleStudent();

        // Add Duplicate
        cy.get('button').contains('Add Student').click();
        cy.get('[data-testid=email]').type(TEST_STUDENT.email);
        cy.get('button').contains('Add Student').click();

        // Create Response
        cy.intercept('POST', `${BASE_URL}/students/create`, {
            statusCode: 200,
            body: {
                success: true,
                student: { email: TEST_STUDENT.email }
            }
        }).as('mockCreateStudent');

        // Submission Response
        cy.intercept('POST', `${BASE_URL}/students/course/${TEST_COURSE.number}/add-student`, {
            statusCode: 409,
            body: { message: "Student is already enrolled in this course" }
        }).as('mockDuplicate');

        // Duplicate Information
        cy.get('[data-testid="email"]').clear().type(TEST_STUDENT.email);
        cy.get('[data-testid="add-student-btn"]').click();

        cy.wait('@mockCreateStudent');
        cy.wait('@mockDuplicate');

        // Verify Error
        cy.contains("Student is already enrolled in this course").should('be.visible');
    });

    // Registers Student
    // Note: This test does not currently pass. If the student already exists in a different course, they will not be enrolled.
    it("Adds a student to a course when the student account already exists.", () => {
        // Course Environment
        cy.CreateCourse();
        cy.contains(`${TEST_COURSE.number}: ${TEST_COURSE.name}`).click();
        cy.contains(TEST_COURSE.name).should('be.visible');
        cy.get('button').contains('Add Student').click();

        // Submission Response
        cy.intercept('POST', `${BASE_URL}/students/course/${TEST_COURSE.number}/add-student`, {
            statusCode: 409,
            body: { message: "Student is already enrolled in this course" }
        }).as('mockDuplicate');

        // Adds Student
        cy.intercept('POST', `${BASE_URL}/students/course/${TEST_COURSE.number}/add-student`, {
            statusCode: 200,
            body: { students: [{ firstName: TEST_STUDENT.firstName, lastName: TEST_STUDENT.lastName, email: TEST_STUDENT.email }] }
        }).as('mockCourseRegister');

        cy.get('[data-testid="email"]').clear().type(TEST_STUDENT.email);
        cy.get('[data-testid="add-student-btn"]').click();

        cy.wait('@mockDuplicate');
        cy.wait('@mockCourseRegister');
    });

});
