import { useState, useEffect } from 'react'
import Course from "../subcomponents/Course.jsx"
import Logout from "../subcomponents/Logout.jsx"
import plus from "../imagez/add-icon-plus-icon-cross-white-text-symmetry-symbol-light-logo-png-clipart-removebg-preview.png"
import imgg from "../imagez/minimalist-white-abstract-background_1272857-194151.jpg"
import styles from "../css_folder/Mycourses.module.css"
import { useLocation } from "react-router-dom";

export function Mycourses (props) {
  const loc = useLocation();
  const { email } = loc.state || {};
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState([]);

  function addCourse() {
    setCourse(prev => [...prev, 
                     {code: "SWE4103-2025-S1", 
                      img: imgg, 
                      titl: "Introduction to Project Management", 
                      desc: "Overview: This is a course about many things, you will learn stuff about various peculiar things regarding projects and no doubt will this be one of the most learning experiences you will ever have."
                    }]
              )
  }

  function handle (course) {
    props.spec(course)
  }

  return (
    <div className={styles.my_courses}>
      <Logout styl={styles}/>

      <div className={styles.bod}>

        <div className = {styles.text_button_beg}>
          <h1 className={styles.my_c}>My Courses</h1>
          <button className={styles.button} onClick={addCourse}>
            <img className={styles.plus} src={plus}/>
            <p className={styles.add_text}>Add course</p>       
          </button>
        </div>

        <div className={styles.all_courses}>
          {course.map(c => (
            <Course styl={styles} course={c} handle={handle} />
          ))}
        </div>

      </div>
    </div>
  )
}

export default Mycourses
