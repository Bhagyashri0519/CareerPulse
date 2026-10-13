import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useApp } from '../context/AppContext';

type Question = {
  id: number;
  type: 'choice' | 'scale' | 'scenario';
  level?: string;
  category: string;
  question: string;
  options: string[];
};

const questions: Question[] = [
  { id: 1, type: 'choice', category: 'Interest', question: 'What type of work interests you most?', options: ['Designing digital experiences', 'Building software & apps', 'Working with data & analytics', 'Artificial Intelligence & ML', 'Business & product management'] },
  { id: 2, type: 'choice', category: 'Work Style', question: 'How would you describe your problem-solving approach?', options: ['Visually — I sketch and wireframe ideas', 'Logically — I break it into code/algorithms', 'Analytically — I look at data and patterns', 'Strategically — I think big-picture first', 'Collaboratively — I brainstorm with others'] },
  { id: 3, type: 'scale', level: 'Self Assessment', category: 'Technical', question: 'Rate your Python programming skill level', options: ['Beginner (Never used)', 'Basic (Simple scripts)', 'Intermediate (Functions, OOP)', 'Advanced (Complex projects)', 'Expert (Production-level code)'] },
  { id: 4, type: 'scale', level: 'Self Assessment', category: 'Technical', question: 'Rate your HTML/CSS skill level', options: ['Never touched it', 'Basic HTML tags', 'Responsive layouts', 'Advanced CSS & animations', 'Expert (CSS-in-JS, frameworks)'] },
  { id: 5, type: 'choice', category: 'Technical', question: 'Which database technology are you familiar with?', options: ['SQL (MySQL, PostgreSQL)', 'NoSQL (MongoDB, Firebase)', 'Both SQL and NoSQL', 'I know basic spreadsheets (Excel)', 'No database experience yet'] },
  { id: 6, type: 'scenario', category: 'Design', question: 'A company wants to improve their mobile app UX. What would you do first?', options: ['Interview real users to understand pain points', 'Redesign the visual interface with better colors', 'Analyze app analytics to find drop-off points', 'Create wireframes of the new layout', 'Study competitor apps for inspiration'] },
  { id: 7, type: 'scale', level: 'Self Assessment', category: 'Technical', question: 'How would you rate your data analysis skills?', options: ['None — never analyzed data', 'Basic (Excel, simple charts)', 'Intermediate (Python Pandas, SQL)', 'Advanced (Statistical modeling)', 'Expert (ML models, predictions)'] },
  { id: 8, type: 'choice', category: 'Interest', question: 'What kind of projects excite you the most?', options: ['Designing beautiful apps and websites', 'Building APIs and backend systems', 'Creating data dashboards and insights', 'Training AI/ML models', 'Launching products and strategies'] },
  { id: 9, type: 'scale', level: 'Self Assessment', category: 'Technical', question: 'Rate your JavaScript/frontend development level', options: ['Never coded JS before', 'Basic DOM manipulation', 'React/Vue frameworks', 'Full-stack JS developer', 'Expert (performance, testing)'] },
  { id: 10, type: 'choice', category: 'Work Style', question: 'Which best describes your ideal working style?', options: ['Creative and visual — designing experiences', 'Systematic — writing clean, organized code', 'Data-driven — finding insights in numbers', 'Research-oriented — understanding problems deeply', 'Leadership — managing and strategizing'] },
  { id: 11, type: 'scale', level: 'Beginner → Advanced', category: 'Technical', question: 'How familiar are you with Machine Learning concepts?', options: ['Never heard of ML before', 'Know basic concepts (supervised/unsupervised)', 'Built simple models (regression, classification)', 'Used TensorFlow/PyTorch', 'Research-level understanding'] },
  { id: 12, type: 'choice', category: 'Communication', question: 'What\'s your preferred way to communicate complex ideas?', options: ['Through visual prototypes and mockups', 'Through code demonstrations', 'Through data visualizations and charts', 'Through written documentation', 'Through presentations and verbal explanation'] },
  { id: 13, type: 'scenario', category: 'Data', question: 'A dataset has 20% missing values. What is your first step?', options: ['Drop all rows with missing values', 'Fill with mean/median depending on distribution', 'Use ML imputation (KNN, MICE)', 'Consult with domain experts first', 'Visualize the missing data pattern first'] },
  { id: 14, type: 'scale', level: 'Self Assessment', category: 'Design', question: 'Rate your UI/UX Design knowledge', options: ['No design experience', 'Basic Canva/template use', 'Figma wireframes & prototypes', 'Full design systems & user research', 'Expert (Design lead level)'] },
  { id: 15, type: 'scale', level: 'Self Assessment', category: 'Technical', question: 'How comfortable are you with mathematical statistics?', options: ['Not comfortable at all', 'Basic (mean, median, mode)', 'Intermediate (probability, distributions)', 'Advanced (hypothesis testing, regression)', 'Expert (Bayesian statistics, etc.)'] },
  { id: 16, type: 'choice', category: 'Motivation', question: 'What motivates you most in your career?', options: ['Creating beautiful, user-friendly products', 'Solving complex technical challenges', 'Finding patterns in massive datasets', 'Teaching machines to think intelligently', 'Building businesses and leading teams'] },
  { id: 17, type: 'scale', level: 'Self Assessment', category: 'Technical', question: 'Rate your SQL knowledge', options: ['Never written SQL', 'Basic SELECT queries', 'JOINs, subqueries, aggregations', 'Query optimization, stored procedures', 'Advanced database administration'] },
  { id: 18, type: 'scenario', category: 'Design', question: 'You\'re designing a new fintech app. Where do you start?', options: ['User research — interview potential users', 'Competitive analysis of existing apps', 'Define user personas and user flows', 'Start wireframing the main screens', 'Create a moodboard and visual direction'] },
  { id: 19, type: 'scale', level: 'Self Assessment', category: 'Technical', question: 'Rate your C++ knowledge', options: ['Never used C++', 'Basic syntax (variables, loops)', 'OOP in C++ (classes, inheritance)', 'Memory management & pointers', 'Advanced (templates, STL mastery)'] },
  { id: 20, type: 'choice', category: 'Technology', question: 'Which technology trend excites you the most?', options: ['Generative AI and LLMs', 'Immersive AR/VR experiences', 'Blockchain and Web3', 'Edge computing and IoT', 'Quantum computing'] },
  { id: 21, type: 'scale', level: 'Self Assessment', category: 'Soft Skills', question: 'Rate your communication and presentation skills', options: ['Struggle to express ideas clearly', 'Comfortable in 1:1 conversations', 'Good in small groups & meetings', 'Confident presenter to large audiences', 'Expert communicator & influencer'] },
  { id: 22, type: 'choice', category: 'Learning Style', question: 'How do you prefer to learn new technical skills?', options: ['By building real projects (project-based)', 'By watching video tutorials first', 'By reading official documentation', 'By attending structured courses', 'By working with a mentor or peer'] },
  { id: 23, type: 'scale', level: 'Self Assessment', category: 'Technical', question: 'Rate your Java programming knowledge', options: ['Never written Java', 'Basic programs', 'OOP and Java frameworks', 'Spring Boot, microservices', 'Expert (JVM internals, enterprise)'] },
  { id: 24, type: 'choice', category: 'Career Goal', question: 'What\'s your primary 5-year career goal?', options: ['Become a UX Lead at a top product company', 'Become a Senior Software Engineer / Architect', 'Become a Data Scientist at a tech unicorn', 'Build my own AI startup', 'Rise to a Product Manager or CTO role'] },
  { id: 25, type: 'scale', level: 'Self Assessment', category: 'Soft Skills', question: 'Rate your overall problem-solving and critical thinking ability', options: ['I struggle with complex problems', 'I solve routine problems comfortably', 'I approach novel problems systematically', 'I excel at ambiguous challenges', 'I thrive in high-pressure, complex scenarios'] },
];

const categoryColors: Record<string, string> = {
  Interest: 'bg-violet-50 text-violet-700 border-violet-200',
  Technical: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Design: 'bg-pink-50 text-pink-700 border-pink-200',
  Data: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Work Style': 'bg-amber-50 text-amber-700 border-amber-200',
  Communication: 'bg-blue-50 text-blue-700 border-blue-200',
  Motivation: 'bg-rose-50 text-rose-700 border-rose-200',
  Technology: 'bg-teal-50 text-teal-700 border-teal-200',
  'Career Goal': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Self Assessment': 'bg-purple-50 text-purple-700 border-purple-200',
  'Soft Skills': 'bg-orange-50 text-orange-700 border-orange-200',
  'Learning Style': 'bg-lime-50 text-lime-700 border-lime-200',
};

export default function Assessment() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const navigate = useNavigate();
  const { setAssessmentCompleted } = useApp();

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const selected = answers[q.id];

  function select(idx: number) {
    setAnswers(a => ({ ...a, [q.id]: idx }));
  }

  function next() {
    if (current < questions.length - 1) setCurrent(c => c + 1);
  }

  function prev() {
    if (current > 0) setCurrent(c => c - 1);
  }

  function complete() {
    setAssessmentCompleted(true);
    navigate('/assessment/result');
  }

  const isLast = current === questions.length - 1;
  const catColor = categoryColors[q.category] || 'bg-violet-50 text-violet-700 border-violet-200';

  return (
    <DashboardLayout title="Career Assessment">
      <div className="p-4 lg:p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Let&apos;s Understand You. 🧠
          </h1>
          <p className="text-gray-500 font-medium">Answer a few questions and CareerPulse will understand your interests, skills and career goals.</p>
        </div>

        {/* Progress */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 mb-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-900 font-bold text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Question {current + 1} of {questions.length}
            </span>
            <span className="text-violet-700 text-sm font-bold">{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step dots for first 25 */}
          <div className="flex gap-1 mt-3 overflow-hidden">
            {questions.slice(0, 25).map((_, i) => (
              <div
                key={i}
                onClick={() => { setAnswers(a => a); setCurrent(i); }}
                className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                  i < current ? 'bg-violet-600' : i === current ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 mb-5 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${catColor}`}>
              {q.category}
            </span>
            {q.level && (
              <span className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                {q.level}
              </span>
            )}
            {q.type === 'scenario' && (
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                Scenario
              </span>
            )}
          </div>

          <h2 className="text-gray-900 text-xl font-bold mb-6 leading-snug" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {q.question}
          </h2>

          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => select(i)}
                className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center gap-4 group ${
                  selected === i
                    ? 'bg-violet-50 border-violet-500 text-gray-900 font-semibold shadow-xs'
                    : 'bg-gray-50/70 border-gray-200/80 text-gray-700 hover:border-violet-300 hover:bg-violet-50/30'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  selected === i ? 'border-violet-600 bg-violet-600' : 'border-gray-300 group-hover:border-violet-400'
                }`}>
                  {selected === i && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-medium mr-2">
                    {q.type === 'scale' ? ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'][i] + ' · ' : ''}
                  </span>
                  {opt}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prev}
            disabled={current === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
          >
            ← Previous
          </button>

          <span className="text-gray-500 text-sm font-medium hidden sm:block">
            {Object.keys(answers).length} of {questions.length} answered
          </span>

          {isLast ? (
            <button
              onClick={complete}
              disabled={selected === undefined}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-md shadow-emerald-200 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Complete Assessment ✓
            </button>
          ) : (
            <button
              onClick={next}
              disabled={selected === undefined}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-md shadow-violet-200 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
