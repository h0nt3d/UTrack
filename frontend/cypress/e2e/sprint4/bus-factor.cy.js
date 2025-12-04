/**
 * Bus Factor Acceptance Tests.
 */

// Data
let TEST_INSTRUCTOR;
let TEST_STUDENT;
let TEST_COURSE;
let TEST_PROJECT;

const BASE_URL = 'http://localhost:5000/api';
const SPECIAL_TOKEN = 'test-token';

// Test Suite
describe("Bus Factor", () => {
    // Environment
    // **************************************************
    before(() => {
        // Instructor
        cy.fixture('TEST_INSTRUCTOR').then((data) => {
            TEST_INSTRUCTOR = data;
        });

        // Student
        cy.fixture('TEST_SINGLE_STUDENT').then((data) => {
            TEST_STUDENT = data;
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

    after(() => {
        cy.clearLocalStorage();
    });

    // Tests
    // **************************************************

    // Prompt Bus Factor Input
    it("Displays a modal for inputting bus factor data.", () => {
        cy.StudentLoginToProject();
        cy.contains("Record Bus Factor").click();
        cy.contains("Record Your Bus Factor").should('be.visible');
        cy.contains("Rate how well your work is covered by others (1-3).");
    });

    // Successful Input
    it("Creates a new bus factor entry with input data", () => {
        // Information
        const DATE_IN = '2025-12-01';
        const RATING = 2;

        // Clock
        const TIME = new Date('2025-12-01T12:00:00Z').getTime();
        cy.clock(TIME, ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval']);

        // Environment
        cy.StudentLoginToProject();

        // Response
        cy.intercept("POST", "**/api/course/*/project/*/add-bus-factor", {
            statusCode: 200,
            body: { ok: true, message: "Bus factor added successfully!" }
        }).as('mockBusFactor');

        // Modal
        cy.contains("Record Bus Factor").first().click();

        // Input
        cy.get('input[name="date"]').clear().type(DATE_IN);
        cy.get('input[name="rating"]').invoke("val", RATING).trigger("input").trigger("change");



        // Submit
        cy.get('form button[type="submit"]').contains("Record Bus Factor").click();
        cy.wait('@mockBusFactor');
        cy.contains("Bus factor added successfully!").should("be.visible");
        cy.tick(1500);
    });

    // Instructor View
    it("Allows the instructor to view the overall bus factor data for a team project.", () => {
        const PROJECT_ID = 1;
        // Create Project-Team
        cy.CreateProjectTeamWithStudents();

        // Bus Factors
        const busFactorData = {
            '1': [{ x: '2025-12-01', y: 2 }, { x: '2025-12-03', y: 2 }],
            '2': [{ x: '2025-11-27', y: 3 }, { x: '2025-11-29', y: 1 }],
            '3': [{ x: '2025-12-02', y: 2 }, { x: '2025-12-03', y: 3 }],
            '4': [{ x: '2025-12-01', y: 1 }, { x: '2025-12-02', y: 1 }],
            '5': [{ x: '2025-12-03', y: 2 }],
        };

        // Response
        cy.intercept("GET", `**/api/course/${TEST_COURSE.number}/project/${PROJECT_ID}/student/*/bus-factor`, (req) => {
            const idMatch = req.url.match(/student\/([^/]+)\/bus-factor/);
            const id = idMatch?.[1];
            req.reply({
                statusCode: 200,
                body: { busFactors: busFactorData[id] ?? [] }
            });

        }).as('mockBusFactors');

        // Bus Factor
        cy.contains('View Metrics').click();
        cy.contains('Bus Factor').click();

        for (let i = 0; i < 5; i++) {
            cy.wait('@mockBusFactors');
        }

        cy.pause();
    });

});