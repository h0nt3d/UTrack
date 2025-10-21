import React from "react";
import "./Stusignup.css";
import { Mail, Lock, User, MoveRight } from "lucide-react";
import { Link } from "react-router-dom";

const Stusignup = () => {
  return (
    <div className="STsignup-container">
      <div className="STbrand-header">
        <h1 className="STbrand-title">UTrack</h1>
      </div>

      <div className="STsignup-card">
        <div className="STicon-wrapper">
          <span className="STarrow-circle">
            <MoveRight size={18} />
          </span>
        </div>

        <h2 className="STsignup-title">Sign Up for Students</h2>

        <form className="STsignup-form">
          <div className="STinput-group">
            <span className="STinput-icon"><User size={18} /></span>
            <input type="text" placeholder="First Name" required />
          </div>

          <div className="STinput-group">
            <span className="STinput-icon"><User size={18} /></span>
            <input type="text" placeholder="Last Name" required />
          </div>

          <div className="STinput-group">
            <span className="STinput-icon"><Mail size={18} /></span>
            <input type="email" placeholder="Email" required />
          </div>

          <div className="STinput-group">
            <span className="STinput-icon"><Lock size={18} /></span>
            <input type="password" placeholder="Password" required />
          </div>

          <div className="STinput-group">
            <span className="STinput-icon"><Lock size={18} /></span>
            <input type="password" placeholder="Retype Password" required />
          </div>

          <button type="submit" className="STsubmit-btn">
            Create Account
          </button>

          <div className="STsignin-link-wrap">
            Already have an Account? <a href="/login">Login</a>
            <br />
            Are you an Instructor? <a href="/instructor-signup">Instructor Sign Up</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Stusignup;
