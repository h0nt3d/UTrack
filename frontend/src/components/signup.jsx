import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSignup } from "./js/signupApi.js";
import EmailVerify from "./EmailVerify/EmailVerify.jsx";

function isValidEmailBasic(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
function isUnbEmail(email) {
  return email.toLowerCase().endsWith("@unb.ca");
}

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendingUserData, setPendingUserData] = useState(null);

  const navigate = useNavigate();

  async function handleSubmit() {
    setErrorMessage("");

    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim().toLowerCase();
    const pw = password;
    const cpw = confirmPassword;

    if (!fn || !ln || !em || !pw || !cpw) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    if (!isValidEmailBasic(em)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!isUnbEmail(em)) {
      setErrorMessage("Please use a valid @unb.ca email address.");
      return;
    }
    if (pw !== cpw) {
      setErrorMessage("Passwords do not match. Please retype.");
      return;
    }
    if (pw.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    // Only now open OTP modal
    setPendingUserData({ firstName: fn, lastName: ln, email: em, password: pw });
    setShowEmailModal(true);
  }

  async function handleEmailVerificationConfirmed(verifiedUser) {
    // EmailVerify only calls this after successful OTP
    const result = await fetchSignup(verifiedUser);
    if (result.success) {
      const signedEmail = result.data?.user?.email || verifiedUser.email;
      localStorage.setItem("email", signedEmail); // handy fallback for Mycourses
      navigate("/profile", { state: { email: signedEmail } });
    } else {
      setErrorMessage(result.error || "Signup failed.");
    }
  }

  function handleCloseEmailModal() {
    setShowEmailModal(false);
    setPendingUserData(null);
  }

  function handleOpenLogin() {
    navigate('/login');
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-blue-50">
      <form className="bg-gradient-to-b from-sky-300 via-sky-200 to-blue-50 p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up for Instructors</h1>

        <input className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="First Name" onChange={(e)=>setFirstName(e.target.value)} />
        <input className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="Last Name"  onChange={(e)=>setLastName(e.target.value)} />
        <input className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="Email (must be @unb.ca)" onChange={(e)=>setEmail(e.target.value)} />
        <input type="password" className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
        <input type="password" className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="Retype Password" onChange={(e)=>setConfirmPassword(e.target.value)} />

        <div className="mb-4">
          <button type="button"
                  className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition mb-2"
                  onClick={handleOpenLogin}>
            Already have an account? Sign In
          </button>
        </div>

        <button type="button"
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-[#004369] transition"
                onClick={handleSubmit}>
          Create Account
        </button>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
              <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
            </div>
          </div>
        )}
      </form>

      <EmailVerify
        isOpen={showEmailModal}
        onClose={handleCloseEmailModal}
        onConfirm={handleEmailVerificationConfirmed}
        userData={pendingUserData}
      />

    </div>
  );
}