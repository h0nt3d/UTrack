import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "../css_folder/Mycourses.module.css";
import Logout from "../subcomponents/Logout.jsx";
import TeamCardC from "./TeamCardC.jsx";
import CardC from "./CardC.jsx";

export default function StudentMetrics() {
  const { courseNumber, projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const {
    token,
    projectTitle,
    projectDescription,
    courseName,
    team,
    projectStudents,
  } = location.state || {};

  const [teamJoyData, setTeamJoyData] = useState([]);
  const [individualJoyData, setIndividualJoyData] = useState([]);
  const [individualBusFactorData, setIndividualBusFactorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("joy");
  const [joyViewType, setJoyViewType] = useState("team"); // "team" or "individual"
  const [selectedStudentEmail, setSelectedStudentEmail] = useState(null);
  const [selectedStudentEmailForBusFactor, setSelectedStudentEmailForBusFactor] = useState(null);

  function rightFormat(results) {
    const flattendArray = results.flat();

    const groupedByDate = {};

    for (const item of flattendArray) {
      const date = item.x;

      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }

      groupedByDate[date].push(item);
    }

    const finalArray = [];

    for (const item in groupedByDate) {
      let countt = 0;
      let totJoy = 0;
      const arrayDate = groupedByDate[item];
      for (let i = 0; i < arrayDate.length; i++) {
        countt++;
        totJoy += arrayDate[i].y;
      }
      const yy = totJoy / countt;
      finalArray.push({ x: item, y: yy, count: countt });
    }

    return finalArray;
  }

  const fetchStudentJoy = async (student) => {
    const studentId = student._id || student.id;
    try {
      const res = await fetch(
        `http://localhost:5000/api/course/${courseNumber}/project/${projectId}/student/${studentId}/joy-factor`,
        {
          headers: { "Content-Type": "application/json", authtoken: token },
        }
      );
      const data = await res.json();
      return data.joyFactors || [];
    } catch (err) {
      console.error(`Error fetching joy factor for ${student.firstName}:`, err);
      return [];
    }
  };

  const fetchStudentBusFactor = async (student) => {
    const studentId = student._id || student.id;
    try {
      const res = await fetch(
        `http://localhost:5000/api/course/${courseNumber}/project/${projectId}/student/${studentId}/bus-factor`,
        {
          headers: { "Content-Type": "application/json", authtoken: token },
        }
      );
      const data = await res.json();
      return data.busFactors || [];
    } catch (err) {
      console.error(`Error fetching bus factor for ${student.firstName}:`, err);
      return [];
    }
  };

  useEffect(() => {
    if (!token || !projectStudents || projectStudents.length === 0) {
      setLoading(false);
      return;
    }

    async function fetchMetrics() {
      setLoading(true);
      try {
        const results = await Promise.all(
          projectStudents.map(fetchStudentJoy)
        );
        const rightFormatResults = rightFormat(results);
        setTeamJoyData(rightFormatResults);
        
        // Store individual student data with student info
        const individualData = projectStudents.map((student, index) => ({
          student: student,
          joyData: results[index] || []
        }));
        setIndividualJoyData(individualData);
        
        // Set first student as selected by default if available
        if (individualData.length > 0 && !selectedStudentEmail) {
          setSelectedStudentEmail(individualData[0].student.email);
        }

        // Fetch bus factor data for instructors
        if (projectStudents && projectStudents.length > 0) {
          const busFactorResults = await Promise.all(
            projectStudents.map(fetchStudentBusFactor)
          );
          const busFactorData = projectStudents.map((student, index) => ({
            student: student,
            busFactorData: busFactorResults[index] || []
          }));
          setIndividualBusFactorData(busFactorData);
          
          if (busFactorData.length > 0 && !selectedStudentEmailForBusFactor) {
            setSelectedStudentEmailForBusFactor(busFactorData[0].student.email);
          }
        }
      } catch (err) {
        console.error("Error fetching team joy data:", err);
        setTeamJoyData([]);
        setIndividualJoyData([]);
        setIndividualBusFactorData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [token, courseNumber, projectId, projectStudents]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-sky-100">
      <Logout styl={styles} />
      <div className="flex relative">
        <button
          className={`${styles.button} absolute top-4 left-4 z-20 flex justify-center`}
          style={{ width: "120px" }}
          onClick={() => navigate(-1)}
        >
          Back
        </button>

        {/* Sidebar for Metric Selection */}
        <div className="w-64 min-h-screen bg-gradient-to-b from-sky-200 to-sky-100 p-6 pt-20 flex flex-col">
          <div className="space-y-2">
            <button
              onClick={() => setSelectedMetric("joy")}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all text-left ${
                selectedMetric === "joy"
                  ? "bg-sky-400 text-white shadow-md"
                  : "bg-transparent text-gray-700 hover:bg-sky-300 hover:text-gray-900"
              }`}
            >
              Joy Factor
            </button>
            
            <button
              onClick={() => setSelectedMetric("bus")}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all text-left ${
                selectedMetric === "bus"
                  ? "bg-sky-400 text-white shadow-md"
                  : "bg-transparent text-gray-700 hover:bg-sky-300 hover:text-gray-900"
              }`}
            >
              Bus Factor
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8 pt-20">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Metrics</h1>
            {projectTitle && (
              <p className="text-gray-600 text-lg">{projectTitle}{team ? ` - ${team}` : ""}</p>
            )}
          </div>

          {/* Filter for Individual vs Team Joy (only show when Joy Factor is selected) */}
          {selectedMetric === "joy" && !loading && (
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setJoyViewType("team")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  joyViewType === "team"
                    ? "bg-sky-400 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-sky-100"
                }`}
              >
                Team Joy
              </button>
              <button
                onClick={() => setJoyViewType("individual")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  joyViewType === "individual"
                    ? "bg-sky-400 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-sky-100"
                }`}
              >
                Individual Joy
              </button>
            </div>
          )}

          <div className="mt-6">
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">Loading metrics data...</p>
              </div>
            ) : (
              <div>
                {selectedMetric === "joy" && (
                  <>
                    {joyViewType === "team" ? (
                      teamJoyData.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                          <p className="text-gray-600">No joy factor data available for this project yet.</p>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg shadow-md p-6">
                          <TeamCardC allStuds={teamJoyData} num={90} team={team} />
                        </div>
                      )
                    ) : (
                      individualJoyData.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                          <p className="text-gray-600">No individual joy factor data available for this project yet.</p>
                        </div>
                      ) : (
                        <div>
                          {/* Student Selector */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Student:
                            </label>
                            <select
                              value={selectedStudentEmail || ""}
                              onChange={(e) => setSelectedStudentEmail(e.target.value)}
                              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                            >
                              {individualJoyData.map((item, index) => {
                                const studentEmail = item.student.email;
                                const studentName = `${item.student.firstName} ${item.student.lastName}`;
                                return (
                                  <option key={index} value={studentEmail}>
                                    {studentName} ({studentEmail})
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {/* Selected Student's Chart */}
                          {selectedStudentEmail && (() => {
                            const selectedStudentData = individualJoyData.find(
                              (item) => item.student.email === selectedStudentEmail
                            );
                            return selectedStudentData ? (
                              <div className="bg-white rounded-lg shadow-md p-6">
                                <CardC
                                  stud={selectedStudentData.joyData}
                                  num={90}
                                  studentName={`${selectedStudentData.student.firstName} ${selectedStudentData.student.lastName}`}
                                />
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )
                    )}
                  </>
                )}
                {selectedMetric === "bus" && (
                  individualBusFactorData.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                      <p className="text-gray-600">No bus factor data available for this project yet.</p>
                    </div>
                  ) : (
                    <div>
                      {/* Student Selector for Bus Factor */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Student:
                        </label>
                        <select
                          value={selectedStudentEmailForBusFactor || ""}
                          onChange={(e) => setSelectedStudentEmailForBusFactor(e.target.value)}
                          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                        >
                          {individualBusFactorData.map((item, index) => {
                            const studentEmail = item.student.email;
                            const studentName = `${item.student.firstName} ${item.student.lastName}`;
                            return (
                              <option key={index} value={studentEmail}>
                                {studentName} ({studentEmail})
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Selected Student's Bus Factor Chart */}
                      {selectedStudentEmailForBusFactor && (() => {
                        const selectedStudentData = individualBusFactorData.find(
                          (item) => item.student.email === selectedStudentEmailForBusFactor
                        );
                        return selectedStudentData ? (
                          selectedStudentData.busFactorData.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                              <p className="text-gray-600">No bus factor data available for this student yet.</p>
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg shadow-md p-6">
                              <CardC
                                stud={selectedStudentData.busFactorData}
                                num={90}
                                studentName={`${selectedStudentData.student.firstName} ${selectedStudentData.student.lastName} - Bus Factor`}
                              />
                            </div>
                          )
                        ) : null;
                      })()}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

