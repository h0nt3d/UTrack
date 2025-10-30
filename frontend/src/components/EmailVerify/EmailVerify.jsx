// EmailVerify.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import emailjs from "@emailjs/browser";
import { EMAILJS_CONFIG } from "../../config/emailjs";

function isValidEmail(email) {
  return typeof email === "string" &&
         /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export default function EmailVerify({ isOpen, onClose, onConfirm, userData }) {
  const email = useMemo(() => (userData?.email || "").trim(), [userData?.email]);

  const [code, setCode] = useState("");
  const [otp, setOtp] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const sentOnceRef = useRef(false); // avoid duplicate sends if React re-renders
  const sendingRef = useRef(false); // track sending state to avoid dependency issues

  const sendOTP = useCallback(async () => {
    setError("");

    if (!isValidEmail(email)) {
      setSent(false);
      setOtp("");
      setExpiresAt(null);
      setError("Please enter a valid email address.");
      return; // <- CRITICAL: do not send if invalid
    }

    if (sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);

    try {
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setOtp(generated);

      const validUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min
      setExpiresAt(validUntil);

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          email,
          passcode: generated,
          time: validUntil.toLocaleTimeString(),
        },
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      setSent(true);
    } catch (e) {
      console.error("EmailJS Error:", e);
      setError("Failed to send verification code. Check the email and try again.");
      setSent(false);
      setOtp("");
      setExpiresAt(null);
    } finally {
      setSending(false);
      sendingRef.current = false;
    }
  }, [email]);

  // Fire only once per open, and only if the email is valid
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal is closed
      setCode("");
      setOtp("");
      setExpiresAt(null);
      setError("");
      setSent(false);
      setSending(false);
      sentOnceRef.current = false;
      sendingRef.current = false;
      return;
    }
    
    if (sentOnceRef.current) return;
    sentOnceRef.current = true;
    sendOTP();
  }, [isOpen, sendOTP]);

  if (!isOpen) return null;

  const handleVerify = () => {
    if (!code) {
      setError("Please enter the verification code.");
      return;
    }
    if (code !== otp) {
      setError("Invalid verification code. Please try again.");
      return;
    }
    if (expiresAt && new Date() > expiresAt) {
      setError("Verification code has expired. Please resend a new one.");
      return;
    }
    setError("");
    onConfirm(userData); // proceed to signup
    onClose();
  };

  const handleResend = () => {
    if (sendingRef.current) return; // Prevent multiple sends
    setCode("");
    setSent(false);
    setOtp("");
    setExpiresAt(null);
    setError("");
    sentOnceRef.current = false; // Reset the flag to allow resend
    sendOTP();
  };

  const handleClose = () => {
    // full reset on close
    setCode("");
    setOtp("");
    setExpiresAt(null);
    setError("");
    setSent(false);
    setSending(false);
    sentOnceRef.current = false;
    sendingRef.current = false;
    onClose();
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">

          <div className="modal-header">
            <h1 className="modal-title fs-5">Email Verification</h1>
            <button type="button" className="btn-close" onClick={handleClose} aria-label="Close" />
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <p className="text-muted mb-2">We’ll send a verification code to:</p>
              <p className="fw-medium text-primary">{email || "(no email provided)"}</p>
              {expiresAt && sent && (
                <p className="text-muted small">Code expires at: {expiresAt.toLocaleTimeString()}</p>
              )}
            </div>

            {!isValidEmail(email) && (
              <div className="alert alert-danger" role="alert">
                Invalid email address. Close this window and fix your email to continue.
              </div>
            )}

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {sending && (
              <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted">Sending verification code to {email}…</p>
              </div>
            )}

            {!sending && sent && isValidEmail(email) && (
              <>
                <div className="alert alert-success mb-3" role="alert">
                  <strong>Code sent!</strong> Check your email for the 6-digit verification code.
                </div>
                <label htmlFor="verificationCode" className="form-label">Enter 6-digit code</label>
                <input
                  id="verificationCode"
                  data-testid="verification-code"
                  type="text"
                  className="form-control"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  autoFocus
                />
                <div className="text-muted small mt-2">
                  Didn't get it?{" "}
                  <button className="btn btn-link p-0 text-decoration-underline" onClick={handleResend} disabled={sending}>
                    Resend
                  </button>
                </div>
              </>
            )}

            {!sending && !sent && isValidEmail(email) && (
              <div className="text-center">
                <p className="text-muted">Preparing to send verification code...</p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={sending}>
              Cancel
            </button>

            {sent && isValidEmail(email) && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleVerify}
                disabled={sending || code.length !== 6}
              >
                Verify & Create Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
