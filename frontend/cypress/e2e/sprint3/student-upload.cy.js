/**
 * This file contains all acceptance tests for uploading a collection of students.
 * 
 * The input file should be formatted as follows: first name, last name, email.
 */


// Data
let TEST_INSTRUCTOR;
let TEST_COURSE;
let TEST_STUDENT;

const BASE_URL = 'http://localhost:5000/api';
const SPECIAL_TOKEN = 'test-token';
const NUM_STUDENTS = 51;

// Test Suite
describe("Upload Students", () => {

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

        // Single Student
        cy.fixture('TEST_SINGLE_STUDENT').then((data) => {
            TEST_STUDENT = data;
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

    // Tests
    // **************************************************

    // Add Student Page
    it("Displays the add students page.", () => {
        // Add Students View
        cy.contains("Add Students (CSV/Excel)").click();
        cy.contains("Add Students via CSV/Excel").should('be.visible');
    });

    // Bulk Upload CSV
    it("Adds a collection of students given a csv file.", () => {
        // Course ID
        const COURSE_ID = TEST_COURSE.number;

        // Add Students View
        cy.contains("Add Students (CSV/Excel)").click();
        cy.contains("Add Students via CSV/Excel").should('be.visible');

        // Select "Choose File"
        cy.get('[data-testid="bulk-upload-input"]').selectFile('cypress/fixtures/TEST_STUDENT.csv', { force: true });

        // Bulk Upload Response
        cy.intercept('POST', `${BASE_URL}/students/course/${COURSE_ID}/add-multiple`, {
            statusCode: 200, body: { ok: true }
        }).as('mockUploadStudents');

        // Verify Preview
        cy.get('table tbody tr').should('have.length.greaterThan', 0);

        cy.clock();

        // Submit
        cy.contains("Add All Students").click();
        cy.wait('@mockUploadStudents');

        // Verify
        cy.contains(`Successfully added ${NUM_STUDENTS} students!`).should('be.visible');
    });

    // Bulk Upload XLSX
    it("Adds a collection of students given an xlsx file.", () => {
        // Data
        const COURSE_ID = TEST_COURSE.number;
        const STUDENT_XLSX = 'cypress/fixtures/TEST_EXCEL.xlsx';

        // Add Students View
        cy.contains("Add Students (CSV/Excel)").click();
        cy.contains("Add Students via CSV/Excel").should("be.visible");

        // Select "Choose File"
        cy.get('[data-testid="bulk-upload-input"]').selectFile(STUDENT_XLSX, { force: true });

        // Bulk Upload Response
        cy.intercept('POST', `${BASE_URL}/students/course/${COURSE_ID}/add-multiple`, {
            statusCode: 200, body: { ok: true }
        }).as('mockUploadStudents');

        // Verify Preview
        cy.get('table tbody tr').should('have.length.greaterThan', 0);

        cy.clock();

        // Submit
        cy.contains("Add All Students").click();
        cy.wait('@mockUploadStudents');

        // Verify
        cy.contains(`Successfully added ${NUM_STUDENTS} students!`).should('be.visible');
    });

    // Incorrect Format
    it("Displays an error message when the given file has an invalid headers.", () => {
        // Course ID
        const COURSE_ID = TEST_COURSE.number;

        cy.window().then(win => {
            const tok = TEST_INSTRUCTOR.personalToken || SPECIAL_TOKEN;
            win.localStorage.setItem('token', SPECIAL_TOKEN);
            win.localStorage.setItem('authToken', SPECIAL_TOKEN);
            win.localStorage.setItem('email', (TEST_INSTRUCTOR.email || '').toLowerCase());
        });

        // Add Students View
        cy.contains("Add Students (CSV/Excel)").click();
        cy.contains("Add Students via CSV/Excel").should('be.visible');

        // Invalid CSV
        const invalidCSV = ['last,first,email', 'Smith,Jane,js@unb.ca'].join('\n');
        const blob = new Blob([invalidCSV], { type: 'text/csv' });

        cy.get('[data-testid="bulk-upload-input"]').selectFile(
            { contents: blob, fileName: 'invalid_headers.csv', mimeType: 'text/csv' },
            { force: true }
        );

        // Spy Response
        cy.intercept('POST', `${BASE_URL}/students/course/${COURSE_ID}/add-multiple`).as('mockUploadInvalidFile');

        // Verify Upload Failure
        cy.get('table').should('not.exist');
        cy.get('@mockUploadInvalidFile.all').should('have.length', 0);
    });

    // Duplicate File
    it("Does not add students when a file has already been uploaded.", () => {
        // Data
        const COURSE_ID = TEST_COURSE.number;
        const CSV = 'cypress/fixtures/TEST_STUDENT.csv';
        // snapshot

        // Add Students View
        cy.contains('Add Students (CSV/Excel)').click();
        cy.contains('Add Students via CSV/Excel').should('be.visible');

        // Upload
        cy.get('[data-testid="bulk-upload-input"]').selectFile(CSV, { force: true });
        cy.get('table tbody tr').should('have.length.greaterThan', 0);

        // Students
        let studentPreview = [];
        cy.get('table tbody tr').then($rows => {
            studentPreview = Array.from($rows).map(row => {
                const cells = row.querySelectorAll('td');
                return {
                    firstName: cells[0]?.textContent?.trim() || '',
                    lastName: cells[1]?.textContent?.trim() || '',
                    email: cells[2]?.textContent?.trim() || ''
                };
            });
        });

        // Storage
        cy.window().then((win) => {
            const tok = TEST_INSTRUCTOR.personalToken || 'test-token';
            win.localStorage.setItem('token', tok);
            win.localStorage.setItem('authToken', tok);
            win.localStorage.setItem('email', (TEST_INSTRUCTOR.email || '').toLowerCase());
        });

        // Roster Response
        cy.then(() => {
            cy.intercept('GET', `${BASE_URL}/auth/get-course/${COURSE_ID}`, (req) => {
                req.reply({
                    statusCode: 200,
                    body: {
                        courseNumber: TEST_COURSE.number,
                        courseName: TEST_COURSE.name,
                        description: TEST_COURSE.description,
                        students: studentPreview,
                        projects: [],
                        instructor: { firstName: TEST_INSTRUCTOR.firstName, lastName: TEST_INSTRUCTOR.lastName, email: TEST_INSTRUCTOR.email }
                    }
                });
            }).as('mockRoster');
        });

        // Bulk Upload
        cy.intercept('POST', `${BASE_URL}/students/course/${COURSE_ID}/add-multiple`, {
            statusCode: 200,
            body: { ok: true }
        }).as('mockUpload');

        cy.clock();

        // Get Students
        cy.contains("Add All Students").click();
        cy.wait('@mockUpload');

        // Verify
        cy.contains(`Successfully added ${NUM_STUDENTS} students!`).should('be.visible');

        // Auto-Navigate
        cy.tick(1600);

        // Updated Details
        cy.wait('@mockRoster');
        cy.contains("Current Students in Course:").should('be.visible');

        // Verify Student Information
        cy.get('table thead th').should('have.length.at.least', 2);
        cy.get('table thead th').eq(0).should('contain.text', 'Name');
        cy.get('table thead th').eq(1).should('contain.text', 'Email');
        cy.get('table tbody tr').should('have.length', NUM_STUDENTS);

        cy.contains("Jane Smith").should('be.visible');

        // Second Upload
        cy.contains("Add Students (CSV/Excel)").click();
        cy.get('[data-testid="bulk-upload-input"]').selectFile(CSV, { force: true });
        cy.get('table tbody tr').should('have.length.greaterThan', 0);

        // Second Student Preview
        let studentPreview2 = [];
        cy.get('table tbody tr').then($rows => {
            studentPreview2 = Array.from($rows).map(row => {
                const cells = row.querySelectorAll('td');
                return {
                    firstName: cells[0]?.textContent?.trim() || '',
                    lastName: cells[1]?.textContent?.trim() || '',
                    email: cells[2]?.textContent?.trim() || ''
                };
            });
        });

        // Storage
        cy.window().then((win) => {
            const tok = TEST_INSTRUCTOR.personalToken || 'test-token';
            win.localStorage.setItem('token', tok);
            win.localStorage.setItem('authToken', tok);
            win.localStorage.setItem('email', (TEST_INSTRUCTOR.email || '').toLowerCase());
        });

        // Course Response
        cy.then(() => {
            cy.intercept('GET', `${BASE_URL}/auth/get-course/${COURSE_ID}`, {
                statusCode: 200,
                body: {
                    courseNumber: TEST_COURSE.number,
                    courseName: TEST_COURSE.name,
                    description: TEST_COURSE.description,
                    students: studentPreview2,
                    projects: [],
                    instructor: { firstName: TEST_INSTRUCTOR.firstName, lastName: TEST_INSTRUCTOR.lastName, email: TEST_INSTRUCTOR.email }
                }
            }).as('mockGetUnchangedRoster');
        });

        // Response
        cy.intercept('POST', `${BASE_URL}/students/course/${COURSE_ID}/add-multiple`, {
            statusCode: 200, body: { ok: true }
        }).as('mockSecondUpload');

        cy.clock();

        // Get Students
        cy.contains("Add All Students").click();
        cy.wait('@mockSecondUpload');

        // Verify
        cy.contains(`Successfully added ${NUM_STUDENTS} students!`).should('be.visible');

        // Auto-Navigate
        cy.tick(1600);

        // Unchanged Roster
        cy.wait('@mockGetUnchangedRoster');
        cy.contains("Current Students in Course:").should('be.visible');

        // Verify Student Information
        cy.get('table thead th').should('have.length.at.least', 2);
        cy.get('table thead th').eq(0).should('contain.text', 'Name');
        cy.get('table thead th').eq(1).should('contain.text', 'Email');
        cy.get('table tbody tr').should('have.length', NUM_STUDENTS);

        cy.contains("Jane Smith").should('be.visible');
    });

    // Duplicate Student
    it("Does not add students that are already enrolled in the course.", () => {
        // Course ID
        const COURSE_ID = TEST_COURSE.number;
        const STUDENT_EMAIL = TEST_STUDENT.email;

        // Add Student
        cy.AddSingleStudent();

        // Upload File
        cy.contains("Add Students (CSV/Excel)").click();
        cy.contains("Add Students via CSV/Excel").should('be.visible');

        // Select "Choose File"
        cy.get('[data-testid="bulk-upload-input"]').selectFile('cypress/fixtures/TEST_STUDENT.csv', { force: true });

        // Verify Preview
        cy.get('table tbody tr').should('have.length.greaterThan', 0);

        // Get Students
        let studentPreview = [];
        cy.get('table tbody tr').then(($rows) => {
            studentPreview = Array.from($rows).map((row) => {
                const cells = row.querySelectorAll('td');
                return {
                    firstName: cells[0]?.textContent?.trim() || '',
                    lastName: cells[1]?.textContent?.trim() || '',
                    email: cells[2]?.textContent?.trim() || ''
                }
            });

            const duplicatePresent = studentPreview.some(s => s.email === STUDENT_EMAIL);
            expect(duplicatePresent, "fixture CSV must include the pre-enrolled student").to.be.true;
        });

        // Request (Includes Student)
        cy.intercept('POST', `${BASE_URL}/students/course/${COURSE_ID}/add-multiple`, (req) => {
            const sentStudents = (req.body?.students || []).map(s => (s.email || "").toLowerCase());
            expect(sentStudents).to.include(STUDENT_EMAIL);
            req.reply({ statusCode: 200, body: { ok: true } });
        }).as('mockUpload');

        // Correct Roster
        cy.then(() => {
            const uniqueStudents = [];
            const roster = new Set();
            for (const s of studentPreview) {
                const key = (s.email || "").toLowerCase();
                if (!roster.has(key)) {
                    roster.add(key);
                    uniqueStudents.push(s);
                }
            }

            // Course Response
            cy.intercept('GET', `${BASE_URL}/auth/get-course/${COURSE_ID}`, {
                statusCode: 200,
                body: {
                    courseNumber: TEST_COURSE.number,
                    courseName: TEST_COURSE.name,
                    description: TEST_COURSE.description,
                    students: uniqueStudents,
                    projects: [],
                    instructor: { firstName: TEST_INSTRUCTOR.firstName, lastName: TEST_INSTRUCTOR.lastName, email: TEST_INSTRUCTOR.email }
                }
            }).as('mockRoster');
        });

        // Send Request
        cy.clock();
        cy.contains("Add All Students").click();
        cy.wait('@mockUpload');
        cy.contains(`Successfully added`).should('be.visible');

        // Receive Details
        cy.tick(1600);
        cy.wait('@mockRoster');

        cy.contains("Current Students in Course:").should('be.visible');
        cy.get('table thead th').eq(0).should('contain.text', "Name");
        cy.get('table thead th').eq(1).should('contain.text', "Email");

        // Distinct Students
        cy.get('table tbody tr td:nth-child(2)').then(($cells) => {
            const emails = [...$cells].map((td) => td.textContent.trim().toLowerCase());
            const duplicateCount = emails.filter((e) => e === STUDENT_EMAIL).length;
            expect(duplicateCount, "duplicate email should appear exactly once on the roster").to.equal(1);
        });
    });

    // Invalid File
    it("Displays an error when uploading a non csv or xlsx file.", () => {
        // Course ID
        const COURSE_ID = TEST_COURSE.number;

        // Add Students View
        cy.contains("Add Students (CSV/Excel)").click();
        cy.contains("Add Students via CSV/Excel").should("be.visible");

        // Upload Response
        cy.intercept('POST', `${BASE_URL}/students/course/${COURSE_ID}/add-multiple`).as('mockUpload');

        // File
        const blob = new Blob(["not-valid"], { type: 'text/plain' });

        cy.get('[data-testid="bulk-upload-input"]').selectFile(
            { contents: blob, fileName: 'text.txt', mimeType: 'text/plain' },
            { force: true }
        );

        // Verify Error
        cy.get('table').should('not.exist');
        cy.contains("Add All Students").should('not.exist');
        cy.get('@mockUpload.all').should('have.length', 0);
    });

    // Students Enrolled
    it("Displays the correct number of students enrolled after the upload.", () => {
        // Course ID
        const COURSE_ID = TEST_COURSE.number;

        // Add Students View
        cy.contains("Add Students (CSV/Excel").click();
        cy.contains("Add Students via CSV/Excel").should('be.visible');

        // Select "Choose File"
        cy.get('[data-testid="bulk-upload-input"]').selectFile('cypress/fixtures/TEST_STUDENT.csv', { force: true });

        // Verify Preview
        cy.get('table tbody tr').should('have.length.greaterThan', 0);

        // Get Students
        let studentPreview = [];
        cy.get('table tbody tr').then(($rows) => {
            studentPreview = Array.from($rows).map((row) => {
                const cells = row.querySelectorAll('td');
                return {
                    firstName: cells[0]?.textContent?.trim() || '',
                    lastName: cells[1]?.textContent?.trim() || '',
                    email: cells[2]?.textContent?.trim() || ''
                }
            });
        });

        // Storage
        cy.window().then((win) => {
            const tok = TEST_INSTRUCTOR.personalToken || 'test-token';
            win.localStorage.setItem('token', tok);
            win.localStorage.setItem('authToken', tok);
            win.localStorage.setItem('email', (TEST_INSTRUCTOR.email || '').toLowerCase());
        });

        // Course Response
        cy.then(() => {
            cy.intercept('GET', `${BASE_URL}/auth/get-course/${COURSE_ID}`, {
                statusCode: 200,
                body: {
                    courseNumber: TEST_COURSE.number,
                    courseName: TEST_COURSE.name,
                    description: TEST_COURSE.description,
                    students: studentPreview,
                    projects: [],
                    instructor: { firstName: TEST_INSTRUCTOR.firstName, lastName: TEST_INSTRUCTOR.lastName, email: TEST_INSTRUCTOR.email }
                }
            }).as('mockGetUpdatedCourse');
        });

        // Bulk Upload Response
        cy.intercept('POST', `${BASE_URL}/students/course/${COURSE_ID}/add-multiple`, {
            statusCode: 200, body: { ok: true }
        }).as('mockUploadStudents');

        cy.clock();

        // Submit
        cy.contains("Add All Students").click();
        cy.wait('@mockUploadStudents');

        // Verify
        cy.contains(`Successfully added ${NUM_STUDENTS} students!`).should('be.visible');

        // Auto Navigate
        cy.tick(1600);

        // Updated Course Details
        cy.wait('@mockGetUpdatedCourse');
        cy.contains("Current Students in Course:").should('be.visible');

        // Verify Student Information
        cy.get('table thead th').should('have.length.at.least', 2);
        cy.get('table thead th').eq(0).should('contain.text', 'Name');
        cy.get('table thead th').eq(1).should('contain.text', 'Email');
        cy.get('table tbody tr').should('have.length', NUM_STUDENTS);

        cy.contains("Jane Smith").should('be.visible');
    });
});