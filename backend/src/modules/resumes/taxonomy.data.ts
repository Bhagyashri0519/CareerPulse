export interface CanonicalSkillDefinition {
  canonicalId: string;
  name: string;
  category: string;
  aliases: string[];
}

/**
 * Platform canonical skill registry matching docs/SKILL_TAXONOMY.md.
 * Used for deterministic token matching and normalization during resume parsing.
 */
export const CANONICAL_SKILLS_TAXONOMY: CanonicalSkillDefinition[] = [
  // ─── Design & UI/UX ────────────────────────────────────────────────────────
  {
    canonicalId: 'skill_design_figma',
    name: 'Figma',
    category: 'design_ux',
    aliases: ['Figma', 'Figma UI', 'Figma Tool', 'Figma Prototyping', 'Auto Layout'],
  },
  {
    canonicalId: 'skill_design_ui_ux',
    name: 'UI/UX Design',
    category: 'design_ux',
    aliases: ['UI/UX Design', 'User Interface Design', 'User Experience', 'Product Design', 'UI Design', 'UX Design', 'UI/UX'],
  },
  {
    canonicalId: 'skill_design_user_research',
    name: 'User Research',
    category: 'design_ux',
    aliases: ['User Research', 'UX Research', 'User Testing', 'Usability Testing', 'User Interviews', 'Personas'],
  },
  {
    canonicalId: 'skill_design_prototyping',
    name: 'Prototyping',
    category: 'design_ux',
    aliases: ['Prototyping', 'Interactive Prototyping', 'Wireframing', 'Low-fi Prototyping', 'High-fi Prototypes', 'Wireframes'],
  },

  // ─── Frontend Development ──────────────────────────────────────────────────
  {
    canonicalId: 'skill_fe_html_css',
    name: 'HTML/CSS',
    category: 'frontend',
    aliases: ['HTML/CSS', 'HTML5', 'CSS3', 'Semantic HTML', 'Responsive Web Design', 'Flexbox', 'CSS Grid', 'HTML', 'CSS'],
  },
  {
    canonicalId: 'skill_fe_javascript',
    name: 'JavaScript',
    category: 'frontend',
    aliases: ['JavaScript', 'Vanilla JS', 'ECMAScript', 'ES6+', 'Modern JavaScript', 'JS'],
  },
  {
    canonicalId: 'skill_fe_typescript',
    name: 'TypeScript',
    category: 'frontend',
    aliases: ['TypeScript', 'Typed JavaScript', 'TSX', 'TS'],
  },
  {
    canonicalId: 'skill_fe_react',
    name: 'React',
    category: 'frontend',
    aliases: ['React', 'React.js', 'ReactJS', 'React 18', 'React 19', 'React Hooks'],
  },
  {
    canonicalId: 'skill_fe_tailwind',
    name: 'Tailwind CSS',
    category: 'frontend',
    aliases: ['Tailwind CSS', 'Tailwind', 'TailwindCSS', 'Utility-first CSS'],
  },

  // ─── Backend Development ───────────────────────────────────────────────────
  {
    canonicalId: 'skill_be_nodejs',
    name: 'Node.js',
    category: 'backend',
    aliases: ['Node.js', 'NodeJS', 'Server-side JS', 'Node runtime', 'Node'],
  },
  {
    canonicalId: 'skill_be_express',
    name: 'Express',
    category: 'backend',
    aliases: ['Express', 'Express.js', 'ExpressJS', 'Node Express'],
  },
  {
    canonicalId: 'skill_be_mongodb',
    name: 'MongoDB',
    category: 'backend',
    aliases: ['MongoDB', 'Mongo', 'Mongoose', 'NoSQL Database', 'Document DB'],
  },
  {
    canonicalId: 'skill_be_rest_api',
    name: 'RESTful APIs',
    category: 'backend',
    aliases: ['RESTful APIs', 'REST API', 'REST APIs', 'REST', 'API Design', 'JSON APIs'],
  },

  // ─── Data & AI / Machine Learning ──────────────────────────────────────────
  {
    canonicalId: 'skill_ai_python',
    name: 'Python',
    category: 'data_ai',
    aliases: ['Python', 'Python3', 'Py3', 'Python Programming'],
  },
  {
    canonicalId: 'skill_ai_machine_learning',
    name: 'Machine Learning',
    category: 'data_ai',
    aliases: ['Machine Learning', 'scikit-learn', 'Supervised Learning', 'Model Training', 'ML'],
  },
  {
    canonicalId: 'skill_data_sql',
    name: 'SQL',
    category: 'data_ai',
    aliases: ['SQL', 'Structured Query Language', 'PostgreSQL', 'MySQL', 'Relational DB'],
  },
  {
    canonicalId: 'skill_data_pandas',
    name: 'Data Analysis (Pandas)',
    category: 'data_ai',
    aliases: ['Pandas', 'NumPy', 'Data Wrangling', 'Exploratory Data Analysis', 'Data Analysis'],
  },

  // ─── Professional & Soft Skills ────────────────────────────────────────────
  {
    canonicalId: 'skill_soft_communication',
    name: 'Communication',
    category: 'soft_skills',
    aliases: ['Communication', 'Verbal Communication', 'Written Communication', 'Presentation'],
  },
  {
    canonicalId: 'skill_soft_problem_solving',
    name: 'Problem Solving',
    category: 'soft_skills',
    aliases: ['Problem Solving', 'Analytical Thinking', 'Critical Thinking', 'Debugging Mindset'],
  },
  {
    canonicalId: 'skill_soft_teamwork',
    name: 'Teamwork & Collaboration',
    category: 'soft_skills',
    aliases: ['Teamwork & Collaboration', 'Agile Collaboration', 'Pair Programming', 'Code Reviews', 'Teamwork'],
  },
];
