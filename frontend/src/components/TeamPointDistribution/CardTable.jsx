import TableForm from "./TableForm.jsx";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * CardTable component - displays Submit button as well as error messages if applicable
 * Adapted from provided code to work with existing backend API
 */
export default function CardTable() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from location state, fallback to localStorage for token
  const { courseNumber, projectId, token: stateToken } = location.state || {};
  const token = stateToken || localStorage.getItem("token");

  // For keeping track of table information
  const [tableInfo, setTableInfo] = React.useState({});
  const [event, setEvent] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // For keeping track of if user has pressed "Submit" or not
  const [first, setFirst] = React.useState(true);

  // For keeping track of if there are errors in submitted form
  const [errorScore, setErrorScore] = React.useState(false);
  const [errorTotal, setErrorTotal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState(null);
  const [isError, setIsError] = React.useState(false);

  // Fetch event data on mount
  React.useEffect(() => {
    async function fetchEvent() {
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
          setEvent(data.event);
          if (data.hasSubmitted) {
            // If already submitted, redirect back
            navigate("/teampage", {
              state: {
                courseNumber,
                projectId,
                token,
                hasSubmitted: true,
              },
            });
          }
        } else {
          setSubmitMessage("No open event found for this project.");
          setIsError(true);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setSubmitMessage("Error loading event. Please try again.");
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvent();
  }, [token, courseNumber, projectId, navigate]);

  // Get table information and put it as new state
  function receiveFromTable(total, scores, exptotal) {
    setTableInfo({ total: total, scores: scores, exptotal: exptotal });
  }

  // Validate submitted form
  function validateData() {
    setFirst(false);

    setErrorScore(false);
    setErrorTotal(false);

    let error = false;

    let scorez = tableInfo["scores"];

    // If any scores in table are negative or decimal, then there is error
    for (const score of scorez) {
      if (!Number.isInteger(score) || score < 0) {
        setErrorScore(true);
        error = true;
        break;
      }
    }

    // If expected total and actual total are not same, then there is error
    if (tableInfo["total"] !== tableInfo["exptotal"]) {
      setErrorTotal(true);
      error = true;
    }

    return !error;
  }

  // Handle form submission
  async function handleSubmit() {
    if (!validateData()) {
      return;
    }

    if (!event || !token || !courseNumber || !projectId) {
      setSubmitMessage("Missing required information. Please try again.");
      setIsError(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);
    setIsError(false);

    try {
      // Convert scores to ratings format expected by API
      const ratings = event.roster.map((member, index) => ({
        rateeId: member.studentId,
        points: tableInfo["scores"][index] || 0,
      }));

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
      setSubmitMessage("Points submitted successfully!");

      // Navigate back to student dashboard after successful submission
      setTimeout(() => {
        navigate("/student-dashboard");
      }, 1500);
    } catch (err) {
      console.error("Error submitting points:", err);
      setIsError(true);
      setSubmitMessage(err.message || "Error submitting points");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token || !courseNumber || !projectId) {
    return (
      <div 
        className="flex flex-col gap-4 items-center justify-center h-screen w-screen"
        style={{ background: 'linear-gradient(to bottom, #BCEEFF, #FFFFFF)' }}
      >
        <p className="text-red-500">
          Missing required information. Please navigate from a project page.
        </p>
        <button
          className="px-4 py-2 rounded text-white bg-gray-600 font-bold cursor-pointer hover:bg-gray-700"
          onClick={() => navigate("/student-dashboard")}
        >
          Go to Dashboard
        </button>
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

  if (!event) {
    return (
      <div 
        className="flex flex-col gap-4 items-center justify-center h-screen w-screen"
        style={{ background: 'linear-gradient(to bottom, #BCEEFF, #FFFFFF)' }}
      >
        <p className="text-red-500">{submitMessage || "No event found"}</p>
        <button
          className="px-4 py-2 rounded text-white bg-gray-600 font-bold cursor-pointer hover:bg-gray-700"
          onClick={() => navigate("/student-dashboard")}
        >
          Go Back to Dashboard
        </button>
      </div>
    );
  }

  // Display table and submit button
  return (
    <div 
      className="flex flex-col gap-4 items-center min-h-screen py-10 w-screen"
      style={{ background: 'linear-gradient(to bottom, #BCEEFF, #FFFFFF)' }}
    >
      <button
        className="self-start ml-4 px-4 py-2 rounded text-white bg-gray-600 font-bold cursor-pointer hover:bg-gray-700"
        onClick={() => {
          // Go back to student dashboard
          navigate("/student-dashboard");
        }}
      >
        ← Back
      </button>
      <TableForm tableData={receiveFromTable} roster={event.roster} />
      <button
        className="px-4 py-2 rounded text-white bg-black font-bold max-w-[100px] cursor-pointer
                  hover:bg-gray-900 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>

      {/* Following error messages are displayed or not depending on errorScore and errorTotal */}
      {!first && errorScore && (
        <p className="text-red-500">Error: One or more scores are not valid</p>
      )}

      {!first && errorTotal && (
        <p className="text-red-500">Error: Expected total and actual total do not match</p>
      )}

      {submitMessage && (
        <p className={isError ? "text-red-500" : "text-green-500"}>{submitMessage}</p>
      )}
    </div>
  );
}

