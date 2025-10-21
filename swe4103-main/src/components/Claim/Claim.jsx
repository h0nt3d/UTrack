import React from "react";
import "./Claim.css";
import { Mail, Lock, MoveRight } from "lucide-react";
import { Link } from "react-router-dom";

const Claim = () => {
  return (
    <div className="Csignup-container">
        <div className="Cbrand-header">
        <h1 className="Cbrand-title">UTrack</h1>
      </div>
      <div className="Csignup-card">
        <div className="Cicon-wrapper">
          <span className="Carrow-icon">
            <MoveRight size={16} />
          </span>
        </div>

        <h2 className="Csignup-title">Student First Time Login</h2>

        <form className="Csignup-form">
          <div className="Cinput-group">
            <span className="Cinput-icon"><Mail size={18} /></span>
            <input type="email" placeholder="Email" required />
          </div>

          <div className="Cinput-group">
            <span className="Cinput-icon"><Lock size={18} /></span>
            <input type="password" placeholder="Password" required />
          </div>

          <div className="Cinput-group">
            <span className="Cinput-icon"><Lock size={18} /></span>
            <input type="password" placeholder="Retype Password" required />
          </div>

          <button type="submit" className="Csubmit-btn">
            Claim Account
          </button>

          <div className="Csignin-btn-wrapper">
            Already have an account? <a href="/login">Login</a>
            <br />
            Are you an Instructor? <a href="/instructor-signup">Instructor Sign Up</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Claim;
