import React, { useState, useEffect, useCallback } from "react";
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs';

export default function EmailVerify({ isOpen, onClose, onConfirm, userData }) {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const generateAndSendOTP = useCallback(() => {
    setIsSendingOTP(true);
    setErrorMessage("");
    
    try {
   
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setOtp(generatedOtp);
      

      const now = new Date();
      const validUntil = new Date(now.getTime() + 15 * 60000); // 15 mins later
      const expiryString = validUntil.toLocaleTimeString();
      setOtpExpiry(validUntil);
      
   
      const templateParams = {
        email: userData.email,
        passcode: generatedOtp,
        time: expiryString
      };

      // Send OTP via EmailJS using send method with public key
      emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      )
      .then((response) => {
        console.log("EmailJS Success:", response);
        setOtpSent(true);
        setIsSendingOTP(false);
      })
      .catch((error) => {
        console.error("EmailJS Error:", error);
        setErrorMessage("Failed to send verification code. Please check your email address and try again.");
        setIsSendingOTP(false);
      });
    } catch (error) {
      console.error("Error generating OTP:", error);
      setErrorMessage("Failed to send verification code. Please check your email address and try again.");
      setIsSendingOTP(false);
    }
  }, [userData?.email]);

  // Generate OTP and send email when modal opens
  useEffect(() => {
    if (isOpen && userData?.email) {
      generateAndSendOTP();
    }
  }, [isOpen, userData?.email, generateAndSendOTP]);

  const handleVerify = () => {
    if (!verificationCode) {
      setErrorMessage("Please enter the verification code.");
      return;
    }
    
    if (verificationCode !== otp) {
      setErrorMessage("Invalid verification code. Please try again.");
      return;
    }
    
    // Check if OTP has expired
    if (otpExpiry && new Date() > otpExpiry) {
      setErrorMessage("Verification code has expired. Please request a new one.");
      return;
    }
    
    setIsVerifying(true);
    setErrorMessage("");
    
    // Proceed with signup after successful verification
    onConfirm(userData);
    onClose();
  };

  const handleResendOTP = () => {
    setOtpSent(false);
    setVerificationCode("");
    setErrorMessage("");
    generateAndSendOTP();
  };

  const handleCloseModal = () => {
    // Reset all states when closing modal
    setOtpSent(false);
    setVerificationCode("");
    setErrorMessage("");
    setOtp("");
    setOtpExpiry(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          {/* Modal Header */}
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">Email Verification</h1>
            <button
              type="button"
              className="btn-close"
              onClick={handleCloseModal}
              aria-label="Close"
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            {isSendingOTP ? (
              <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Sending verification code...</p>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <p className="text-muted mb-2">
                    {otpSent ? "We've sent a verification code to:" : "Sending verification code to:"}
                  </p>
                  <p className="fw-medium text-primary">{userData?.email}</p>
                  {otpExpiry && (
                    <p className="text-muted small">
                      Code expires at: {otpExpiry.toLocaleTimeString()}
                    </p>
                  )}
                </div>
                
                {otpSent && (
                  <div className="mb-3">
                    <label htmlFor="verificationCode" className="form-label">
                      Enter Verification Code
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="verificationCode"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength="6"
                    />
                  </div>
                )}

                {errorMessage && (
                  <div className="alert alert-danger" role="alert">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>{errorMessage}</span>
                      {!otpSent && (
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={handleResendOTP}
                          disabled={isSendingOTP}
                        >
                          Try Again
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {otpSent && (
                  <div className="text-muted small">
                    <p>Didn't receive the code? 
                      <button 
                        className="btn btn-link p-0 ms-1 text-decoration-underline"
                        onClick={handleResendOTP}
                        disabled={isSendingOTP}
                      >
                        Resend
                      </button>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCloseModal}
              disabled={isSendingOTP || isVerifying}
            >
              Cancel
            </button>
            {otpSent && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleVerify}
                disabled={verificationCode.length !== 6 || isVerifying || isSendingOTP}
              >
                {isVerifying ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Verifying...
                  </>
                ) : (
                  "Verify & Create Account"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
