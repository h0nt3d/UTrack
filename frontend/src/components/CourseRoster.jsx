import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "../css_folder/Mycourses.module.css"; // reuse Mycourses CSS
import Logout from "../subcomponents/Logout.jsx";

export default function CourseRoster() {
  const { courseNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token;

  const [courseInfo, setCourseInfo] = useState({
    name: location.state?.courseName || "",
    code: location.state?.courseCode || "",
    number: location.state?.courseNumber || courseNumber,
    description: location.state?.courseDescription || "",
  });

  const [students, setStudents] = useState([]);

  useEffect(() => {
    async function fetchRoster() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/auth/get-course/by-number/${courseNumber}`,
          {
            headers: { "Content-Type": "application/json", "authtoken": token },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch course");

        setCourseInfo({
          name: data.courseName || courseInfo.name,
          code: data.courseCode || courseInfo.code,
          number: data.courseNumber || courseInfo.number,
          description: data.description || courseInfo.description,
        });

        setStudents(data.students || []);
      } catch (err) {
        console.error("Error fetching course roster:", err);
      }
    }

    fetchRoster();
  }, [courseNumber, token]);

  return (
    <div className={styles.my_courses}>
      <Logout styl={styles} />

      <div className={`${styles.bod} relative`}>
        {/* Back Button */}
        <button
          className={`${styles.button} absolute top-0 left-0 m-2 flex justify-center items-center`}
          style={{ width: "120px" }}
          onClick={() => navigate(-1)}
        >

          Back
        </button>

        {/* Course Info */}
        <div className="mb-4">
          <h1 className={styles.my_c}>{courseInfo.name}</h1>
          <p className="text-gray-700 font-medium">{courseInfo.number}</p>
          {courseInfo.description && (
            <p className="text-gray-600 mt-2 ml-4 text-left">{courseInfo.description}</p>
          )}
        </div>

        {/* Buttons Row */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            className={`${styles.button} flex justify-center items-center`}
            style={{ minWidth: "150px" }}
	  onClick={() =>
      		navigate(`/course/${courseInfo.number}/add-students`, {
       		 state: { token },
      		})
    	   }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Student
          </button>
          <button
            className={`${styles.button} flex justify-center items-center`}
            style={{ minWidth: "150px" }}
          >
            Add Students (CSV/Excel)
          </button>
        </div>

        {/* Students List */}
        <div className={`${styles.all_courses} mt-6`}>
          {students.length === 0 ? (
            <p className="text-gray-600 text-center w-full mt-4">
              No students enrolled in this course yet.
            </p>
          ) : (
            students.map((s, idx) => (
              <div
                key={idx}
                className={`${styles.course_card} flex items-center justify-between p-2 mb-2`}
              >
                {s.email || s.name || `Student ${idx + 1}`}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

