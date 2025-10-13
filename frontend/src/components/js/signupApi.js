// API function for user signup
export const fetchSignup = async (userData) => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error("Error submitting data: ", error);
    return { success: false, error: "Network error occurred" };
  }
};
