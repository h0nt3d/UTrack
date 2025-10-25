import styles from "../css_folder/Coursepage.module.css"
import plus from "../imagez/add-icon-plus-icon-cross-white-text-symmetry-symbol-light-logo-png-clipart-removebg-preview.png"
import profile from "../imagez/256-2560255_user-icon-user-white-icon-transparent-hd-png-removebg-preview.png"
import Header from "../subcomponents/Header";
import Project from "../subcomponents/Project";
import React from "react" ;

export function Coursepage ({course}) {

    const [project, setProject] = React.useState([]);

    function addProject(){
        setProject(prev => [...prev, {namee: "Project #1: Finance Tracker"}]);
    }

    return (
        <div className={styles.course_1}>
            <Header styl = {styles} code ={course.code} title={course.titl} />

            <div className={styles.bod}>
                <p className={styles.coursDesc}>
                    {course.desc}
                </p>
                <div className={styles.bottom}>
                    <div className={styles.project}>
                        <button className={styles.button} onClick={addProject}>
                            <img className={styles.plus} src={plus}/>
                            <p>Add Project</p>       
                        </button>
                        <div className={styles.all_projs}>
                            {project.map(p => (
                                <Project styl={styles} nam={p.namee}/>
                            ))}
                        </div>
                    </div>
                    <button className={styles.studbutton}>
                        <h2 className={styles.studentsText}>Students</h2>
                        <div className={styles.studimgs}>
                            <img className={styles.studimg} src={profile}/>
                            <img className={styles.studimg} src={profile}/>
                            <img className={styles.studimg} src={profile}/>
                        </div>
                    </button>
                </div>
            </div>
        </div>
  );
}

export default Coursepage;