/**
 * This file contains all acceptance tests for adding projects to courses.
 */

// Test Data
// ****************************************************************************************************

const BASE_URL = 'http://localhost:5000/api'

// Instructor
const TEST_INSTRUCTOR = {
    firstName: "John",
    lastName: "Doe",
    personalToken: "test-token",
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

// Test Cases
// ****************************************************************************************************

describe("Manage Projects", () => {

    // Environment Setup
    // ****************************************************************************************************

    // Active Course
    beforeEach(() => {
        cy.CreateCourse();
    });

    // Clean Storage
    after(() => {
        cy.clearLocalStorage();
    });

    // Test Cases
    // ****************************************************************************************************

    // Project Page
    it("Displays active projects, an add project button, and a back button.", () => {
        //
    });

    // Navigation
    it("Navigates back to the course page when the back button is clicked.", () => {
        //
    });

    // Add Project
    it("Adds a project when given a project name and description.", () => {
        //
    });

    // New Project
    it("Displays the newly added project on the project page after creation.", () => {
        //
    });

    // Required Fields (Project Name)
    it("Displays an error message when attempting to add a project without a name.", () => {
        //
    });

    // Duplicate Project
    it("Displays an error message when attempting to add a project with a name that already exists.", () => {
        //
    });

    // Cancel Adding Project
    it("Closes the add project view when the cancel button is cliked.", () => {
        //
    });

    // Edit Project
    it("Allows the instructor to edit a project's name and description.", () => {
        //
    });

    // Delete Project
    it("Allows the instructor to remove an active project.", () => {
        //
    });

    // Project Details
    it("Displays the landing page for a specific project.", () => {
        //
    });

});