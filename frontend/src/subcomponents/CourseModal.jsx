import React, { useState } from "react";

export default function CourseModal({ onClose, onSave }) {
  const [course, setCourse] = useState({
    courseNumber: "",
    courseName: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(course);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "10px",
          width: "400px",
          boxShadow: "0 5px 20px rgba(0,0,0,0.3)"
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Add a New Course</h2>

        <input
          name="courseNumber"
          data-testid="course-number"
          type="text"
          placeholder="Course Number (e.g., ECE101)"
          value={course.courseNumber}
          onChange={handleChange}
          style={{ display: "block", width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />

        <input
          name="courseName"
          data-testid="course-name"
          type="text"
          placeholder="Course Name"
          value={course.courseName}
          onChange={handleChange}
          style={{ display: "block", width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />

        <textarea
          name="description"
          data-testid="course-description"
          placeholder="Course Description"
          value={course.description}
          onChange={handleChange}
          style={{ display: "block", width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
        />

        <div style={{ textAlign: "right" }}>
          <button data-testid="course-save" onClick={handleSubmit} style={{ marginRight: "0.5rem" }}>
            Save
          </button>
          <button data-testid="course-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

