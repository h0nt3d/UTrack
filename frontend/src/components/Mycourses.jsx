// src/pages/Mycourses.jsx
import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Logout from "../subcomponents/Logout.jsx";
import Course from "../subcomponents/Course.jsx";
import CourseModal from "../subcomponents/CourseModal.jsx";
import plus from "../imagez/add-icon-plus-icon-cross-white-text-symmetry-symbol-light-logo-png-clipart-removebg-preview.png";
import styles from "../css_folder/Mycourses.module.css";
import { fetchCoursesByEmail, addCourseForEmail } from "./js/Mycourses.js"

export default function Mycourses({ user }) {
  const loc = useLocation();
  const email = useMemo(
    () =>
      (loc.state?.email ||
       user?.email ||
       localStorage.getItem("email") ||
       "").trim().toLowerCase(),
    [loc.state?.email, user?.email]
  );

  // Get user data from localStorage for display purposes
  const storedUser = useMemo(() => {
    const storedUserData = localStorage.getItem('user');
    const storedFirstName = localStorage.getItem('firstName');
    const storedLastName = localStorage.getItem('lastName');
    
    if (storedUserData && storedFirstName && storedLastName) {
      try {
        const userData = JSON.parse(storedUserData);
        return {
          firstName: storedFirstName,
          lastName: storedLastName,
          email: userData.email
        };
      } catch (err) {
        console.error("Error parsing stored user data", err);
        return null;
      }
    }
    return null;
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (!email) return;
    (async () => {
      const list = await fetchCoursesByEmail(email);
      setCourses(list);
    })();
  }, [email]);

  // If truly no email — bounce to login
  if (!email) return <Navigate to="/login" replace />;

  const handleAddCourse = async (newCourse) => {
    const list = await addCourseForEmail(email, newCourse);
    setCourses(list);
    setShowModal(false);
  };

  const handleCourseClick = (c) => user?.spec?.(c);

  return (
    <div className={styles.my_courses}>
      <Logout styl={styles} user={storedUser} />

      <div className={styles.bod}>
        <div className={styles.text_button_beg}>
          <h1 className={styles.my_c}>My Courses</h1>
          <button className={styles.button} onClick={() => setShowModal(true)}>
            <img className={styles.plus} src={plus} alt="Add Course" />
            <p className={styles.add_text}>Add course</p>
          </button>
        </div>

        <div className={styles.all_courses}>
          {courses.map((c, idx) => (
            <Course
              key={c.id || c._id || c.title || idx}
              styl={styles}
              course={c}
              handle={handleCourseClick}
            />
          ))}
        </div>
      </div>

      {showModal && (
        <CourseModal onClose={() => setShowModal(false)} onSave={handleAddCourse} />
      )}
    </div>
  );
}
