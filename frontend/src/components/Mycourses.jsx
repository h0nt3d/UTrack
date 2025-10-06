import { useState, useEffect } from 'react'
import Course from "../subcomponents/Course.jsx"
import Logout from "../subcomponents/Logout.jsx"
import plus from "../imagez/add-icon-plus-icon-cross-white-text-symmetry-symbol-light-logo-png-clipart-removebg-preview.png"
import imgg from "../imagez/minimalist-white-abstract-background_1272857-194151.jpg"
import styles from "../css_folder/Mycourses.module.css"
import { useLocation } from "react-router-dom";
import CourseModal from "../subcomponents/CourseModal.jsx"

export function Mycourses ({user}) {
  const loc = useLocation();
  const {email} = loc.state || {};
  const [showModal, setShowModal] = useState(false);
  const [course, setCourse] = useState([]);

  useEffect(() => {
	    if (!email) return;

	    async function fetchCourses() {
	      try {
		const response = await fetch(`http://localhost:5000/get-courses/${email}`);
		const data = await response.json();
		if (response.ok) {
		  setCourse(data.courses);
		}
	      } catch (err) {
		console.error("Error fetching courses:", err);
	      }
	    }

	    fetchCourses();
	  }, [email]);




  async function addCourse(newCourse)  {
	try {
	      const response = await fetch(`http://localhost:5000/add-course/${email}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(newCourse),
	      });
	      const data = await response.json();
	      if (response.ok) setCourse(data.courses);
	      setShowModal(false);
	    }
	 catch (err) {
	      console.error("Error adding course:", err);
	    }	
  }

  function handle (course) {
    user.spec(course)
  }

  return (
  <div className={styles.my_courses}>
    <Logout styl={styles}/>

   <div className={styles.bod}>
        <div className={styles.text_button_beg}>
          <h1 className={styles.my_c}>My Courses</h1>
          <button
            className={styles.button}
            onClick={() => setShowModal(true)}
          >
            <img className={styles.plus} src={plus} />
            <p className={styles.add_text}>Add course</p>
          </button>
        </div>

        <div className={styles.all_courses}>
          {course.map((c) => (
            <Course styl={styles} course={c} handle={handle} />
          ))}
        </div>
      </div>

      {showModal && (
        <CourseModal
          onClose={() => setShowModal(false)}
          onSave={addCourse}
        />
      )}
    </div>
  );
}

export default Mycourses
