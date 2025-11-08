// parseHelpers.js
import _ from "lodash";
import * as XLSX from "xlsx";

/**
 * Normalize headers to lowercase and trim spaces
 * Returns array of objects with keys: firstName, lastName, email
 */
function normalizeHeaders(arr) {
  if (!arr || arr.length === 0) return [];

  return arr.map((row) => {
    let normalized = {};
    for (let key in row) {
      const lowerKey = key.trim().toLowerCase();
      if (lowerKey === "firstname" || lowerKey === "firstName") normalized.firstName = row[key] || "";
      if (lowerKey === "lastname" || lowerKey === "lastName") normalized.lastName = row[key] || "";
      if (lowerKey === "email") normalized.email = row[key] || "";
    }
    return normalized;
  });
}

// Remove duplicates
export function checkDupes(arr) {
  const unique = _.uniqBy(arr, (obj) => JSON.stringify(obj));
  if (unique.length !== arr.length) {
    console.log(`Duplicates found: ${arr.length - unique.length} removed`);
  }
  return unique;
}

// Clean strings and lowercase emails
export function clean(arr) {
  return arr.map((s) => ({
    firstName: s.firstName.trim(),
    lastName: s.lastName.trim(),
    email: s.email.trim().toLowerCase(),
  }));
}

// Validate emails
export function valEmail(arr) {
  return arr.filter((s) => {
    if (!s.email.endsWith("@unb.ca")) {
      console.log("Invalid email:", s.email);
      return false;
    }
    return true;
  });
}

// Check required headers exist
export function checkHeaders(arr) {
  if (!arr || arr.length === 0) return [];

  const first = arr[0];
  if ("firstName" in first && "lastName" in first && "email" in first) {
    return arr;
  }
  console.log("Invalid headers: expected firstName, lastName, email");
  return [];
}

/**
 * Parse CSV text
 */
export function parseCSVText(csvText) {
  const rows = csvText.split(/\r?\n/).filter(Boolean);
  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.split(",").map((h) => h.trim());

  const arr = dataRows.map((row) => {
    const cols = row.split(",");
    let obj = {};
    headers.forEach((h, i) => {
      obj[h] = cols[i]?.trim() || "";
    });
    return obj;
  });

  let parsed = normalizeHeaders(arr);
  parsed = checkHeaders(parsed);
  parsed = clean(parsed);
  parsed = valEmail(parsed);
  return checkDupes(parsed);
}

/**
 * Parse XLSX file content in browser (binary string)
 */
export function parseXLSXBinary(binaryData) {
  const workbook = XLSX.read(binaryData, { type: "binary" });
  const sheetName = workbook.SheetNames[0];
  let arr = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  arr = normalizeHeaders(arr);
  arr = checkHeaders(arr);
  arr = clean(arr);
  arr = valEmail(arr);
  return checkDupes(arr);
}

/**
 * Generic function to parse uploaded file in browser
 */
export async function parseUploadedFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        let parsed = [];
        if (file.name.endsWith(".csv")) {
          parsed = parseCSVText(data);
        } else if (file.name.endsWith(".xlsx")) {
          parsed = parseXLSXBinary(data);
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);

    if (file.name.endsWith(".xlsx")) reader.readAsBinaryString(file);
    else reader.readAsText(file);
  });
}

