import CardC from "./CardC.jsx";
import TeamCardC from "./TeamCardC.jsx";

export default function TeamJoyModal ({setShowTeamChartModal, teamJoyData, setTeamJoyData, loadingTeamChart, team, setSelectedStudentForChart}) {

    return (

    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl relative">
                <button
                    onClick={() => {
                    setShowTeamChartModal(false);
                    setSelectedStudentForChart(null);
                    setTeamJoyData([]);
                    }}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                    ×
                </button>
                
                {loadingTeamChart ? (
                    <div className="text-center py-8">
                    <p className="text-gray-600">Loading Joy Factor data...</p>
                    </div>
                ) : (
                    <div>
                    {teamJoyData.length === 0 ? (
                        <p className="text-center text-gray-600 py-8">
                        No Joy Factor data available for this team yet.
                        </p>
                        ) : (
                        <TeamCardC 
                        allStuds={teamJoyData} 
                        num={90}
                        team={team}
                        />
                    )}
                    </div>
                )}
            </div>
    </div>
    );
}