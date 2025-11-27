/**
 * This file contains acceptance tests for managing courses.
 *
 * For these test cases, the course modal file (src/subcomponents/CourseModal.jsx) was updated to include test IDs.
 *
 * These test cases have been updated to match the refactored functionality.
 */

// Data
let TEST_INSTRUCTOR;
let TEST_COURSE;

const BASE_URL = 'http://localhost:5000/api';
const SPECIAL_TOKEN = 'test-token';

// Test Suite
describe("Manage Courses", () => {

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
  });

  beforeEach(() => {
    // Instructor Sign-Up
    cy.InstructorSignUp();

    // Visit Profile
    cy.visit("http://localhost:3000/profile", {
      onBeforeLoad(win) {
        win.localStorage.setItem("email", TEST_INSTRUCTOR.email);
        win.localStorage.setItem("authToken", TEST_INSTRUCTOR.personalToken);
        win.localStorage.setItem("token", TEST_INSTRUCTOR.personalToken);
      },
    });
  });

  // Clean Storage (Test Again)
  after(() => {
    cy.clearLocalStorage();
  });

  // Tests
  // **************************************************

  // Courses Page
  it("Displays active courses and an add course button.", () => {
    // Page Details

    // URL
    cy.url().should("include", "/profile");

    // Header (My Courses)
    cy.contains("My Courses").should("be.visible");

    // Add Courses Button
    cy.contains("button", "Add course").should("be.visible");
  });

  // Add Course
  it("Adds a course when given a course code, name, and description.", () => {
    // Backend Response
    cy.intercept("POST", `${BASE_URL}/auth/createCourses`, {
      statusCode: 200,
      body: {
        course: {
          _id: "1",
          courseNumber: TEST_COURSE.number,
          courseName: TEST_COURSE.name,
        },
      },
    }).as("mockCreateCourse");

    // Add Courses View
    cy.contains("Add course").click();

    // Course Information
    cy.get('[data-testid="course-number"]').type(TEST_COURSE.number);
    cy.get('[data-testid="course-name"]').type(TEST_COURSE.name);
    cy.get('[data-testid="course-description"]').type(TEST_COURSE.description);

    // Create
    cy.get('[data-testid="course-save"]').click();

    cy.url().should("include", "/profile");
    cy.contains("My Courses").should("be.visible");
    cy.wait("@mockCreateCourse");
    cy.contains(`${TEST_COURSE.number}: ${TEST_COURSE.name}`).should(
      "be.visible"
    );
  });

  // Empty Fields
  it("Displays an error when an instructor attempts to create a course with missing fields.", () => {
    // Backend Response
    cy.intercept("POST", `${BASE_URL}/auth/createCourses`, {
      statusCode: 400,
      body: { message: "courseNumber required, courseName required" },
    }).as("missingFields");

    // Add Courses View
    cy.contains("Add course").click();

    // Correct View
    cy.get('[data-testid="course-number"]').should("be.visible");
    cy.get('[data-testid="course-name"]').should("be.visible");
    cy.get('[data-testid="course-description"]').should("be.visible");

    // Submit
    cy.get('[data-testid="course-save"]').click();
    cy.wait("@missingFields");

    // Error Validation
    cy.on("window:alert", (alertText) => {
      expect(alertText).to.match(/courseNumber required, courseName required/i);
    });
  });

  // Duplicate Course
  it("Displays an error when an instructor attempts to create a duplicate course.", () => {
    // Add Course
    // **************************************************

    // Backend Response
    cy.intercept("POST", `${BASE_URL}/auth/createCourses`, {
      statusCode: 200,
      body: {
        course: {
          _id: "1",
          courseNumber: TEST_COURSE.number,
          courseName: TEST_COURSE.name,
        },
      },
    }).as("mockCreateCourse");

    // Add Courses View
    cy.contains("Add course").click();

    // Course Information
    cy.get('input[data-testid="course-number"]').type(TEST_COURSE.number);
    cy.get('input[data-testid="course-name"]').type(TEST_COURSE.name);
    cy.get('[data-testid="course-description"]').type(TEST_COURSE.description);

    // Create
    cy.get('[data-testid="course-save"]').click();
    cy.wait("@mockCreateCourse");

    cy.contains(`${TEST_COURSE.number}: ${TEST_COURSE.name}`).should(
      "be.visible"
    );

    // Test Duplicate
    // **************************************************

    // Backend Response
    cy.intercept("POST", `${BASE_URL}/auth/createCourses`, {
      statusCode: 409,
      body: { message: "courseNumber already exists" },
    }).as("duplicateCourse");

    // Add Courses View
    cy.contains("Add course").click();

    // Correct View
    cy.get('[data-testid="course-number"]').should("be.visible");
    cy.get('[data-testid="course-name"]').should("be.visible");
    cy.get('[data-testid="course-description"]').should("be.visible");

    // Course Information
    cy.get('input[data-testid="course-number"]').type(TEST_COURSE.number);
    cy.get('input[data-testid="course-name"]').type(TEST_COURSE.name);
    cy.get('[data-testid="course-description"]').type(TEST_COURSE.description);

    // Submit
    cy.get('[data-testid="course-save"]').click();
    cy.wait("@duplicateCourse");

    // Error Validation
    cy.on("window:alert", (alertText) => {
      expect(alertText).to.match(/courseNumber already exists/i);
    });
  });

  // Cancel Adding Course
  it("Closes the add course view when the cancel button is clicked.", () => {
    // Response
    cy.intercept("POST", `${BASE_URL}/auth/createCourses`).as(
      "createCourseAttempt"
    );

    // Add Courses View
    cy.contains("Add course").click();

    // Correct View
    cy.get('[data-testid="course-number"]').should("be.visible");
    cy.get('[data-testid="course-name"]').should("be.visible");
    cy.get('[data-testid="course-description"]').should("be.visible");

    // Begin Entering Information
    cy.get('input[data-testid="course-number"]').type(TEST_COURSE.number);

    // Cancel
    cy.get('[data-testid="course-cancel"]').click();

    // No Data
    cy.get('[data-testid="course-number"]').should("not.exist");

    // No Request
    cy.wait(500);
    cy.get("@createCourseAttempt.all").should("have.length", 0);
  });

  // Course Details
  it("Displays the landing page for a specific course.", () => {
    // Add Course
    // **************************************************

    // Backend Response
    cy.intercept("POST", `${BASE_URL}/auth/createCourses`, {
      statusCode: 200,
      body: {
        course: {
          _id: "1",
          courseNumber: TEST_COURSE.number,
          courseName: TEST_COURSE.name,
        },
      },
    }).as("mockCreateCourse");

    // Add Courses View
    cy.contains("Add course").click();

    // Course Information
    cy.get('input[data-testid="course-number"]').type(TEST_COURSE.number);
    cy.get('input[data-testid="course-name"]').type(TEST_COURSE.name);
    cy.get('[data-testid="course-description"]').type(TEST_COURSE.description);

    // Create
    cy.get('[data-testid="course-save"]').click();
    cy.wait("@mockCreateCourse");

    // Course Page
    cy.contains(`${TEST_COURSE.number}: ${TEST_COURSE.name}`).click();
    cy.contains(TEST_COURSE.name).should('be.visible');
  });
});
