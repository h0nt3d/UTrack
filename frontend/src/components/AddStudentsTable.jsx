import styles from "../css_folder/Mycourses.module.css";

export default function AddStudentsTable ({courseStudents, selectedStudents, projectStudents, handleAddStudents, setSelectedStudents}) {

    const toggleStudentSelection = (studentId) => {
        setSelectedStudents((prev) =>
        prev.includes(studentId)
            ? prev.filter((id) => id !== studentId)
            : [...prev, studentId]
        );
    };

    return (
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
        
    );
}



