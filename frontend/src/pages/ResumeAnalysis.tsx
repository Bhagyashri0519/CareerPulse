import DashboardLayout from '../components/DashboardLayout';
import ResumeAnalysisView from '../features/resumes/ResumeAnalysisView';

export default function ResumeAnalysis() {
  return (
    <DashboardLayout title="Resume Analysis & Ingestion">
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <ResumeAnalysisView />
      </div>
    </DashboardLayout>
  );
}
