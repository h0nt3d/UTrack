import React from "react";
import Signup from "./components/signup";
import Mycourses from "./components/Mycourses";
import Coursepage from "./components/Coursepage";
import SigninInst from "./components/SignInInstructor/Login";
import Landingpage from "./components/Landingpage";
import CourseDetails from "./components/CourseDetails";
import AddStudent from "./components/AddStudent";
import StuSignup from "./components/StuSignup";
import FirstLogin from "./components/FirstLogin";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";


export default function App() {
	
	return(
		<Router>
			<Routes>
				<Route path = "/" element= {<Landingpage />} />
				<Route path = "/instructor-signup" element={<Signup />} />
				<Route path = "/student-signup" element={<StuSignup />} />
				<Route path = "/login" element={<SigninInst />} />
				<Route path = "/first-time-login" element={<FirstLogin />} />
				<Route path = "/profile" element={<Mycourses />} />
				<Route path = "/course/:id" element={<CourseDetails />} />
				<Route path = "/course/:courseId/add-students" element = {<AddStudent />} />
			</Routes>
		</Router>
	);
}


