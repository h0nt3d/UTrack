let TEST_INSTRUCTOR;
let TEST_COURSE;
let TEST_STUDENT;
let TEST_PROJECT;

describe("Adding Students to projects", function () {
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
    cy.fixture("TEST_PROJECT").then((data) => {
      TEST_PROJECT = data;
    });
  });

  // TC-A: Team page loads correctly
  it("TC-A - Team page loads correctly", () => {
    cy.window().then((win) => {
      win.localStorage.setItem("email", TEST_INSTRUCTOR.email);
      win.localStorage.setItem("token", TEST_INSTRUCTOR.personalToken);
    });

    cy.intercept("GET", "http://localhost:5000/api/auth/get-courses", {
      statusCode: 200,
      body: {
        courses: [
          {
            _id: "1",
            courseNumber: TEST_COURSE.number,
            courseName: TEST_COURSE.name,
            courseCode: TEST_COURSE.number,
          },
        ],
      },
    }).as("mockGetCourses");

    cy.intercept(
      "GET",
      `http://localhost:5000/api/auth/get-course/${TEST_COURSE.number}`,
      {
        statusCode: 200,
        body: {
          _id: "1",
          courseNumber: TEST_COURSE.number,
          courseName: TEST_COURSE.name,
          students: [],
          projects: [],
        },
      }
    ).as("mockGetCourseEmpty");

    cy.visit("http://localhost:3000/profile", {
      onBeforeLoad(win) {
        win.localStorage.setItem("email", TEST_INSTRUCTOR.email);
        win.localStorage.setItem("token", TEST_INSTRUCTOR.personalToken);
      },
    });

    cy.wait("@mockGetCourses");
    cy.contains(`${TEST_COURSE.number}: ${TEST_COURSE.name}`).click();
    cy.wait("@mockGetCourseEmpty");
  });

  // TC-B: Open Add Students and add students (happy path)
  it("TC-B - Open Add Students and add students (happy path)", () => {
    cy.window().then((win) => {
      win.localStorage.setItem("email", TEST_INSTRUCTOR.email);
      win.localStorage.setItem("token", TEST_INSTRUCTOR.personalToken);
    });

    cy.intercept("GET", "http://localhost:5000/api/auth/get-courses", {
      statusCode: 200,
      body: {
        courses: [
          {
            _id: "1",
            courseNumber: TEST_COURSE.number,
            courseName: TEST_COURSE.name,
          },
        ],
      },
    }).as("mockGetCourses");

    cy.fixture("TEST_STUDENT").then((all) => {
      const courseStudents = all.slice(0, 4).map((s, i) => ({
        _id: `s${i + 1}`,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
      }));

      cy.intercept(
        "GET",
        `http://localhost:5000/api/auth/get-course/${TEST_COURSE.number}`,
        {
          statusCode: 200,
          body: {
            _id: "1",
            courseNumber: TEST_COURSE.number,
            courseName: TEST_COURSE.name,
            students: courseStudents,
            projects: [
              {
                _id: "p1",
                title: TEST_PROJECT.title,
                team: TEST_PROJECT.team_name,
              },
            ],
          },
        }
      ).as("mockGetCourseWithStudents");

      cy.intercept(
        "GET",
        new RegExp(
          "http://localhost:5000/api/auth/course/" +
            TEST_COURSE.number +
            "/project/.*/students"
        ),
        {
          statusCode: 200,
          body: { students: [] },
        }
      ).as("mockGetProjectStudentsEmpty");

      cy.visit("http://localhost:3000/profile", {
        onBeforeLoad(win) {
          win.localStorage.setItem("email", TEST_INSTRUCTOR.email);
          win.localStorage.setItem("token", TEST_INSTRUCTOR.personalToken);
        },
      });

      cy.wait("@mockGetCourses");
      cy.contains(`${TEST_COURSE.number}: ${TEST_COURSE.name}`).click();
      cy.wait("@mockGetCourseWithStudents");
      cy.contains(`${TEST_PROJECT.title}-${TEST_PROJECT.team_name}`).click();
      cy.wait("@mockGetProjectStudentsEmpty");

      // Open add students
      cy.contains("Add Students").click();
      cy.get("table thead th").eq(0).should("contain.text", "Select");
      cy.get("table tbody tr").should("have.length.gte", 2);

      // Select first two and post
      cy.get("table tbody tr")
        .eq(0)
        .find('input[type="checkbox"]')
        .check({ force: true });
      cy.get("table tbody tr")
        .eq(1)
        .find('input[type="checkbox"]')
        .check({ force: true });

      const added = courseStudents
        .slice(0, 2)
        .map((s, i) => ({ ...s, _id: `ps${i + 1}` }));
      cy.intercept(
        "POST",
        new RegExp(
          "http://localhost:5000/api/auth/course/" +
            TEST_COURSE.number +
            "/project/.*/add-students"
        ),
        {
          statusCode: 200,
          body: { students: added },
        }
      ).as("mockPostAddStudents");

      cy.contains("Add Selected Students").click();
      cy.wait("@mockPostAddStudents");

      cy.get('tr[data-testid="added-students"]').should("have.length", 2);
    });
  });

  // TC-C: Validation (no selection) and already-added disabled
  it("TC-C - Validation (no selection) and already-added disabled", () => {
    cy.window().then((win) => {
      win.localStorage.setItem("email", TEST_INSTRUCTOR.email);
      win.localStorage.setItem("token", TEST_INSTRUCTOR.personalToken);
    });

    cy.intercept("GET", "http://localhost:5000/api/auth/get-courses", {
      statusCode: 200,
      body: {
        courses: [
          {
            _id: "1",
            courseNumber: TEST_COURSE.number,
            courseName: TEST_COURSE.name,
          },
        ],
      },
    }).as("mockGetCourses");

    cy.fixture("TEST_STUDENT").then((all) => {
      const courseStudents = all.slice(0, 3).map((s, i) => ({
        _id: `s${i + 1}`,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
      }));
      const already = [courseStudents[0]];

      cy.intercept(
        "GET",
        `http://localhost:5000/api/auth/get-course/${TEST_COURSE.number}`,
        {
          statusCode: 200,
          body: {
            _id: "1",
            courseNumber: TEST_COURSE.number,
            courseName: TEST_COURSE.name,
            students: courseStudents,
            projects: [
              {
                _id: "p1",
                title: TEST_PROJECT.title,
                team: TEST_PROJECT.team_name,
              },
            ],
          },
        }
      ).as("mockGetCourseForC");

      cy.intercept(
        "GET",
        new RegExp(
          "http://localhost:5000/api/auth/course/" +
            TEST_COURSE.number +
            "/project/.*/students"
        ),
        {
          statusCode: 200,
          body: { students: already },
        }
      ).as("mockGetProjectStudentsC");

      cy.visit("http://localhost:3000/profile", {
        onBeforeLoad(win) {
          win.localStorage.setItem("email", TEST_INSTRUCTOR.email);
          win.localStorage.setItem("token", TEST_INSTRUCTOR.personalToken);
        },
      });

      cy.wait("@mockGetCourses");
      cy.contains(`${TEST_COURSE.number}: ${TEST_COURSE.name}`).click();
      cy.wait("@mockGetCourseForC");
      cy.contains(`${TEST_PROJECT.title}-${TEST_PROJECT.team_name}`).click();
      cy.wait("@mockGetProjectStudentsC");

      // Open Add Students and attempt to submit with no selection
      cy.contains("Add Students").click();
      cy.get("table tbody tr").should("have.length.gte", 1);
      cy.contains("Add Selected Students").click();
      cy.contains("Add Selected Students").should("be.visible");

      // Already-added student row has disabled checkbox
      cy.contains(already[0].email)
        .parents("tr")
        .within(() => {
          cy.get('input[type="checkbox"]').should("be.disabled");
        });

      // Select a non-added student and add
      cy.get("table tbody tr")
        .not(`:contains("${already[0].email}")`)
        .first()
        .find('input[type="checkbox"]')
        .check({ force: true });
      const added = [courseStudents[1]];
      cy.intercept(
        "POST",
        new RegExp(
          "http://localhost:5000/api/auth/course/" +
            TEST_COURSE.number +
            "/project/.*/add-students"
        ),
        {
          statusCode: 200,
          body: { students: [added[0]] },
        }
      ).as("mockPostAddOnce");

      cy.contains("Add Selected Students").click();
      cy.wait("@mockPostAddOnce");
      cy.contains(added[0].email).should("be.visible");
    });
  });

  // TC-D: Remove, re-add and cancel behavior
  it("TC-D - Remove, re-add and cancel behavior", () => {
    cy.window().then((win) => {
      win.localStorage.setItem("email", TEST_INSTRUCTOR.email);
      win.localStorage.setItem("token", TEST_INSTRUCTOR.personalToken);
    });

    cy.intercept("GET", "http://localhost:5000/api/auth/get-courses", {
      statusCode: 200,
      body: {
        courses: [
          {
            _id: "1",
            courseNumber: TEST_COURSE.number,
            courseName: TEST_COURSE.name,
          },
        ],
      },
    }).as("mockGetCourses");

    cy.fixture("TEST_STUDENT").then((all) => {
      const courseStudents = all.slice(0, 3).map((s, i) => ({
        _id: `s${i + 1}`,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
      }));
      const projectStudents = [courseStudents[0]];

      cy.intercept(
        "GET",
        `http://localhost:5000/api/auth/get-course/${TEST_COURSE.number}`,
        {
          statusCode: 200,
          body: {
            _id: "1",
            courseNumber: TEST_COURSE.number,
            courseName: TEST_COURSE.name,
            students: courseStudents,
            projects: [
              {
                _id: "p1",
                title: TEST_PROJECT.title,
                team: TEST_PROJECT.team_name,
              },
            ],
          },
        }
      ).as("mockGetCourseForD");

      cy.intercept(
        "GET",
        new RegExp(
          "http://localhost:5000/api/auth/course/" +
            TEST_COURSE.number +
            "/project/.*/students"
        ),
        {
          statusCode: 200,
          body: { students: projectStudents },
        }
      ).as("mockGetProjectStudentsD");

      cy.intercept(
        "POST",
        new RegExp(
          "http://localhost:5000/api/auth/course/" +
            TEST_COURSE.number +
            "/project/.*/remove-student"
        ),
        {
          statusCode: 200,
          body: { success: true },
        }
      ).as("mockPostRemoveD");

      cy.intercept(
        "POST",
        new RegExp(
          "http://localhost:5000/api/auth/course/" +
            TEST_COURSE.number +
            "/project/.*/add-students"
        ),
        (req) => {
          const ids = (req.body.studentIds || []).map((id, i) => ({
            _id: `ps${i + 1}`,
            firstName:
              courseStudents.find((c) => c._id === id)?.firstName || "x",
            lastName: courseStudents.find((c) => c._id === id)?.lastName || "x",
            email: courseStudents.find((c) => c._id === id)?.email || "x",
          }));
          req.reply({ statusCode: 200, body: { students: ids } });
        }
      ).as("mockPostAddD");

      cy.visit("http://localhost:3000/profile", {
        onBeforeLoad(win) {
          win.localStorage.setItem("email", TEST_INSTRUCTOR.email);
          win.localStorage.setItem("token", TEST_INSTRUCTOR.personalToken);
        },
      });

      cy.wait("@mockGetCourses");
      cy.contains(`${TEST_COURSE.number}: ${TEST_COURSE.name}`).click();
      cy.wait("@mockGetCourseForD");
      cy.contains(`${TEST_PROJECT.title}-${TEST_PROJECT.team_name}`).click();
      cy.wait("@mockGetProjectStudentsD");

      // Remove the student
      cy.on("window:confirm", () => true);
      cy.get('tr[data-testid="added-students"]')
        .first()
        .within(() => cy.contains("Remove").click());
      cy.wait("@mockPostRemoveD");
      cy.get('tr[data-testid="added-students"]').should("have.length", 0);

      // Re-add the student via Add Students
      cy.contains("Add Students").click();
      cy.get("table tbody tr")
        .first()
        .within(() => cy.get('input[type="checkbox"]').check({ force: true }));
      cy.contains("Add Selected Students").click();
      cy.wait("@mockPostAddD");
      cy.contains(courseStudents[0].email).should("be.visible");

      // Cancel does not change team
      cy.get('tr[data-testid="added-students"]').then(($rows) => {
        const initial = $rows.length;
        cy.contains("Add Students").click();
        cy.get("table tbody tr")
          .first()
          .find('input[type="checkbox"]')
          .check({ force: true });
        cy.contains("Cancel").click();
        cy.get('tr[data-testid="added-students"]').should(
          "have.length",
          initial
        );
      });
    });
  });
});
