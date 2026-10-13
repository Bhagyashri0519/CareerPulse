# Skill Taxonomy & Career Role Benchmarks — CareerPulse

> Official reference for canonical skills, aliases, evaluation rubrics, and career role skill benchmarks.

---

## 1. Canonical Skill Registry

Each skill maintains a unique canonical ID, canonical display name, parent domain category, tags, and a list of accepted aliases for parsing resumes and student inputs.

### 1.1 Design & UI/UX (`design_ux`)

| Canonical ID | Canonical Name | Aliases & Synonyms | Description |
|---|---|---|---|
| `skill_design_figma` | **Figma** | `Figma UI`, `Figma Tool`, `Figma Prototyping`, `Auto Layout` | Collaborative interface design, auto layout, component libraries, and interactive prototyping. |
| `skill_design_ui_ux` | **UI/UX Design** | `User Interface Design`, `User Experience`, `Product Design`, `UI Design` | Visual design hierarchy, design systems, usability heuristics, interaction design. |
| `skill_design_user_research` | **User Research** | `UX Research`, `User Testing`, `Usability Testing`, `User Interviews`, `Personas` | Qualitative interviews, surveys, persona creation, heuristic evaluations, user journey mapping. |
| `skill_design_prototyping` | **Prototyping** | `Interactive Prototyping`, `Wireframing`, `Low-fi Prototyping`, `High-fi Prototypes` | Translating concepts into clickable low- and high-fidelity prototypes for usability testing. |

### 1.2 Frontend Development (`frontend`)

| Canonical ID | Canonical Name | Aliases & Synonyms | Description |
|---|---|---|---|
| `skill_fe_html_css` | **HTML/CSS** | `HTML5`, `CSS3`, `Semantic HTML`, `Responsive Web Design`, `Flexbox`, `CSS Grid` | Web markup standards, CSS styling, responsive viewport layouts, accessibility. |
| `skill_fe_javascript` | **JavaScript** | `JS`, `Vanilla JS`, `ECMAScript`, `ES6+`, `Modern JavaScript` | Core language mechanics, async/await, DOM manipulation, closures, event loop. |
| `skill_fe_typescript` | **TypeScript** | `TS`, `Typed JavaScript`, `TSX` | Static typing, interfaces, generics, type assertions, configuration. |
| `skill_fe_react` | **React** | `React.js`, `ReactJS`, `React 18`, `React 19`, `React Hooks` | Component lifecycle, hooks, context API, state management, virtual DOM. |
| `skill_fe_tailwind` | **Tailwind CSS** | `Tailwind`, `TailwindCSS v4`, `Utility-first CSS` | Modern utility CSS framework, design token customization, dark mode styling. |

### 1.3 Backend Development (`backend`)

| Canonical ID | Canonical Name | Aliases & Synonyms | Description |
|---|---|---|---|
| `skill_be_nodejs` | **Node.js** | `Node`, `NodeJS`, `Server-side JS`, `Node runtime` | V8 JavaScript runtime, event-driven I/O, npm package ecosystem. |
| `skill_be_express` | **Express** | `Express.js`, `ExpressJS`, `Node Express` | Web framework for Node.js, middleware pipelines, routing, error handling. |
| `skill_be_mongodb` | **MongoDB** | `Mongo`, `Mongoose`, `NoSQL Database`, `Document DB` | NoSQL document database, aggregation pipelines, schema design, indexing. |
| `skill_be_rest_api` | **RESTful APIs** | `REST API`, `REST`, `API Design`, `JSON APIs` | Resource-oriented HTTP API architecture, status codes, idempotent methods. |

### 1.4 Data & AI / Machine Learning (`data_ai`)

| Canonical ID | Canonical Name | Aliases & Synonyms | Description |
|---|---|---|---|
| `skill_ai_python` | **Python** | `Python3`, `Py3`, `Python Programming` | Core Python syntax, data structures, OOP, standard libraries. |
| `skill_ai_machine_learning` | **Machine Learning** | `ML`, `scikit-learn`, `Supervised Learning`, `Model Training` | Classical ML algorithms (regression, classification, clustering), feature engineering. |
| `skill_data_sql` | **SQL** | `Structured Query Language`, `PostgreSQL`, `MySQL`, `Relational DB` | Relational data querying, joins, grouping, indexing, query optimization. |
| `skill_data_pandas` | **Data Analysis (Pandas)** | `Pandas`, `NumPy`, `Data Wrangling`, `Exploratory Data Analysis` | Tabular data manipulation, cleaning, aggregation, exploratory data analysis. |

### 1.5 Professional & Soft Skills (`soft_skills`)

| Canonical ID | Canonical Name | Aliases & Synonyms | Description |
|---|---|---|---|
| `skill_soft_communication` | **Communication** | `Verbal Communication`, `Written Communication`, `Presentation` | Clear technical articulation, stakeholder updates, collaborative documentation. |
| `skill_soft_problem_solving`| **Problem Solving** | `Analytical Thinking`, `Critical Thinking`, `Debugging Mindset` | Structured analytical breakdown of ambiguous bugs or business requirements. |
| `skill_soft_teamwork` | **Teamwork & Collaboration** | `Agile Collaboration`, `Pair Programming`, `Code Reviews` | Cross-functional empathy, constructive code reviews, agile workflows. |

---

## 2. Proficiency Rubrics (What Levels Represent)

To provide objective evaluations, the platform uses standardized rubrics:

### Example: `skill_design_figma` (Figma)
- **0–25% (Beginner)**: Knows frames, text tools, basic shapes, and basic export functions.
- **26–50% (Developing)**: Uses Auto Layout, creates reusable basic components, basic prototyping links.
- **51–75% (Proficient — Job-Ready)**: Builds nested Auto Layouts, component properties, variants, interactive components, responsive constraints.
- **76–100% (Advanced — Mastery)**: Designs complete token-driven design systems, manages library publishes, variables (modes/themes), auto-layout animations.

### Example: `skill_fe_react` (React)
- **0–25% (Beginner)**: Understands JSX, functional components, basic `useState`.
- **26–50% (Developing)**: Uses `useEffect`, handles form state, passes props, creates list mappings.
- **51–75% (Proficient — Job-Ready)**: Builds custom hooks, handles complex state (Context / Redux), optimizes renders, integrates REST APIs with loading/error states.
- **76–100% (Advanced — Mastery)**: Architectures SSR/micro-frontends, designs atomic design systems, implements lazy loading & performance profiling.

---

## 3. Career Role Benchmarks

### 3.1 `role_ui_ux_designer` — UI/UX Designer
> Focuses on user-centric interfaces, interactive prototypes, and design systems.

| Required Skill | Canonical ID | Required Level ($L_{\text{req}}$) | Weight ($w_i$) |
|---|---|---|---|
| UI/UX Design | `skill_design_ui_ux` | 85 | 0.25 |
| Figma | `skill_design_figma` | 85 | 0.25 |
| User Research | `skill_design_user_research`| 80 | 0.20 |
| Prototyping | `skill_design_prototyping` | 85 | 0.15 |
| HTML/CSS | `skill_fe_html_css` | 75 | 0.10 |
| Communication | `skill_soft_communication` | 80 | 0.05 |

### 3.2 `role_fullstack_dev` — Full-Stack Developer
> Builds end-to-end client-server applications with React, Node.js, and databases.

| Required Skill | Canonical ID | Required Level ($L_{\text{req}}$) | Weight ($w_i$) |
|---|---|---|---|
| JavaScript | `skill_fe_javascript` | 85 | 0.20 |
| TypeScript | `skill_fe_typescript` | 80 | 0.20 |
| React | `skill_fe_react` | 80 | 0.20 |
| Node.js | `skill_be_nodejs` | 80 | 0.15 |
| MongoDB / SQL | `skill_be_mongodb` | 75 | 0.15 |
| Problem Solving | `skill_soft_problem_solving`| 80 | 0.10 |

### 3.3 `role_ai_ml_engineer` — AI / Machine Learning Engineer
> Implements data analysis, predictive models, and AI pipelines.

| Required Skill | Canonical ID | Required Level ($L_{\text{req}}$) | Weight ($w_i$) |
|---|---|---|---|
| Python | `skill_ai_python` | 85 | 0.30 |
| Machine Learning | `skill_ai_machine_learning` | 80 | 0.30 |
| Data Analysis (Pandas)| `skill_data_pandas` | 80 | 0.20 |
| SQL | `skill_data_sql` | 75 | 0.10 |
| Problem Solving | `skill_soft_problem_solving`| 80 | 0.10 |

---

## 4. Taxonomy Maintenance & Evolution Rules

1. **Immutable Historical Records**: When a skill is updated or renamed, its `canonicalId` remains unchanged. Historical assessment attempts point to `canonicalId`, ensuring student scores never break.
2. **Deprecation Strategy**: Skills are never hard-deleted. A deprecated skill is marked `isDeprecated: true` with a `supersededBy: "skill_new_id"` reference.
3. **Alias Expansion**: Adding new aliases (e.g. adding `React 20` to `skill_fe_react`) is a non-breaking configuration update that immediately benefits the AI resume parser.
