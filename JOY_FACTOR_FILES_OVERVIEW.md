# Joy Factor System - Files Overview

## 📁 Files Created for Joy Factor System

This document provides a comprehensive overview of all files created for the Joy Factor tracking system.

---

## 🔷 Backend Files

### 1. `backend/models/JoyFactor.js`
**Purpose**: Database model/schema for storing joy factor data

**What it does**:
- Defines the MongoDB schema for joy factor entries
- Stores ratings (1-5) for students in specific projects
- Contains validation rules (rating must be 1-5, integer)
- Creates database indexes for efficient queries

**Key Fields**:
- `project`: ObjectId reference to the project (embedded in Course)
- `student`: ObjectId reference to the Student
- `date`: Date (normalized to start of day)
- `rating`: Number (1-5, integer)
- `createdAt`/`updatedAt`: Timestamps

**Indexes Created**:
- Unique index on `student + project + date` (prevents duplicates)
- Index on `project + date` (for querying by project)
- Index on `student + project + date` (for student history queries)

---

### 2. `backend/routes/JoyFactor.js`
**Purpose**: API routes for managing joy factor data

**What it does**:
- Handles all HTTP requests related to joy factor operations
- Validates instructor ownership and student-project relationships
- Provides CRUD operations for joy factor entries

**API Endpoints**:

#### POST `/api/course/:courseNumber/project/:projectId/add-joy-factor`
- **Purpose**: Add or update a joy factor entry
- **Authentication**: Required (instructor only)
- **Body**: `{ studentId, date, rating }`
- **Behavior**: Uses upsert - updates if entry exists for same student-project-date, otherwise creates new
- **Validations**: 
  - Student must be assigned to the project
  - Rating must be 1-5 (integer)
  - Date must be valid ISO 8601 format

#### GET `/api/course/:courseNumber/project/:projectId/student/:studentId/joy-factor`
- **Purpose**: Get all joy factor entries for a specific student in a project
- **Authentication**: Required (instructor only)
- **Returns**: Array of joy factors in format `{ x: date, y: rating }` (Chart.js compatible)
- **Includes**: Student info (id, email, firstName, lastName)

#### GET `/api/course/:courseNumber/project/:projectId/joy-factors`
- **Purpose**: Get all joy factor entries for all students in a project
- **Authentication**: Required (instructor only)
- **Returns**: Object grouped by student ID, each containing student info and joy factors array

#### PUT `/api/course/:courseNumber/project/:projectId/joy-factor/:joyFactorId`
- **Purpose**: Update an existing joy factor entry
- **Authentication**: Required (instructor only)
- **Body**: `{ rating?, date? }` (both optional)
- **Validations**: Rating must be 1-5, date must be valid

#### DELETE `/api/course/:courseNumber/project/:projectId/joy-factor/:joyFactorId`
- **Purpose**: Delete a joy factor entry
- **Authentication**: Required (instructor only)
- **Behavior**: Verifies entry belongs to instructor's project before deletion

**Security Features**:
- All routes require authentication (`requireAuth` middleware)
- Verifies instructor owns the course
- Verifies project exists in the course
- Verifies student is assigned to the project

---

## 🔷 Frontend Files

### 3. `frontend/src/components/studentjoyfactor/JoyFactorForm.jsx`
**Purpose**: Form component for adding/updating joy factor entries

**What it does**:
- Provides a user-friendly form for instructors to add joy factor ratings
- Includes student dropdown selection
- Date picker for selecting the entry date
- Rating slider (1-5) with visual feedback
- Handles form submission and displays success/error messages

**Props**:
- `students`: Array of student objects with `_id`, `firstName`, `lastName`, `email`

**Features**:
- Real-time rating display (shows current rating value)
- Form validation
- Success/error message display
- Auto-reset form after successful submission
- Loading states during submission

---

### 4. `frontend/src/components/studentjoyfactor/JoyFactorList.jsx`
**Purpose**: Display component for viewing joy factor history

**What it does**:
- Shows all joy factor entries for a selected student
- Displays data in a table format with date, rating, and visual progress bar
- Fetches data from API and handles loading/error states

**Props**:
- `studentId`: MongoDB ObjectId of the student

**Features**:
- Displays student name and email in header
- Table showing: Date, Rating (X/5), Visual progress bar
- Progress bar shows percentage (rating/5 * 100)
- Sorted by date (ascending)
- Empty state message when no entries found
- Loading and error state handling

**Data Format**: Returns data compatible with Chart.js:
```javascript
[
  { x: '2025-08-07', y: 3.2 },
  { x: '2025-08-08', y: 4.1 },
  // ...
]
```

---

### 5. `frontend/src/components/studentjoyfactor/JoyFactorManager.jsx`
**Purpose**: Main management interface component

**What it does**:
- Combines form and list components into a complete interface
- Manages overall state and navigation
- Fetches project and student information
- Provides student selection dropdown

**Features**:
- Displays project information (course name, course number, project title, team)
- Combines `JoyFactorForm` and `JoyFactorList` components
- Student selection dropdown for viewing history
- Navigation integration (back button)
- Error handling and loading states
- Logout functionality

**Route Integration**:
- Should be added to `App.js` as:
```jsx
<Route 
  path="/course/:courseNumber/project/:projectId/joy-factor" 
  element={<JoyFactorManager />} 
/>
```

---

### 6. `frontend/src/components/studentjoyfactor/joyFactorApi.js`
**Purpose**: API utility functions for joy factor operations

**What it does**:
- Provides reusable functions for all joy factor API calls
- Handles error handling and response formatting
- Centralizes API endpoint URLs

**Functions**:

#### `addJoyFactor(courseNumber, projectId, studentId, date, rating, token)`
- Adds or updates a joy factor entry
- Returns `{ success: boolean, data?: object, error?: string }`

#### `getStudentJoyFactors(courseNumber, projectId, studentId, token)`
- Gets all joy factor entries for a student
- Returns formatted data compatible with Chart.js

#### `getAllProjectJoyFactors(courseNumber, projectId, token)`
- Gets all joy factor entries for all students in a project
- Returns data grouped by student

#### `updateJoyFactor(courseNumber, projectId, joyFactorId, updates, token)`
- Updates an existing joy factor entry
- `updates` object can contain `rating` and/or `date`

#### `deleteJoyFactor(courseNumber, projectId, joyFactorId, token)`
- Deletes a joy factor entry

**Benefits**:
- Reusable across components
- Consistent error handling
- Easy to maintain and update API endpoints

---

### 7. `frontend/src/components/studentjoyfactor/README.md`
**Purpose**: Documentation for the joy factor component system

**What it contains**:
- Overview of the joy factor system
- Data structure explanation
- Component descriptions
- API endpoint documentation
- Integration notes
- Storage strategy details
- Future enhancement ideas

---

## 📊 Data Flow

```
Instructor → Course → Project → Student → Joy Factor Entries
```

1. **Instructor** creates a **Course**
2. **Course** contains **Projects**
3. **Projects** have **Students** assigned
4. **Joy Factor** entries track ratings for each **Student** in each **Project**

---

## 🔗 Integration Points

### Backend Integration
- **File**: `backend/backend_v1.js`
- **Change**: Added route registration:
```javascript
const joyFactorRouter = require("./routes/JoyFactor");
app.use("/api", joyFactorRouter);
```

### Frontend Integration (To Be Done)
- **File**: `frontend/src/App.js`
- **Change**: Add route:
```jsx
import JoyFactorManager from "./components/studentjoyfactor/JoyFactorManager";

<Route 
  path="/course/:courseNumber/project/:projectId/joy-factor" 
  element={<JoyFactorManager />} 
/>
```

---

## 🎯 Key Features

1. **Data Integrity**:
   - Unique constraint prevents duplicate entries per student-project-date
   - Validates student is in project before allowing entry
   - Validates instructor ownership

2. **Data Format**:
   - Dates normalized to start of day (00:00:00)
   - Ratings must be integers 1-5
   - Data format compatible with Chart.js for visualization

3. **Security**:
   - All routes require authentication
   - Instructor ownership verification
   - Student-project relationship validation

4. **User Experience**:
   - Intuitive forms with dropdowns and sliders
   - Visual progress bars
   - Clear error messages
   - Loading states

---

## 📝 Usage Example

### Adding a Joy Factor Entry:
```javascript
// Frontend
import { addJoyFactor } from './components/studentjoyfactor/joyFactorApi';

const result = await addJoyFactor(
  'SWE4103',
  'projectId123',
  'studentId456',
  '2025-03-15',
  4,
  token
);
```

### Getting Student Joy Factors:
```javascript
// Frontend
import { getStudentJoyFactors } from './components/studentjoyfactor/joyFactorApi';

const result = await getStudentJoyFactors(
  'SWE4103',
  'projectId123',
  'studentId456',
  token
);
// Returns: { x: '2025-03-15', y: 4 }, ...
```

---

## 🔄 Future Integration with LineChart.jsx and CardC.jsx

These files will be updated later to:
- Use real joy factor data from the API instead of demo data
- Fetch data based on student ID and project
- Display charts using actual joy factor entries

---

## 📋 Summary

**Total Files Created**: 7
- **Backend**: 2 files (Model + Routes)
- **Frontend**: 5 files (3 Components + 1 API Utility + 1 Documentation)

**Purpose**: Complete system for tracking and managing student joy factor ratings (1-5) within projects, with full CRUD operations and a user-friendly interface.

