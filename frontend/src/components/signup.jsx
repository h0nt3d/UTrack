import React, {useState} from "react";
import {useNavigate} from "react-router-dom";

export default function Signup() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail, token] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const navigate = useNavigate();
	  
	async function handleSubmit() {
		if (password != confirmPassword) {
			alert("Passwords do not match. Please retype.");
			return;
		}
		try {
			const response = await fetch("http://localhost:5000/api/auth/signup", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({firstName, lastName, email, password}),
			});

			const data = await response.json();
			console.log(data);
			if (response.ok) {
				navigate("/profile", {state: {email: data.user.email, token: data.token}});
			}
			else {
				alert(data.message);
			}
		}
		catch(err) {
			console.error("Error submitting data: ", err);
		}
		
	}

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up for Instructors</h1>
	<input
          type="text"
          placeholder="First Name"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
	  onChange={(e) => setFirstName(e.target.value)}
        />
	<input
          type="text"
          placeholder="Last Name"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
	  onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
	  onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
	  onChange={(e) => setPassword(e.target.value)}
        />
	<input
          type="password"
          placeholder="Retype Password"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
	  onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
	  type="button"
	  onClick={handleSubmit}>
          Create Account
        </button>
      </form>
    </div>
  );
}

