import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "../css_folder/Mycourses.module.css";
import Logout from "../subcomponents/Logout.jsx";

export default function AddProject() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token;

  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ title: "", description: "", team: "" });
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  // Fetch projects
  useEffect(() => {
    if (!token) return;

    const fetchProjects = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/auth/get-course/${courseId}`,
          {
            headers: { "Content-Type": "application/json", authtoken: token },
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to fetch course");
        }

        const data = await res.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setIsError(true);
        setMessage(err.message);
      }
    };

    fetchProjects();
  }, [courseId, token]);

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title.trim() || !newProject.team.trim()) return;

    try {
      console.log(token);
      const res = await fetch(
        `http://localhost:5000/api/auth/course/${courseId}/add-project`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", authtoken: token },
          body: JSON.stringify(newProject),
        }
      );
      console.log(res);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to add project");
      }

      const data = await res.json();
      setProjects(data.projects || []);
      setNewProject({ title: "", description: "", team: "" });
      setIsError(false);
      setMessage("Project added successfully!");
      setTimeout(() => setMessage(null), 1500);
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage(err.message);
      setTimeout(() => setMessage(null), 2500);
    }
  };

  return (
    <div className={styles.my_courses}>
      <Logout styl={styles} />
      <div className={`${styles.bod} relative`}>
        <button
          className={`${styles.button} absolute top-0 left-0 m-2 flex justify-center items-center`}
          style={{ width: "120px" }}
          onClick={() => navigate(-1)}
        >
          Back
        </button>

        <div className="mb-4 mt-10 text-center">
          <h1 className={styles.my_c}>Add Project-Teams to {courseId}</h1>
        </div>

        <div className="flex justify-center mb-6">
          <form
            onSubmit={handleAddProject}
            className={`${styles.course_card} p-6 flex flex-col gap-3 w-full max-w-md relative`}
          >
            <input
              type="text"
              data-testid="project-title"
              placeholder="Project Title"
              value={newProject.title}
              onChange={(e) =>
                setNewProject({ ...newProject, title: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
            <textarea
              data-testid="project-description"
              placeholder="Project Description (optional)"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              data-testid="project-teamname"
              placeholder="Team Name"
              value={newProject.team}
              onChange={(e) =>
                setNewProject({ ...newProject, team: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            />
            <button
              type="submit"
              data-testid="project-save"
              className={`${styles.button} flex justify-center items-center`}
            >
              Add Project-Team
            </button>

            {message && (
              <div
                className="absolute left-1/2 transform -translate-x-1/2 mt-2 text-center text-sm font-medium px-3 py-2 rounded shadow-md transition-all duration-300"
                style={{
                  backgroundColor: isError ? "#fee2e2" : "#d1fae5",
                  color: isError ? "#991b1b" : "#065f46",
                }}
              >
                {message}
              </div>
            )}
          </form>
        </div>

        {projects.length > 0 && (
          <div className={`${styles.all_courses} mt-8`}>
          </div>
        )}
      </div>
    </div>
  );
}

