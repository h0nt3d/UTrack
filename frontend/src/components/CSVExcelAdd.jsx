import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import styles from "../css_folder/Mycourses.module.css";
import Logout from "../subcomponents/Logout.jsx";

// Import your helpers (adjust paths if needed)
import { checkHeaders, clean, valEmail, checkDupes } from "../utils/parseHelpers.js";

export default function CSVExcelAdd() {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token;

  const [file, setFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  // Parse file in browser
  const parseFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        let parsed = [];
        try {
          const data = e.target.result;

          if (file.name.endsWith(".csv")) {
            const [headerRow, ...rows] = data.split(/\r?\n/).filter(Boolean);
            const headers = headerRow.split(",").map((h) => h.trim());

            parsed = rows.map((row) => {
              const cols = row.split(",");
              let obj = {};
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
      setError("Failed to parse file. Make sure it is valid CSV or XLSX.");
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

      alert(`Successfully added ${students.length} students!`);
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Error adding students: " + err.message);
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
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="p-2 border rounded w-full max-w-md"
          />
        </div>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        {/* Preview Students */}
        {students.length > 0 && (
          <div className={`${styles.all_courses} mb-6 w-full max-w-lg mx-auto`}>
            <h2 className="text-xl font-semibold mb-2 text-center">Parsed Students:</h2>
            {students.map((s, idx) => (
              <div
                key={idx}
                className={`${styles.course_card} flex items-center justify-between p-2 mb-2`}
              >
                {s.firstName} {s.lastName} ({s.email})
              </div>
            ))}

            <button
              className={`${styles.button} mt-4 w-full flex justify-center items-center`}
              onClick={handleAddStudents}
            >
              Add All Students
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

