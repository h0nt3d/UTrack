import { useState, useEffect } from "react";

/**
 * TeamPointsForm Component
 * Form for students to submit team points distribution
 */
export default function TeamPointsForm({
  isOpen,
  onClose,
  onSuccess,
  event,
  courseNumber,
  projectId,
  token,
}) {
  const [ratings, setRatings] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const teamSize = event?.roster?.length || 0;
  const expectedTotal = teamSize * 10;

  useEffect(() => {
    if (event && event.roster) {
      // Initialize ratings with 10 points each
      const initialRatings = event.roster.map((member) => ({
        rateeId: member.studentId,
        points: 10,
      }));
      setRatings(initialRatings);
      setTotalPoints(teamSize * 10);
    }
  }, [event, teamSize]);

  const handlePointChange = (index, value) => {
    const newRatings = [...ratings];
    const numValue = value === "" ? 0 : parseInt(value, 10);
    
    if (isNaN(numValue) || numValue < 0) {
      return;
    }

    newRatings[index].points = numValue;
    setRatings(newRatings);

    // Calculate total
    const newTotal = newRatings.reduce((sum, r) => sum + r.points, 0);
    setTotalPoints(newTotal);

    // Clear error for this field
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    // Check all points are integers
    ratings.forEach((rating, index) => {
      if (!Number.isInteger(rating.points) || rating.points < 0) {
        newErrors[index] = "Points must be a non-negative integer";
      }
    });

    // Check total
    if (totalPoints !== expectedTotal) {
      newErrors.total = `Total must equal ${expectedTotal} (team size × 10). Current: ${totalPoints}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setIsError(true);
      setMessage("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setIsError(false);

    try {
      const res = await fetch(
        `http://localhost:5000/api/course/${courseNumber}/project/${projectId}/points/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authtoken: token,
          },
          body: JSON.stringify({
            eventId: event.id,
            ratings: ratings,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit points");
      }

      setIsError(false);
      setMessage("Points submitted successfully!");
      
      setTimeout(() => {
        setMessage(null);
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error submitting points:", err);
      setIsError(true);
      setMessage(err.message || "Error submitting points");
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !event) return null;

  const isTotalValid = totalPoints === expectedTotal;
  const totalColor = isTotalValid ? "text-green-600" : "text-red-600";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Team Points Distribution</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-gray-700">
            <strong>Instructions:</strong> Allocate 10 points per team member (including yourself).
            <br />
            <span className="text-xs text-gray-600">
              Total must equal {expectedTotal} points (team size: {teamSize} × 10).
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Team Member</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Points</th>
                </tr>
              </thead>
              <tbody>
                {event.roster.map((member, index) => (
                  <tr key={member.studentId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-4 py-2">
                      {member.studentName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                      {member.studentEmail}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={ratings[index]?.points || 0}
                        onChange={(e) => handlePointChange(index, e.target.value)}
                        className={`w-20 px-2 py-1 border rounded text-center ${
                          errors[index] ? "border-red-500" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        required
                      />
                      {errors[index] && (
                        <p className="text-xs text-red-600 mt-1">{errors[index]}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td colSpan="2" className="border border-gray-300 px-4 py-2 text-right">
                    Total:
                  </td>
                  <td className={`border border-gray-300 px-4 py-2 text-center ${totalColor}`}>
                    {totalPoints} / {expectedTotal}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {errors.total && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{errors.total}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading || !isTotalValid}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                isError
                  ? "bg-red-100 text-red-700 border border-red-300"
                  : "bg-green-100 text-green-700 border border-green-300"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

