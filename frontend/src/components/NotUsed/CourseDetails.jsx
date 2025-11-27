import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "../../css_folder/Mycourses.module.css";
import Logout from "../../subcomponents/Logout.jsx";
import QuickAddJoyFactorModal from "../studentjoyfactor/QuickAddJoyFactorModal.jsx";
import AddBusFactorModal from "../AddBusFactorModal.jsx";

export default function CourseDetails() {
  const { courseNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token;

  const [courseInfo, setCourseInfo] = useState({
    name: location.state?.courseName || "",
    number: location.state?.courseNumber || courseNumber,
    description: location.state?.courseDescription || "",
  });

  const [students, setStudents] = useState([]);
  const [studentProjects, setStudentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [instructor, setInstructor] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showJoyFactorModal, setShowJoyFactorModal] = useState(false);
  const [showBusFactorModal, setShowBusFactorModal] = useState(false);
  const [projectEvents, setProjectEvents] = useState({}); // projectId -> event data
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchCourseData = async () => {
      try {
        // Fetch course data
        const res = await fetch(
          `http://localhost:5000/api/student-auth/get-course/${courseNumber}`,
          {
            headers: { "Content-Type": "application/json", authtoken: token },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch course");

        setCourseInfo({
          name: data.courseName || courseInfo.name,
          number: data.courseNumber || courseInfo.number,
          description: data.description || courseInfo.description,
        });

        setStudents(data.students || []);
        setInstructor(data.instructor || null);

        // Fetch student info to get student ID
        const email = localStorage.getItem("email");
        if (email) {
          const studentRes = await fetch(
            `http://localhost:5000/api/student-auth/get-student/${encodeURIComponent(email.toLowerCase())}`,
            {
              headers: { "Content-Type": "application/json", authtoken: token },
            }
          );
          const studentData = await studentRes.json();
          if (studentRes.ok && studentData._id) {
            setStudentId(studentData._id);
            
            // Filter projects where student is assigned
            // project.students can contain either ObjectIds or emails
            const filteredProjects = (data.projects || []).filter((project) => {
              if (!project.students || project.students.length === 0) return false;
              // Check if student ID is in project.students (ObjectId format)
              const hasStudentId = project.students.some((s) => {
                const sStr = s.toString();
                const studentIdStr = studentData._id.toString();
                return sStr === studentIdStr || sStr === studentData._id;
              });
              // Check if student email is in project.students (email format)
              const hasStudentEmail = project.students.some((s) => {
                return s === email.toLowerCase() || s === email;
              });
              return hasStudentId || hasStudentEmail;
            });
            setStudentProjects(filteredProjects);
          }
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseNumber, token]);

  // Fetch open events for all student projects
  useEffect(() => {
    if (!token || !studentProjects.length || !studentId) return;

    async function fetchOpenEvents() {
      const eventsMap = {};
      for (const project of studentProjects) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/course/${courseNumber}/project/${project._id}/points/events/open`,
            {
              headers: {
                "Content-Type": "application/json",
                authtoken: token,
              },
            }
          );
          const data = await res.json();
          if (res.ok && data.event && data.event.status !== "Closed") {
            eventsMap[project._id] = data;
          }
        } catch (err) {
          console.error(`Error fetching event for project ${project._id}:`, err);
        }
      }
      setProjectEvents(eventsMap);
    }

    fetchOpenEvents();
    
    // Refresh events when component is focused (user returns from submission)
    const handleFocus = () => {
      fetchOpenEvents();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [token, courseNumber, studentProjects, studentId]);

  const goBack = () => navigate(-1);

  if (!token) return <p className="text-center mt-8">Access denied.</p>;

  return (
    <div className={styles.my_courses}>
      <Logout styl={styles} />

      <div className={`${styles.bod} relative`}>
        {/* Back Button */}
        <button
          className={`${styles.button} absolute top-0 left-0 m-2 flex justify-center items-center`}
          style={{ width: "120px" }}
          onClick={goBack}
        >
          Back
        </button>
        
        {/* Course Info */}
        <div className="mb-4 mt-10 text-center">
          <h1 className={styles.my_c}>{courseInfo.name}</h1>
          <p className="text-gray-700 font-medium">{courseInfo.number}</p>
          {courseInfo.description && (
            <p className="text-gray-600 mt-2 ml-4 text-left">
              {courseInfo.description}
            </p>
          )}
        </div>

	{/* Instructor */}
	{instructor && (
	  <div className="text-center mb-4">
	    <p className="text-gray-700 font-medium">
	      Instructor: {instructor.firstName} {instructor.lastName} ({instructor.email})
	    </p>
	  </div>
	)}

        {/* Loading state */}
        {loading && (
          <p className="text-gray-600 text-center w-full mt-4">
            Loading course details...
          </p>
        )}

        {/* Students */}
        {!loading && (
          <div className={`${styles.all_courses} mt-8`}>
            <h2 className="text-xl font-semibold mb-4 text-center">Students</h2>
            {students.length === 0 ? (
              <p className="text-gray-600 text-center mt-4">
                No students enrolled yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2">Name</th>
                      <th className="border border-gray-300 px-4 py-2">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="border border-gray-300 px-4 py-2">
                          {s.firstName} {s.lastName}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{s.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Projects - Only show projects student is assigned to */}
        {!loading && (
          <div className={`${styles.all_courses} mt-8`}>
            <h2 className="text-xl font-semibold mb-4 text-center">My Projects</h2>
            {studentProjects.length === 0 ? (
              <p className="text-gray-600 text-center mt-4">
                You are not assigned to any projects in this course.
              </p>
            ) : (
              <div className="space-y-6">
                {studentProjects.map((p, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-md p-4">
                    <div className="overflow-x-auto mt-4">
                      <table className="w-full border-collapse border border-gray-300 text-left">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border border-gray-300 px-4 py-2">Project Title</th>
                            <th className="border border-gray-300 px-4 py-2">Team</th>
                            <th className="border border-gray-300 px-4 py-2">Description</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="border border-gray-300 px-4 py-2">
                              <strong>{p.title}</strong>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">{p.team || "-"}</td>
                            <td className="border border-gray-300 px-4 py-2">
                              {p.description || "-"}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <div className="flex flex-col gap-2 items-center">
                                <button
                                  onClick={() => {
                                    setSelectedProject(p);
                                    setShowJoyFactorModal(true);
                                  }}
                                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm w-full"
                                >
                                  Add Joy Factor
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedProject(p);
                                    setShowBusFactorModal(true);
                                  }}
                                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm w-full"
                                >
                                  Record Bus Factor
                                </button>
                                {/* Team Points Distribution Button */}
                                {projectEvents[p._id] && projectEvents[p._id].hasSubmitted ? (
                                  <button
                                    disabled
                                    className="px-4 py-2 bg-gray-400 text-white rounded text-sm w-full cursor-not-allowed"
                                  >
                                    ✓ Submitted
                                  </button>
                                ) : projectEvents[p._id] && projectEvents[p._id].event ? (
                                  <button
                                    onClick={() => {
                                      navigate("/teampage", {
                                        state: {
                                          courseNumber,
                                          projectId: p._id,
                                          token,
                                          hasSubmitted: projectEvents[p._id].hasSubmitted,
                                        },
                                      });
                                    }}
                                    className={`px-4 py-2 text-white rounded text-sm w-full ${
                                      projectEvents[p._id].event.status === "Past Due"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-green-600 hover:bg-green-700"
                                    }`}
                                  >
                                    {projectEvents[p._id].event.status === "Past Due"
                                      ? "⚠ Team Points Distribution (Past Due)"
                                      : "📋 Team Points Distribution"}
                                  </button>
                                ) : (
                                  <button
                                    onClick={async () => {
                                      // Fetch event on click and navigate if exists
                                      try {
                                        const res = await fetch(
                                          `http://localhost:5000/api/course/${courseNumber}/project/${p._id}/points/events/open`,
                                          {
                                            headers: {
                                              "Content-Type": "application/json",
                                              authtoken: token,
                                            },
                                          }
                                        );
                                        const data = await res.json();
                                        if (res.ok && data.event && data.event.status !== "Closed") {
                                          setProjectEvents((prev) => ({
                                            ...prev,
                                            [p._id]: data,
                                          }));
                                          navigate("/teampage", {
                                            state: {
                                              courseNumber,
                                              projectId: p._id,
                                              token,
                                              hasSubmitted: data.hasSubmitted,
                                            },
                                          });
                                        } else if (res.ok && !data.event) {
                                          alert("No Team Points Distribution event has been created for this project yet. Please ask your instructor to launch an event.");
                                        } else {
                                          alert("Unable to load Team Points Distribution. Please try again later.");
                                        }
                                      } catch (err) {
                                        console.error("Error fetching event:", err);
                                        alert("Error loading Team Points Distribution. Please try again.");
                                      }
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm w-full"
                                  >
                                    📋 Team Points Distribution
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Joy Factor Modal */}
        {showJoyFactorModal && selectedProject && studentId && (
          <QuickAddJoyFactorModal
            student={{ _id: studentId }}
            isOpen={showJoyFactorModal}
            onClose={() => {
              setShowJoyFactorModal(false);
              setSelectedProject(null);
            }}
            onSuccess={() => {
              setShowJoyFactorModal(false);
              setSelectedProject(null);
            }}
            courseNumber={courseNumber}
            projectId={selectedProject._id}
          />
        )}

        {/* Bus Factor Modal */}
        {showBusFactorModal && selectedProject && studentId && (
          <AddBusFactorModal
            student={{ _id: studentId }}
            isOpen={showBusFactorModal}
            onClose={() => {
              setShowBusFactorModal(false);
              setSelectedProject(null);
            }}
            onSuccess={() => {
              setShowBusFactorModal(false);
              setSelectedProject(null);
            }}
            courseNumber={courseNumber}
            projectId={selectedProject._id}
            teamSize={selectedProject.students?.length || 1}
          />
        )}

      </div>
    </div>
  );
}

