export default function Course ({styl, course, handle}) {

    function courseOverview() {
        handle(course)
    }

    return (
        <button className={styl.course} onClick={courseOverview}>
            <h3 className={styl.code_of_course}>{course.code}</h3>
            <img className={styl.course_img} src={course.img}/>
        </button>
    );
}