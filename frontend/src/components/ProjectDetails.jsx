import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "../css_folder/Mycourses.module.css";
import Logout from "../subcomponents/Logout.jsx";
import CardC from "./CardC.jsx";
import AddStudentsTable from "./AddStudentsTable.jsx"
import ProjectStudentsTable from "./ProjectStudentsTable.jsx"

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
          token = {token}
          setSelectedStudentForChart = {setSelectedStudentForChart}
          setJoyFactorData = {setJoyFactorData}
          setLoadingChart = {setLoadingChart}

          courseNumber = {courseNumber}
          projectId = {projectId}
          setShowChartModal = {setShowChartModal}
        />

       
        {/* Joy Factor Chart Modal */}
        {showChartModal && selectedStudentForChart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl relative">
              <button
                onClick={() => {
                  setShowChartModal(false);
                  setSelectedStudentForChart(null);
                  setJoyFactorData([]);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
              
              {loadingChart ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading joy factor data...</p>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold mb-4 text-center">
                    Joy Factor Chart - {selectedStudentForChart.firstName} {selectedStudentForChart.lastName}
                  </h2>
                  {joyFactorData.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">
                      No joy factor data available for this student yet.
                    </p>
                  ) : (
                    <CardC 
                      stud={joyFactorData} 
                      num={90}
                      studentName={`${selectedStudentForChart.firstName} ${selectedStudentForChart.lastName}`}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

