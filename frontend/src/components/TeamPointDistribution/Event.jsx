import { useNavigate, useLocation } from "react-router-dom";
import React from "react";

/**
 * Event component - displays button to navigate to team points form
 * Adapted from provided code to work with existing backend API
 */
export default function Event() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get data from location state or URL params, fallback to localStorage for token
  const { courseNumber, projectId, token: stateToken, hasSubmitted } = location.state || {};
  const token = stateToken || localStorage.getItem("token");
  const [isLoading, setIsLoading] = React.useState(true);
  const [eventExists, setEventExists] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(hasSubmitted || false);

  // Fetch event status on mount and when component is focused
  React.useEffect(() => {
    async function fetchEventStatus() {
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
        if (res.ok && data.event && data.event.status !== "Closed") {
          setEventExists(true);
          setSubmitted(data.hasSubmitted || false);
        } else {
          setEventExists(false);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setEventExists(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEventStatus();
    
    // Refresh when window regains focus (user returns from form)
    const handleFocus = () => {
      fetchEventStatus();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [token, courseNumber, projectId]);

  const handleNavigate = () => {
    navigate("/teampage/form", {
      state: {
        courseNumber,
        projectId,
        token,
        hasSubmitted: submitted,
      },
    });
  };

  if (!token || !courseNumber || !projectId) {
    return (
      <div 
        className="flex justify-center items-center h-screen w-screen"
        style={{ background: 'linear-gradient(to bottom, #BCEEFF, #FFFFFF)' }}
      >
        <p className="text-red-500">
          Missing required information. Please navigate from a project page.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div 
        className="flex justify-center items-center h-screen w-screen"
        style={{ background: 'linear-gradient(to bottom, #BCEEFF, #FFFFFF)' }}
      >
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Only show button if event exists and is open
  return (
    <div 
      className="flex flex-col justify-center items-center h-screen w-screen gap-4"
      style={{ background: 'linear-gradient(to bottom, #BCEEFF, #FFFFFF)' }}
    >
      {eventExists && submitted ? (
        <div className="flex flex-col items-center gap-2">
          <button
            disabled
            className="px-4 py-2 rounded text-white bg-gray-400 font-bold max-w-[200px] cursor-not-allowed opacity-60"
          >
            ✓ Submitted
          </button>
          <p className="text-green-600 text-sm">You have already submitted your team points.</p>
        </div>
      ) : eventExists ? (
        <button
          className="px-4 py-2 rounded text-white bg-green-800 font-bold max-w-[200px] cursor-pointer
                      hover:bg-green-700 hover:scale-[1.02]"
          onClick={handleNavigate}
        >
          Fill Team Points Form
        </button>
      ) : (
        <p className="text-gray-600">
          No Team Points Distribution event is currently open for this project.
        </p>
      )}
      <button
        className="px-4 py-2 rounded text-white bg-gray-600 font-bold cursor-pointer hover:bg-gray-700"
        onClick={() => navigate(`/student/course/${courseNumber}`, { state: { token } })}
      >
        ← Back
      </button>
    </div>
  );
}

