// src/pages/Mycourses.jsx
import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Logout from "../subcomponents/Logout.jsx";
import Course from "../subcomponents/Course.jsx";
import CourseModal from "../subcomponents/CourseModal.jsx";
import plus from "../imagez/add-icon-plus-icon-cross-white-text-symmetry-symbol-light-logo-png-clipart-removebg-preview.png";
import styles from "../css_folder/Mycourses.module.css";
import { fetchCoursesByEmail, addCourseForEmail } from "./js/Mycourses.js";

export default function Mycourses({ user }) {
  const loc = useLocation();
  const {email: stateEmail, token: stateToken} = loc.state || {};
  
  // Get email from multiple sources with priority
  const email = useMemo(
    () =>
      (stateEmail ||
       user?.email ||
       localStorage.getItem("email") ||
       "").trim().toLowerCase(),
    [stateEmail, user?.email]
  );

  // Get token from multiple sources with priority
  const token = useMemo(
    () => stateToken || localStorage.getItem("token"),
    [stateToken]
  );

  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (!email) return;
    
    // Use token-based API for proper instructor isolation
    if (token) {
      fetchCoursesWithToken();
    } else {
      // If no token, try email-based API as fallback
      fetchCoursesWithEmail();
    }

    async function fetchCoursesWithToken() {
      try {
        const response = await fetch("http://localhost:5000/api/auth/get-courses", {
          method: "GET",
          headers: {"Content-Type": "application/json", "authtoken": token},
        });
        const data = await response.json();
        if (response.ok) {
          setCourses(data.courses || []);
        } else {
          console.error("Token-based API failed:", data.message);
          // Fallback to email-based API if token fails
          fetchCoursesWithEmail();
        }
      } catch (err) {
        console.error("Error fetching courses with token:", err);
        // Fallback to email-based API
        fetchCoursesWithEmail();
      }
    }

    async function fetchCoursesWithEmail() {
      try {
        const list = await fetchCoursesByEmail(email);
        setCourses(list);
      } catch (err) {
        console.error("Error fetching courses with email:", err);
        setCourses([]); // Set empty array on error
      }
    }
  }, [email, token]);

  // If truly no email — bounce to login
  if (!email) return <Navigate to="/login" replace />;

  const handleAddCourse = async (newCourse) => {
    // Use token-based API for proper instructor isolation
    if (token) {
      try {
        const response = await fetch("http://localhost:5000/api/auth/createCourses", {
          method: "POST",
          headers: { "Content-Type": "application/json", "authtoken": token },
          body: JSON.stringify(newCourse),
        });
        const data = await response.json();
        if (response.ok) {
          setCourses(prev => [...prev, data.course]);
          setShowModal(false);
        } else {
          console.error("Token-based API failed:", data.message);
          // Fallback to email-based API if token fails
          const list = await addCourseForEmail(email, newCourse);
          setCourses(list);
          setShowModal(false);
        }
      } catch (err) {
        console.error("Error adding course with token:", err);
        // Fallback to email-based API
        const list = await addCourseForEmail(email, newCourse);
        setCourses(list);
        setShowModal(false);
      }
    } else {
      // Use email-based API if no token
      const list = await addCourseForEmail(email, newCourse);
      setCourses(list);
      setShowModal(false);
    }
  };

  const handleCourseClick = (c) => user?.spec?.(c);

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
          {courses.map((c, idx) => (
            <Course
              key={c.id || c._id || c.title || idx}
              styl={styles}
              course={c}
              handle={handleCourseClick}
              token={token}
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
