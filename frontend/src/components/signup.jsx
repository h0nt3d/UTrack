import React, {useState} from "react";

export default function Signup() {

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	  
	async function handleSubmit() {
		try {
			const response = await fetch("http://localhost:5000/signup", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({email, password}),
			});

			const data = await response.json();
			console.log(data);
		}
		catch(err) {
			console.error("Error submitting data: ", err);
		}
		
	}

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-blue-50">
      <form className="bg-gradient-to-b from-sky-300 via-sky-200 to-blue-50 p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up for Instructors</h1>
        <input
          type="text"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
	  onChange={(e) => setEmail(e.target.value)}
        />
	<input
          type="text"
          placeholder="Personal Token"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
	  onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-[#004369] transition"
	  type="button"
	  onClick={handleSubmit}>
          Create Account
        </button>
      </form>
    </div>
  );
}

