import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "../css_folder/Mycourses.module.css";
import Logout from "../subcomponents/Logout.jsx";
import CardC from "./CardC.jsx";
import TeamCardC from "./TeamCardC.jsx";
import AddStudentsTable from "./AddStudentsTable.jsx"
import ProjectStudentsTable from "./ProjectStudentsTable.jsx"
import AllStudentsButton from "./AllStudentsButton.jsx"

import StudentJoyModal from "./StudentJoyModal.jsx"
import TeamJoyModal from "./TeamJoyModal.jsx"

export default function ProjectDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const {
    token,
    projectTitle,
    projectDescription,
    courseName,
    courseNumber,
    team,
  } = location.state || {};

  const [projectStudents, setProjectStudents] = useState([]);
  const [courseStudents, setCourseStudents] = useState([]);
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedStudentForChart, setSelectedStudentForChart] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [joyFactorData, setJoyFactorData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);

  //mirroring the way individual students were done
  const [showTeamChartModal, setShowTeamChartModal] = useState(false);
  const [teamJoyData, setTeamJoyData] = useState([]);
  const [loadingTeamChart, setLoadingTeamChart] = useState(false);

  // Fetch project students
  useEffect(() => {
    if (!token) return;

    async function fetchProjectStudents() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/auth/course/${courseNumber}/project/${projectTitle}/students`,
          {
            headers: { "Content-Type": "application/json", authtoken: token },
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch project students");
        setProjectStudents(data.students || []);
      } catch (err) {
        console.error(err);
      }
    }

    fetchProjectStudents();
  }, [courseNumber, projectTitle, token]);

  // Fetch course students
  useEffect(() => {
    if (!token) return;

    async function fetchCourseStudents() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/auth/get-course/${courseNumber}`,
          {
            headers: { "Content-Type": "application/json", authtoken: token },
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch course students");
        const normalizedStudents = (data.students || []).map((s) => ({
          id: s._id,
          firstName: s.firstName || "",
          lastName: s.lastName || "",
          email: s.email || s.name || "",
        }));
        setCourseStudents(normalizedStudents);
      } catch (err) {
        console.error(err);
      }
    }

    fetchCourseStudents();
  }, [courseNumber, token]);

const handleAddStudents = async () => {
  if (!selectedStudents.length) return;

  console.log("Adding students:", selectedStudents);

  try {
    const res = await fetch(
      `http://localhost:5000/api/auth/course/${courseNumber}/project/${encodeURIComponent(projectTitle)}/add-students`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", authtoken: token },
        body: JSON.stringify({ studentIds: selectedStudents }),
      }
    );

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Failed to add students to project");
    }

    const data = await res.json();
    setProjectStudents(data.students || []);
    setShowAddStudents(false);
    setSelectedStudents([]);
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className={styles.my_courses}>
      <Logout styl={styles} />
      <div className={`${styles.bod} relative`}>
        <button
          className={`${styles.button} absolute top-0 left-0 m-2 flex justify-center`}
          style={{ width: "120px" }}
          onClick={() => navigate(-1)}
        >
          Back
        </button>

        <div className="mt-10 mb-4 text-center">
          <h1 className={styles.my_c}>{projectTitle}-{team}</h1>
          {projectDescription && <p className="text-gray-600">{projectDescription}</p>}
          <p className="text-gray-700 font-medium mt-1">{courseName} ({courseNumber})</p>
        </div>

        {/* Add Students Button */}
        <div className="flex justify-center mt-4">
          <button
            className={`${styles.button} flex justify-center items-center`}
            onClick={() => setShowAddStudents(!showAddStudents)}
          >
            {showAddStudents ? "Cancel" : "Add Students"}
          </button>
        </div>

        {showAddStudents && 
        <AddStudentsTable
          courseStudents={courseStudents}
          selectedStudents={selectedStudents}
          projectStudents={projectStudents}
          handleAddStudents={handleAddStudents}
          setSelectedStudents={setSelectedStudents}
        />}

        <ProjectStudentsTable
          projectStudents = {projectStudents}
	  setProjectStudents = {setProjectStudents}
          token = {token}
          setSelectedStudentForChart = {setSelectedStudentForChart}
          setJoyFactorData = {setJoyFactorData}
          setLoadingChart = {setLoadingChart}

          courseNumber = {courseNumber}
          projectId = {projectId}
          setShowChartModal = {setShowChartModal}
        />

        {<AllStudentsButton
          projectStudents= {projectStudents}
          token= {token}
          courseNumber= {courseNumber}
          projectId= {projectId}
          projectTitle= {projectTitle}
          projectDescription= {projectDescription}
          courseName= {courseName}
          team= {team}
        />}
       
        {/*INDIVIDUAL JOY DISPLAY*/}
        {showChartModal && selectedStudentForChart && 
        <StudentJoyModal
          showChartModal={showChartModal}
          setShowChartModal={setShowChartModal}
          selectedStudentForChart={selectedStudentForChart}
          setSelectedStudentForChart={setSelectedStudentForChart}
          joyFactorData={joyFactorData}
          setJoyFactorData={setJoyFactorData}
          loadingChart={loadingChart}
        />}
      
      {/*TEAM JOY DISPLAY*/}
      {showTeamChartModal && 
      <TeamJoyModal
        showTeamChartModal={showTeamChartModal}
        setShowTeamChartModal={setShowTeamChartModal}
        setSelectedStudentForChart={setSelectedStudentForChart}
        teamJoyData={teamJoyData}
        setTeamJoyData={setTeamJoyData}
        loadingTeamChart={loadingTeamChart}
      />}
    
        
    </div>
  </div>
  );
}

