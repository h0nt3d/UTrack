//* Instructor Sign Up *//
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, KeyRound, Mail, Lock } from "lucide-react";
import logo from "../imagez/utrack-rbg.png";
import EmailVerify from "./EmailVerify/EmailVerify.jsx";
import { fetchSignup } from "./js/signupApi.js";

const isValidEmailBasic = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
const isUnbEmail = (email) => email.toLowerCase().endsWith("@unb.ca");

const Field = ({ icon: Icon, value, setValue, type = "text", placeholder, "data-testid" : testid }) => (
  <div className="relative">
    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
      <Icon size={18} strokeWidth={2} />
    </div>
    <input
      type={type}
      placeholder={placeholder}
      data-testid={testid}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="
        w-full pl-11 pr-4 h-12
        rounded-xl border border-gray-200
        bg-white/80 shadow-sm
        placeholder:text-gray-400
        focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400
        transition
      "
    />
  </div>
);

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [personalToken, setPersonalToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendingUserData, setPendingUserData] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = () => {

    setErrorMessage("");

    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim().toLowerCase();
    const pw = password;
    const cpw = confirmPassword;
    const SPECIAL_INSTRUCTOR_TOKEN = process.env.REACT_APP_INSTRUCTOR_TOKEN;
   
    if (!personalToken.trim() != SPECIAL_INSTRUCTOR_TOKEN) {
      setErrorMessage("Invalid Instructor Token. Please contact admin for a valid one.");
	    console.log(SPECIAL_INSTRUCTOR_TOKEN);
      return;
    }

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

    setPendingUserData({ firstName: fn, lastName: ln, email: em, password: pw });
    setShowEmailModal(true);
  };

  const handleEmailVerificationConfirmed = async (verifiedUser) => {
    const result = await fetchSignup(verifiedUser);
    if (result.success) {
      const signedEmail = result.data?.user?.email || verifiedUser.email;
      localStorage.setItem("email", signedEmail);
      navigate("/profile", { state: { email: signedEmail } });
    } else {
      setErrorMessage(result.error || "Signup failed.");
    }
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setPendingUserData(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-sky-300 via-sky-200 to-blue-50 px-4">
      <div className="relative w-full max-w-md">
        <form
          className="bg-white/95 rounded-3xl shadow-xl ring-1 ring-black/5 px-6 py-7 sm:px-8 sm:py-9"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="UTrack Logo" className="w-60 h-30 object-contain mb-2 drop-shadow" />
          </div>

          <h2 className="text-center text-xl sm:text-2xl font-extrabold text-black mb-6">
            Sign Up for Instructors
          </h2>

          <div className="space-y-4">
            <Field icon={User} data-testid="signup-firstName" placeholder="First Name" value={firstName} setValue={setFirstName} />
            <Field icon={User} data-testid="signup-lastName" placeholder="Last Name" value={lastName} setValue={setLastName} />
            <Field icon={KeyRound} data-testid="signup-personalToken" placeholder="Personal Token" value={personalToken} setValue={setPersonalToken} />
            <Field icon={Mail} data-testid="signup-email" type="email" placeholder="Email" value={email} setValue={setEmail} />
            <Field icon={Lock} data-testid="signup-password" type="password" placeholder="Password" value={password} setValue={setPassword} />
            <Field icon={Lock} data-testid="signup-confirmPassword" type="password" placeholder="Retype Password" value={confirmPassword} setValue={setConfirmPassword} />
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              className="w-full rounded-xl bg-[#0b1220] text-white py-3 shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:bg-[#1a1f33] hover:shadow-[0_10px_25px_rgba(0,0,0,0.25)] active:scale-[0.99] transition-all duration-200 ease-in-out"
              onClick={handleSubmit}
            >
              Create Account
            </button>

            <div className="text-center text-sm text-gray-700">
              Went to the Wrong Page?{" "}
              <a href="/" className="underline underline-offset-2 hover:text-black">
                UTrack Main Menu
              </a>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  />
                </svg>
                <p className="text-sm font-medium text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}
        </form>
      </div>

      <EmailVerify
        isOpen={showEmailModal}
        onClose={handleCloseEmailModal}
        onConfirm={handleEmailVerificationConfirmed}
        userData={pendingUserData}
      />
    </div>
  );
}

