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
import LaunchTeamPointsDialog from "./TeamPointDistribution/LaunchTeamPointsDialog.jsx"
import TeamPointsBanner from "./TeamPointDistribution/TeamPointsBanner.jsx"

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

  // Bus Factor for students (project-level average)
  const [busFactorData, setBusFactorData] = useState([]);
  const [loadingBusFactor, setLoadingBusFactor] = useState(false);

  // Team Points Distribution
  const [showLaunchDialog, setShowLaunchDialog] = useState(false);
  const [teamPointsEvents, setTeamPointsEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

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

  // Fetch bus factor average for students
  useEffect(() => {
    if (!token || !projectId || !courseNumber) return;

    async function fetchBusFactorAverage() {
      try {
        setLoadingBusFactor(true);
        const res = await fetch(
          `http://localhost:5000/api/course/${courseNumber}/project/${projectId}/bus-factor-average`,
          {
            headers: { "Content-Type": "application/json", authtoken: token },
          }
        );
        const data = await res.json();
        if (res.ok && data.busFactorAverage) {
          setBusFactorData(data.busFactorAverage);
        }
      } catch (err) {
        console.error("Error fetching bus factor average:", err);
      } finally {
        setLoadingBusFactor(false);
      }
    }

    fetchBusFactorAverage();
  }, [token, courseNumber, projectId]);

  // Fetch Team Points Distribution events (for instructor)
  useEffect(() => {
    if (!token || !projectId || !courseNumber) return;

    async function fetchTeamPointsEvents() {
      try {
        setLoadingEvents(true);
        const res = await fetch(
          `http://localhost:5000/api/course/${courseNumber}/project/${projectId}/points/events`,
          {
            headers: { "Content-Type": "application/json", authtoken: token },
          }
        );
        const data = await res.json();
        if (res.ok && data.events) {
          setTeamPointsEvents(data.events || []);
        }
      } catch (err) {
        console.error("Error fetching team points events:", err);
      } finally {
        setLoadingEvents(false);
      }
    }

    fetchTeamPointsEvents();
  }, [token, courseNumber, projectId]);

  const handleLaunchSuccess = () => {
    // Refresh events list
    async function refreshEvents() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/course/${courseNumber}/project/${projectId}/points/events`,
          {
            headers: { "Content-Type": "application/json", authtoken: token },
          }
        );
        const data = await res.json();
        if (res.ok && data.events) {
          setTeamPointsEvents(data.events || []);
        }
      } catch (err) {
        console.error("Error refreshing events:", err);
      }
    }
    refreshEvents();
  };

  const handleCloseEvent = async (eventId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/course/${courseNumber}/project/${projectId}/points/events/${eventId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", authtoken: token },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // Refresh events list
        handleLaunchSuccess();
      } else {
        alert(data.message || "Failed to close event");
      }
    } catch (err) {
      console.error("Error closing event:", err);
      alert("Error closing event: " + err.message);
    }
  };

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

        {/* Add Students Button (Instructor only) */}
        <div className="flex justify-center mt-4 gap-4">
          <button
            className={`${styles.button} flex justify-center items-center`}
            onClick={() => setShowAddStudents(!showAddStudents)}
          >
            {showAddStudents ? "Cancel" : "Add Students"}
          </button>
          <button
            className={`${styles.button} flex justify-center items-center bg-green-600 hover:bg-green-700`}
            onClick={() => setShowLaunchDialog(true)}
          >
            Launch Team Points Distribution
          </button>
        </div>

        {/* Team Points Distribution Banner (for students - shows for all but only students can submit) */}
        <TeamPointsBanner
          courseNumber={courseNumber}
          projectId={projectId}
          token={token}
        />

        {/* Team Points Distribution Events Status (for instructor) */}
        {teamPointsEvents.length > 0 && (
          <div className="mt-4 mb-4">
            <h3 className="text-lg font-semibold mb-2 text-center">Team Points Distribution Events</h3>
            <div className="space-y-2">
              {teamPointsEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border-2 ${
                    event.status === "Open" || event.status === "Past Due"
                      ? "bg-yellow-50 border-yellow-300"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            event.status === "Open"
                              ? "bg-green-100 text-green-800"
                              : event.status === "Past Due"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {event.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          Created: {new Date(event.createdAt).toLocaleString()}
                        </span>
                        {event.dueDate && (
                          <span className="text-sm text-gray-600">
                            Due: {new Date(event.dueDate).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        Submissions: {event.submissionCount} / {event.totalExpected}
                      </p>
                    </div>
                    {event.status === "Open" && (
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to close this event? Scaling factors will be computed.")) {
                            handleCloseEvent(event.id);
                          }
                        }}
                        className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Close Event
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

      {/* Bus Factor Chart for Students (Project-level daily average) */}
      {busFactorData.length > 0 && (
        <div className={`${styles.all_courses} mt-6`}>
          <h2 className="text-xl font-semibold mb-4 text-center">Project Bus Factor (Daily Average)</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <TeamCardC 
              allStuds={busFactorData} 
              num={90} 
              team={`${projectTitle} - Bus Factor Average`} 
            />
          </div>
        </div>
      )}

      {/* Launch Team Points Distribution Dialog */}
      {showLaunchDialog && (
        <LaunchTeamPointsDialog
          isOpen={showLaunchDialog}
          onClose={() => setShowLaunchDialog(false)}
          onSuccess={handleLaunchSuccess}
          courseNumber={courseNumber}
          projectId={projectId}
          token={token}
        />
      )}
    
        
    </div>
  </div>
  );
}

