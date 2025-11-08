const TEST_TOKEN = "token1";
let TEST_INSTRUCTOR;
let TEST_COURSE;
let TEST_STUDENT;

describe("View Current Roster", function () {
  before(() => {
    cy.fixture("TEST_INSTRUCTOR").then((data) => {
      TEST_INSTRUCTOR = data;
    });
    cy.fixture("TEST_COURSE").then((data) => {
      TEST_COURSE = data;
    });
    cy.fixture("TEST_STUDENT").then((data) => {
      TEST_STUDENT = data;
    });
  });
  beforeEach(() => {
    cy.CreateCourse();
  });
  it("Displays Empty Roster for new course", () => {
    cy.contains(TEST_COURSE.name).should("be.visible");
  });

  it("Adds a Student to the course", () => {
    cy.intercept("POST", "http://localhost:5000/api/students/create", {
      statusCode: 200,
      body: {
        student: {
          _id: "1",
          firstName: TEST_STUDENT.firstName,
          lastName: TEST_STUDENT.lastName,
          email: TEST_STUDENT.email,
        },
      },
    }).as("mockAddStudents");
    cy.intercept(
      "POST",
      `http://localhost:5000/api/students/course/${TEST_COURSE.number}/add-student`,
      {
        statusCode: 200,
        body: {
          student: {
            _id: "1",
            firstName: TEST_STUDENT.firstName,
            lastName: TEST_STUDENT.lastName,
            email: TEST_STUDENT.email,
          },
        },
      }
    ).as("mockAddStudentsToCourse");
    cy.contains(TEST_COURSE.name).click();
    //In CourseRoster.jsx
    cy.get('[data-testid = "add-student-btn"]').click();
    //In AddStudent.jsx
    cy.get('[data-testid = "email"]').type(TEST_STUDENT[0].email);
    cy.get('[data-testid = "add-student-btn"]').click();
    cy.wait("@mockAddStudents");
    cy.wait("@mockAddStudentsToCourse");
    cy.contains("Student added successfully!");
  });
  it("Doesn't add empty fields to the course and checks validity of email", () => {
    cy.contains(TEST_COURSE.name).click();

    // open AddStudent modal
    cy.get('[data-testid="add-student-btn"]').click();

    // 1) Submit with empty field -> valueMissing should be true
    cy.get('[data-testid="add-student-btn"]').click();

    cy.get('[data-testid="email"]').then(($el) => {
      const el = $el[0];
      // show the native bubble if you want (not required for the assertion)
      el.reportValidity();
      expect(el.validity.valueMissing, "email is required").to.be.true;
      expect(el.checkValidity(), "input is invalid").to.be.false;
    });

    // 2) Submit with bad email -> typeMismatch should be true
    cy.get('[data-testid="email"]').type("abc.def");
    cy.get('[data-testid="add-student-btn"]').click();

    cy.get('[data-testid="email"]').then(($el) => {
      const el = $el[0];
      el.reportValidity();
      expect(el.validity.typeMismatch, "invalid email format").to.be.true;
      expect(el.checkValidity(), "input is still invalid").to.be.false;
    });
  });

  it("Add Students via CSV/Excel", () => {
    cy.intercept(
      "POST",
      `http://localhost:5000/api/students/course/${TEST_COURSE.number}/add-multiple`,
      {
        statusCode: 200,
        body: {
          message: "Successfully added students",
        },
      }
    ).as("uploadCsv");
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
