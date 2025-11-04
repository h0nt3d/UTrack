import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

/**
 * JoyFactorList Component
 * Displays all joy factor entries for a specific student in a project
 */
export default function JoyFactorList({ studentId }) {
  const { courseNumber, projectId } = useParams();
  const location = useLocation();
  const token = location.state?.token || localStorage.getItem("token");

  const [joyFactors, setJoyFactors] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId || !courseNumber || !projectId) return;

    const fetchJoyFactors = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const encodedId = encodeURIComponent(studentId);
        const res = await fetch(
          `http://localhost:5000/api/course/${courseNumber}/project/${projectId}/student/${encodedId}/joy-factor`,
          {
            headers: {
              "Content-Type": "application/json",
              authtoken: token,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch joy factors");
        }

        setJoyFactors(data.joyFactors || []);
        setStudentInfo(data.student || null);
      } catch (err) {
        console.error("Error fetching joy factors:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJoyFactors();
  }, [studentId, courseNumber, projectId, token]);

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">Loading joy factor data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (joyFactors.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">No joy factor entries found for this student.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-3">
        Joy Factor History
        {studentInfo && (
          <span className="text-sm font-normal text-gray-600 ml-2">
            - {studentInfo.firstName} {studentInfo.lastName} ({studentInfo.email})
          </span>
        )}
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Rating</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Visual</th>
            </tr>
          </thead>
          <tbody>
            {joyFactors.map((entry, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(entry.x).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  {entry.y} / 5
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-4 mr-2">
                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{ width: `${(entry.y / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {((entry.y / 5) * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

