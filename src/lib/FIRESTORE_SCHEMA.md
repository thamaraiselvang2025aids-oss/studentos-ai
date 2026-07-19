# StudentOS AI — Comprehensive Firestore Schema Design

This document details the database architecture, schema structures, and indexing rules implemented for the **StudentOS AI** platform, fully synchronized with `/firestore.rules` and the core React state provider.

---

## 1. Architectural Strategy
StudentOS AI implements an **Isomorphic Single-User Subcollection Architecture**. 

Instead of a flat schema where academic or financial items require a global query with a `userId` index, all modules are housed in subcollections of the primary `/users/{userId}` path. 
* **Benefits:**
  * **Hard Security Boundary:** Data is strictly isolated. A user cannot fetch, list, or tamper with another scholar's subcollections.
  * **Optimized Queries:** Queries scale with the number of items *for that specific user*, not the size of the global database.
  * **Effortless Cascading:** Clean relational mapping that mimics standard file system directories.

---

## 2. Document Collections & Field Mappings

### 2.1. Collection: `/users`
Stores core scholar profiles and streak telemetry.
* **Document ID:** `{userId}` (Matches Firebase Authentication `uid`)

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `uid` | `string` | Matches request auth uid. |
| `fullName` | `string` | Scholar's full legal name. |
| `email` | `string` | Verified educational email address. |
| `university`| `string` | Academic institution. |
| `major` | `string` | Major field of study. |
| `graduationYear` | `integer` | Targeted academic graduation year. |
| `streakCount` | `integer` | Active consecutive days login streak. |
| `lastActive` | `string` (ISO) | Last interactive ping timestamp. |

---

### 2.2. Subcollection: `/users/{userId}/semesters`
Defines academic terms.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (e.g., `fall_2026`). |
| `title` | `string` | Academic term name (e.g., "Fall Semester 2026"). |
| `targetGPA` | `number` | Ideal target GPA (e.g., `3.90`). |
| `currentGPA` | `number` (Opt) | Calculated current term GPA. |

---

### 2.3. Subcollection: `/users/{userId}/courses`
Primary academic subjects.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique course identifier. |
| `code` | `string` | Course registration code (e.g., `CS106B`). |
| `name` | `string` | Official course title. |
| `credits` | `integer` | Credits value (e.g., `4`). |
| `semesterId` | `string` | Relational reference pointing to `semesters/{id}`. |
| `attendancePresent` | `integer` | Count of sessions attended. |
| `attendanceAbsent` | `integer` | Count of sessions missed. |
| `instructor` | `string` (Opt) | Instructor's name. |

---

### 2.4. Subcollection: `/users/{userId}/assignments`
Academic tasks, homeworks, exams.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique assignment identifier. |
| `title` | `string` | Assignment topic or name. |
| `courseId` | `string` | Relational reference pointing to `courses/{id}`. |
| `dueDate` | `string` (ISO) | Submission deadline. |
| `priority` | `string` | Priority severity (`low` \| `medium` \| `high`). |
| `status` | `string` | Current progress (`pending` \| `completed`). |
| `notes` | `string` (Opt) | Additional notes or context. |

---

### 2.5. Subcollection: `/users/{userId}/notes`
Study guides, cheatsheets, lecture summaries.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique note identifier. |
| `title` | `string` | Note subject. |
| `content` | `string` | Full Markdown content payload (supports up to 1MB). |
| `tags` | `array<string>` | Organization keywords (e.g., `["AI", "ExamPreps"]`). |
| `lastModified`| `string` (ISO) | Last save timestamp. |

---

### 2.6. Subcollection: `/users/{userId}/transactions`
Finances, income, expenditures.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique transaction identifier. |
| `type` | `string` | Financial category (`income` \| `expense`). |
| `category` | `string` | Transaction tag (e.g., `Rent`, `Scholarship`, `Food`). |
| `amount` | `number` | Absolute dollar value (positive). |
| `date` | `string` (ISO) | Date of transaction. |
| `description` | `string` | Transaction narrative or vendor. |

---

### 2.7. Subcollection: `/users/{userId}/goals`
Scholarship benchmarks and savings milestones.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique goal identifier. |
| `title` | `string` | Measurable goal metric. |
| `targetDate` | `string` (ISO) | Deadline. |
| `category` | `string` | Domain tag (e.g., `savings`, `academic`). |
| `progress` | `integer` | Progress percentage scale (`0` to `100`). |
| `completed` | `boolean` | Done flag. |

---

### 2.8. Subcollection: `/users/{userId}/projects`
Personal software or hardware builds.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier. |
| `title` | `string` | Project name. |
| `description` | `string` | High-fidelity scope writeup. |
| `status` | `string` | Progress cycle (`idea` \| `in_progress` \| `completed`). |

---

## 3. Recommended Performance Indexes

Single-field indices are automatically created by Firestore for every field in every subcollection. To optimize sorting and composite filters, we declare the following **Composite Indexes** under your Firebase project's console:

### 3.1. Course Assignments Index
* **Collection:** `assignments`
* **Query Scope:** `Collection`
* **Fields:** 
  1. `courseId` (Ascending)
  2. `status` (Ascending)
  3. `dueDate` (Ascending)
* **Usage:** Renders current pending homework items filtered by course.

### 3.2. Financial Ledger Index
* **Collection:** `transactions`
* **Query Scope:** `Collection`
* **Fields:**
  1. `type` (Ascending)
  2. `date` (Descending)
* **Usage:** Provides quick chronological expense/income breakdowns for bento charts.

### 3.3. Calendar Chronology Index
* **Collection:** `calendarEvents`
* **Query Scope:** `Collection`
* **Fields:**
  1. `type` (Ascending)
  2. `start` (Ascending)
* **Usage:** Drives the agenda and calendar layouts by chronological order.

---

## 4. Production Security Rules Overview

These mappings are validated in depth in `/firestore.rules` using the custom validation schemas.
```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    // 1. Force absolute authentication
    function isSignedIn() {
      return request.auth != null;
    }

    // 2. Force tenancy isolation
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // 3. User boundary matching
    match /users/{userId} {
      allow get: if isOwner(userId);
      allow create, update: if isOwner(userId) && isValidStudentProfile(request.resource.data);
      allow delete: if false;

      // Subcollections inherit isOwner validation
      match /{allSubcollections=**} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```
This ensures complete protection of private educational and financial records.
