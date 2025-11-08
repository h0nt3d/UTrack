import { useEffect, useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import Logout from "../subcomponents/Logout.jsx";
import Course from "../subcomponents/Course.jsx";
import CourseModal from "../subcomponents/CourseModal.jsx";
import plus from "../imagez/add-icon-plus-icon-cross-white-text-symmetry-symbol-light-logo-png-clipart-removebg-preview.png";
import styles from "../css_folder/Mycourses.module.css";
import { fetchCoursesByEmail, addCourseForEmail } from "./js/Mycourses.js";

export default function Mycourses({ user }) {
  const emailFromState = useMemo(
    () => (user?.email || localStorage.getItem("email") || "").trim().toLowerCase(),
    [user?.email]
  );
  const token = useMemo(() => localStorage.getItem("token"), []);

  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!emailFromState) return;

    async function fetchCourses() {
      try {
        if (token) {
          const res = await fetch("http://localhost:5000/api/auth/get-courses", {
            method: "GET",
            headers: { "Content-Type": "application/json", "authtoken": token },
          });
          const data = await res.json();
          setCourses(res.ok ? data.courses || [] : await fetchCoursesByEmail(emailFromState));
        } else {
          const list = await fetchCoursesByEmail(emailFromState);
          setCourses(list);
        }
      } catch (err) {
        console.error(err);
        setCourses([]);
      }
    }

    fetchCourses();
  }, [emailFromState, token]);

  if (!emailFromState) return <Navigate to="/login" replace />;

  const handleAddCourse = async (newCourse) => {
    try {
      if (token) {
        const res = await fetch("http://localhost:5000/api/auth/createCourses", {
          method: "POST",
          headers: { "Content-Type": "application/json", "authtoken": token },
          body: JSON.stringify(newCourse),
        });
        const data = await res.json();
        if (res.ok) setCourses((prev) => [...prev, data.course]);
        else {
          const list = await addCourseForEmail(emailFromState, newCourse);
          setCourses(list);
        }
      } else {
        const list = await addCourseForEmail(emailFromState, newCourse);
        setCourses(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setShowModal(false);
    }
  };

  return (
    <div className={styles.my_courses}>
      <Logout styl={styles} />

      <div className={styles.bod}>
        <div className={styles.text_button_beg}>
          <h1 className={styles.my_c}>My Courses</h1>
          <button className={styles.button} onClick={() => setShowModal(true)}>
            <img className={styles.plus} src={plus} alt="Add Course" />
            <p className={styles.add_text}>Add course</p>
          </button>
        </div>

        <div className={styles.all_courses}>
          {courses.length === 0 ? (
            <p className="text-gray-600 text-center w-full mt-4">
              No courses found. Add one using the button above.
            </p>
          ) : (
            courses.map((course, idx) => (
              <Course key={course.courseNumber || idx} styl={styles} course={course} token={token} />
            ))
          )}
        </div>
      </div>

      {showModal && <CourseModal onClose={() => setShowModal(false)} onSave={handleAddCourse} />}
    </div>
  );
}
