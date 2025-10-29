import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "../css_folder/Mycourses.module.css"; // reuse Mycourses CSS
import Logout from "../subcomponents/Logout.jsx";

export default function AddStudent() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token;

  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ firstName: "", lastName: "", email: "" });
  const [courseName, setCourseName] = useState("");

  useEffect(() => {
    async function fetchCourseAndStudents() {
      try {
        const courseRes = await fetch(`http://localhost:5000/api/auth/get-course/${courseId}`, {
          headers: { "Content-Type": "application/json", "authtoken": token },
        });
        const courseData = await courseRes.json();
        if (!courseRes.ok) throw new Error(courseData.message || "Failed to fetch course");

        setCourseName(courseData.courseName || "Course");
        setStudents(courseData.students || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCourseAndStudents();
  }, [courseId, token]);

  async function handleAddStudent(e) {
    e.preventDefault();
    try {
      const createRes = await fetch(`http://localhost:5000/api/students/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "authtoken": token },
        body: JSON.stringify(newStudent),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.message || "Failed to create student");

      const addRes = await fetch(
        `http://localhost:5000/api/students/course/${courseId}/add-student`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "authtoken": token },
          body: JSON.stringify({ email: newStudent.email }),
        }
      );
      const addData = await addRes.json();
      if (!addRes.ok) throw new Error(addData.message || "Failed to add student to course");

      setStudents(addData.students || []);
      setNewStudent({ firstName: "", lastName: "", email: "" });
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
          <h1 className={styles.my_c}>Add Students to {courseId}</h1>
        </div>

        {/* Add Student Form */}
        <div className="flex justify-center mb-6">
          <form
            onSubmit={handleAddStudent}
            className={`${styles.course_card} p-6 flex flex-col gap-3 w-full max-w-md`}
          >
            <input
              type="email"
              placeholder="Email"
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              className={`${styles.button} flex justify-center items-center`}
            >
              Add Student
            </button>
          </form>
        </div>

        {/* Existing Students */}
        <div className={`${styles.all_courses} mt-6`}>
          <h2 className="text-xl font-semibold mb-4 text-center">Existing Students</h2>
          {students.length === 0 ? (
            <p className="text-gray-600 text-center w-full mt-2">No students in this course yet.</p>
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

