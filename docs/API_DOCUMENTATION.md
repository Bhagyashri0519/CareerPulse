# REST API Contract Specification — CareerPulse

> Official specification for the CareerPulse Backend REST API (`/api/v1`).
> All endpoints use JSON (except file uploads), require Bearer JWT authentication (unless marked Public), and adhere to the standardized response envelope.

---

## 1. Global API Standards

- **Base URL**: `http://localhost:4000/api/v1` (or production configured `API_URL`)
- **Authentication Header**: `Authorization: Bearer <jwt_access_token>`
- **Content-Type**: `application/json` (or `multipart/form-data` for file uploads)
- **Error Codes**:
  - `400 Bad Request` — Malformed JSON or invalid syntax.
  - `401 Unauthorized` — Missing, invalid, or expired JWT.
  - `403 Forbidden` — Insufficient role permissions or accessing another user's tenant resource.
  - `404 Not Found` — Resource does not exist.
  - `409 Conflict` — Duplicate unique key (e.g. email already registered).
  - `422 Unprocessable Entity` — Schema validation failed (express-validator error list).
  - `500 Internal Server Error` — Unhandled server exception.

---

## 2. Authentication Module (`/api/v1/auth`)

### 2.1 Register New Account
- **Method & Path**: `POST /auth/register`
- **Auth Required**: None (Public)
- **Request Body**:
```json
{
  "email": "student@university.edu",
  "password": "SecurePassword123!",
  "name": "Arjun Ghuge",
  "role": "student"
}
```
- **Validation Rules**:
  - `email`: valid email, normalized lowercase, unique.
  - `password`: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special character.
  - `name`: min 2, max 80 chars.
  - `role`: optional, defaults to `'student'`.
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "660c1f2e8f1b2c001a123456",
      "email": "student@university.edu",
      "name": "Arjun Ghuge",
      "role": "student",
      "createdAt": "2026-10-14T00:50:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "d8e3f4a1..."
  }
}
```
- **Side Effects**: Automatically initializes an empty `StudentProfile` record for the new user.

---

### 2.2 User Login
- **Method & Path**: `POST /auth/login`
- **Auth Required**: None (Public)
- **Request Body**:
```json
{
  "email": "student@university.edu",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "660c1f2e8f1b2c001a123456",
      "email": "student@university.edu",
      "name": "Arjun Ghuge",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "d8e3f4a1..."
  }
}
```
- **Errors**: `401 Unauthorized` (`"Invalid email or password"`).

---

### 2.3 Get Current User Session
- **Method & Path**: `GET /auth/me`
- **Auth Required**: Bearer Token
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "660c1f2e8f1b2c001a123456",
    "email": "student@university.edu",
    "name": "Arjun Ghuge",
    "role": "student",
    "createdAt": "2026-10-14T00:50:00.000Z"
  }
}
```

---

## 3. Student Profile Module (`/api/v1/profiles`)

### 3.1 Get Current Student Profile
- **Method & Path**: `GET /profiles/me`
- **Auth Required**: Bearer Token (`student` or `admin`)
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "userId": "660c1f2e8f1b2c001a123456",
    "degree": "B.Tech",
    "branch": "Computer Science",
    "year": 3,
    "cgpa": 8.4,
    "bio": "Aspiring UI/UX designer and frontend engineer.",
    "targetRoleId": "role_ui_ux_designer",
    "weeklyLearningHours": 10,
    "skills": [
      {
        "canonicalId": "skill_design_figma",
        "name": "Figma",
        "category": "design_ux",
        "level": 79,
        "tier": "advanced",
        "lastAssessedAt": "2026-10-10T14:30:00.000Z"
      },
      {
        "canonicalId": "skill_design_user_research",
        "name": "User Research",
        "category": "design_ux",
        "level": 54,
        "tier": "proficient",
        "lastAssessedAt": "2026-10-08T09:15:00.000Z"
      }
    ]
  }
}
```

---

### 3.2 Update Student Profile
- **Method & Path**: `PUT /profiles/me`
- **Auth Required**: Bearer Token
- **Request Body**:
```json
{
  "degree": "B.Tech",
  "branch": "Computer Science",
  "year": 3,
  "cgpa": 8.5,
  "bio": "Updated bio text.",
  "targetRoleId": "role_ui_ux_designer",
  "weeklyLearningHours": 12
}
```
- **Validation**:
  - `year`: integer between 1 and 5.
  - `cgpa`: float between 0.0 and 10.0.
  - `weeklyLearningHours`: integer between 1 and 60.
- **Response (200 OK)**: Returns updated `StudentProfile` object.

---

### 3.3 Update or Add User Skills (Self-Reported)
- **Method & Path**: `PATCH /profiles/me/skills`
- **Auth Required**: Bearer Token
- **Request Body**:
```json
{
  "skills": [
    {
      "canonicalId": "skill_design_figma",
      "level": 82
    }
  ]
}
```
- **Validation**:
  - `canonicalId`: must exist in the canonical `skills` taxonomy.
  - `level`: integer between 0 and 100.
- **Response (200 OK)**: Returns updated skills array with recomputed tiers.
- **Side Effects**: Appends a `self_report` evidence record into `UserSkill.evidence`.

---

## 4. Resume Management Module (`/api/v1/resumes`)

### 4.1 Upload Resume
- **Method & Path**: `POST /resumes/upload`
- **Auth Required**: Bearer Token
- **Content-Type**: `multipart/form-data`
- **Form Fields**: `file` (binary PDF or DOCX file, max 10MB)
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Resume uploaded and parsing queued",
  "data": {
    "resumeId": "660c201a8f1b2c001a654321",
    "fileName": "Arjun_Ghuge_Resume.pdf",
    "fileSize": 142050,
    "mimeType": "application/pdf",
    "parseStatus": "processing",
    "uploadedAt": "2026-10-14T00:55:00.000Z"
  }
}
```
- **Side Effects**: Triggers asynchronous background request to AI Engine `POST /api/v1/extract-skills`.

---

### 4.2 List Student Resumes
- **Method & Path**: `GET /resumes`
- **Auth Required**: Bearer Token
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "660c201a8f1b2c001a654321",
      "fileName": "Arjun_Ghuge_Resume.pdf",
      "parseStatus": "completed",
      "skillsExtractedCount": 8,
      "uploadedAt": "2026-10-14T00:55:00.000Z"
    }
  ]
}
```

---

### 4.3 Get Parsed Skills from Resume
- **Method & Path**: `GET /resumes/:id/parsed`
- **Auth Required**: Bearer Token (Resource owner or Admin)
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "resumeId": "660c201a8f1b2c001a654321",
    "parseStatus": "completed",
    "skills": [
      {
        "canonicalId": "skill_design_figma",
        "name": "Figma",
        "rawText": "Figma UI Prototyping",
        "confidence": 0.92,
        "estimatedLevel": 75
      },
      {
        "canonicalId": "skill_fe_react",
        "name": "React",
        "rawText": "React.js developer",
        "confidence": 0.88,
        "estimatedLevel": 65
      }
    ]
  }
}
```

---

## 5. Career Roles & Taxonomy Module (`/api/v1/career-roles`)

### 5.1 List Career Roles
- **Method & Path**: `GET /career-roles`
- **Auth Required**: None (Public)
- **Query Parameters**:
  - `page` (default 1), `limit` (default 20)
  - `department` (e.g. `Design`, `Engineering`)
  - `demandLevel` (`low`, `medium`, `high`)
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "660c223a8f1b2c001a777888",
      "canonicalId": "role_ui_ux_designer",
      "title": "UI/UX Designer",
      "department": "Design",
      "demandLevel": "high",
      "averageSalary": "$75k - $105k",
      "requiredSkillsCount": 6
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1
  }
}
```

---

### 5.2 Get Career Role Details
- **Method & Path**: `GET /career-roles/:canonicalId`
- **Auth Required**: None (Public)
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "canonicalId": "role_ui_ux_designer",
    "title": "UI/UX Designer",
    "description": "Designs user-centered interfaces, creates wireframes, prototypes, and manages design systems.",
    "department": "Design",
    "demandLevel": "high",
    "averageSalary": "$75k - $105k",
    "requiredSkills": [
      {
        "canonicalSkillId": "skill_design_figma",
        "skillName": "Figma",
        "requiredLevel": 85,
        "weight": 0.25,
        "isMandatory": true
      },
      {
        "canonicalSkillId": "skill_design_ui_ux",
        "skillName": "UI/UX Design",
        "requiredLevel": 85,
        "weight": 0.25,
        "isMandatory": true
      },
      {
        "canonicalSkillId": "skill_design_user_research",
        "skillName": "User Research",
        "requiredLevel": 80,
        "weight": 0.20,
        "isMandatory": true
      }
    ]
  }
}
```

---

## 6. Assessments Module (`/api/v1/assessments`)

### 6.1 List Available Assessments
- **Method & Path**: `GET /assessments`
- **Auth Required**: Bearer Token
- **Query Parameters**: `category`, `page`, `limit`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "660c23018f1b2c001a999000",
      "title": "Figma & UI Design Benchmark",
      "category": "design_ux",
      "targetSkillIds": ["skill_design_figma", "skill_design_ui_ux"],
      "timeLimitMinutes": 15,
      "questionsCount": 10
    }
  ]
}
```

---

### 6.2 Get Assessment (Take Quiz)
- **Method & Path**: `GET /assessments/:id`
- **Auth Required**: Bearer Token
- **Security Rule**: The server strips `correctOptionIndex` before sending questions to the student.
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "660c23018f1b2c001a999000",
    "title": "Figma & UI Design Benchmark",
    "timeLimitMinutes": 15,
    "questions": [
      {
        "questionId": "q_figma_01",
        "text": "Which feature in Figma ensures components automatically resize when content changes?",
        "type": "multiple_choice",
        "options": ["Smart Animate", "Auto Layout", "Constraints", "Variants"],
        "testedSkillId": "skill_design_figma"
      }
    ]
  }
}
```

---

### 6.3 Submit Assessment Attempt
- **Method & Path**: `POST /assessments/:id/attempts`
- **Auth Required**: Bearer Token
- **Request Body**:
```json
{
  "answers": {
    "q_figma_01": 1,
    "q_figma_02": 3
  },
  "timeTakenSeconds": 480
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Assessment submitted and scored",
  "data": {
    "attemptId": "660c24508f1b2c001a111222",
    "totalScore": 85,
    "skillScores": {
      "skill_design_figma": 88,
      "skill_design_ui_ux": 82
    },
    "completedAt": "2026-10-14T01:05:00.000Z"
  }
}
```
- **Side Effects**: Automatically updates the student's `UserSkill` levels in `StudentProfile` and appends `quiz_assessment` verification evidence.

---

## 7. Skill Gap Analysis Module (`/api/v1/skill-gap`)

### 7.1 Compute Live Skill Gap
- **Method & Path**: `POST /skill-gap/analyze`
- **Auth Required**: Bearer Token
- **Request Body**:
```json
{
  "targetRoleId": "role_ui_ux_designer"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "targetRole": {
      "canonicalId": "role_ui_ux_designer",
      "title": "UI/UX Designer"
    },
    "careerReadinessScore": 72,
    "gapsSummary": {
      "metCount": 2,
      "smallGapsCount": 1,
      "majorGapsCount": 1
    },
    "skillGaps": [
      {
        "canonicalSkillId": "skill_design_user_research",
        "skillName": "User Research",
        "currentLevel": 54,
        "requiredLevel": 80,
        "gap": 26,
        "severity": "gap",
        "insight": "Focus on User Research first — it represents your biggest proficiency gap."
      },
      {
        "canonicalSkillId": "skill_design_figma",
        "skillName": "Figma",
        "currentLevel": 79,
        "requiredLevel": 85,
        "gap": 6,
        "severity": "small_gap",
        "insight": "Your Figma score is 6% below recommended level. Complete Auto Layout mastery."
      }
    ]
  }
}
```

---

## 8. Career Roadmap Module (`/api/v1/roadmaps`)

### 8.1 Generate Personalized Roadmap
- **Method & Path**: `POST /roadmaps/generate`
- **Auth Required**: Bearer Token
- **Request Body**:
```json
{
  "targetRoleId": "role_ui_ux_designer",
  "weeklyLearningHours": 10
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Personalized career roadmap generated",
  "data": {
    "id": "660c25508f1b2c001a333444",
    "targetRoleId": "role_ui_ux_designer",
    "status": "active",
    "weeklyHours": 10,
    "estimatedTotalHours": 48,
    "estimatedDurationWeeks": 5,
    "milestones": [
      {
        "milestoneId": "ms_01",
        "orderIndex": 1,
        "title": "Advanced Auto Layout & Design Tokens in Figma",
        "targetSkillId": "skill_design_figma",
        "targetGain": 10,
        "estimatedHours": 12,
        "status": "in_progress",
        "resourceIds": ["660c26008f1b2c001a555666"]
      },
      {
        "milestoneId": "ms_02",
        "orderIndex": 2,
        "title": "Practical User Research & Heuristic Evaluation",
        "targetSkillId": "skill_design_user_research",
        "targetGain": 25,
        "estimatedHours": 20,
        "status": "locked",
        "resourceIds": ["660c26008f1b2c001a555777"]
      }
    ]
  }
}
```
- **Side Effects**: Replaces or archives any previously active roadmap for the student.

---

### 8.2 Get Student's Active Roadmap
- **Method & Path**: `GET /roadmaps/me`
- **Auth Required**: Bearer Token
- **Response (200 OK)**: Returns the current active `CareerRoadmap` document.

---

### 8.3 Update Milestone Status
- **Method & Path**: `PATCH /roadmaps/me/milestones/:milestoneId`
- **Auth Required**: Bearer Token
- **Request Body**:
```json
{
  "status": "completed"
}
```
- **Validation**: `status` must be `['available', 'in_progress', 'completed', 'skipped']`.
- **Side Effects**: Automatically unlocks subsequent dependent milestones in sequence.

---

## 9. Learning Resources Module (`/api/v1/resources`)

### 9.1 Search & Filter Learning Resources
- **Method & Path**: `GET /resources`
- **Auth Required**: None (Public)
- **Query Parameters**:
  - `skillId`: canonical skill slug (e.g., `skill_design_figma`)
  - `type`: `course`, `video`, `article`, `project`, `book`
  - `isFree`: `true` | `false`
  - `page`, `limit`, `sort`
- **Response (200 OK)**: Returns paginated list of `LearningResource` items.

---

## 10. Career Matching Module (`/api/v1/career-matching`)

### 10.1 Match Student Skills Across All Roles
- **Method & Path**: `GET /career-matching/me`
- **Auth Required**: Bearer Token
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "role": {
        "canonicalId": "role_ui_ux_designer",
        "title": "UI/UX Designer",
        "department": "Design",
        "demandLevel": "high"
      },
      "fitScore": 82,
      "readinessStatus": "developing",
      "matchingSkills": [
        { "name": "UI/UX Design", "level": 88 },
        { "name": "Figma", "level": 79 }
      ],
      "topGapSkill": {
        "name": "User Research",
        "current": 54,
        "required": 80
      }
    },
    {
      "role": {
        "canonicalId": "role_frontend_dev",
        "title": "Frontend Developer",
        "department": "Engineering",
        "demandLevel": "high"
      },
      "fitScore": 68,
      "readinessStatus": "developing"
    }
  ]
}
```
