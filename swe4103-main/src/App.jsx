import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Stusignup from "./components/Stusignup/Stusignup";
import Signup from "./components/Signup/Signup"
import Login from "./components/Login/Login";
import Instructorsignup from "./components/Instructorsignup/Instructorsignup";
import Claim from "./components/Claim/Claim";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student-signup" element={<Stusignup />} />
        <Route path="/instructor-signup" element={<Instructorsignup />} />
        <Route path="/first-time-login" element={<Claim />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
