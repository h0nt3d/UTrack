import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "../css_folder/Mycourses.module.css";
import Logout from "../subcomponents/Logout.jsx";

export default function AddStudent() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token;

  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ firstName: "", lastName: "", email: "" });
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  async function handleAddStudent(e) {
    e.preventDefault();
    try {
      const createRes = await fetch(`http://localhost:5000/api/students/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", authtoken: token },
        body: JSON.stringify(newStudent),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.message || "Failed to create student");

      const addRes = await fetch(
        `http://localhost:5000/api/students/course/${courseId}/add-student`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", authtoken: token },
          body: JSON.stringify({ email: newStudent.email }),
        }
      );
      const addData = await addRes.json();
      if (!addRes.ok) throw new Error(addData.message || "Failed to add student to course");

      setStudents(addData.students || []);
      setNewStudent({ firstName: "", lastName: "", email: "" });

      //Success message (green)
      setIsError(false);
      setMessage("Student added successfully!");
      setTimeout(() => setMessage(null), 1500);
    } catch (err) {
      console.error(err);

      setIsError(true);
      setMessage(`${err.message}`);
      setTimeout(() => setMessage(null), 2500);
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
            className={`${styles.course_card} p-6 flex flex-col gap-3 w-full max-w-md relative`}
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

            {/*Success/Error Message Popup */}
            {message && (
              <div
                className="absolute left-1/2 transform -translate-x-1/2 mt-2 text-center text-sm font-medium px-3 py-2 rounded shadow-md transition-all duration-300"
                style={{
                  backgroundColor: isError ? "#fee2e2" : "#d1fae5", // red or green
                  color: isError ? "#991b1b" : "#065f46",
                }}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

