import React, {useState} from "react";

export default function Signup() {

	const [username, setUsername] = useState("");
		const [password, setPassword] = useState("");
		const [value, setValue] = useState("");
	  
		async function handleSubmit() {
			try {
				const response = await fetch("http://localhost:5000/signup", {
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: JSON.stringify({username, password}),
				});

				const data = await response.json();
				console.log(data);
			}
			catch(err) {
				console.error("Error submitting data: ", err);
			}
			
		}

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
	  onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
	  onChange={(e) => setPassword(e.target.value)}
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

