import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

export default function AddStudent() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token;

  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ firstName: "", lastName: "", email: "" });

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch(`http://localhost:5000/api/students/course${id}`, {
          headers: { "Content-Type": "application/json", "authtoken": token },
        });
        const data = await res.json();
        if (res.ok) setStudents(data.students || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchStudents();
  }, [id, token]);

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

	    const addRes = await fetch(`http://localhost:5000/api/students/course/${id}/add-student`, {
	      method: "POST",
	      headers: { "Content-Type": "application/json", "authtoken": token },
	      body: JSON.stringify({ email: newStudent.email }),
	    });
	    const addData = await addRes.json();
	    if (!addRes.ok) throw new Error(addData.message || "Failed to add student to course");

	    setStudents(addData.students);
	    setNewStudent({ firstName: "", lastName: "", email: "" });

	  } catch (err) {
	    console.error(err);
	  }
	}

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <button
        className="absolute top-4 left-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
        onClick={() => navigate(-1)}
      >
        Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Add Students to Course {id}</h1>

      <form onSubmit={handleAddStudent} className="bg-white rounded-lg shadow-lg p-8 w-11/12 md:w-2/3 lg:w-1/2 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Student</h2>
        <input
          type="text"
          placeholder="First Name"
          value={newStudent.firstName}
          onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
          className="w-full p-2 mb-3 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={newStudent.lastName}
          onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
          className="w-full p-2 mb-3 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newStudent.email}
          onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
          className="w-full p-2 mb-3 border rounded"
          required
        />
        <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition">
          Add Student
        </button>
      </form>

      <div className="w-11/12 md:w-2/3 lg:w-1/2">
        <h2 className="text-xl font-semibold mb-4">Existing Students</h2>
        {students.length === 0 ? (
          <p className="text-gray-600">No students in this course yet.</p>
        ) : (
          <ul>
            {students.map((s) => (
              <li key={s._id} className="border-b py-2">{s.firstName} {s.lastName} ({s.email})</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

