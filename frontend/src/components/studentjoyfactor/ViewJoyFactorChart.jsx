import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import CardC from "../CardC.jsx";

/**
 * ViewJoyFactorChart Component
 * Displays joy factor chart for a student using LineChart component
 */
export default function ViewJoyFactorChart({ 
  student, 
  isOpen, 
  onClose 
}) {
  const { courseNumber, projectId } = useParams();
  const location = useLocation();
  const token = location.state?.token || localStorage.getItem("token");

  const [joyFactors, setJoyFactors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dayRange, setDayRange] = useState(14);

  useEffect(() => {
    if (!isOpen || !student || !student._id) return;

    const fetchJoyFactors = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const encodedId = encodeURIComponent(student._id);
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

        // Transform to format expected by LineChart: { x: date, y: rating }
        const formattedData = (data.joyFactors || []).map((entry) => ({
          x: entry.x,
          y: entry.y,
        }));

        setJoyFactors(formattedData);
      } catch (err) {
        console.error("Error fetching joy factors:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJoyFactors();
  }, [isOpen, student, courseNumber, projectId, token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 my-8 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Joy Factor Chart - {student?.firstName} {student?.lastName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading joy factor data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">Error: {error}</p>
          </div>
        ) : joyFactors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No joy factor entries found for this student.</p>
          </div>
        ) : (
          <div>
            {/* Use CardC component which wraps LineChart with Material-UI Card */}
            <div className="flex justify-center mb-4">
              <CardC 
                stud={joyFactors} 
                num={dayRange}
                studentName={`${student?.firstName} ${student?.lastName}`}
              />
            </div>

            {/* Student Info Display */}
            <div className="mt-4 text-center text-gray-600">
              <p className="font-medium">
                {student?.firstName} {student?.lastName} ({student?.email})
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

