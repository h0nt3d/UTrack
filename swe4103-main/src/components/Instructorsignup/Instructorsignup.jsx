import React from "react";
import "./Instructorsignup.css";
import { User, Mail, Lock, Key, MoveRight } from "lucide-react";
import { Link } from "react-router-dom";

const Instructorsignup = () => {
  return (
    <div className="Isignup-container">
        <div className="Ibrand-header">
        <h1 className="Ibrand-title">UTrack</h1>
      </div>
      <div className="Isignup-card">
        <div className="Iicon-wrapper">
          <span className="Iarrow-icon">
            <MoveRight size={16} />
          </span>
        </div>

        <h2 className="Isignup-title">Sign Up for Instructors</h2>

        <form className="Isignup-form">
          <div className="Iinput-group">
            <span className="Iinput-icon"><User size={18} /></span>
            <input type="text" placeholder="First Name" required />
          </div>

          <div className="Iinput-group">
            <span className="Iinput-icon"><User size={18} /></span>
            <input type="text" placeholder="Last Name" required />
          </div>

          <div className="Iinput-group">
            <span className="Iinput-icon"><Key size={18} /></span>
            <input type="text" placeholder="Personal Token" required />
          </div>

          <div className="Iinput-group">
            <span className="Iinput-icon"><Mail size={18} /></span>
            <input type="email" placeholder="Email" required />
          </div>

          <div className="Iinput-group">
            <span className="Iinput-icon"><Lock size={18} /></span>
            <input type="password" placeholder="Password" required />
          </div>

          <div className="Iinput-group">
            <span className="Iinput-icon"><Lock size={18} /></span>
            <input type="password" placeholder="Retype Password" required />
          </div>

          <button type="submit" className="Isubmit-btn">
            Create Account
          </button>

          <div className="Isignin-btn-wrapper">
            Already have an Account? <a href="/login">Login</a><br />
            Are you a Student? <a href="/signup">Student Sign Up</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Instructorsignup;
