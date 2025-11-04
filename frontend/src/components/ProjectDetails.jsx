import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "../css_folder/Mycourses.module.css";
import Logout from "../subcomponents/Logout.jsx";
import QuickAddJoyFactorModal from "./studentjoyfactor/QuickAddJoyFactorModal.jsx";
import ViewJoyFactorChart from "./studentjoyfactor/ViewJoyFactorChart.jsx";

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
  
  // Joy Factor Modal States
  const [selectedStudentForJoyFactor, setSelectedStudentForJoyFactor] = useState(null);
  const [showAddJoyFactorModal, setShowAddJoyFactorModal] = useState(false);
  const [showViewChartModal, setShowViewChartModal] = useState(false);

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

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
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

        {/* Add Students Table */}
        {showAddStudents && (
          <div className="mt-4 max-w-3xl mx-auto border p-4 rounded shadow">
            {courseStudents.length === 0 ? (
              <p>No students enrolled in the course.</p>
            ) : (
              <>
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2">Select</th>
                      <th className="border border-gray-300 px-4 py-2">First Name</th>
                      <th className="border border-gray-300 px-4 py-2">Last Name</th>
                      <th className="border border-gray-300 px-4 py-2">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(s.id)}
                            onChange={() => toggleStudentSelection(s.id)}
                            disabled={projectStudents.some((ps) => ps.email === s.email)}
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{s.firstName}</td>
                        <td className="border border-gray-300 px-4 py-2">{s.lastName}</td>
                        <td className="border border-gray-300 px-4 py-2">{s.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-center mt-3">
                  <button
                    className={`${styles.button} flex justify-center items-center`}
                    onClick={handleAddStudents}
                  >
                    Add Selected Students
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Project Students */}
        <div className={`${styles.all_courses} mt-6`}>
          <h2 className="text-xl font-semibold mb-4 text-center">Students in Project:</h2>
          {projectStudents.length === 0 ? (
            <p className="text-gray-600 text-center mt-4">
              No students assigned to this project yet.
            </p>
          ) : (
            <table className="w-full border-collapse border border-gray-300 text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">First Name</th>
                  <th className="border border-gray-300 px-4 py-2">Last Name</th>
                  <th className="border border-gray-300 px-4 py-2">Email</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projectStudents.map((s, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{s.firstName}</td>
                    <td className="border border-gray-300 px-4 py-2">{s.lastName}</td>
                    <td className="border border-gray-300 px-4 py-2">{s.email}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setSelectedStudentForJoyFactor({ _id: s._id || s.id, firstName: s.firstName, lastName: s.lastName, email: s.email });
                            setShowAddJoyFactorModal(true);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Add Joy Factor
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudentForJoyFactor({ _id: s._id || s.id, firstName: s.firstName, lastName: s.lastName, email: s.email });
                            setShowViewChartModal(true);
                          }}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          View Chart
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Joy Factor Modals */}
        {showAddJoyFactorModal && selectedStudentForJoyFactor && (
          <QuickAddJoyFactorModal
            student={selectedStudentForJoyFactor}
            isOpen={showAddJoyFactorModal}
            onClose={() => {
              setShowAddJoyFactorModal(false);
              setSelectedStudentForJoyFactor(null);
            }}
            onSuccess={() => {
              // Refresh project students if needed
              // You can add a refresh function here if needed
            }}
          />
        )}

        {showViewChartModal && selectedStudentForJoyFactor && (
          <ViewJoyFactorChart
            student={selectedStudentForJoyFactor}
            isOpen={showViewChartModal}
            onClose={() => {
              setShowViewChartModal(false);
              setSelectedStudentForJoyFactor(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

