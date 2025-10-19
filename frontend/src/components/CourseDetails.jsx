import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function CourseDetails() {
  const { id } = useParams();
  const location = useLocation();
  const token = location.state?.token;
  const [course, setCourse] = useState(null);
  const navigate = useNavigate();

	useEffect(() => {
	    async function fetchCourse() {
	      try {
		const res = await fetch(`http://localhost:5000/api/auth/get-course/${id}`, {
		  method: "GET",
		  headers: {
		    "Content-Type": "application/json",
		    "authtoken": token
		  }
		});

		const data = await res.json();
		if (res.ok) {
		  setCourse(data);
		} else {
		  console.error("Error fetching course:", data.message);
		}
	      } catch (err) {
		console.error("Network error:", err);
	      }
	    }

	    fetchCourse();
	  }, [id, token]);

	 if (!course) {
	    return (
	      <div className="flex items-center justify-center h-screen">
		<p className="text-gray-600 text-lg">Loading course details...</p>
	      </div>
	    );
	 }

	return (
	  <div className="min-h-screen bg-gray-50 relative flex flex-col items-center justify-center px-4">
	    <button
	      onClick={() => window.history.back()}
	      className="absolute top-4 left-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
	    >
	      Back to My Courses
	    </button>
	    <div className="bg-white rounded-lg shadow-lg p-8 w-11/12 md:w-2/3 lg:w-1/2 mt-10">
	      <h1 className="text-3xl font-bold mb-4 text-center">{course.courseName}</h1>
	      <p className="text-gray-700 mb-2"><strong>Course Number:</strong> {course.courseNumber}</p>
	      <p className="text-gray-700 mb-2"><strong>Description:</strong> {course.description || "No description provided."}</p>
	      <p className="text-gray-700 mb-2"><strong>Students Enrolled:</strong> {course.students?.length || 0}</p>
	    </div>
	      <button
	      	 className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
		 onClick={() => navigate(`/course/${id}/add-students`, { state: { token } })}>
	      Add Students
	    </button>
	  </div>
	);	
 }
