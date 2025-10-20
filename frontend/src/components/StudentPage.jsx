import { useState } from "react";

const StudentPage = () => {
  const [students, setStudents] = useState([
    { name: "Alex Piroozfar", id: 1234, email: "alexpir@unb.ca" },
    { name: "Ben Smith", id: 5678, email: "bens@unb.ca" },
    { name: "Carter McDonald", id: 8883, email: "mcdonald@unb.ca" },
    { name: "Daniel Baker", id: 8686, email: "daniscool@unb.ca" },
  ]);

  const [newStudent, setNewStudent] = useState({ name: "", id: "", email: "" });
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


  const handleAddStudent = () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@unb\.ca$/;

    if (!newStudent.name || !newStudent.id || !newStudent.email) {
      alert("Please fill in all fields!");
      return;
    }

    if (!emailPattern.test(newStudent.email)) {
      alert("Email must end with @unb.ca");
      return;
    }

    // prevent duplicate IDs
    if (students.some((s) => s.id === parseInt(newStudent.id))) {
      alert("A student with this ID already exists!");
      return;
    }

    setStudents([...students, { ...newStudent, id: parseInt(newStudent.id) }]);
    setNewStudent({ name: "", id: "", email: "" });
    setShowForm(false);
  };

  // ✅ Filter students based on search term
  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term) ||
      student.id.toString().includes(term)
    );
  });

  return (
    <>
     
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black">
        <div className="flex justify-center items-center h-16 w-full">
          <h1 className="text-white text-[18px] font-bold cursor-pointer">
            SWE4103-2025-S1 : Students
          </h1>
        </div>
      </nav>

      <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-blue-50 flex flex-col items-center pt-24 px-4">

    
        <div className="flex justify-between items-center w-full max-w-3xl mb-10">
          <input
            type="text"
            placeholder="🔍 Search by name, ID, or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#F5F5F5] p-3 border rounded-lg placeholder-gray-500 shadow w-1/2"
          />

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-black text-white font-bold px-8 py-3 rounded-full border border-black shadow hover:bg-gray-800 transition"
          >
            + Add Student
          </button>
        </div>

    
        {showForm && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6 w-full max-w-3xl">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Add New Student
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, name: e.target.value })
                }
                className="border p-2 rounded-lg w-full"
              />
              <input
                type="number"
                placeholder="Student ID"
                value={newStudent.id}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, id: e.target.value })
                }
                className="border p-2 rounded-lg w-full"
              />
              <input
                type="email"
                placeholder="Email (must end with @unb.ca)"
                value={newStudent.email}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, email: e.target.value })
                }
                className="border p-2 rounded-lg w-full"
              />
              <button
                onClick={handleAddStudent}
                className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition"
              >
                Add
              </button>
            </div>
          </div>
        )}

        
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-3 px-6 font-semibold">Name</th>
                <th className="py-3 px-6 font-semibold">ID</th>
                <th className="py-3 px-6 font-semibold">Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-200 hover:bg-gray-50 transition text-black"
                  >
                    <td className="py-3 px-6">{student.name}</td>
                    <td className="py-3 px-6">{student.id}</td>
                    <td className="py-3 px-6">{student.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No matching students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default StudentPage;
