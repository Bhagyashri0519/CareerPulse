import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import AIAssistant from './components/AIAssistant';

import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import AssessmentResult from './pages/AssessmentResult';
import SkillProfile from './pages/SkillProfile';
import LearningGap from './pages/LearningGap';
import CareerFit from './pages/CareerFit';
import CareerDetail from './pages/CareerDetail';
import CourseHub from './pages/CourseHub';
import LearningRoadmap from './pages/LearningRoadmap';
import LearningProgress from './pages/LearningProgress';
import Analytics from './pages/Analytics';
import Opportunities from './pages/Opportunities';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useApp();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isLoggedIn, aiPanelOpen, setAiPanelOpen } = useApp();

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
        <Route path="/assessment/result" element={<ProtectedRoute><AssessmentResult /></ProtectedRoute>} />
        <Route path="/skills" element={<ProtectedRoute><SkillProfile /></ProtectedRoute>} />
        <Route path="/learning-gap" element={<ProtectedRoute><LearningGap /></ProtectedRoute>} />
        <Route path="/career-fit" element={<ProtectedRoute><CareerFit /></ProtectedRoute>} />
        <Route path="/career/:id" element={<ProtectedRoute><CareerDetail /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><CourseHub /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><LearningRoadmap /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><LearningProgress /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isLoggedIn && <AIAssistant open={aiPanelOpen} onToggle={() => setAiPanelOpen(!aiPanelOpen)} />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
}
