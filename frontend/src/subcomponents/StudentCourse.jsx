// StudentCourse.jsx
import { useNavigate } from "react-router-dom";

export default function StudentCourse({ course, styl, token }) {
  const navigate = useNavigate();

  const goToDetails = () => {
    navigate(`/student/course/${course.courseNumber}`, {
      state: {
        token,
        courseName: course.courseName,
        courseNumber: course.courseNumber,
        courseDescription: course.description || "",
      },
    });
  };

  return (
    <div
      className={`${styl.course_card} flex flex-col items-center text-center cursor-pointer`}
      onClick={goToDetails}
    >
      <h3 className={styl.course}>
        {course.courseNumber}: {course.courseName}
      </h3>
      {course.img && <img className={styl.course_img} src={course.img} alt={course.courseName} />}
    </div>
  );
}

