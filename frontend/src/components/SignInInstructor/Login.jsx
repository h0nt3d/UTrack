import logo from "../../imagez/utrack-rbg.png";
import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { fetchLogin } from "./loginApi";

const Signin = () => {
  const [error, setError] = useState("");
  const [role, setRole] = useState("student"); // default role

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const formData = new FormData(event.target);
      const { username, password } = Object.fromEntries(formData);

      const loginData = { email: username, password };
      const result = await fetchLogin(loginData, role);

      if (result.success) {
        // Save user info in localStorage
        localStorage.setItem("email", result.data.user?.email || username);
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user || { email: username }));
        localStorage.setItem("firstName", result.data.user?.firstName || "");
        localStorage.setItem("lastName", result.data.user?.lastName || "");

        // Redirect to profile page
        window.location.href = "/profile";
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login");
    }
  };

  const Field = ({ icon: Icon, ...rest }) => (
    <div className="relative">
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        <Icon size={18} strokeWidth={2} />
      </div>
      <input
        {...rest}
        className="
          w-full pl-11 pr-4 h-12
          rounded-xl border border-gray-200
          bg-white/80 shadow-sm
          placeholder:text-gray-400
          focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-400
          transition
        "
      />
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-sky-300 via-sky-200 to-blue-50 px-4">
      <div className="w-full max-w-xl">
        <form
          onSubmit={handleLogin}
          className="
            bg-white/95 backdrop-blur
            rounded-3xl shadow-xl ring-1 ring-black/5
            px-6 py-7 sm:px-8 sm:py-9
          "
        >
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="UTrack Logo" className="w-60 h-30 object-contain mb-2 drop-shadow" />
          </div>

          <h2 className="text-center text-xl sm:text-2xl font-extrabold text-black mb-6">
            Login
          </h2>

          {/* Role Selector */}
          <div className="mb-4">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-12 rounded-xl border border-gray-200 pl-4"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>

          <div className="space-y-4">
            <Field
              icon={Mail}
              name="username"
              type="email"
              placeholder="Email"
              autoComplete="username"
              required
            />
            <Field
              icon={Lock}
              name="password"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="
              mt-6 w-full rounded-xl bg-[#0b1220] text-white py-3
              shadow-[0_8px_20px_rgba(0,0,0,0.15)]
              hover:bg-[#1a1f33]
              hover:shadow-[0_10px_25px_rgba(0,0,0,0.25)]
              active:scale-[0.99]
              transition-all duration-200 ease-in-out
            "
          >
            Sign in
          </button>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-sm font-medium text-red-700 text-center">{error}</p>
            </div>
          )}

          <p className="mt-4 text-center text-sm text-gray-700">
            Went to the Wrong Page?{" "}
            <a href="/" className="underline underline-offset-2 hover:text-black">
              UTrack Main Menu
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signin;

