import styles from "../css_folder/Mycourses.module.css";

export default function ProjectStudentsTable({
  projectStudents,
  setProjectStudents,
  token,
  setSelectedStudentForChart,
  setJoyFactorData,
  setLoadingChart,
  courseNumber,
  projectId,
  setShowChartModal,
}) {

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to remove this student from the project?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/course/${courseNumber}/project/${projectId}/remove-student`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", authtoken: token },
          body: JSON.stringify({ studentId }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove student");

      // Update table after removal
      // `data.students` contains remaining student IDs
      const remainingStudents = projectStudents.filter(s => s._id !== studentId);
      setSelectedStudentForChart(null);
      setJoyFactorData([]);
      setProjectStudents(remainingStudents);
    } catch (err) {
      console.error(err);
    }
  };

  return (
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
                    {/* View Joy Button */}
                    <button
                      onClick={async () => {
                        const studentId = s._id || s.id;
                        setSelectedStudentForChart({ 
                          _id: studentId, 
                          firstName: s.firstName, 
                          lastName: s.lastName, 
                          email: s.email 
                        });
                        setShowChartModal(true);
                        setLoadingChart(true);
                        
                        try {
                          const res = await fetch(
                            `http://localhost:5000/api/course/${courseNumber}/project/${projectId}/student/${studentId}/joy-factor`,
                            { headers: { "Content-Type": "application/json", authtoken: token } }
                          );
                          const data = await res.json();
                          setJoyFactorData(data.joyFactors || []);
                        } catch (err) {
                          console.error(err);
                          setJoyFactorData([]);
                        } finally {
                          setLoadingChart(false);
                        }
                      }}
                      className="px-3 py-1 text-black rounded bg-yellow-400 hover:bg-yellow-500 text-sm"
                    >
                      View Joy
                    </button>

                    {/* Remove Student Button */}
                    <button
                      onClick={() => handleRemoveStudent(s._id)}
                      className="px-3 py-1 text-white rounded bg-red-500 hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

