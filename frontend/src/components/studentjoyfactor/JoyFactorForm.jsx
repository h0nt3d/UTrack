import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";

/**
 * JoyFactorForm Component
 * Allows instructors to add or update joy factor ratings for students
 * in a specific project within a course
 */
export default function JoyFactorForm({ students = [] }) {
  const { courseNumber, projectId } = useParams();
  const location = useLocation();
  const token = location.state?.token || localStorage.getItem("token");

  const [formData, setFormData] = useState({
    studentId: "",
    date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    rating: 3,
  });

  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Format date as ISO string for API
      const dateISO = new Date(formData.date).toISOString();

      const res = await fetch(
        `http://localhost:5000/api/course/${courseNumber}/project/${projectId}/add-joy-factor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authtoken: token,
          },
          body: JSON.stringify({
            studentId: formData.studentId,
            date: dateISO,
            rating: formData.rating,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add joy factor");
      }

      setIsError(false);
      setMessage("Joy factor added/updated successfully!");
      
      // Reset form
      setFormData({
        studentId: "",
        date: new Date().toISOString().split("T")[0],
        rating: 3,
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Error adding joy factor:", err);
      setIsError(true);
      setMessage(err.message || "Error adding joy factor");
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Add Joy Factor</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student Selection */}
        <div>
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
            Select Student
          </label>
          <select
            id="studentId"
            name="studentId"
            value={formData.studentId}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a student --</option>
            {students.map((student, idx) => (
              <option key={idx} value={student._id}>
                {student.firstName} {student.lastName} ({student.email})
              </option>
            ))}
          </select>
        </div>

        {/* Date Input */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Rating Input */}
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
            Rating (1-5)
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              id="rating"
              name="rating"
              min="1"
              max="5"
              value={formData.rating}
              onChange={handleInputChange}
              className="flex-1"
            />
            <span className="text-lg font-semibold text-blue-600 w-8 text-center">
              {formData.rating}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 (Low)</span>
            <span>5 (High)</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Adding..." : "Add Joy Factor"}
        </button>

        {/* Message Display */}
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
  );
}

