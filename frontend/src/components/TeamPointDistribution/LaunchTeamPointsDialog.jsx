import { useState } from "react";

/**
 * LaunchTeamPointsDialog Component
 * Dialog for instructors to launch a Team Points Distribution event
 */
export default function LaunchTeamPointsDialog({
  isOpen,
  onClose,
  onSuccess,
  courseNumber,
  projectId,
  token,
}) {
  const [dueDate, setDueDate] = useState("");
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch(
        `http://localhost:5000/api/course/${courseNumber}/project/${projectId}/points/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authtoken: token,
          },
          body: JSON.stringify({
            dueDate: dueDate || null,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create event");
      }

      setIsError(false);
      setMessage("Team Points Distribution event created successfully!");
      
      // Reset form
      setDueDate("");

      setTimeout(() => {
        setMessage(null);
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error creating event:", err);
      setIsError(true);
      setMessage(err.message || "Error creating event");
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-center">
          Launch Team Points Distribution
        </h2>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-gray-700">
            <strong>Team Points Distribution:</strong> Students will allocate 10 points per team member (including themselves).
            <br />
            <span className="text-xs text-gray-600">
              Each student's submission must total N × 10 points (where N is team size).
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date (Optional)
            </label>
            <input
              type="datetime-local"
              id="dueDate"
              name="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for no due date. Event can be closed manually.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Launch Event"}
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

