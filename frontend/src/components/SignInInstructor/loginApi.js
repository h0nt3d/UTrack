// loginApi.js
export const fetchLogin = async (loginData, role = "instructor") => {
  try {
    let endpoint = "";
    if (role === "instructor") {
      endpoint = "http://localhost:5000/api/auth/login";
    } else if (role === "student") {
      endpoint = "http://localhost:5000/api/student-auth/login";
    } else {
      throw new Error("Invalid role selected");
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    if (response.ok) {
      const user = data.user || { email: loginData.email };
      return { success: true, data: { ...data, user } };
    } else {
      return { success: false, error: data.message || "Login failed" };
    }
  } catch (error) {
    console.error("Error during login:", error);
    return { success: false, error: "Network error occurred" };
  }
};

