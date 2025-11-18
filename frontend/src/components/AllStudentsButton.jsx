import { useNavigate } from "react-router-dom";

export default function AllStudentsButton({
  projectStudents,
  token,
  courseNumber,
  projectId,
  projectTitle,
  projectDescription,
  courseName,
  team,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/course/${courseNumber}/project/${projectId}/student-metrics`, {
      state: {
        token,
        projectTitle,
        projectDescription,
        courseName,
        courseNumber,
        team,
        projectStudents,
      },
    });
  };

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1 text-black rounded bg-yellow-400 hover:bg-yellow-500 text-lg"
    >
      View Metrics
    </button>
  );
}