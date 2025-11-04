import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import JoyFactorForm from "./JoyFactorForm";
import JoyFactorList from "./JoyFactorList";
import styles from "../../css_folder/Mycourses.module.css";
import Logout from "../../subcomponents/Logout";

/**
 * JoyFactorManager Component
 * Main component for managing joy factor data for students in a project
 * Provides interface to add/view joy factor entries
 */
export default function JoyFactorManager() {
  const { courseNumber, projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem("token");

  const [projectInfo, setProjectInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch project and student information
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!courseNumber || !projectId || !token) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch course and project details
        const courseRes = await fetch(
          `http://localhost:5000/api/auth/get-course/${courseNumber}`,
          {
            headers: {
              "Content-Type": "application/json",
              authtoken: token,
            },
          }
        );

        const courseData = await courseRes.json();

        if (!courseRes.ok) {
          throw new Error(courseData.message || "Failed to fetch course");
        }

        // Find the project
        const project = courseData.projects?.find(
          (p) => p._id === projectId
        );

        if (!project) {
          throw new Error("Project not found");
        }

        setProjectInfo({
          courseNumber: courseData.courseNumber,
          courseName: courseData.courseName,
          projectTitle: project.title,
          projectTeam: project.team,
          projectDescription: project.description,
        });

        // Fetch student details for students in the project
        const studentEmails = project.students || [];
        const studentPromises = studentEmails.map(async (email) => {
          try {
            const studentRes = await fetch(
              `http://localhost:5000/api/students/course/${courseNumber}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  authtoken: token,
                },
              }
            );
            const studentData = await studentRes.json();
            return studentData.students?.find((s) => s.email === email);
          } catch (err) {
            console.error(`Error fetching student ${email}:`, err);
            return { email, firstName: "", lastName: "" };
          }
        });

        const studentResults = await Promise.all(studentPromises);
        setStudents(studentResults.filter(Boolean));
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [courseNumber, projectId, token]);

  if (isLoading) {
    return (
      <div className={styles.my_courses}>
        <Logout styl={styles} />
        <div className={`${styles.bod} text-center py-8`}>
          <p className="text-gray-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.my_courses}>
        <Logout styl={styles} />
        <div className={`${styles.bod} text-center py-8`}>
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={() => navigate(-1)}
            className={`${styles.button} mt-4`}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.my_courses}>
      <Logout styl={styles} />
      <div className={`${styles.bod} relative`}>
        {/* Back Button */}
        <button
          className={`${styles.button} absolute top-0 left-0 m-2 flex justify-center items-center`}
          style={{ width: "120px" }}
          onClick={() => navigate(-1)}
        >
          Back
        </button>

        {/* Header */}
        <div className="mb-6 mt-10 text-center">
          <h1 className={styles.my_c}>Manage Joy Factor</h1>
          {projectInfo && (
            <div className="mt-4 text-gray-700">
              <p className="font-semibold">
                {projectInfo.courseName} ({projectInfo.courseNumber})
              </p>
              <p className="text-lg">
                Project: {projectInfo.projectTitle} - {projectInfo.projectTeam}
              </p>
            </div>
          )}
        </div>

        {/* Add Joy Factor Form */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Add New Joy Factor Entry
          </h2>
          {students.length > 0 ? (
            <div className="max-w-md mx-auto">
              <JoyFactorForm students={students} />
            </div>
          ) : (
            <p className="text-center text-gray-600">
              No students assigned to this project yet.
            </p>
          )}
        </div>

        {/* Student Selection and Joy Factor List */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-center">
            View Joy Factor History
          </h2>

          {/* Student Selection */}
          {students.length > 0 ? (
            <div className="mb-6">
              <label
                htmlFor="studentSelect"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Student:
              </label>
              <select
                id="studentSelect"
                value={selectedStudentId || ""}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full max-w-md mx-auto block px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a student --</option>
                {students.map((student, idx) => (
                  <option key={idx} value={student._id}>
                    {student.firstName} {student.lastName} ({student.email})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-center text-gray-600 mb-4">
              No students assigned to this project yet.
            </p>
          )}

          {/* Display Joy Factor List for Selected Student */}
          {selectedStudentId && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <JoyFactorList studentId={selectedStudentId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

