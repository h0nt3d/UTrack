// src/pages/Mycourses.js
export async function fetchCoursesByEmail(email) {
  if (!email) return [];
  try {
    const res = await fetch(`http://localhost:5000/get-courses/${email}`);
    const data = await res.json();
    if (res.ok) return data.courses || [];
    console.error("Error fetching courses:", data.message);
    return [];
  } catch (err) {
    console.error("Network error fetching courses:", err);
    return [];
  }
}

export async function addCourseForEmail(email, newCourse) {
  try {
    const res = await fetch(`http://localhost:5000/add-course/${email}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCourse),
    });
    const data = await res.json();
    if (res.ok) return data.courses || [];
    console.error("Error adding course:", data.message);
    return [];
  } catch (err) {
    console.error("Network error adding course:", err);
    return [];
  }
}
