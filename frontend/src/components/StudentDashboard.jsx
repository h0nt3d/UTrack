import { useEffect, useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import Logout from "../subcomponents/Logout.jsx";
import Course from "../subcomponents/Course.jsx";
import styles from "../css_folder/Mycourses.module.css";
import { fetchStudentCourses } from "./js/StudentDashboard.js";

export default function StudentDashboard({ user }) {
  const emailFromState = useMemo(
    () => (user?.email || localStorage.getItem("email") || "").trim().toLowerCase(),
    [user?.email]
  );
  const token = useMemo(() => localStorage.getItem("token"), []);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!emailFromState) return;

    async function fetchCourses() {
      try {
        const list = await fetchStudentCourses(emailFromState, token);
        setCourses(list);
      } catch (err) {
        console.error(err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [emailFromState, token]);

  if (!emailFromState) return <Navigate to="/first-login" replace />;

  return (
    <div className={styles.my_courses}>
      <Logout styl={styles} />

      <div className={styles.bod}>
        <div className={styles.text_button_beg}>
          <h1 className={styles.my_c}>My Courses</h1>
        </div>

        {loading ? (
          <p className="text-gray-600 text-center w-full mt-4">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-600 text-center w-full mt-4">
            You are not enrolled in any courses.
          </p>
        ) : (
          <div className={styles.all_courses}>
            {courses.map((course, idx) => (
              <Course
                key={course.courseNumber || idx}
                styl={styles}
                course={course}
                token={token}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

