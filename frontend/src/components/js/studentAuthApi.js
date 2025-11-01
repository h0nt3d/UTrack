export async function studentFirstLogin({ email, password }) {
  try {
    const res = await fetch("http://localhost:5000/api/student-auth/first-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to claim account.");
    }

    // Store token locally if needed
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
    }

    return { success: true, data };
  } catch (err) {
    console.error("Student first login error:", err.message);
    return { success: false, error: err.message };
  }
}

