import React from 'react';
import EmailVerify from "../../src/components/EmailVerify/EmailVerify";
import emailjs from "@emailjs/browser";

describe("Email Verification", () => {

   const userData = { 
      firstName: 'test',
      lastName: 'testerson',
      token: 'token1',
      password: 'P@ssW0rd!'
   };

   const mockOTP = 123456;

   function signup(email) {
      cy.get('input[data-testid="signup-firstName"]').type(userData.firstName);
      cy.get('input[data-testid="signup-lastName"]').type(userData.lastName);
      cy.get('input[data-testid="signup-token"]').type(userData.token);
      cy.get('input[data-testid="signup-email"]').type(email);
      cy.get('input[data-testid="signup-password"]').type(userData.password);
      cy.get('input[data-testid="signup-confirmPassword"]').type(userData.password);
      cy.get('button[data-testid="signup-createAccount"]').click();
   };

   beforeEach(() => {
      cy.visit('http://localhost:3000/instructor-signup');
   });

   it("Modal does not open when invalid input is given.", () => {
      signup('testemail');
      cy.get('.modal-header').should('not.exist');
      cy.get('.modal-body').should('not.exist');
      cy.get('.modal-footer').should('not.exist');
   });

   it("Modal opens when valid input is given.", () => {
      signup('testemail@unb.ca');
      cy.get('.modal-header').should('be.visible');
      cy.get('.modal-body').should('be.visible');
      cy.get('.modal-footer').should('be.visible');
   });

   it("Modal close buttons work correctly.", () => {
      signup('testemail@unb.ca');
      cy.get('.modal-header').should('be.visible');
      cy.get('.modal-body').should('be.visible');
      cy.get('.modal-footer').should('be.visible');

      cy.get('.btn-close').click();
      cy.get('.modal-header').should('not.exist');
      cy.get('.modal-body').should('not.exist');
      cy.get('.modal-footer').should('not.exist');
      
      cy.get('button[data-testid="signup-createAccount"]').click();
      cy.get('.modal-header').should('be.visible');
      cy.get('.modal-body').should('be.visible');
      cy.get('.modal-footer').should('be.visible');
      
      cy.get('.btn.btn-secondary').click();
      cy.get('.modal-header').should('not.exist');
      cy.get('.modal-body').should('not.exist');
      cy.get('.modal-footer').should('not.exist');
   });

});