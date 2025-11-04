import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";

/**
 * QuickAddJoyFactorModal Component
 * Modal form for quickly adding joy factor for a specific student
 */
export default function QuickAddJoyFactorModal({ 
  student, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const { courseNumber, projectId } = useParams();
  const location = useLocation();
  const token = location.state?.token || localStorage.getItem("token");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
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
    if (!student || !student._id) return;

    setIsLoading(true);
    setMessage(null);

    try {
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
            studentId: student._id,
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
      setMessage("Joy factor added successfully!");
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split("T")[0],
        rating: 3,
      });

      setTimeout(() => {
        setMessage(null);
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error adding joy factor:", err);
      setIsError(true);
      setMessage(err.message || "Error adding joy factor");
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-center">
          Add Joy Factor for {student?.firstName} {student?.lastName}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Adding..." : "Add Joy Factor"}
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

