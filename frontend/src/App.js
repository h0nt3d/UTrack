import React from "react";
import Signup from "./components/signup";
import Mycourses from "./components/Mycourses";
import Coursepage from "./components/NotUsed/Coursepage";
import SigninInst from "./components/SignInInstructor/Login";
import Landingpage from "./components/Landingpage";
import AddStudent from "./components/AddStudent";
import StuSignup from "./components/StuSignup";
import CourseRoster from "./components/CourseRoster";
import CSVExcelAdd from "./components/CSVExcelAdd";
import AddProject from "./components/AddProject";
import ProjectDetails from "./components/ProjectDetails";
import CardC from "./components/CardC";
import FirstLogin from "./components/FirstLogin";
import StudentDashboard from "./components/StudentDashboard";
import CourseDetails from "./components/NotUsed/CourseDetails";
import StudentMetrics from "./components/StudentMetrics";
import Event from "./components/TeamPointDistribution/Event";
import CardTable from "./components/TeamPointDistribution/CardTable";
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
				<Route path = "/course/:courseNumber" element={<CourseRoster />} />
				<Route path = "/course/:courseId/add-students" element = {<AddStudent />} />
				<Route path = "/course/:courseId/add-students-file" element = {<CSVExcelAdd />} />
				<Route path="/course/:courseId/add-project" element={<AddProject />} />
				<Route path="/course/:courseNumber/project/:projectId" element={<ProjectDetails />} />
				<Route path="/course/:courseNumber/project/:projectId/student-metrics" element={<StudentMetrics />} />
				<Route path="/student-metrics/:studId" element={<CardC />} />
				<Route path="/first-login" element={<FirstLogin />} />
				<Route path="/student-dashboard" element={<StudentDashboard />} />
				<Route path="/student/course/:courseNumber" element={<CourseDetails />} />
				<Route path="/teampage" element={<Event />} />
				<Route path="/teampage/form" element={<CardTable />} />
			</Routes>
		</Router>
	);
}


