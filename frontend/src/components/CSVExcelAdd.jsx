import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import styles from "../css_folder/Mycourses.module.css";
import Logout from "../subcomponents/Logout.jsx";
import { checkHeaders, clean, valEmail, checkDupes } from "../utils/parseHelpers.js";

export default function CSVExcelAdd() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token;

  const [file, setFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);

  // Parse file
  const parseFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target.result;
          let parsed = [];

          if (file.name.endsWith(".csv")) {
            const [headerRow, ...rows] = data.split(/\r?\n/).filter(Boolean);
            const headers = headerRow.split(",").map((h) => h.trim());
            parsed = rows.map((row) => {
              const cols = row.split(",");
              const obj = {};
              headers.forEach((h, i) => (obj[h] = cols[i]?.trim() || ""));
              return obj;
            });
          } else if (file.name.endsWith(".xlsx")) {
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            parsed = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          }

          parsed = checkHeaders(parsed);
          parsed = clean(parsed);
          parsed = valEmail(parsed);
          parsed = checkDupes(parsed);

          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = (err) => reject(err);

      if (file.name.endsWith(".xlsx")) reader.readAsBinaryString(file);
      else reader.readAsText(file);
    });
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    try {
      const parsedStudents = await parseFile(selectedFile);
      setStudents(parsedStudents);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to parse file. Please check your CSV/XLSX formatting.");
      setStudents([]);
    }
  };

  const handleAddStudents = async () => {
    if (students.length === 0) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/students/course/${courseId}/add-multiple`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authtoken: token,
          },
          body: JSON.stringify({ students }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add students");

      setMessage({
        text: `Successfully added ${students.length} students!`,
        type: "success",
      });
      setTimeout(() => setMessage(null), 1500);

      setStudents([]);
      setFile(null);

      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Error adding students: " + err.message, type: "error" });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className={styles.my_courses}>
      <Logout styl={styles} />

      <div className={`${styles.bod} relative`}>
        {/* Back Button */}
        <button
          className={`${styles.button} absolute top-0 left-0 m-2 flex justify-center items-center`}
          style={{ width: "120px" }}
          onClick={() => navigate(-1)}
        >
          Back
        </button>

        {/* Page Header */}
        <div className="mb-6 mt-10 text-center">
          <h1 className={styles.my_c}>Add Students via CSV/Excel</h1>
        </div>

        {/* File Input */}
        <div className="flex justify-center mb-6">
          <input
            data-testid = "bulk-upload-input"
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="p-2 border rounded w-full max-w-md"
          />
        </div>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        {/* Parsed Students Table */}
        {students.length > 0 && (
          <div className="w-full max-w-3xl mx-auto mt-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Parsed Students Preview
            </h2>

            <div className="overflow-x-auto shadow-md rounded-lg border border-gray-300">
              <table className="w-full border-collapse border border-gray-300 text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">First Name</th>
                    <th className="border border-gray-300 px-4 py-2">Last Name</th>
                    <th className="border border-gray-300 px-4 py-2">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="border border-gray-300 px-4 py-2">
                        {s.firstName || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {s.lastName || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {s.email || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-6">
              <button
                className={`${styles.button} flex justify-center items-center`}
                onClick={handleAddStudents}
              >
                Add All Students
              </button>
            </div>
          </div>
        )}

        {/* Success / Error Popup */}
        {message && (
          <div
            className="fixed bottom-5 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded shadow-md text-white font-medium transition-all duration-300"
            style={{
              backgroundColor:
                message.type === "success" ? "#16a34a" : "#dc2626", // green/red
            }}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

