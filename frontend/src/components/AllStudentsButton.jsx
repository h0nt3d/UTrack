export default function AllStudentsButton({
  projectStudents,
  token,
  courseNumber,
  projectId,
  setTeamJoyData,
  setLoadingTeamChart,
  setShowTeamChartModal
}) {

function rightFormat(results) {

    const flattendArray = results.flat()

    const groupedByDate = {}

    for (const item of flattendArray) {
        const date = item.x;

        if (!groupedByDate[date]) {
            groupedByDate[date] = [];
        }

        groupedByDate[date].push(item);
    }

    const finalArray = []

    for (const item in groupedByDate ) {
        let countt = 0;
        let totJoy = 0;
        const arrayDate = groupedByDate[item]
        for (let i=0; i< arrayDate.length; i++) {
            countt++;
            totJoy += arrayDate[i].y
        }
        const yy = totJoy / countt
        finalArray.push({x: item, y: yy, count: countt})
    }

    return finalArray
}



  const fetchStudentJoy = async (student) => {
    const studentId = student._id || student.id;
    try {
      const res = await fetch(
        `http://localhost:5000/api/course/${courseNumber}/project/${projectId}/student/${studentId}/joy-factor`,
        {
          headers: { "Content-Type": "application/json", authtoken: token },
        }
      );
      const data = await res.json();
      return data.joyFactors || []

    } catch (err) {
      console.error(`Error fetching joy factor for ${student.firstName}:`, err);
      return [];
    }
  };

  const handleClick = async () => {
    setShowTeamChartModal(true);
    setLoadingTeamChart(true);

    try {

        // array of arrays
      const results = await Promise.all(projectStudents.map(fetchStudentJoy));

    const rightFormatResults = rightFormat(results)

      setTeamJoyData(rightFormatResults); 
    } catch (err) {
      console.error("Error fetching team joy data:", err);
      setTeamJoyData([]);
    } finally {
      setLoadingTeamChart(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1 text-black rounded bg-yellow-400 hover:bg-yellow-500 text-lg"
    >
      View Team Joy
    </button>
  );
}