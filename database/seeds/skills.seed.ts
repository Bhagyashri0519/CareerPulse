/**
 * skills.seed.ts
 * Sample skill taxonomy for development/testing.
 * These are fictional sample entries only — do not treat as real market data.
 * Run: ts-node database/seeds/skills.seed.ts
 */

const sampleSkills = [
  // Design
  { name: 'UI/UX Design', category: 'Design', tags: ['design', 'ux', 'ui'] },
  { name: 'Figma', category: 'Design', tags: ['design', 'prototyping', 'tool'] },
  { name: 'User Research', category: 'Design', tags: ['ux', 'research', 'interviews'] },
  { name: 'Prototyping', category: 'Design', tags: ['design', 'wireframing'] },

  // Programming
  { name: 'HTML/CSS', category: 'Programming', tags: ['web', 'frontend'] },
  { name: 'JavaScript', category: 'Programming', tags: ['web', 'frontend', 'scripting'] },
  { name: 'TypeScript', category: 'Programming', tags: ['web', 'typed', 'frontend', 'backend'] },
  { name: 'React', category: 'Programming', tags: ['web', 'frontend', 'framework'] },
  { name: 'Node.js', category: 'Programming', tags: ['backend', 'runtime'] },
  { name: 'Python', category: 'Programming', tags: ['scripting', 'data', 'ai'] },

  // Data & AI
  { name: 'Data Analysis', category: 'Data', tags: ['data', 'analytics'] },
  { name: 'Machine Learning', category: 'AI/ML', tags: ['ai', 'ml', 'models'] },
  { name: 'SQL', category: 'Data', tags: ['database', 'query'] },

  // Soft Skills
  { name: 'Communication', category: 'Soft Skills', tags: ['teamwork', 'presentation'] },
  { name: 'Problem Solving', category: 'Soft Skills', tags: ['analytical', 'critical-thinking'] },
];

console.log('Sample skills seed data (use with your MongoDB seed script):');
console.log(JSON.stringify(sampleSkills, null, 2));

export { sampleSkills };
