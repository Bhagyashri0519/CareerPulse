# Database Design — CareerPulse

> MongoDB is used as the primary database.
> All Mongoose schemas live in the backend module that owns each entity.

---

## Entity Relationship Overview

```
User ──────────────── StudentProfile
  │                        │
  │                    UserSkill[]
  │                        │
  ├── AssessmentAttempt[]   Skill (taxonomy)
  │        │                   │
  │    skillScores{}       CareerRole
  │                            │
  ├── LearningRoadmap       RoleRequirement[]
  │       │
  │   RoadmapMilestone[]
  │       │
  │   LearningResource[]
  │
  ├── Resume
  ├── InterviewSession[]
  ├── ProgressRecord[]
  └── Notification[]
```

---

## Core Entities

### User
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `email` | String | Unique, indexed |
| `passwordHash` | String | bcrypt, never returned in API |
| `name` | String | |
| `role` | Enum | `student` \| `admin` |
| `createdAt` | Date | |
| `updatedAt` | Date | |

### StudentProfile
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | Ref: User, unique |
| `degree` | String | e.g. B.Tech |
| `branch` | String | e.g. CSE |
| `year` | Number | 1–4 |
| `cgpa` | Number | Optional |
| `careerGoal` | String | Selected career role title |
| `weeklyLearningHours` | Number | |
| `skills` | UserSkill[] | Embedded |

### Skill (taxonomy)
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `name` | String | Unique, indexed |
| `category` | String | e.g. "Programming", "Design" |
| `tags` | String[] | |

### CareerRole
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `title` | String | Unique |
| `description` | String | |
| `requiredSkills` | RoleRequirement[] | Embedded |
| `demandLevel` | Enum | `low` \| `medium` \| `high` |

### Assessment & AssessmentAttempt
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | Ref: User |
| `score` | Number | 0–100 |
| `skillScores` | Map<String, Number> | skillId → level |
| `completedAt` | Date | |

### LearningRoadmap
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | Ref: User, unique |
| `careerGoal` | String | |
| `milestones` | RoadmapMilestone[] | Ordered array |

### LearningResource
| Field | Type | Notes |
|---|---|---|
| `title` | String | |
| `provider` | String | |
| `url` | String | |
| `type` | Enum | `course` \| `video` \| `article` \| `project` \| `book` |
| `skillIds` | ObjectId[] | Ref: Skill |
| `isFree` | Boolean | |

---

## Indexes to Create

```
users.email              unique
studentProfiles.userId   unique
skills.name              unique
careerRoles.title        unique
learningResources.skillIds  multikey
```

---

## Data Retention Notes

- Personal student data (profiles, resumes, progress) must not be stored beyond account deletion.
- Resumes stored as files must be deleted from storage when the user deletes their account.
- Assessment attempts may be retained anonymously for model training only after explicit consent.
- Never commit real student data to Git.
