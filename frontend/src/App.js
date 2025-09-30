import {useState} from "react";
import './App.css';

export default function MyForm() {
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
    <>
      <label>
        Username: <input
	  name="usernameInput"
	  value={username}
	  onChange={(e) => setUsername(e.target.value)}/>
      </label>
      <hr />
      <label>
        Password: <input 
	  type="password"
	  name="passwordInput"
	  value={password}
	  onChange={(e) => setPassword(e.target.value)}/>
      </label>
      <hr /> 
	<button type="button" onClick={handleSubmit}>
	  Sign Up
	  </button>
    </>
  );
}

