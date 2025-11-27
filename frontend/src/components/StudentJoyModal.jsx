import CardC from "./CardC.jsx";
import TeamCardC from "./TeamCardC.jsx";

export default function StudentJoyModal ({setShowChartModal, selectedStudentForChart, setSelectedStudentForChart, joyFactorData, setJoyFactorData, loadingChart}) {

return (
        
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl relative">
              <button
                onClick={() => {
                  setShowChartModal(false);
                  setSelectedStudentForChart(null);
                  setJoyFactorData([]);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
              
              {loadingChart ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading Joy Factor data...</p>
                </div>
              ) : (
                <div>
                  {joyFactorData.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">
                      No Joy Factor data available for this student yet.
                    </p>
                  ) : (
                    <CardC 
                      stud={joyFactorData} 
                      num={90}
                      studentName={`${selectedStudentForChart.firstName} ${selectedStudentForChart.lastName}`}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
    )
}