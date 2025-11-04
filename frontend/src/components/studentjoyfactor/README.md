# Joy Factor Component Structure

## Overview
This folder contains components for managing student joy factor data. Joy factor is a rating system (1-5) that tracks student satisfaction/engagement for specific students in specific projects within courses.

## Data Structure

### Backend Schema (JoyFactor Model)
- **project**: ObjectId reference to Project (embedded in Course)
- **student**: ObjectId reference to Student
- **date**: Date (normalized to start of day)
- **rating**: Number (1-5, integer)
- **createdAt/updatedAt**: Timestamps

**Note**: Course and Instructor information are derived from the project when needed. The schema uses student ID (ObjectId) for better referential integrity.

### Data Flow
```
Project → Student → Joy Factor Entries
(Course and Instructor are derived from Project when needed)
```

Each entry stores: `{ date: YYYY-MM-DD, rating: 1-5 }`

## Components

### 1. JoyFactorForm.jsx
- **Purpose**: Form to add/update joy factor entries
- **Features**:
  - Student email input
  - Date picker
  - Rating slider (1-5)
  - Validation and error handling
- **Usage**: Standalone form component

### 2. JoyFactorList.jsx
- **Purpose**: Display joy factor history for a student
- **Props**: `studentId` (required) - Student MongoDB ObjectId
- **Features**:
  - Fetches and displays all joy factor entries for a student
  - Shows date, rating, and visual progress bar
  - Handles loading and error states
- **Data Format**: Returns array of `{ x: date, y: rating }` matching Chart.js format

### 3. JoyFactorManager.jsx
- **Purpose**: Main management interface
- **Features**:
  - Combines form and list components
  - Student selection dropdown
  - Project information display
  - Navigation integration
- **Route**: Should be added to App.js as:
  ```jsx
  <Route path="/course/:courseNumber/project/:projectId/joy-factor" element={<JoyFactorManager />} />
  ```

### 4. joyFactorApi.js
- **Purpose**: API utility functions
- **Functions**:
  - `addJoyFactor()` - Add/update entry (upsert)
  - `getStudentJoyFactors()` - Get entries for a student
  - `getAllProjectJoyFactors()` - Get all entries for a project
  - `updateJoyFactor()` - Update existing entry
  - `deleteJoyFactor()` - Delete entry

## API Endpoints

### Backend Routes (mounted at `/api`)
- `POST /api/course/:courseNumber/project/:projectId/add-joy-factor`
- `GET /api/course/:courseNumber/project/:projectId/student/:studentId/joy-factor`
- `GET /api/course/:courseNumber/project/:projectId/joy-factors`
- `PUT /api/course/:courseNumber/project/:projectId/joy-factor/:joyFactorId`
- `DELETE /api/course/:courseNumber/project/:projectId/joy-factor/:joyFactorId`

## Integration Notes

### For LineChart.jsx
The joy factor data format matches the expected Chart.js format:
```javascript
[
  { x: '2025-08-07', y: 3.2 },
  { x: '2025-08-08', y: 4.1 },
  // ...
]
```

### For CardC.jsx
The component will need to:
1. Fetch joy factor data using `getStudentJoyFactors()`
2. Pass the data to LineChart component
3. Handle date range filtering (14/30/90 days)

## Usage Example

```jsx
import JoyFactorManager from './components/studentjoyfactor/JoyFactorManager';

// In App.js routes:
<Route 
  path="/course/:courseNumber/project/:projectId/joy-factor" 
  element={<JoyFactorManager />} 
/>
```

## Storage Strategy

- **Date normalization**: All dates stored at start of day (00:00:00) for consistent queries
- **Unique constraint**: One entry per student-project-date combination
- **Indexes**: Optimized for queries by:
  - student + project + date (unique)
  - project + date
  - student + project + date (for history queries)
- **Simplified schema**: Only stores project ID, course/instructor derived from project when needed

## Future Enhancements

- Bulk import from CSV
- Date range filtering in UI
- Export joy factor data
- Visual charts in list view
- Average rating calculations

