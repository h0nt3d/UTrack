// API function for user login
export const fetchLogin = async (loginData) => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(loginData),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error("Error during login: ", error);
    return { success: false, error: "Network error occurred" };
  }
};
