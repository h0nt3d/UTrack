import styles from "../css_folder/Mycourses.module.css";

export default function ProjectStudentsTable ({projectStudents, token, setSelectedStudentForChart, setJoyFactorData, setLoadingChart, courseNumber, projectId, setShowChartModal}) {

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
                            
                            // Fetch joy factor data for this student
                            try {
                                const res = await fetch(
                                    `http://localhost:5000/api/course/${courseNumber}/project/${projectId}/student/${studentId}/joy-factor`,
                                    {
                                        headers: { "Content-Type": "application/json", authtoken: token },
                                    }
                                );

                              const data = await res.json();
                              if (res.ok && data.joyFactors) {
                                setJoyFactorData(data.joyFactors);
                              } else {
                                setJoyFactorData([]);
                              }
                            } catch (err) {
                              console.error("Error fetching joy factor:", err);
                              setJoyFactorData([]);
                            } finally {
                              setLoadingChart(false);
                            }
                          }}
                                                
                          className="px-3 py-1 text-black rounded bg-yellow-400 hover:bg-yellow-500 text-sm"
                        >
                          View Joy
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

