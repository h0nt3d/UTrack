import { useNavigate } from "react-router-dom";

export default function Course({ course, styl, token }) {
  const navigate = useNavigate();

  const goToRoster = () => {
    navigate(`/course/${course.courseNumber}`, {
      state: {
        token,
        courseName: course.courseName,
        courseCode: course.courseCode,
        courseNumber: course.courseNumber,
        courseDescription: course.description || "",
      },
    });
  };

  return (
    <div
      className={`${styl.course_card} flex flex-col items-center text-center cursor-pointer`}
      onClick={goToRoster}
    >
      <h3 className={styl.course}>
        {course.courseNumber}: {course.courseName}
      </h3>
      {course.img && <img className={styl.course_img} src={course.img} alt={course.courseName} />}
    </div>
  );
}

