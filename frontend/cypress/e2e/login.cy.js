describe ("Login Page", () => {

   it("Landing page redirects to login", () => {
      cy.visit('http://localhost:3000');
      cy.get('button[data-testid="landing-login"]').click();
      cy.url().should('include', '/login');
   });

   beforeEach(() => {
      cy.visit('http://localhost:3000/login');
   });

   it("Page elements appear", () => {
      cy.get('input[data-testid="login-email"]').should('be.visible');
      cy.get('input[data-testid="login-password"]').should('be.visible');
      cy.get('button').contains('Sign in').should('be.visible');
      cy.get('p[data-testid="login-mainMenu"]').should('be.visible');
   });

   it("Main menu href redirects to landing page", () => {
      cy.get('p[data-testid="login-mainMenu"] a').should('have.attr', 'href', '/');
      cy.get('p[data-testid="login-mainMenu"] a').click();
      cy.url().should('eq', 'http://localhost:3000/');
   });

});