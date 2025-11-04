/**
 * Joy Factor API Utility Functions
 * Handles all API calls related to joy factor data
 */

const BASE_URL = "http://localhost:5000/api";

/**
 * Add or update joy factor entry
 * @param {string} courseNumber - Course number
 * @param {string} projectId - Project ID
 * @param {string} studentId - Student MongoDB ObjectId
 * @param {string} date - Date in ISO format (YYYY-MM-DD)
 * @param {number} rating - Rating from 1-5
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data
 */
export async function addJoyFactor(courseNumber, projectId, studentId, date, rating, token) {
  try {
    const response = await fetch(
      `${BASE_URL}/course/${courseNumber}/project/${projectId}/add-joy-factor`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authtoken: token,
        },
        body: JSON.stringify({
          studentId,
          date: new Date(date).toISOString(),
          rating: parseInt(rating),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add joy factor");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error adding joy factor:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get joy factor data for a specific student in a project
 * @param {string} courseNumber - Course number
 * @param {string} projectId - Project ID
 * @param {string} studentId - Student MongoDB ObjectId
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data with joy factors
 */
export async function getStudentJoyFactors(courseNumber, projectId, studentId, token) {
  try {
    const encodedId = encodeURIComponent(studentId);
    const response = await fetch(
      `${BASE_URL}/course/${courseNumber}/project/${projectId}/student/${encodedId}/joy-factor`,
      {
        headers: {
          "Content-Type": "application/json",
          authtoken: token,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch joy factors");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching joy factors:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all joy factors for a project
 * @param {string} courseNumber - Course number
 * @param {string} projectId - Project ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data with all joy factors grouped by student
 */
export async function getAllProjectJoyFactors(courseNumber, projectId, token) {
  try {
    const response = await fetch(
      `${BASE_URL}/course/${courseNumber}/project/${projectId}/joy-factors`,
      {
        headers: {
          "Content-Type": "application/json",
          authtoken: token,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch joy factors");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching project joy factors:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update joy factor entry
 * @param {string} courseNumber - Course number
 * @param {string} projectId - Project ID
 * @param {string} joyFactorId - Joy factor entry ID
 * @param {Object} updates - Object with rating and/or date to update
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data
 */
export async function updateJoyFactor(courseNumber, projectId, joyFactorId, updates, token) {
  try {
    const response = await fetch(
      `${BASE_URL}/course/${courseNumber}/project/${projectId}/joy-factor/${joyFactorId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authtoken: token,
        },
        body: JSON.stringify(updates),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update joy factor");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error updating joy factor:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete joy factor entry
 * @param {string} courseNumber - Course number
 * @param {string} projectId - Project ID
 * @param {string} joyFactorId - Joy factor entry ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data
 */
export async function deleteJoyFactor(courseNumber, projectId, joyFactorId, token) {
  try {
    const response = await fetch(
      `${BASE_URL}/course/${courseNumber}/project/${projectId}/joy-factor/${joyFactorId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authtoken: token,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete joy factor");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error deleting joy factor:", error);
    return { success: false, error: error.message };
  }
}

