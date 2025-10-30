import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "../css_folder/Mycourses.module.css";
import Logout from "../subcomponents/Logout.jsx";

export default function CourseRoster() {
  const { courseNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token;

  const [courseInfo, setCourseInfo] = useState({
    name: location.state?.courseName || "",
    code: location.state?.courseCode || "",
    number: location.state?.courseNumber || courseNumber,
    description: location.state?.courseDescription || "",
  });

  const [students, setStudents] = useState([]);
  const [projects, setProjects] = useState([]);

  // Fetch course info, students, and projects
  useEffect(() => {
    if (!token) return;

    const fetchCourseData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/auth/get-course/${courseNumber}`,
          {
            headers: { "Content-Type": "application/json", authtoken: token },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch course");

        setCourseInfo({
          name: data.courseName || courseInfo.name,
          code: data.courseCode || courseInfo.code,
          number: data.courseNumber || courseInfo.number,
          description: data.description || courseInfo.description,
        });

        const normalizedStudents = (data.students || []).map((s) => ({
          firstName: s.firstName || "",
          lastName: s.lastName || "",
          email: s.email || s.name || "",
        }));
        setStudents(normalizedStudents);

        setProjects(data.projects || []);
      } catch (err) {
        console.error("Error fetching course data:", err);
      }
    };

    fetchCourseData();
  }, [courseNumber, token]);

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

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            className={`${styles.button} flex justify-center items-center`}
            style={{ minWidth: "150px" }}
            onClick={() =>
              navigate(`/course/${courseInfo.number}/add-students`, { state: { token } })
            }
          >
            Add Student
          </button>

          <button
            className={`${styles.button} flex justify-center items-center`}
            style={{ minWidth: "150px" }}
            onClick={() =>
              navigate(`/course/${courseInfo.number}/add-students-file`, { state: { token } })
            }
          >
            Add Students (CSV/Excel)
          </button>

          <button
            className={`${styles.button} flex justify-center items-center`}
            style={{ minWidth: "150px" }}
            onClick={() =>
              navigate(`/course/${courseInfo.number}/add-project`, { state: { token } })
            }
          >
            Add Project
          </button>
        </div>

        {/* Students Table */}
        <div className={`${styles.all_courses} mt-8`}>
          <h2 className="text-xl font-semibold mb-4 text-center">
            Current Students:
          </h2>
          {students.length === 0 ? (
            <p className="text-gray-600 text-center mt-4">
              No students enrolled in this course yet.
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

        {/* Projects List */}
        <div className={`${styles.all_courses} mt-8`}>
          <h2 className="text-xl font-semibold mb-4 text-center">
            Current Projects:
          </h2>

          {projects.length === 0 ? (
            <p className="text-gray-600 text-center mt-4">
              No projects created for this course yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2 ml-6">
              {projects.map((p, idx) => (
                <button
                  key={idx}
                  className={`${styles.button} w-max px-4 py-2 text-left`}
                  onClick={() =>
                    navigate(`/course/${courseInfo.number}/project/${p._id}`, {
                      state: {
                        token,
                        projectTitle: p.title,
                        projectDescription: p.description,
                        courseName: courseInfo.name,
                        courseNumber: courseInfo.number,
                      },
                    })
                  }
                >
                  <strong>{p.title}</strong>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

