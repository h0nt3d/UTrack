/**
 * Adding Projects Acceptance Tests.
 * 
 * Files Updated:
 *  - AddProject.jsx
 */

// Test Data
// ****************************************************************************************************

// Data
let TEST_INSTRUCTOR;
let TEST_COURSE;
let TEST_PROJECT;

const BASE_URL = 'http://localhost:5000/api';
const SPECIAL_TOKEN = 'test-token';

// Test Suite
describe("Manage Projects", () => {

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

        // Project
        cy.fixture('TEST_PROJECT').then((data) => {
            TEST_PROJECT = data;
        });
    });

    beforeEach(() => {
        // Create Course
        cy.CreateCourse();

        // Verify Details
        cy.contains(`${TEST_COURSE.number}: ${TEST_COURSE.name}`).click();
        cy.contains(TEST_COURSE.name).should('be.visible');
    });

    // Clean
    after(() => {
        cy.clearLocalStorage();
    });

    // Test Cases
    // **************************************************

    // Navigation
    it("Navigates back to the course page when the back button is clicked.", () => {
        // Active Courses Response
        cy.intercept('GET', `${BASE_URL}/auth/get-courses`, {
            statusCode: 200,
            body: {
                courses: [{ _id: '1', courseNumber: TEST_COURSE.number, courseName: TEST_COURSE.name, description: TEST_COURSE.description }]
            }
        }).as('mockGetCourses');

        // Navigate
        cy.contains("Back").click();

        // Active Courses
        cy.wait('@mockGetCourses');

        // Details
        cy.url().should('include', '/profile');
        cy.contains("My Courses").should('be.visible');
    });

    // Add Project
    it("Adds a project when given a project name and description, and displays the newly added project.", () => {
        // Course ID
        const COURSE_ID = TEST_COURSE.number;

        // **************************************************

        // Course Information Fetch
        cy.intercept('GET', `${BASE_URL}/auth/get-course/${COURSE_ID}`, {
            statusCode: 200,
            times: 1,
            body: {
                courseNumber: TEST_COURSE.number,
                courseName: TEST_COURSE.name,
                description: TEST_COURSE.description,
                students: [],
                projects: [],
                instructor: { firstName: TEST_INSTRUCTOR.firstName, lastName: TEST_INSTRUCTOR.lastName, email: TEST_INSTRUCTOR.email }
            }
        }).as('mockGetCourse');

        // Project Creation Response
        cy.intercept('POST', `${BASE_URL}/auth/course/${TEST_COURSE.number}/add-project`, {
            statusCode: 200,
            body: {
                projects: [{ _id: '1', title: TEST_PROJECT.title, description: TEST_PROJECT.description, team: TEST_PROJECT.team_name }]
            }
        }).as('mockAddProject');

        // Add Project View
        cy.contains("Add Project-Team").click();

        // Get Course
        cy.wait('@mockGetCourse');

        // Verify Add Project Details
        cy.contains(`Add Project-Teams to ${TEST_COURSE.number}`).should('be.visible');

        // Project Information
        cy.get('[data-testid="project-title"]').type(TEST_PROJECT.title);
        cy.get('[data-testid="project-description"]').type(TEST_PROJECT.description);
        cy.get('[data-testid="project-teamname"]').type(TEST_PROJECT.team_name);

        // Create
        cy.get('[data-testid="project-save"]').click();
        cy.wait('@mockAddProject');

        // **************************************************

        // Updated Course Information Fetch
        cy.intercept('GET', `${BASE_URL}/auth/get-course/${COURSE_ID}`, {
            statusCode: 200,
            body: {
                courseNumber: TEST_COURSE.number,
                courseName: TEST_COURSE.name,
                description: TEST_COURSE.description,
                students: [],
                projects: [{ _id: '1', title: TEST_PROJECT.title, description: TEST_PROJECT.description, team: TEST_PROJECT.team_name }],
                instructor: { firstName: TEST_INSTRUCTOR.firstName, lastName: TEST_INSTRUCTOR.lastName, email: TEST_INSTRUCTOR.email }
            }
        }).as('mockGetUpdatedCourse');

        // Verify Updated Course Details
        cy.contains("Back").click();
        cy.wait('@mockGetUpdatedCourse');

        cy.contains(`${TEST_PROJECT.title}`).should('be.visible');
    });

    // Required Fields (Project and Team Name)
    it("Displays an error message when attempting to add a project without a name.", () => {
        // Course ID
        const COURSE_ID = TEST_COURSE.number;

        // Course Information Fetch (Initial GET)
        cy.intercept('GET', `${BASE_URL}/auth/get-course/${COURSE_ID}`, {
            statusCode: 200,
            times: 1,
            body: {
                courseNumber: TEST_COURSE.number,
                courseName: TEST_COURSE.name,
                description: TEST_COURSE.description,
                students: [],
                projects: [],
                instructor: { firstName: TEST_INSTRUCTOR.firstName, lastName: TEST_INSTRUCTOR.lastName, email: TEST_INSTRUCTOR.email }
            }
        }).as('mockGetCourse');

        // Project Creation Response 
        cy.intercept('POST', `${BASE_URL}/auth/course/${TEST_COURSE.number}/add-project`).as('mockAddProject');

        // Add New Project
        cy.contains("Add Project-Team").click();
        cy.wait('@mockGetCourse');

        // Project Information (No Title or Team Name)
        cy.get('[data-testid="project-description"]').type(TEST_PROJECT.description);

        // Try Submission
        cy.get('[data-testid="project-save"]').click();

        // Verify Error Message and No Response
        cy.get('[data-testid="project-title"]').should('have.prop', 'validity').its('valueMissing').should('be.true');
        cy.get('@mockAddProject.all').should('have.length', 0);
    });

    // Duplicate Project
    it("Displays an error message when attempting to add a project with a name that already exists.", () => {
        // Course ID
        const COURSE_ID = TEST_COURSE.number;

        // Initial Course Information Fetch
        cy.intercept('GET', `${BASE_URL}/auth/get-course/${COURSE_ID}`, {
            statusCode: 200,
            body: {
                courseNumber: TEST_COURSE.number,
                courseName: TEST_COURSE.name,
                description: TEST_COURSE.description,
                students: [],
                projects: [{ _id: '1', title: TEST_PROJECT.title, description: TEST_PROJECT.description, team: TEST_PROJECT.team_name }],
                instructor: { firstName: TEST_INSTRUCTOR.firstName, lastName: TEST_INSTRUCTOR.lastName, email: TEST_INSTRUCTOR.email }
            }
        }).as('mockGetCourse');

        // Add New Project
        cy.contains("Add Project-Team").click();
        cy.wait('@mockGetCourse');
        cy.contains(`Add Project-Teams to ${TEST_COURSE.number}`).should('be.visible');

        // Duplicate Response
        // There is no response for this.
        cy.intercept('POST', `${BASE_URL}/auth/course/${COURSE_ID}/add-project`, {
            statusCode: 409,
            body: { message: "A project with that title already exists." }
        }).as('mockAddDuplicateProject');

        throw new Error("Our system allows duplicate project titles.");
    });

    // Cancel Adding Project
    it("Closes the add project view when the cancel button is cliked.", () => {
        // Course ID
        const COURSE_ID = TEST_COURSE.number;

        // **************************************************

        // Course Information Fetch
        cy.intercept('GET', `${BASE_URL}/auth/get-course/${COURSE_ID}`, {
            statusCode: 200,
            body: {
                courseNumber: TEST_COURSE.number,
                courseName: TEST_COURSE.name,
                description: TEST_COURSE.description,
                students: [],
                projects: [],
                instructor: { firstName: TEST_INSTRUCTOR.firstName, lastName: TEST_INSTRUCTOR.lastName, email: TEST_INSTRUCTOR.email }
            }
        }).as('mockGetCourse');

        // Project Creation Response
        cy.intercept('POST', `${BASE_URL}/auth/course/${TEST_COURSE.number}/add-project`).as('mockAddProject');

        // Add New Project
        cy.contains("Add Project-Team").click();
        cy.wait('@mockGetCourse');
        cy.contains(`Add Project-Teams to ${TEST_COURSE.number}`).should('be.visible');

        // Project Information
        cy.get('[data-testid="project-title"]').type(TEST_PROJECT.title);
        cy.get('[data-testid="project-description"]').type(TEST_PROJECT.description);
        cy.get('[data-testid="project-teamname"]').type(TEST_PROJECT.team_name);

        // Cancel
        cy.contains("Back").click();
        cy.get('@mockAddProject.all').should('have.length', 0);

        cy.wait('@mockGetCourse');
        cy.contains("No project-teams created for this course yet.").should('be.visible');
    });

    // Project Details
    it("Displays the landing page for a specific project.", () => {
        // Course ID
        const COURSE_ID = TEST_COURSE.number;

        // **************************************************

        // Course Information Fetch
        cy.intercept('GET', `${BASE_URL}/auth/get-course/${COURSE_ID}`, {
            statusCode: 200,
            times: 1,
            body: {
                courseNumber: TEST_COURSE.number,
                courseName: TEST_COURSE.name,
                description: TEST_COURSE.description,
                students: [],
                projects: [],
                instructor: { firstName: TEST_INSTRUCTOR.firstName, lastName: TEST_INSTRUCTOR.lastName, email: TEST_INSTRUCTOR.email }
            }
        }).as('mockGetCourse');

        // Project Creation Response
        cy.intercept('POST', `${BASE_URL}/auth/course/${TEST_COURSE.number}/add-project`, {
            statusCode: 200,
            body: {
                projects: [{ _id: '1', title: TEST_PROJECT.title, description: TEST_PROJECT.description, team: TEST_PROJECT.team_name }]
            }
        }).as('mockAddProject');

        // Add Project View
        cy.contains("Add Project-Team").click();

        // Get Course
        cy.wait('@mockGetCourse');

        // Verify Add Project Details
        cy.contains(`Add Project-Teams to ${TEST_COURSE.number}`).should('be.visible');

        // Project Information
        cy.get('[data-testid="project-title"]').type(TEST_PROJECT.title);
        cy.get('[data-testid="project-description"]').type(TEST_PROJECT.description);
        cy.get('[data-testid="project-teamname"]').type(TEST_PROJECT.team_name);

        // Create
        cy.get('[data-testid="project-save"]').click();
        cy.wait('@mockAddProject');

        // **************************************************

        // Updated Course Information Fetch
        cy.intercept('GET', `${BASE_URL}/auth/get-course/${COURSE_ID}`, {
            statusCode: 200,
            body: {
                courseNumber: TEST_COURSE.number,
                courseName: TEST_COURSE.name,
                description: TEST_COURSE.description,
                students: [],
                projects: [{ _id: '1', title: TEST_PROJECT.title, description: TEST_PROJECT.description, team: TEST_PROJECT.team_name }],
                instructor: { firstName: TEST_INSTRUCTOR.firstName, lastName: TEST_INSTRUCTOR.lastName, email: TEST_INSTRUCTOR.email }
            }
        }).as('mockGetUpdatedCourse');

        // Verify Updated Course Details
        cy.contains("Back").click();
        cy.wait('@mockGetUpdatedCourse');

        // View Project
        cy.contains(`${TEST_PROJECT.title}`).click();

        // Verify Project Details
        cy.contains(`${TEST_PROJECT.title}`).should('be.visible');
        cy.contains(`${TEST_PROJECT.description}`).should('be.visible');
        cy.contains(`${TEST_PROJECT.team_name}`).should('be.visible');
    });

    // Add Project-Team Command
    it("Uses the create project command to create a project-team.", () => {
        cy.CreateProjectTeam();
        cy.pause();
    });

});