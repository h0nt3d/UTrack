describe("Instructor Sign-Up", () => {
    
    // Sign-Up Page
    it("Confirms the instructor sign-up page loads correctly.", () => {
        cy.visit('http://localhost:3000');
        cy.contains("Sign Up for Instructors").should('be.visible')
    });

    beforeEach(() => {
        cy.visit('http://localhost:3000');
    });

    // Sign-Up Fields
    it("Displays all required input fields.", () => {
        cy.get('input[data-testid="signup-firstName"]').should('be.visible');
        cy.get('input[data-testid="signup-lastName"]').should('be.visible');
        cy.get('input[data-testid="signup-email"]').should('be.visible');
        cy.get('input[data-testid="signup-personalToken"]').should('be.visible');
        cy.get('input[data-testid="signup-password"]').should('be.visible');
        cy.get('input[data-testid="signup-confirmPassword"]').should('be.visible');
    });

    // Account Creation
    it("Creates an instructor account with valid data.", () => {
        // Mock Response
        cy.intercept('POST', 'http://localhost:5000/signup', {
            statusCode: 200,
            body: {
                message: "User created successfully",
                user: {
                    firstName: "John",
                    lastName: "Doe",
                    email: "john.doe@example.com"
                }
            }
        }).as('mockSignup');

        // Form
        cy.get('input[data-testid="signup-firstName"]').type("John");
        cy.get('input[data-testid="signup-lastName"]').type("Doe");
        cy.get('input[data-testid="signup-email"]').type("john.doe@example.com");
        cy.get('input[data-testid="signup-personalToken"]').type("token1");
        cy.get('input[data-testid="signup-password"]').type("password123");
        cy.get('input[data-testid="signup-confirmPassword"]').type("password123");

        cy.get('button').contains("Create Account").click();
        cy.wait('@mockSignup');

        cy.url().should('include', '/profile');
    });

    // Empty Fields
    // Note: This test will not pass under the current conditions. (10/08)
    it("Shows a validation error when there are empty fields.", () => {
        // Mock Response
        cy.intercept('POST', 'http://localhost:5000/signup').as('mockSignup');

        // Submit Form w/ Empty Fields
        cy.get('button').contains("Create Account").click();

        // Validation Messages
        cy.contains("First name is required.").should('be.visible');
        cy.contains("Last name is required.").should('be.visible');
        cy.contains("Email is required.").should('be.visible');
        cy.contains("Password is required.").should('be.visible');
        cy.contains("Confirm password is required.").should('be.visible');

        // No Form Submission
        cy.get('@mockSignup.all').should('have.length.at.most', 0);
    });

    // Password Match
    it("Shows a validation error when the password fields don't match.", () => {
        // Form
        cy.get('input[data-testid="signup-firstName"]').type("John");
        cy.get('input[data-testid="signup-lastName"]').type("Doe");
        cy.get('input[data-testid="signup-email"]').type("john.doe@example.com");
        cy.get('input[data-testid="signup-personalToken"]').type("token1");
        cy.get('input[data-testid="signup-password"]').type("password123");
        cy.get('input[data-testid="signup-confirmPassword"]').type("password321");

        // Password Alert
        cy.on('window:alert', (alertText) => {
            expect(alertText).to.match(/Passwords do not match\. Please retype\./i);
        });

        cy.get('button').contains("Create Account").click();
    });

    // Invalid Email
    // Note: This test will not pass under the current conditions. (10/08)
    it("Shows a validation error when an email input is incorrectly formatted.", () => {
        // Form
        cy.get('input[data-testid="signup-firstName"]').type("John");
        cy.get('input[data-testid="signup-lastName"]').type("Doe");
        cy.get('input[data-testid="signup-email"]').type("invalid");
        cy.get('input[data-testid="signup-personalToken"]').type("token1");
        cy.get('input[data-testid="signup-password"]').type("password123");
        cy.get('input[data-testid="signup-confirmPassword"]').type("password123");

        // Email Alert
        cy.on('window:alert', (alertText) => {
            expect(alertText).to.match(/Invalid email address\. Please retype\./i);
        });

        cy.get('button').contains("Create Account").click();
    });

    // Duplicate Emails
    // Note: This test will not pass under the current conditions. (10/08)
    it("Shows a validation error for a duplicate email.", () => {
        // Mock Response
        cy.intercept('POST', 'http://localhost:5000/signup', {
            statusCode: 400,
            body: { message: "Email already registered." }
        }).as('duplicateEmail');

        // Form
        cy.get('input[data-testid="signup-firstName"]').type("John");
        cy.get('input[data-testid="signup-lastName"]').type("Doe");
        cy.get('input[data-testid="signup-email"]').type("john.doe@example.com");
        cy.get('input[data-testid="signup-personalToken"]').type("token1");
        cy.get('input[data-testid="signup-password"]').type("password123");
        cy.get('input[data-testid="signup-confirmPassword"]').type("password123");

        cy.on('window:alert', (alertText) => {
            expect(alertText).to.match(/Email already registered/i);
        });

        cy.get('button').contains("Create Account").click();

        cy.wait('@duplicateEmail');
    });

    // Redirected to Profile
    it("Redirects the instructor after a successful sign-up.", () => {
        // Mock Response
        cy.intercept('POST', 'http://localhost:5000/signup', {
            statusCode: 200,
            body: {
                message: "User created successfully",
                user: {
                    firstName: "John",
                    lastName: "Doe",
                    email: "john.doe@example.com"
                }
            }
        }).as('mockSignup');

        // Form
        cy.get('input[data-testid="signup-firstName"]').type("John");
        cy.get('input[data-testid="signup-lastName"]').type("Doe");
        cy.get('input[data-testid="signup-email"]').type("john.doe@example.com");
        cy.get('input[data-testid="signup-personalToken"]').type("token1");
        cy.get('input[data-testid="signup-password"]').type("password123");
        cy.get('input[data-testid="signup-confirmPassword"]').type("password123");

        cy.get('button').contains("Create Account").click();
        cy.wait('@mockSignup');

        cy.url().should("include", "/profile");
    });
    
});