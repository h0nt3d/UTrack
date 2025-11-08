export async function fetchStudentCourses(email, token) {
  try {
    const res = await fetch(
      `http://localhost:5000/api/student-auth/get-courses?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authtoken: token || "",
        },
      }
    );

    const data = await res.json();
    if (res.ok && Array.isArray(data.courses)) {
      return data.courses;
    }

    console.warn("Unexpected response:", data);
    return [];
  } catch (err) {
    console.error("Error fetching student courses:", err);
    return [];
  }
}

