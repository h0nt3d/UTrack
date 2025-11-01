import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/student-dashboard");
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#f4f6fa] text-center">
      <h1 className="text-3xl font-bold text-[#0b1220] mb-3">
        Account Claimed!
      </h1>
      <p className="text-gray-600">Redirecting to your dashboard...</p>
    </div>
  );
}
