import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "../css_folder/Mycourses.module.css";
import Logout from "../subcomponents/Logout.jsx";
import TeamCardC from "./TeamCardC.jsx";
import CardC from "./CardC.jsx";
import ScalingFactorBarChart from "./ScalingFactorBarChart.jsx";

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
  const [teamBusFactorData, setTeamBusFactorData] = useState([]);
  const [individualBusFactorData, setIndividualBusFactorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("joy");
  const [joyViewType, setJoyViewType] = useState("team"); // "team" or "individual"
  const [busFactorViewType, setBusFactorViewType] = useState("team"); // "team" or "individual"
  const [selectedStudentEmail, setSelectedStudentEmail] = useState(null);
  const [selectedStudentEmailForBusFactor, setSelectedStudentEmailForBusFactor] = useState(null);
  const [selectedStudentEmailForTeamPoints, setSelectedStudentEmailForTeamPoints] = useState(null);
  const [teamPointsScalingData, setTeamPointsScalingData] = useState([]);
  const [loadingTeamPoints, setLoadingTeamPoints] = useState(false);

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
          
          // Calculate team bus factor (average) using rightFormat
          const teamBusFactorResults = rightFormat(busFactorResults);
          setTeamBusFactorData(teamBusFactorResults);
          
          // Store individual student bus factor data
          const busFactorData = projectStudents.map((student, index) => ({
            student: student,
            busFactorData: busFactorResults[index] || []
          }));
          setIndividualBusFactorData(busFactorData);
          
          if (busFactorData.length > 0 && !selectedStudentEmailForBusFactor) {
            setSelectedStudentEmailForBusFactor(busFactorData[0].student.email);
          }
        }

        // Fetch team points scaling factors for instructors
        if (projectStudents && projectStudents.length > 0) {
          try {
            setLoadingTeamPoints(true);
            const res = await fetch(
              `http://localhost:5000/api/course/${courseNumber}/project/${projectId}/points/scaling-factors`,
              {
                headers: { "Content-Type": "application/json", authtoken: token },
              }
            );
            const data = await res.json();
            if (res.ok && data.scalingFactorsByEvent) {
              // Transform data to be per-student
              const studentScalingData = projectStudents.map((student) => {
                const studentFactors = [];
                data.scalingFactorsByEvent.forEach((eventData) => {
                  const factor = eventData.scalingFactors.find(
                    (f) => f.studentId.toString() === (student._id || student.id).toString()
                  );
                  if (factor) {
                    studentFactors.push({
                      eventId: eventData.eventId,
                      eventCreatedAt: eventData.eventCreatedAt,
                      eventClosedAt: eventData.eventClosedAt,
                      scalingFactor: factor.scalingFactor,
                      totalReceived: factor.totalReceived,
                      teamSize: factor.teamSize,
                      computedAt: factor.computedAt,
                    });
                  }
                });
                // Sort by event closed date (most recent first)
                studentFactors.sort((a, b) => {
                  const dateA = new Date(a.eventClosedAt || a.eventCreatedAt);
                  const dateB = new Date(b.eventClosedAt || b.eventCreatedAt);
                  return dateB - dateA; // Descending order (newest first)
                });
                return {
                  student: student,
                  scalingFactors: studentFactors,
                };
              });
              setTeamPointsScalingData(studentScalingData);
              
              if (studentScalingData.length > 0 && !selectedStudentEmailForTeamPoints) {
                setSelectedStudentEmailForTeamPoints(studentScalingData[0].student.email);
              }
            }
          } catch (err) {
            console.error("Error fetching team points scaling factors:", err);
          } finally {
            setLoadingTeamPoints(false);
          }
        }
      } catch (err) {
        console.error("Error fetching team joy data:", err);
        setTeamJoyData([]);
        setIndividualJoyData([]);
        setTeamBusFactorData([]);
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
            
            <button
              onClick={() => setSelectedMetric("teamPoints")}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all text-left ${
                selectedMetric === "teamPoints"
                  ? "bg-sky-400 text-white shadow-md"
                  : "bg-transparent text-gray-700 hover:bg-sky-300 hover:text-gray-900"
              }`}
            >
              Team Points Distribution
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

          {/* Filter for Individual vs Team Bus Factor (only show when Bus Factor is selected) */}
          {selectedMetric === "bus" && !loading && (
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setBusFactorViewType("team")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  busFactorViewType === "team"
                    ? "bg-sky-400 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-sky-100"
                }`}
              >
                Team Bus Factor
              </button>
              <button
                onClick={() => setBusFactorViewType("individual")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  busFactorViewType === "individual"
                    ? "bg-sky-400 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-sky-100"
                }`}
              >
                Individual Bus Factor
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
                  <>
                    {busFactorViewType === "team" ? (
                      teamBusFactorData.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                          <p className="text-gray-600">No bus factor data available for this project yet.</p>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg shadow-md p-6">
                          <TeamCardC allStuds={teamBusFactorData} num={90} team={team ? `${team} - Bus Factor` : "Bus Factor"} metricLabel="Average Bus Factor" />
                        </div>
                      )
                    ) : (
                      individualBusFactorData.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                          <p className="text-gray-600">No individual bus factor data available for this project yet.</p>
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
                                    metricLabel="Bus Factor"
                                  />
                                </div>
                              )
                            ) : null;
                          })()}
                        </div>
                      )
                    )}
                  </>
                )}
                {selectedMetric === "teamPoints" && (
                  teamPointsScalingData.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                      <p className="text-gray-600">No team points distribution data available for this project yet.</p>
                    </div>
                  ) : (
                    <div>
                      {/* Student Selector for Team Points Scaling Factors */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Student:
                        </label>
                        <select
                          value={selectedStudentEmailForTeamPoints || ""}
                          onChange={(e) => setSelectedStudentEmailForTeamPoints(e.target.value)}
                          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                        >
                          {teamPointsScalingData.map((item, index) => {
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

                      {/* Selected Student's Scaling Factors */}
                      {selectedStudentEmailForTeamPoints && (() => {
                        const selectedStudentData = teamPointsScalingData.find(
                          (item) => item.student.email === selectedStudentEmailForTeamPoints
                        );
                        return selectedStudentData ? (
                          selectedStudentData.scalingFactors.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                              <p className="text-gray-600">No scaling factors available for this student yet.</p>
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg shadow-md p-6">
                              <h3 className="text-xl font-semibold mb-4">
                                Team Point Scaling Factors for {selectedStudentData.student.firstName} {selectedStudentData.student.lastName}
                              </h3>
                              
                              {/* Bar Chart for Scaling Factors */}
                              <div className="mb-6 p-3 bg-white border border-gray-200 rounded-lg">
                                <h4 className="text-sm font-semibold mb-2 text-gray-700">Scaling Factors Visualization</h4>
                                <ScalingFactorBarChart scalingFactors={selectedStudentData.scalingFactors} />
                              </div>

                              {/* Latest Event Card */}
                              {selectedStudentData.scalingFactors.length > 0 && selectedStudentData.scalingFactors[0] && (
                                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-lg font-semibold text-blue-900">Latest Event</h4>
                                    <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-semibold rounded">
                                      Most Recent
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                    <div>
                                      <p className="text-xs text-gray-600 mb-1">Event Date</p>
                                      <p className="font-semibold text-gray-800">
                                        {new Date(selectedStudentData.scalingFactors[0].eventClosedAt || selectedStudentData.scalingFactors[0].eventCreatedAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-600 mb-1">Total Received</p>
                                      <p className="font-semibold text-gray-800">{selectedStudentData.scalingFactors[0].totalReceived}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-600 mb-1">Team Size</p>
                                      <p className="font-semibold text-gray-800">{selectedStudentData.scalingFactors[0].teamSize}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-600 mb-1">Scaling Factor</p>
                                      <p className="font-bold text-blue-700 text-lg">
                                        {selectedStudentData.scalingFactors[0].scalingFactor.toFixed(3)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* All Events History Table */}
                              <div className="mt-4">
                                <h4 className="text-md font-semibold mb-3 text-gray-700">Event History Table</h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                      <tr className="bg-gray-100">
                                        <th className="border border-gray-300 px-4 py-2 text-left">Event Date</th>
                                        <th className="border border-gray-300 px-4 py-2 text-center">Total Received</th>
                                        <th className="border border-gray-300 px-4 py-2 text-center">Team Size</th>
                                        <th className="border border-gray-300 px-4 py-2 text-center">Scaling Factor</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedStudentData.scalingFactors.map((factor, index) => (
                                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                          <td className="border border-gray-300 px-4 py-2">
                                            {new Date(factor.eventClosedAt || factor.eventCreatedAt).toLocaleDateString()}
                                          </td>
                                          <td className="border border-gray-300 px-4 py-2 text-center">
                                            {factor.totalReceived}
                                          </td>
                                          <td className="border border-gray-300 px-4 py-2 text-center">
                                            {factor.teamSize}
                                          </td>
                                          <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                            {factor.scalingFactor.toFixed(3)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="text-sm text-gray-700">
                                  <strong>Scaling Factor:</strong> (sum of points received) / (team size × 10)
                                  <br />
                                  <span className="text-xs text-gray-600">
                                    A factor of 1.0 means the student received exactly 10 points per rater on average. 
                                    Factors below 1.0 indicate below-average peer ratings; above 1.0 indicates above-average ratings.
                                  </span>
                                </p>
                              </div>
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

