import { useState, useEffect } from "react";
import TeamPointsForm from "./TeamPointsForm.jsx";

/**
 * TeamPointsBanner Component
 * Banner shown to students when an open Team Points Distribution event exists
 */
export default function TeamPointsBanner({
  courseNumber,
  projectId,
  token,
}) {
  const [event, setEvent] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function fetchOpenEvent() {
      if (!token || !courseNumber || !projectId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5000/api/course/${courseNumber}/project/${projectId}/points/events/open`,
          {
            headers: {
              "Content-Type": "application/json",
              authtoken: token,
            },
          }
        );

        const data = await res.json();

        if (res.ok && data.event) {
          setEvent(data.event);
          setHasSubmitted(data.hasSubmitted);
        }
      } catch (err) {
        console.error("Error fetching open event:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOpenEvent();
  }, [token, courseNumber, projectId]);

  const handleFormSuccess = () => {
    setHasSubmitted(true);
    setShowForm(false);
    // Refresh event data
    async function refreshEvent() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/course/${courseNumber}/project/${projectId}/points/events/open`,
          {
            headers: {
              "Content-Type": "application/json",
              authtoken: token,
            },
          }
        );
        const data = await res.json();
        if (res.ok && data.event) {
          setEvent(data.event);
          setHasSubmitted(data.hasSubmitted);
        }
      } catch (err) {
        console.error("Error refreshing event:", err);
      }
    }
    refreshEvent();
  };

  if (isLoading) return null;

  if (!event || event.status === "Closed") return null;

  const isPastDue = event.status === "Past Due";

  return (
    <>
      <div className={`mb-4 p-4 rounded-lg border-2 ${
        hasSubmitted
          ? "bg-green-50 border-green-300"
          : isPastDue
          ? "bg-red-50 border-red-300"
          : "bg-yellow-50 border-yellow-300"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className={`font-semibold text-lg ${
              hasSubmitted ? "text-green-800" : isPastDue ? "text-red-800" : "text-yellow-800"
            }`}>
              {hasSubmitted
                ? "✓ Team Points Distribution Submitted"
                : isPastDue
                ? "⚠ Team Points Distribution - Past Due"
                : "📋 Team Points Distribution Open"}
            </h3>
            <p className={`text-sm mt-1 ${
              hasSubmitted ? "text-green-700" : isPastDue ? "text-red-700" : "text-yellow-700"
            }`}>
              {hasSubmitted
                ? "You have successfully submitted your team points distribution."
                : isPastDue
                ? "The due date has passed. Please contact your instructor."
                : "Please allocate 10 points per team member (including yourself)."}
            </p>
            {event.dueDate && (
              <p className={`text-xs mt-1 ${
                hasSubmitted ? "text-green-600" : isPastDue ? "text-red-600" : "text-yellow-600"
              }`}>
                Due: {new Date(event.dueDate).toLocaleString()}
              </p>
            )}
          </div>
          {!hasSubmitted && !isPastDue && (
            <button
              onClick={() => setShowForm(true)}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Open Form
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <TeamPointsForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
          event={event}
          courseNumber={courseNumber}
          projectId={projectId}
          token={token}
        />
      )}
    </>
  );
}

