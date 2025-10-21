import React from "react";
import { GraduationCap, Users, LogIn, UserCheck } from "lucide-react";
import "./Signup.css";
import { Link } from "react-router-dom";

const Signup = () => {
  return (
    <div className="Slogin-selection-container">
      <div className="Sbrand-header">
        <h1 className="Sbrand-title">UTrack</h1>
      </div>

      <div className="Slogin-selection-content">
        <div className="Slogin-card">
          <div className="Slogin-icon">
            <GraduationCap size={50} />
          </div>
          <h2 className="Slogin-title">Student Sign Up</h2>
          <Link to="/student-signup">
            <button className="Slogin-button">
              <LogIn size={18} />
            </button>
          </Link>
        </div>

        <div className="Slogin-card">
          <div className="Slogin-icon">
            <Users size={50} />
          </div>
          <h2 className="Slogin-title">Instructor Sign Up</h2>
          <Link to="/instructor-signup">
            <button className="Slogin-button">
              <LogIn size={18} />
            </button>
          </Link>
        </div>

        <div className="Slogin-card">
          <div className="Slogin-icon">
            <UserCheck size={50} />
          </div>
          <h2 className="Slogin-title">Student Claim Account</h2>
          <Link to="/first-time-login">
            <button className="Slogin-button">
              <LogIn size={18} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

