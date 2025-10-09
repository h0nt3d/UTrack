import React from "react";
import Signup from "./components/signup";
import Mycourses from "./components/Mycourses";
import Coursepage from "./components/Coursepage";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

export default function App() {

	const [ nnew, setNnew] = React.useState(true);

	const [specificCourse, setSpecificCourse] = React.useState(true);

	const [selectedCourse, setSelectedCourse] = React.useState(null);

	function newPage() {
		setNnew(prev => !prev);
	}

	function handleCourseSelect(courseData) {
		setSelectedCourse(courseData);
		setSpecificCourse(false);
    }
	return(
		<Router>
			<Routes>
				<Route path = "/" element={<Signup />} />
				<Route path = "/profile" element={<Mycourses />} />
			</Routes>
		</Router>
	);
}
/*
	return (
		<div>
			{nnew 
				? <Signup/> 
				: (specificCourse 
					? <Mycourses spec={handleCourseSelect}/>
					: <Coursepage course={selectedCourse}/>)
			}

			{nnew && <button className="test" onClick={newPage}>New stuff yay!</button>}
		</div>
	);
	*/


/*
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
		<div>
			<box />
		</div>
	)
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
  */
