import React, { useState } from "react";
import "./Login.css";
import { Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const emailPattern = /^[a-zA-Z0-9._%+-]+@unb\.ca$/i;
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{6,}$/;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!emailPattern.test(email)) {
      setError("Please use your UNB Email Address (must end with @unb.ca).");
      return;
    }
    if (!passwordPattern.test(password)) {
      setError(
        "Password must be at least 6 characters, with 1 Uppercase, 1 Lowercase, and 1 Special Character."
      );
      return;
    }

    setError("");
    alert("Login Successful");
  };

  return (
    <div className="Llogin-selection-container">
      <div className="Lbrand-header">
        <h1 className="Lbrand-title">UTrack</h1>
      </div>

      <div className="Llogin-card form-card">
        <h2 className="Lform-title">Login</h2>

        <form className="Llogin-form" onSubmit={handleSubmit}>
          <label className="Linput-group">
            <span className="Linput-icon">
              <Mail size={18} />
            </span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="Linput-group">
            <span className="Linput-icon">
              <Lock size={18} />
            </span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="Lform-error">{error}</p>}

          <button type="submit" className="Lprimary-btn">
            Sign in
          </button>
        </form>

        <p className="Lform-footnote">
          Don't have an Account? <a href="/signup">Sign Up</a>
        </p>
      </div>
    </div>
  );
}
