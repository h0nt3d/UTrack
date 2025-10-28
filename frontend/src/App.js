import React from "react";
import Signup from "./components/signup";
import Mycourses from "./components/Mycourses";
import Coursepage from "./components/Coursepage";
import CardC from "./components/CardC";
import SigninInst from "./components/SignInInstructor/Login";
import Landingpage from "./components/Landingpage";
import CourseDetails from "./components/CourseDetails";
import AddStudent from "./components/AddStudent";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";


export default function App() {
	
	return(
		<Router>
			<Routes>
				<Route path = "/" element= {<Landingpage />} />
				<Route path = "/signup" element={<Signup />} />
				<Route path = "/login" element={<SigninInst />} />
				<Route path = "/profile" element={<Mycourses />} />
				<Route path = "/course/:id" element={<CourseDetails />} />
				<Route path = "/course/:courseId/add-students" element = {<AddStudent />} />
				<Route path = "/course/:courseId/metrics" element = {<CardC/>} />
			</Routes>
		</Router>
	);
}


