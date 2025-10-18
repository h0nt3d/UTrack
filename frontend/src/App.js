import React from "react";
import Signup from "./components/signup";
import Mycourses from "./components/Mycourses";
import Coursepage from "./components/Coursepage";
import Landingpage from "./components/Landingpage";
import CourseDetails from "./components/CourseDetails";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

export default function App() {
	
	return(
		<Router>
			<Routes>
				<Route path = "/" element= {<Landingpage />} />
				<Route path = "/signup" element={<Signup />} />
				<Route path = "/profile" element={<Mycourses />} />
				<Route path = "/course/:id" element={<CourseDetails />} />
			</Routes>
		</Router>
	);
}


