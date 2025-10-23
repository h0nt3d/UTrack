import profile from "../imagez/256-2560255_user-icon-user-white-icon-transparent-hd-png-removebg-preview.png"
import {useState, useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";

export default function LoginFailed ({styl}) {
    const navigate = useNavigate();


   return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",   
        width: "100vw",         
        backgroundColor: "#f8f9fa",
      }}
    >
      <h1 style={{ color: "#e63946", marginBottom: "1rem" }}>
        Please log in or sign up to continue
      </h1>

      <button
        onClick={() => navigate("/")}
        style={{
          backgroundColor: "#007bff",
          color: "white",
          padding: "0.75rem 1.5rem",
          borderRadius: "8px",
          border: "none",
          fontSize: "1rem",
          cursor: "pointer",
          transition: "background 0.3s",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
      >
        Go to Sign Up
      </button>
    </div>
  );

}



