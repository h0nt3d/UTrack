import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "../css_folder/Mycourses.module.css"; // reuse Mycourses CSS
import Logout from "../subcomponents/Logout.jsx";

export default function CSVExcelAdd() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token;

  const [courseInfo, setCourseInfo] = useState({ name: "", number: courseId });
  const [students, setStudents] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/get-course/${courseId}`, {
          headers: { "Content-Type": "application/json", "authtoken": token },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch course");

        setCourseInfo({
          name: data.courseName || courseInfo.name,
          number: data.courseNumber || courseInfo.number,
        });

        const normalizedStudents = (data.students || []).map((s) => ({
          firstName: s.firstName || "",
          lastName: s.lastName || "",
          email: s.email || s.name || "",
        }));
        setStudents(normalizedStudents);
      } catch (err) {
        console.error(err);
      }
    }

    fetchCourse();
  }, [courseId, token]);

  async function handleFileUpload(e) {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `http://localhost:5000/api/students/course/${courseId}/add-students-file`,
        {
          method: "POST",
          headers: { authtoken: token },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add students");

      // Update student list after successful upload
      const normalizedStudents = (data.students || []).map((s) => ({
        firstName: s.firstName || "",
        lastName: s.lastName || "",
        email: s.email || s.name || "",
      }));
      setStudents(normalizedStudents);
      setFile(null);
    } catch (err) {
      console.error(err);
    }
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

        {/* Page Header */}
        <div className="mb-4 mt-10 text-center">
          <h1 className={styles.my_c}>Add Students from CSV/Excel file</h1>
          <p className="text-gray-700 font-medium">{courseInfo.name} ({courseInfo.number})</p>
        </div>

        {/* File Upload Form */}
        <div className="flex justify-center mb-6">
          <form
            onSubmit={handleFileUpload}
            className={`${styles.course_card} p-6 flex flex-col gap-3 w-full max-w-md`}
          >
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className={`${styles.button} flex justify-center items-center`}
            >
              Upload File
            </button>
          </form>
        </div>

        {/* Current Students */}
        <div className={`${styles.all_courses} mt-6`}>
          <h2 className="text-xl font-semibold mb-4 text-center">Current Students:</h2>
          {students.length === 0 ? (
            <p className="text-gray-600 text-center w-full mt-2">
              No students enrolled in this course yet.
            </p>
          ) : (
            students.map((s, idx) => (
              <div
                key={idx}
                className={`${styles.course_card} flex items-center justify-between p-2 mb-2`}
              >
                {s.firstName} {s.lastName} ({s.email})
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

