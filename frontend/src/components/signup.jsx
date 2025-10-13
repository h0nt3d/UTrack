import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {fetchSignup} from "./js/signupApi";
import EmailVerify from "./EmailVerify";

export default function Signup() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [showEmailModal, setShowEmailModal] = useState(false);
	const [pendingUserData, setPendingUserData] = useState(null);
	const navigate = useNavigate();
	     
	async function handleSubmit() {
		setErrorMessage(""); // Clear previous error messages
		
		// Email validation
		if (!email.endsWith("@unb.ca")) {
			setErrorMessage("Please use a valid @unb.ca email address.");
			return;
		}
		
		// Password validation
		if (password !== confirmPassword) {
			setErrorMessage("Passwords do not match. Please retype.");
			return;
		}
		
		// Show email verification modal before sending data to backend
		const userData = { firstName, lastName, email, password };
		setPendingUserData(userData);
		setShowEmailModal(true);
	}
	
	async function handleEmailVerificationConfirmed(userData) {
		// This function is called after email verification is successful
		const result = await fetchSignup(userData);
		
		if (result.success) {
			console.log(result.data);
			navigate("/profile", {state: {email: result.data.user.email}});
		} else {
			setErrorMessage(result.error);
		}
	}
	
	function handleCloseEmailModal() {
		setShowEmailModal(false);
		setPendingUserData(null);
	}

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up for Instructors</h1>
	<input
          type="text"
          placeholder="First Name"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
	  onChange={(e) => setFirstName(e.target.value)}
        />
	<input
          type="text"
          placeholder="Last Name"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
	  onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
	  onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
	  onChange={(e) => setPassword(e.target.value)}
        />
	<input
          type="password"
          placeholder="Retype Password"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
	  onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
	  type="button"
	  onClick={handleSubmit}>
          Create Account
        </button>
        
        {/* Message Section */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
            </div>
          </div>
        )}
      </form>
      
      {/* Email Verification Modal */}
      <EmailVerify
        isOpen={showEmailModal}
        onClose={handleCloseEmailModal}
        onConfirm={handleEmailVerificationConfirmed}
        userData={pendingUserData}
      />
    </div>
  );
}

