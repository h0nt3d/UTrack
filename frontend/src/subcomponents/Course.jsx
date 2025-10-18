import {Link, useLocation} from "react-router-dom";

export default function Course ({course, styl, token, handle}) {

	
    function courseOverview() {
        handle(course)
    }
    

    return (
	    <Link
      		to={`/course/${course.courseNumber}`}
      		state={{ token }}
      		className={`${styl.course_card} flex flex-col items-center text-center`}>
        	<h3 className={styl.course}>
	    		{course.courseNumber}: {course.courseName}
	    	</h3>
            	<img className={styl.course_img} src={course.img}/>
	    </Link>
    );
}
