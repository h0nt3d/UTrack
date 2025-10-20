import { useState } from "react";

const ProjectOverview = () => {

  const [memberDatabase] = useState([
    "Alex Piroozfar",
    "Ben Smith",
    "Carter McDonald",
    "Chelsea Evans",
    "Ethan Brown",
    "Sophie Black",
    "David Ajaero",
    "Liam Johnson",
    "Emma Chen",
  ]);

  const [teams, setTeams] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState({});

  
  const addTeam = () => {
    const newTeamName = prompt("Enter new team name:");
    if (newTeamName) {
      
      if (teams.some((t) => t.name.toLowerCase() === newTeamName.toLowerCase())) {
        alert("A team with that name already exists!");
        return;
      }
      setTeams([...teams, { name: newTeamName, members: [] }]);
    }
  };

 
  const handleSelectChange = (teamIndex, value) => {
    setSelectedMembers({ ...selectedMembers, [teamIndex]: value });
  };

  // Add selected member to the team
  const handleAddMember = (teamIndex) => {
    const member = selectedMembers[teamIndex];
    if (!member) return alert("Please select a member first.");

    const updatedTeams = [...teams];

    // Prevent duplicate within the same team
    if (updatedTeams[teamIndex].members.includes(member)) {
      alert("This member is already in this team!");
      return;
    }

    // Prevent member from being in any other team
    const memberAlreadyInAnotherTeam = updatedTeams.some((t, i) =>
      i !== teamIndex ? t.members.includes(member) : false
    );
    if (memberAlreadyInAnotherTeam) {
      alert("This member is already assigned to another team!");
      return;
    }

    updatedTeams[teamIndex].members.push(member);
    setTeams(updatedTeams);

    // Clear selection after adding
    setSelectedMembers({ ...selectedMembers, [teamIndex]: "" });
  };

  //  Get members not yet assigned to any team
  const getAvailableMembers = () => {
    const assigned = teams.flatMap((team) => team.members);
    return memberDatabase.filter((member) => !assigned.includes(member));
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black">
        <div className="flex justify-center items-center h-16 w-full">
          <h1 className="text-white text-[18px] font-bold cursor-pointer">
            SWE4103-2025-S1 : Project #1 - Finance Tracker
          </h1>
        </div>
      </nav>

      <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-blue-50 flex flex-col items-center pt-24 px-4">
        <div className="w-full max-w-3xl bg-[#F5F5F5] rounded-lg shadow-md overflow-hidden px-4 mb-10">
          <h1>
            Overview: This is a project where you will build a finance tracker
            for a family to track their purchases throughout the year. It will
            have many features, many features indeed.
          </h1>
        </div>

       
        {teams.length === 0 ? (
          <p className="text-gray-700 mb-8 font-medium">
            No teams yet. Click “+ Add Team” to create one.
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 w-full max-w-5xl mb-10">
            {teams.map((team, teamIndex) => {
              const availableMembers = getAvailableMembers();
              return (
                <div
                  key={teamIndex}
                  className="bg-black text-white font-bold px-4 py-3 rounded-lg border border-black shadow w-64 transition"
                >
                  <table className="text-left border-collapse w-full">
                    <thead>
                      <tr>
                        <th className="py-2 px-2 font-semibold">
                          Team #{teamIndex + 1}: {team.name}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.members.map((member, i) => (
                        <tr
                          key={i}
                          className="border-gray-200 hover:bg-[#004369] transition text-white"
                        >
                          <td className="py-1 px-2">{member}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  
                  <div className="mt-3 flex flex-col items-center">
                    <select
                      value={selectedMembers[teamIndex] || ""}
                      onChange={(e) =>
                        handleSelectChange(teamIndex, e.target.value)
                      }
                      className="text-black w-full rounded-md px-2 py-1 mb-2 focus:outline-none"
                    >
                      <option value="">Select member</option>
                      {availableMembers.map((member, i) => (
                        <option key={i} value={member}>
                          {member}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleAddMember(teamIndex)}
                      className="text-sm bg-white text-black px-3 py-1 rounded hover:bg-gray-200 transition"
                    >
                      + Add Member
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        
        <div className="flex justify-center items-center w-full max-w-3xl mb-10">
          <button
            onClick={addTeam}
            className="bg-black text-white font-bold px-8 py-3 rounded-full border border-black shadow hover:bg-gray-800 transition"
          >
            + Add Team
          </button>
        </div>
      </div>
    </>
  );
};

export default ProjectOverview;
