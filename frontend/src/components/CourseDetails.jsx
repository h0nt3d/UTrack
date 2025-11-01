import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "../css_folder/Mycourses.module.css";
import Logout from "../subcomponents/Logout.jsx";

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
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [instructor, setInstructor] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchCourseData = async () => {
      try {
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
        setProjects(data.projects || []);
	setInstructor(data.instructor || null);
      } catch (err) {
        console.error("Error fetching course data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseNumber, token]);

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

        {/* Projects */}
        {!loading && (
          <div className={`${styles.all_courses} mt-8`}>
            <h2 className="text-xl font-semibold mb-4 text-center">Projects</h2>
            {projects.length === 0 ? (
              <p className="text-gray-600 text-center mt-4">
                No projects available for this course.
              </p>
            ) : (
              <div className="flex flex-col gap-2 ml-6">
                {projects.map((p, idx) => (
                  <div
                    key={idx}
                    className={`${styles.button} w-max px-4 py-2 text-left cursor-default`}
                  >
                    <strong>{p.title}</strong>
                    {p.description && (
                      <p className="text-gray-700 mt-1">{p.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

