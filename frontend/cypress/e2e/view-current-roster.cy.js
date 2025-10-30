const TEST_TOKEN = "token1";

describe("View Current Roster", () => {
  //
  beforeEach(() => {
    cy.intercept("POST", "http://localhost:5000/api/auth/instructor-signup", {
      statusCode: 200,
      body: {
        message: "User created successfully.",
        user: { email: TEST_INSTRUCTOR.email },
        token: TEST_TOKEN,
      },
    }).as("mockSignup");

    cy.visit("http://localhost:3000");
  });
  it("Checks if page loads up", () => {
    cy.contains("Instructors").should("be.visible");
  });
});
