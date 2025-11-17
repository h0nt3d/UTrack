/**
 * This file contains all acceptance tests related to the bus factor metric.
 */

// Data
let TEST_INSTRUCTOR;
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
    });

    after(() => {
        cy.clearLocalStorage();
    });

    // Tests
    // **************************************************

    // Prompt Bus Factor Input
    it("Displays a modal for inputting bus factor data.", () => {
        // Note: Required Information
        // Student Email, Course ID, Project ID, Rating (User Input), Date
    });

    // No Prompt
    it("Does not display a modal for inputting bus factor data when an entry for a time period already exists.", () => {
        //
    });

    // Multiple Projects
    it("Displays a prompt, if none exists, for each team project the student is in.", () => {
        //
    });

    // Successful Input
    it("Creates a new bus factor entry with input data", () => {
        //
    });

    // Required Inputs
    it("Displays an error message when submitting input without required fields", () => {
        //
    });

    // Overall Bus Factor Data
    it("Allows the instructor to view the overall bus factor data for a team project.", () => {
        //
    });

    // Student Bus Factor
    it("Allows the instructor to view a particular student's bus factor data.", () => {
        //
    });

    // Avergae Bus Factor
    it("Displays the team project's average bus factor over time", () => {
        //
    });

});