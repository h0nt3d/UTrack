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
Cypress.Commands.add("InstructorSignUp", function () {
  // Data
  // ====================================================================================================

  const BASE_URL = "http://localhost:5000/api";
  cy.fixture("TEST_INSTRUCTOR").then((TEST_INSTRUCTOR) => {
    cy.fixture("TEST_COURSE").then((TEST_COURSE) => {
      this.TEST_INSTRUCTOR = TEST_INSTRUCTOR;
      const course = TEST_COURSE;

      // System Flow
      // ====================================================================================================

      // Sign-Up Intercept
      cy.intercept("POST", `${BASE_URL}/auth/instructor-signup`, {
        statusCode: 200,
        body: {
          message: "User created successfully.",
          user: { email: TEST_INSTRUCTOR.email },
          token: TEST_INSTRUCTOR.personalToken,
        },
      }).as("mockSignup");
      cy.intercept("GET", `${BASE_URL}/auth/get-course/${TEST_COURSE.number}`, {
        statusCode: 200,
        body: {
          _id: "1",
          courseNumber: course.number,
          courseName: course.name,
          courseCode: course.number,
          description: course.description || "",
          students: [],
          projects: [],
        },
      }).as("loadCourse");

      cy.intercept("GET", `http://localhost:5000/user/john.doe%40unb.ca`, {
        statusCode: 200,
        body: {
          firstName: TEST_INSTRUCTOR.firstName,
          lastName: TEST_INSTRUCTOR.lastName,
          email: TEST_INSTRUCTOR.email,
        },
      }).as("loadUser");

      // Landing Page
      cy.visit("http://localhost:3000");

      // Sign-Up Page
      cy.get('[data-testid="landing-instructorSignUp"]').click();
      cy.url().should("include", "/instructor-signup");

      // Instructor Information
      cy.get('[data-testid="signup-firstName"]').type(
        TEST_INSTRUCTOR.firstName
      );
      cy.get('[data-testid="signup-lastName"]').type(TEST_INSTRUCTOR.lastName);
      cy.get('[data-testid="signup-personalToken"]').type(
        TEST_INSTRUCTOR.personalToken
      );
      cy.get('[data-testid="signup-email"]').type(TEST_INSTRUCTOR.email);
      cy.get('[data-testid="signup-password"]').type(TEST_INSTRUCTOR.password);
      cy.get('[data-testid="signup-confirmPassword"]').type(
        TEST_INSTRUCTOR.password
      );

      // Create Account
      cy.contains("Create Account").click();
      cy.wait(500);

      // Bypass Email Verification
      cy.window().then((win) => {
        win.document
          .querySelectorAll('.modal, [role="dialog"], .modal-backdrop')
          .forEach((el) => el.remove());

        win.localStorage.setItem("email", TEST_INSTRUCTOR.email);
        win.localStorage.setItem("token", TEST_INSTRUCTOR.personalToken);
      });

      // Profile
      cy.visit("http://localhost:3000/profile", {
        onBeforeLoad(win) {
          win.localStorage.setItem("email", TEST_INSTRUCTOR.email);
          win.localStorage.setItem("token", TEST_INSTRUCTOR.personalToken);
        },
      });

      // Profile Details
      cy.url().should("include", "/profile");
      cy.contains("My Courses").should("be.visible");
    });
  });
});

/**
 * A command for emulating the process to add a course.
 *
 * This command first utilizes the instructor sign-up command to then add courses.
 */
Cypress.Commands.add("CreateCourse", () => {
  const BASE_URL = "http://localhost:5000/api";

  cy.fixture("TEST_INSTRUCTOR").then((TEST_INSTRUCTOR) => {
    cy.fixture("TEST_COURSE").then((TEST_COURSE) => {
      const instructor = TEST_INSTRUCTOR;
      const course = TEST_COURSE;

      // Sign-Up
      cy.InstructorSignUp();

      // Re-Visit Page
      cy.visit("http://localhost:3000/profile", {
        onBeforeLoad(win) {
          win.localStorage.setItem("email", instructor.email);
          win.localStorage.setItem("authToken", instructor.personalToken);
          win.localStorage.setItem("token", instructor.personalToken);
        },
      });

      // Intercept course creation
      cy.intercept("POST", `${BASE_URL}/auth/createCourses`, {
        statusCode: 200,
        body: {
          course: {
            _id: "1",
            courseNumber: course.number,
            courseName: course.name,
          },
        },
      }).as("mockCreateCourse");
      cy.intercept("GET", `${BASE_URL}/auth/get-course/${TEST_COURSE.number}`, {
        statusCode: 200,
        body: {
          _id: "1",
          courseNumber: course.number,
          courseName: course.name,
          courseCode: course.number,
          description: course.description || "",
          students: [],
          projects: [],
        },
      }).as("loadCourse");

      cy.intercept("GET", `http://localhost:5000/user/john.doe%40unb.ca`, {
        statusCode: 200,
        body: {
          firstName: TEST_INSTRUCTOR.firstName,
          lastName: TEST_INSTRUCTOR.lastName,
          email: TEST_INSTRUCTOR.email,
        },
      }).as("loadUser");

      // Add course
      cy.contains("Add course").click();
      cy.get('[data-testid="course-number"]').type(course.number);
      cy.get('[data-testid="course-name"]').type(course.name);
      cy.get('[data-testid="course-description"]').type(course.description);
      cy.get('[data-testid="course-save"]').click();

      // Verify results
      cy.url().should("include", "/profile");
      cy.contains("My Courses").should("be.visible");
      cy.wait("@mockCreateCourse");
      cy.contains(`${course.number}: ${course.name}`).should("be.visible");
    });
  });
});

Cypress.Commands.add("AddStudents", () => {
  const BASE_URL = "http://localhost:5000/api";
  cy.fixture("TEST_INSTRUCTOR").then((TEST_INSTRUCTOR) => {
    cy.fixture("TEST_COURSE").then((TEST_COURSE) => {
      cy.fixture("TEST_STUDENT").then((TEST_STUDENT) => {
        const instructor = TEST_INSTRUCTOR;
        const course = TEST_COURSE;
        const student = TEST_STUDENT;

        cy.CreateCourse();

        cy.intercept(
          "POST",
          `${BASE_URL}/students/course/${TEST_COURSE.number}/add-multiple`,
          {
            statusCode: 200,
            body: {
              success: true,
              students: student,
            },
          }
        ).as("uploadCsv");

        cy.intercept(
          "GET",
          `${BASE_URL}/auth/get-course/${TEST_COURSE.number}`,
          {
            statusCode: 200,
            body: {
              _id: "1",
              courseNumber: course.number,
              courseName: course.name,
              courseCode: course.number,
              description: course.description || "",
              students: student,
              projects: [],
            },
          }
        ).as("loadCourse");

        cy.intercept("GET", `http://localhost:5000/user/john.doe%40unb.ca`, {
          statusCode: 200,
          body: {
            firstName: TEST_INSTRUCTOR.firstName,
            lastName: TEST_INSTRUCTOR.lastName,
            email: TEST_INSTRUCTOR.email,
          },
        }).as("loadUser");

        cy.contains(TEST_COURSE.name).click();

        //In CourseRoster.jsx
        cy.contains("Add Students (CSV/Excel)").click();
        //Import CSV file
        cy.get('[data-testid="bulk-upload-input"]')
          .should("exist")
          .selectFile(
            "C:/Users/USER/OneDrive - University of New Brunswick/Desktop/SWE4103/UTrack/frontend/cypress/fixtures/TEST_STUDENT.csv",
            { force: true }
          );
        cy.contains("Add All Students").click();
        cy.wait("@uploadCsv");
      });
    });
  });
});

Cypress.Commands.add("CreateProject", () => {
  const BASE_URL = "http://localhost:5000/api";

  cy.fixture("TEST_INSTRUCTOR").then((TEST_INSTRUCTOR) => {
    cy.fixture("TEST_COURSE").then((TEST_COURSE) => {
      cy.fixture("TEST_STUDENT").then((TEST_STUDENT) => {
        cy.fixture("TEST_PROJECT").then((TEST_PROJECT) => {
          const instructor = TEST_INSTRUCTOR;
          const course = TEST_COURSE;
          const project = TEST_PROJECT;
          const student = TEST_STUDENT;

          // Ensure instructor, course and students exist (AddStudents will create course and add students)
          cy.AddStudents();

          // Intercept the POST that AddProject uses
          cy.intercept(
            "POST",
            `${BASE_URL}/auth/course/${TEST_COURSE.number}/add-project`,
            {
              statusCode: 200,
              body: {
                success: true,
                message: "Project added successfully",
                projects: [project],
              },
            }
          ).as("mockAddProject");

          // Intercept the GET used by CourseRoster / AddProject to return the project after creation
          cy.intercept(
            "GET",
            `${BASE_URL}/auth/get-course/${TEST_COURSE.number}`,
            {
              statusCode: 200,
              body: {
                _id: "1",
                courseNumber: course.number,
                courseName: course.name,
                courseCode: course.number,
                description: course.description || "",
                students: student,
                projects: [project],
              },
            }
          ).as("loadCourseAfterProject");

          // Ensure Logout/profile load is mocked
          cy.intercept("GET", `http://localhost:5000/user/john.doe%40unb.ca`, {
            statusCode: 200,
            body: {
              firstName: TEST_INSTRUCTOR.firstName,
              lastName: TEST_INSTRUCTOR.lastName,
              email: TEST_INSTRUCTOR.email,
            },
          }).as("loadUser");

          // Open the course and go to Add Project
          cy.contains("Add Project-Team").click();

          // Fill the form and submit
          cy.get("form").within(() => {
            cy.get('input[placeholder="Project Title"]').type(project.title);
            cy.get(
              'textarea[placeholder="Project Description (optional)"]'
            ).type(project.description);
            cy.get('input[placeholder="Team Name"]').type(project.team_name);
            cy.contains("Add Project-Team").click();
          });

          // Wait for the mocked POST and then navigate back to the course page and verify
          cy.wait("@mockAddProject");
          cy.contains("Back").click();
          cy.wait("@loadCourseAfterProject");

          // Verify the project is visible on the course roster
          cy.contains(project.title).should("be.visible");
        });
      });
    });
  });
});
