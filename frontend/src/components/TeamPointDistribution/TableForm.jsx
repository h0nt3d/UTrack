import React from "react";

/**
 * TableForm component - displays a table with header, students, and footer
 * Adapted from provided code to work with existing backend API
 */
export default function TableForm({ tableData, roster }) {
  // Calculate expected total
  const total = roster ? roster.length * 10 : 0;

  let scrs = Array(roster ? roster.length : 0).fill(0);
  const [scores, setScores] = React.useState(scrs);
  const [tot, setTot] = React.useState(0);

  // Initialize with 10 points each
  React.useEffect(() => {
    if (roster && roster.length > 0) {
      const initialScores = Array(roster.length).fill(10);
      setScores(initialScores);
      setTot(roster.length * 10);
    }
  }, [roster]);

  // Pass table information to receiveFromTable function in CardTable.jsx if any info changes
  React.useEffect(() => {
    if (tableData && roster) {
      tableData(tot, scores, total);
    }
  }, [tot, scores, total, tableData, roster]);

  // Update scores array state
  function updateScores(number, index) {
    // Find index associated with input field that has changed, and when you do, change array[index] to be that new number
    const updatedArr = scores.map((sc, i) => (i === index ? number : sc));

    // Update array state
    setScores(updatedArr);

    // Update total state
    let sum = 0;
    for (let i = 0; i < updatedArr.length; i++) {
      sum += updatedArr[i];
    }

    setTot(sum);
  }

  if (!roster || roster.length === 0) {
    return (
      <div className="flex justify-center items-center mt-10">
        <p className="text-gray-600">No team members found.</p>
      </div>
    );
  }

  // Returns a table with a header row, body rows, and footer row
  return (
    <div className="flex justify-center max-w-[300px] mx-auto overflow-x-auto mt-10">
      <table className="w-full border-collapse border border-gray-300 text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-center" colSpan={2}>
              Team 1
            </th>
          </tr>
        </thead>

        {/*
          For each student, make a row with two cells, one cell has their name, the other has an input field.
          'onChange' makes it so that EVERY time input field is changed, it updates the scores array and the total
        */}
        <tbody>
          {roster.map((s, index) => (
            <tr key={s.studentId || index}>
              <td className="border border-gray-300 px-4 py-2">
                {s.studentName || s.name || s.email}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right">
                <input
                  type="text"
                  placeholder="e.g. 10"
                  className="max-w-[70px] bg-transparent focus:outline-none"
                  value={scores[index] || ""}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : Number(e.target.value);
                    if (!isNaN(value)) {
                      updateScores(value, index);
                    }
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-100">
          <tr>
            <td className="border border-gray-300 px-4 py-2 text-right font-bold">
              Must total {total}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-right font-bold">{tot}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

